"use strict";

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Telegraf, Markup } = require('telegraf');

const SYSTEM_CONFIG = {
    PORT: process.env.PORT || 3000,
    BOT_TOKEN: '8523431126:AAFw_cxi4tPBb6tqYgu0siJ7PXF1wFPBKkM',
    ADMIN_PRIMARY_ID: '6185367393',
};

const DB = {
    users: new Map(),
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
        const total = players.reduce((sum, p) => sum + p.bet, 0);
        let rand = Math.random() * total;
        let count = 0;
        for (let i = 0; i < players.length; i++) {
            count += players[i].bet;
            if (rand <= count) return i;
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

bot.start((ctx) => {
    ctx.reply('🚀 Добро пожаловать!', Markup.inlineKeyboard([
        [Markup.button.webApp('🎮 Играть', 'https://lootstarsio.netlify.app/')]
    ]));
});

bot.command('admin', (ctx) => {
    if (ctx.from.id.toString() !== SYSTEM_CONFIG.ADMIN_PRIMARY_ID) return;
    ctx.reply('👑 Админ-панель', Markup.inlineKeyboard([
        [Markup.button.callback('🎰 Крутить сейчас', 'admin_spin')]
    ]));
});

bot.action('admin_spin', (ctx) => {
    if (DB.currentRound.players.length < 2) return ctx.answerCbQuery('❌ Мало игроков');
    clearInterval(DB.currentRound.timerInterval);
    executeSpin();
});

function executeSpin() {
    if (DB.currentRound.status === 'spinning') return;
    DB.currentRound.status = 'spinning';
    
    const players = DB.currentRound.players;
    const winnerIndex = CoreUtils.calculateWinner(players);
    const winner = players[winnerIndex];
    const totalBank = players.reduce((sum, p) => sum + p.bet, 0);

    io.emit('start_spin', {
        finalRotation: (10 * 360) + (winnerIndex * (360 / players.length)) + 5,
        winData: { name: winner.name, prize: totalBank, chance: winner.chance, photo: winner.photo }
    });

    setTimeout(() => {
        const u = DB.users.get(winner.id);
        if (u) u.balance += totalBank;
        io.to(winner.id).emit('update_balance', { balance: u?.balance });
        setTimeout(() => {
            DB.currentRound = { id: Math.floor(Math.random() * 100000), status: 'waiting', players: [], timer: 15 };
            io.emit('reset_game');
        }, 5000);
    }, 4000);
}

io.on('connection', (socket) => {
    socket.on('auth', (user) => {
        socket.join(user.id);
        if (!DB.users.has(user.id)) DB.users.set(user.id, { id: user.id, name: user.name, balance: 1000 });
        socket.emit('init_data', { user: DB.users.get(user.id), currentRound: DB.currentRound });
    });

    socket.on('join_game', (data) => {
        const uid = Array.from(socket.rooms)[1];
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
                if (DB.currentRound.timer <= 0) { clearInterval(DB.currentRound.timerInterval); executeSpin(); }
            }, 1000);
        }
    });
});

server.listen(SYSTEM_CONFIG.PORT, () => console.log('Live'));
bot.launch();
