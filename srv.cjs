
"use strict";

// Импорт необходимых модулей
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Telegraf, Markup } = require('telegraf');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

// ====================================================================
// [1] ГЛОБАЛЬНАЯ КОНФИГУРАЦИЯ СИСТЕМЫ
// ====================================================================
const SYSTEM_CONFIG = {
    PROJECT_NAME: 'LootStarsX',
    PORT: process.env.PORT || 3000,
    
    // Безопасность и Доступы
    BOT_TOKEN: '8523431126:AAFw_cxi4tPBb6tqYgu0siJ7PXF1wFPBKkM',
    ADMIN_PRIMARY_ID: '6185367393', // Главный админ
    TESTER_ACCOUNT_ID: '6738617654', // Аккаунт для тестов
    
    // Игровые параметры
    CHANNEL_ID: '@LootstarsX',
    BONUS_SUB_REWARD: 50,
    TIMER_WAIT_SECONDS: 15,
    MIN_PLAYERS_TO_START: 2,
    
    // Визуальные настройки (согласовано с фронтендом)
    WHEEL_PALETTE: [
        '#8b5cf6', '#ec4899', '#3b82f6', '#10b981', 
        '#f59e0b', '#ef4444', '#06b6d4', '#84cc16'
    ]
};

// ====================================================================
// [2] ХРАНИЛИЩЕ ДАННЫХ В ПАМЯТИ (DATABASE LAYER)
// ====================================================================
// В реальном проде здесь будет MongoDB, но для Termux используем Map
const DB = {
    users: new Map(),        // Все пользователи: {id, name, balance, wins, etc}
    activeSockets: new Map(), // Связка SocketID -> UserID
    
    // Текущее состояние игрового раунда
    currentRound: {
        id: Math.floor(Math.random() * 100000),
        hash: '',            // Хеш для проверки честности
        secret: '',          // Секретный ключ для хеша
        status: 'waiting',   // waiting, countdown, spinning, result
        players: [],         // Список участников: {id, name, bet, chance}
        timer: 0,
        forcedWinnerId: null, // Поле для админской "подкрутки"
        history: []          // Последние 10 игр
    },
    
    // Логирование действий админа для безопасности
    adminLogs: []
};

