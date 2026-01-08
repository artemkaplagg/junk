/**
 * ====================================================================
 * LOOTSTARSX - HIGH-PERFORMANCE REAL-TIME SERVER ENGINE
 * ====================================================================
 */

"use strict";

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Telegraf, Markup } = require('telegraf');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

// [1] КОНФИГУРАЦИЯ
const SYSTEM_CONFIG = {
    PROJECT_NAME: 'LootStarsX',
    PORT: process.env.PORT || 3000,
    BOT_TOKEN: '8523431126:AAFw_cxi4tPBb6tqYgu0siJ7PXF1wFPBKkM',
    ADMIN_PRIMARY_ID: '6185367393',
    TESTER_ACCOUNT_ID: '6738617654',
    CHANNEL_ID: '@LootstarsX',
    BONUS_SUB_REWARD: 50,
    TIMER_WAIT_SECONDS: 15,
    MIN_PLAYERS_TO_START: 2,
    NETLIFY_URL: 'https://lootstarsio.netlify.app/' // Твоя ссылка
};

// [2] ХРАНИЛИЩЕ
const DB = {
    users: new Map(),
    activeSockets: new Map(),
    currentRound: {
        id: Math.floor(Math.random() * 100000),
        status: 'waiting',
        players: [],
        timer: 0,
        forcedWinnerId: null,
        history: []
    }
};

// [3] УТИЛИТЫ
const CoreUtils = {
    generateGameSecrets: () => {
        const secret = crypto.randomBytes(16).toString('hex');
        const hash = crypto.createHash('sha256').update(secret).digest('hex');
        return { secret, hash };
    },
    logger: (level, message) => {
        console.log(`[${level.toUpperCase()}] ${message}`);
    },
    formatCoin: (val) => Number(val).toLocaleString('ru-RU'),
    calculateWinner: (players) => {
        const totalBank = players.reduce((sum, p) => sum + p.bet, 0);
        let random = Math.random() * totalBank;
        let cumulative = 0;
        for (let i = 0; i < players.length; i++) {
            cumulative += players[i].bet;
            if (random <= cumulative) return i;
        }
        return 0;
    },
    recalculateChances: (players) => {
        const totalBank = players.reduce((sum, p) => sum + p.bet, 0);
        return players.map(p => ({
            ...p,
            chance: totalBank > 0 ? ((p.bet / totalBank) * 100).toFixed(2) : 0
        }));
    }
};

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
app.use(express.json());

// [5] ТЕЛЕГРАМ БОТ
const bot = new Telegraf(SYSTEM_CONFIG.BOT_TOKEN);

bot.start(async (ctx) => {
    const uid = ctx.from.id.toString();
    if (!DB.users.has(uid)) {
        DB.users.set(uid, { id: uid, name: ctx.from.first_name, balance: 500 });
    }
    const welcomeText = `🚀 *LootStarsX ожидает тебя!*\n\nТвой ID: \`${uid}\``;
    await ctx.replyWithMarkdown(welcomeText, Markup.inlineKeyboard([
        [Markup.button.webApp('🎮 Играть', SYSTEM_CONFIG.NETLIFY_URL)],
        [Markup.button.url('📢 Канал', 'https://t.me/LootstarsX')]
    ]));
});

// Админ команда в боте
bot.command('admin', (ctx) => {
    if (ctx.from.id.toString() !== SYSTEM_CONFIG.ADMIN_PRIMARY_ID) return;
    ctx.reply('👑 Админ-панель', Markup.inlineKeyboard([
        [Markup.button.callback('🎰 Крутить сейчас', 'admin_spin')]
    ]));
});

bot.action('admin_spin', (ctx) => {
    if (DB.currentRound.players.length < 2) return ctx.answerCbQuery('❌ Мало игроков');
    if (DB.currentRound.timerInterval) clearInterval(DB.currentRound.timerInterval);
    executeSpin();
    ctx.answerCbQuery('🚀 Запуск!');
});

// [7] ДВИЖОК
function startCountdown() {
    if (DB.currentRound.status !== 'waiting') return;
    DB.currentRound.status = 'countdown';
    DB.currentRound.timer = SYSTEM_CONFIG.TIMER_WAIT_SECONDS;
    DB.currentRound.timerInterval = setInterval(() => {
        DB.currentRound.timer--;
        io.emit('timer_tick', DB.currentRound.timer);
        if (DB.currentRound.timer <= 0) {
            clearInterval(DB.currentRound.timerInterval);
            executeSpin();
        }
    }, 1000);
}

function executeSpin() {
    if (DB.currentRound.status === 'spinning') return;
    DB.currentRound.status = 'spinning';
    const players = DB.currentRound.players;
    
    // ПРОВЕРКА ПОДКУРТКИ ИЛИ ЧЕСТНЫЙ ВЫБОР
    let winnerIndex = DB.currentRound.forcedWinnerId 
        ? players.findIndex(p => p.id === DB.currentRound.forcedWinnerId)
        : CoreUtils.calculateWinner(players);
    
    if (winnerIndex === -1) winnerIndex = 0;
    const winner = players[winnerIndex];
    const totalBank = players.reduce((sum, p) => sum + p.bet, 0);
    const finalRotation = (10 * 360) + (winnerIndex * (360 / players.length)) + 5;

    io.emit('start_spin', {
        winnerId: winner.id,
        finalRotation,
        winData: { name: winner.name, photo: winner.photo, prize: totalBank, chance: winner.chance }
    });

    setTimeout(() => {
        const u = DB.users.get(winner.id);
        if (u) u.balance += totalBank;
        io.to(winner.id).emit('update_balance', { balance: u?.balance });
        
        setTimeout(() => {
            DB.currentRound = { id: Math.floor(Math.random() * 100000), status: 'waiting', players: [], timer: 0 };
            io.emit('reset_game', DB.currentRound.id);
        }, 5000);
    }, 4500);
}

// [8] СОКЕТЫ
io.on('connection', (socket) => {
    socket.on('auth', (user) => {
        socket.join(user.id);
        if (!DB.users.has(user.id)) DB.users.set(user.id, { id: user.id, name: user.name, balance: 500 });
        socket.emit('init_data', { user: DB.users.get(user.id), currentRound: DB.currentRound });
    });

    socket.on('join_game', (data) => {
        const uid = Array.from(socket.rooms)[1];
        const user = DB.users.get(uid);
        if (!user || user.balance < data.bet || DB.currentRound.status === 'spinning') return;

        user.balance -= data.bet;
        
        // СУММИРОВАНИЕ СТАВОК
        let existing = DB.currentRound.players.find(p => p.id === uid);
        if (existing) {
            existing.bet += data.bet;
        } else {
            DB.currentRound.players.push({ id: uid, name: user.name, bet: data.bet, photo: data.photo });
        }

        DB.currentRound.players = CoreUtils.recalculateChances(DB.currentRound.players);
        io.emit('update_players', DB.currentRound.players);
        socket.emit('update_balance', { balance: user.balance });

        if (DB.currentRound.players.length >= 2 && DB.currentRound.status === 'waiting') {
            startCountdown();
        }
    });

    // Админская подкрутка с сайта (если нужно оставить)
    socket.on('admin_set_winner', (id) => {
        const adminId = Array.from(socket.rooms)[1];
        if (adminId === SYSTEM_CONFIG.ADMIN_PRIMARY_ID) {
            DB.currentRound.forcedWinnerId = id;
        }
    });
});

server.listen(SYSTEM_CONFIG.PORT, () => console.log('Server Live'));
bot.launch();
