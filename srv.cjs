"use strict";

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Telegraf, Markup } = require('telegraf');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const SYSTEM_CONFIG = {
    PORT: process.env.PORT || 3000,
    BOT_TOKEN: '8523431126:AAFw_cxi4tPBb6tqYgu0siJ7PXF1wFPBKkM',
    ADMIN_PRIMARY_ID: '6185367393',
    CHANNEL_ID: '@LootstarsX'
};

const DB = {
    users: new Map(),
    activeSockets: new Map(),
    currentRound: {
        id: Math.floor(Math.random() * 100000),
        status: 'waiting',
        players: [],
        timer: 15,
        timerInterval: null,
        forcedWinnerId: null
    }
};

const CoreUtils = {
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
        const total = players.reduce((sum, p) => sum + p.bet, 0);
        return players.map(p => ({ ...p, chance: ((p.bet / total) * 100).toFixed(2) }));
    }
};

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const bot = new Telegraf(SYSTEM_CONFIG.BOT_TOKEN);

// Логика бота
bot.start((ctx) => {
    const uid = ctx.from.id.toString();
    if (!DB.users.has(uid)) {
        DB.users.set(uid, { id: uid, name: ctx.from.first_name, balance: 500 });
    }
    ctx.reply('🚀 Добро пожаловать в LootStarsX!', Markup.inlineKeyboard([
        [Markup.button.webApp('🎮 Играть', 'https://lootstarsio.netlify.app/')]
    ]));
});

// Админ-команды в боте
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
});

function executeSpin() {
    if (DB.currentRound.status === 'spinning') return;
    DB.currentRound.status = 'spinning';
    
    const players = DB.currentRound.players;
    const winnerIndex = CoreUtils.calculateWinner(players);
    const winner = players[winnerIndex];
    const totalBank = players.reduce((sum, p) => sum + p.bet, 0);
    const finalRotation = (8 * 360) + (winnerIndex * (360 / players.length)) + 10;

    io.emit('start_spin', {
        winnerId: winner.id,
        finalRotation,
        winData: { name: winner.name, prize: totalBank, chance: winner.chance, photo: winner.photo }
    });

    setTimeout(() => {
        const u = DB.users.get(winner.id);
        if (u) u.balance += totalBank;
        io.to(winner.id).emit('update_balance', { balance: u?.balance });

        setTimeout(() => {
            DB.currentRound = { id: Math.floor(Math.random() * 100000), status: 'waiting', players: [], timer: 15 };
            io.emit('reset_game', DB.currentRound.id);
        }, 5000);
    }, 4000);
}

io.on('connection', (socket) => {
    socket.on('auth', (user) => {
        socket.join(user.id);
        if (!DB.users.has(user.id)) DB.users.set(user.id, { ...user, balance: 500 });
        socket.emit('init_data', { user: DB.users.get(user.id), currentRound: DB.currentRound });
    });

    socket.on('join_game', (data) => {
        const uid = [...socket.rooms][1];
        const user = DB.users.get(uid);
        if (!user || user.balance < data.bet || DB.currentRound.status === 'spinning') return;

        user.balance -= data.bet;
        let p = DB.currentRound.players.find(x => x.id === uid);
        if (p) p.bet += data.bet;
        else DB.currentRound.players.push({ id: uid, name: user.name, bet: data.bet, photo: data.photo });

        DB.currentRound.players = CoreUtils.recalculateChances(DB.currentRound.players);
        io.emit('update_players', DB.currentRound.players);
        socket.emit('update_balance', { balance: user.balance });

        if (DB.currentRound.players.length >= 2 && DB.currentRound.status === 'waiting') {
            DB.currentRound.status = 'countdown';
            DB.currentRound.timerInterval = setInterval(() => {
                DB.currentRound.timer--;
                io.emit('timer_tick', DB.currentRound.timer);
                if (DB.currentRound.timer <= 0) {
                    clearInterval(DB.currentRound.timerInterval);
                    executeSpin();
                }
            }, 1000);
        }
    });
});

server.listen(SYSTEM_CONFIG.PORT, () => console.log('Server OK'));
bot.launch();