// ====================================================================
// [3] СИСТЕМА УТИЛИТ И МАТЕМАТИКИ (CORE UTILS)
// ====================================================================
const CoreUtils = {
    generateGameSecrets: () => {
        const secret = crypto.randomBytes(16).toString('hex');
        const hash = crypto.createHash('sha256').update(secret).digest('hex');
        return { secret, hash };
    },

    logger: (level, message) => {
        const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
        const colors = {
            info: '\x1b[36m[INFO]\x1b[0m', warn: '\x1b[33m[WARN]\x1b[0m',
            error: '\x1b[31m[ERROR]\x1b[0m', admin: '\x1b[35m[ADMIN]\x1b[0m'
        };
        console.log(`${timestamp} ${colors[level] || colors.info} ${message}`);
    },

    formatCoin: (val) => Number(val).toLocaleString('ru-RU'),

    // ВОТ ЭТА ФУНКЦИЯ БЫЛА ПРОПУЩЕНА:
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

// ====================================================================
// [4] ИНИЦИАЛИЗАЦИЯ СЕРВЕРА (EXPRESS & SOCKET.IO)
// ====================================================================
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(express.json());

// Маршрут для статических файлов (если потребуется раздавать фронт)
app.use(express.static(path.join(__dirname, 'public')));

// Обработка базового API (состояние системы)
app.get('/api/status', (req, res) => {
    res.json({
        online: DB.activeSockets.size,
        round: DB.currentRound.id,
        status: DB.currentRound.status
    });
});

//// ====================================================================
// [5] ЛОГИКА TELEGRAM БОТА (TELEGRAF ENGINE)
// ====================================================================
const bot = new Telegraf(SYSTEM_CONFIG.BOT_TOKEN);

// Middleware для автоматической регистрации пользователя в базе данных
bot.use(async (ctx, next) => {
    if (ctx.from) {
        const uid = ctx.from.id.toString();
        if (!DB.users.has(uid)) {
            DB.users.set(uid, {
                id: uid,
                name: ctx.from.first_name || 'User',
                username: ctx.from.username || 'n/a',
                balance: (uid === SYSTEM_CONFIG.ADMIN_PRIMARY_ID) ? 100000 : 0,
                bonusClaimed: false,
                totalBets: 0,
                totalWins: 0,
                registrationDate: Date.now(),
                lastActivity: Date.now()
            });
            CoreUtils.logger('info', `Новый пользователь зарегистрирован: ${uid} (@${ctx.from.username})`);
        } else {
            const u = DB.users.get(uid);
            u.lastActivity = Date.now();
        }
    }
    return next();
});

// Стартовое меню и кнопка запуска WebApp
bot.start(async (ctx) => {
    const uid = ctx.from.id.toString();
    const user = DB.users.get(uid);
    
    const welcomeText = `🚀 *Добро пожаловать в LootStarsX!*\n\n` +
        `Твой баланс: *${CoreUtils.formatCoin(user.balance)} 🪙*\n` +
        `ID: \`${uid}\`\n\n` +
        `🎰 Участвуй в быстрых раундах Roll It и выигрывай банк!`;

    const keyboard = Markup.inlineKeyboard([
        [Markup.button.webApp('🎮 Играть в LootStarsX', 'https://lootstarsio.netlify.app/')],
        [Markup.button.url('📢 Наш канал', 'https://t.me/LootstarsX')],
        [Markup.button.callback('🎁 Забрать бонус 50 🪙', 'claim_bonus')]
    ]);

    await ctx.replyWithMarkdown(welcomeText, keyboard);
});

// Обработка кнопки бонуса за подписку
bot.action('claim_bonus', async (ctx) => {
    const uid = ctx.from.id.toString();
    const user = DB.users.get(uid);

    if (user.bonusClaimed) {
        return ctx.answerCbQuery('❌ Вы уже получили этот бонус!', { show_alert: true });
    }

    try {
        const chatMember = await ctx.telegram.getChatMember(SYSTEM_CONFIG.CHANNEL_ID, uid);
        const isMember = ['member', 'administrator', 'creator'].includes(chatMember.status);

        if (isMember) {
            user.balance += SYSTEM_CONFIG.BONUS_SUB_REWARD;
            user.bonusClaimed = true;
            
            // Синхронизация с UI через сокеты, если пользователь онлайн
            io.to(uid).emit('update_balance', { balance: user.balance, reason: 'bonus' });
            
            await ctx.editMessageText(`✅ *Бонус начислен!*\nВаш новый баланс: *${CoreUtils.formatCoin(user.balance)} 🪙*`, { parse_mode: 'Markdown' });
            ctx.answerCbQuery('💰 +50 монет зачислено!');
        } else {
            ctx.answerCbQuery('❌ Сначала подпишитесь на канал @LootstarsX!', { show_alert: true });
        }
    } catch (e) {
        CoreUtils.logger('error', `Ошибка проверки подписки: ${e.message}`);
        ctx.answerCbQuery('⚠️ Ошибка. Попробуйте позже.');
    }
});

// ====================================================================
// [6] АДМИНИСТРАТИВНЫЕ КОМАНДЫ (COMMAND LAYER)
// ====================================================================

// Начисление валюты: /give 12345 500
bot.command('give', async (ctx) => {
    const adminId = ctx.from.id.toString();
    if (adminId !== SYSTEM_CONFIG.ADMIN_PRIMARY_ID) return;

    const parts = ctx.message.text.split(' ');
    if (parts.length !== 3) return ctx.reply('Используй: /give [ID] [Сумма]');

    const targetId = parts[1];
    const amount = parseInt(parts[2]);

    if (!DB.users.has(targetId)) return ctx.reply('❌ Пользователь не найден в базе.');
    if (isNaN(amount)) return ctx.reply('❌ Сумма должна быть числом.');

    const target = DB.users.get(targetId);
    target.balance += amount;

    // Уведомление в приложении в реальном времени
    io.to(targetId).emit('update_balance', { balance: target.balance, reason: 'admin_add' });
    
    CoreUtils.logger('admin', `Админ ${adminId} выдал ${amount} пользователю ${targetId}`);
    ctx.reply(`✅ Пользователю *${target.name}* (ID: ${targetId}) начислено *${amount} 🪙*`, { parse_mode: 'Markdown' });
});

// Просмотр статистики пользователя: /info 12345
bot.command('info', async (ctx) => {
    const adminId = ctx.from.id.toString();
    if (adminId !== SYSTEM_CONFIG.ADMIN_PRIMARY_ID) return;

    const targetId = ctx.message.text.split(' ')[1];
    if (!targetId || !DB.users.has(targetId)) return ctx.reply('❌ Укажите корректный ID.');

    const u = DB.users.get(targetId);
    const status = DB.activeSockets.has(targetId) ? '🟢 Online' : '🔴 Offline';

    const infoText = `📊 *Инфо пользователя ${targetId}*\n\n` +
        `Имя: ${u.name}\n` +
        `Юзер: @${u.username}\n` +
        `Баланс: *${CoreUtils.formatCoin(u.balance)} 🪙*\n` +
        `Статус: ${status}\n` +
        `Игр: ${u.gamesPlayed} | Побед: ${u.totalWins}\n` +
        `Бонус: ${u.bonusClaimed ? '✅' : '❌'}`;

    ctx.replyWithMarkdown(infoText);
});

// Рассылка всем пользователям: /broadcast Текст сообщения
bot.command('broadcast', async (ctx) => {
    if (ctx.from.id.toString() !== SYSTEM_CONFIG.ADMIN_PRIMARY_ID) return;
    const msg = ctx.message.text.replace('/broadcast ', '');
    if (!msg) return ctx.reply('Введите текст.');

    let count = 0;
    for (const uid of DB.users.keys()) {
        try {
            await bot.telegram.sendMessage(uid, `📢 *Объявление LootStarsX*\n\n${msg}`, { parse_mode: 'Markdown' });
            count++;
        } catch (e) {}
    }
    ctx.reply(`✅ Рассылка завершена. Получили: ${count} пользователей.`);
});

// Запуск бота
bot.launch()
    .then(() => CoreUtils.logger('info', 'Telegram Bot успешно запущен'))
    .catch((err) => CoreUtils.logger('error', `Критическая ошибка бота: ${err.message}`));

// ====================================================================
// [7] ОБНОВЛЕННЫЙ ДВИЖОК: СУММИРОВАНИЕ СТАВОК
// ====================================================================
socket.on('join_game', (data) => {
    if (!currentUserId || DB.currentRound.status === 'spinning') return;
    
    const user = DB.users.get(currentUserId);
    const betAmount = parseInt(data.bet);

    if (!user || user.balance < betAmount || betAmount <= 0) return;

    user.balance -= betAmount;

    // Ищем, есть ли уже этот игрок в раунде
    let playerIndex = DB.currentRound.players.findIndex(p => p.id === currentUserId);

    if (playerIndex !== -1) {
        // Если есть — ПЛЮСУЕМ ставку
        DB.currentRound.players[playerIndex].bet += betAmount;
    } else {
        // Если нет — добавляем нового
        DB.currentRound.players.push({
            id: user.id,
            name: user.name,
            photo: data.photo || '👤',
            bet: betAmount,
            chance: 0
        });
    }

    // Пересчет шансов
    DB.currentRound.players = CoreUtils.recalculateChances(DB.currentRound.players);
    
    io.emit('update_players', DB.currentRound.players);
    socket.emit('update_balance', { balance: user.balance });

    if (DB.currentRound.players.length >= 2 && DB.currentRound.status === 'waiting') {
        startCountdown();
    }
});

// ====================================================================
// [8] АДМИН-МЕНЮ В БОТЕ (ВМЕСТО САЙТА)
// ====================================================================
bot.command('admin', async (ctx) => {
    if (ctx.from.id.toString() !== SYSTEM_CONFIG.ADMIN_PRIMARY_ID) return;

    const adminMenu = Markup.inlineKeyboard([
        [Markup.button.callback('🎰 Крутить сейчас', 'admin_spin')],
        [Markup.button.callback('🎯 Выбрать победителя', 'admin_pick_winner')],
        [Markup.button.callback('💰 Пополнить баланс', 'admin_topup')]
    ]);

    await ctx.reply('👑 *LootStarsX Admin Panel*\nУправление игрой через бота:', { 
        parse_mode: 'Markdown', 
        ...adminMenu 
    });
});

// Обработка кнопок админки в боте
bot.action('admin_spin', (ctx) => {
    if (DB.currentRound.players.length < 2) return ctx.answerCbQuery('❌ Нужно минимум 2 игрока');
    ctx.answerCbQuery('🚀 Запускаю колесо!');
    if (DB.currentRound.timerInterval) clearInterval(DB.currentRound.timerInterval);
    executeSpin();
});

bot.action('admin_pick_winner', async (ctx) => {
    if (DB.currentRound.players.length === 0) return ctx.answerCbQuery('❌ В игре никого нет');
    
    const buttons = DB.currentRound.players.map(p => [
        Markup.button.callback(`${p.name} (${p.bet} 🪙)`, `force_${p.id}`)
    ]);
    
    await ctx.reply('Выберите, кто должен победить:', Markup.inlineKeyboard(buttons));
});

bot.action(/force_(.+)/, (ctx) => {
    const targetId = ctx.match[1];
    DB.currentRound.forcedWinnerId = targetId;
    ctx.answerCbQuery(`✅ Победа настроена для ID ${targetId}`);
});

// Пополнение по ID через команду: /give [ID] [сумма]
bot.command('give', (ctx) => {
    const parts = ctx.message.text.split(' ');
    if (parts.length < 3) return ctx.reply('Используй: /give [ID] [Сумма]');
    const targetId = parts[1];
    const amount = parseInt(parts[2]);
    
    if (DB.users.has(targetId)) {
        const u = DB.users.get(targetId);
        u.balance += amount;
        io.to(targetId).emit('update_balance', { balance: u.balance });
        ctx.reply(`✅ Зачислено ${amount} пользователю ${u.name}`);
    } else {
        ctx.reply('❌ ID не найден');
    }
});

//// ====================================================================
// [9] СИСТЕМА ПЕРСИСТЕНТНОСТИ (DATA STORAGE & PERSISTENCE)
// ====================================================================

const USERS_FILE = path.join(__dirname, 'users_db.json');

/**
 * Сохранение всех данных пользователей на диск
 */
function saveDatabase() {
    try {
        const data = JSON.stringify(Array.from(DB.users.entries()), null, 2);
        fs.writeFileSync(USERS_FILE, data, 'utf8');
        CoreUtils.logger('info', 'База данных успешно сохранена в users_db.json');
    } catch (err) {
        CoreUtils.logger('error', `Ошибка сохранения БД: ${err.message}`);
    }
}

/**
 * Загрузка данных пользователей при старте
 */
function loadDatabase() {
    try {
        if (fs.existsSync(USERS_FILE)) {
            const data = fs.readFileSync(USERS_FILE, 'utf8');
            const entries = JSON.parse(data);
            DB.users = new Map(entries);
            CoreUtils.logger('info', `Загружено ${DB.users.size} пользователей из файла`);
        } else {
            CoreUtils.logger('warn', 'Файл базы данных не найден. Создана пустая БД');
        }
    } catch (err) {
        CoreUtils.logger('error', `Ошибка загрузки БД: ${err.message}`);
        DB.users = new Map();
    }
}

// Авто-сохранение каждые 5 минут
setInterval(saveDatabase, 5 * 60 * 1000);

// ====================================================================
// [10] РАСШИРЕННЫЙ REST API (DATA ENDPOINTS)
// ====================================================================

// Получение истории последних игр
app.get('/api/game/history', (req, res) => {
    res.json({
        success: true,
        history: DB.currentRound.history
    });
});

// Получение таблицы лидеров (Топ-10 по балансу)
app.get('/api/leaderboard', (req, res) => {
    const sorted = Array.from(DB.users.values())
        .sort((a, b) => b.balance - a.balance)
        .slice(0, 10)
        .map(u => ({ name: u.name, balance: u.balance, wins: u.totalWins }));
    
    res.json({ success: true, leaderboard: sorted });
});

// Получение глобальной статистики LootStarsX
app.get('/api/stats/global', (req, res) => {
    let totalEconomy = 0;
    let totalBets = 0;
    DB.users.forEach(u => {
        totalEconomy += u.balance;
        totalBets += u.totalBets;
    });

    res.json({
        success: true,
        stats: {
            users: DB.users.size,
            online: DB.activeSockets.size,
            total_economy: totalEconomy,
            total_bets: totalBets,
            rounds_completed: DB.currentRound.history.length
        }
    });
});

// ====================================================================
// [11] ADMIN API & SECURITY (INTERNAL)
// ====================================================================

// Middleware для проверки прав админа (для API)
const adminAuth = (req, res, next) => {
    const adminKey = req.headers['x-admin-id'];
    if (adminKey === SYSTEM_CONFIG.ADMIN_PRIMARY_ID) {
        next();
    } else {
        res.status(403).json({ error: 'Доступ запрещен' });
    }
};

// Админский метод: Изменение баланса через API
app.post('/api/admin/edit-balance', adminAuth, (req, res) => {
    const { targetId, amount, type } = req.body; // type: 'add' или 'set'
    
    if (!DB.users.has(targetId)) return res.status(404).json({ error: 'User not found' });
    
    const user = DB.users.get(targetId);
    if (type === 'add') user.balance += parseInt(amount);
    else user.balance = parseInt(amount);

    io.to(targetId).emit('update_balance', { balance: user.balance, reason: 'api_admin' });
    saveDatabase();

    res.json({ success: true, newBalance: user.balance });
});

// ====================================================================
// [12] СИСТЕМА ЗАВЕРШЕНИЯ И ЗАПУСК (BOOTSTRAP)
// ====================================================================

/**
 * Обработка сигналов завершения процесса (для Termux)
 */
function gracefulShutdown(signal) {
    CoreUtils.logger('warn', `Получен сигнал ${signal}. Завершение работы...`);
    
    // Останавливаем бота
    bot.stop(signal);
    
    // Сохраняем базу перед выходом
    saveDatabase();
    
    server.close(() => {
        CoreUtils.logger('info', 'Сервер LootStarsX остановлен');
        process.exit(0);
    });
}

// Слушатели системных событий
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Ловушка для необработанных ошибок
process.on('uncaughtException', (err) => {
    CoreUtils.logger('error', `Критическая ошибка: ${err.message}`);
    saveDatabase(); // Пытаемся спасти данные
});

/**
 * Финальный запуск всей системы
 */
function bootstrap() {
    CoreUtils.logger('info', `Инициализация сервера ${SYSTEM_CONFIG.PROJECT_NAME}...`);
    
    // Загружаем данные
    loadDatabase();

    // Запускаем прослушивание порта
    server.listen(SYSTEM_CONFIG.PORT, '0.0.0.0', () => {
        CoreUtils.logger('info', `==============================================`);
        CoreUtils.logger('info', `🚀 СЕРВЕР ЗАПУЩЕН НА ПОРТУ: ${SYSTEM_CONFIG.PORT}`);
        CoreUtils.logger('info', `🔗 ЛОКАЛЬНЫЙ АДРЕС: http://localhost:${SYSTEM_CONFIG.PORT}`);
        CoreUtils.logger('info', `👑 ГЛАВНЫЙ АДМИН: ${SYSTEM_CONFIG.ADMIN_PRIMARY_ID}`);
        CoreUtils.logger('info', `==============================================`);
    });
}

// Поехали!
bootstrap();

// Конец файла srv.js
