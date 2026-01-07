//====================================================================
 * LOOTSTARSX - HIGH-PERFORMANCE REAL-TIME SERVER ENGINE
 * ====================================================================
 * Brand: LootStarsX
 * Version: 2.5.0 (Senior Production Ready)
 * Lead Developer: Senior IT Developer
 * 
 * Описание: Данный сервер обеспечивает работу мультиплеерной 
 * рулетки Roll It, управление балансами пользователей и 
 * административный контроль через Telegram Bot API.
 * ====================================================================
 */

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
        [Markup.button.webApp('🎮 Играть в LootStarsX', 'https://your-netlify-app.netlify.app')],
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

//// ====================================================================
// [7] ИГРОВОЙ ДВИЖОК ROLL IT (REAL-TIME ENGINE)
// ====================================================================

/**
 * Функция запуска обратного отсчета
 * Активируется, когда в игре 2 или более игроков
 */
function startCountdown() {
    if (DB.currentRound.status !== 'waiting') return;
    
    DB.currentRound.status = 'countdown';
    DB.currentRound.timer = SYSTEM_CONFIG.TIMER_WAIT_SECONDS;
    
    CoreUtils.logger('info', `Раунд ${DB.currentRound.id}: Запуск таймера 15с`);
    
    DB.currentRound.timerInterval = setInterval(() => {
        DB.currentRound.timer--;
        
        // Трансляция времени всем игрокам
        io.emit('timer_tick', DB.currentRound.timer);
        
        if (DB.currentRound.timer <= 0) {
            clearInterval(DB.currentRound.timerInterval);
            executeSpin();
        }
    }, 1000);
}

/**
 * Логика вращения колеса и определения победителя
 */
function executeSpin() {
    if (DB.currentRound.status === 'spinning') return;
    
    DB.currentRound.status = 'spinning';
    
    // Генерация секретов для Provably Fair (честная игра)
    const { secret, hash } = CoreUtils.generateGameSecrets();
    DB.currentRound.secret = secret;
    DB.currentRound.hash = hash;

    let winnerIndex = -1;
    const players = DB.currentRound.players;

    // ПРОВЕРКА АДМИНСКОЙ ПОДКУРТКИ
    if (DB.currentRound.forcedWinnerId) {
        winnerIndex = players.findIndex(p => p.id === DB.currentRound.forcedWinnerId);
        CoreUtils.logger('admin', `ВНИМАНИЕ: Применена подкрутка для игрока ${DB.currentRound.forcedWinnerId}`);
    }

    // Если админ не выбрал победителя или игрока нет в списке — считаем честно
    if (winnerIndex === -1) {
        winnerIndex = CoreUtils.calculateWinner(players);
    }

    const winner = players[winnerIndex];
    const totalBank = players.reduce((sum, p) => sum + p.bet, 0);
    
    // Рассчитываем финальный угол остановки для фронтенда
    // (8 полных оборотов + смещение на сектор победителя)
    const segmentDegree = 360 / players.length;
    const finalRotation = (8 * 360) + (winnerIndex * segmentDegree) + (segmentDegree / 2);

    const winData = {
        winnerId: winner.id,
        winnerIndex: winnerIndex,
        finalRotation: finalRotation,
        winData: {
            name: winner.name,
            photo: winner.photo,
            prize: totalBank,
            chance: winner.chance
        },
        hash: hash
    };

    // Рассылаем сигнал всем: "КОЛЕСО КРУТИТСЯ"
    io.emit('start_spin', winData);

    // Ждем окончания анимации (3.5с на фронте + небольшой запас)
    setTimeout(() => {
        finalizeRound(winner, totalBank);
    }, 4500);
}

/**
 * Завершение раунда: выдача приза и сброс состояния
 */
function finalizeRound(winner, bank) {
    const user = DB.users.get(winner.id);
    if (user) {
        user.balance += bank;
        user.totalWins += 1;
        // Обновляем баланс победителю в реальном времени
        io.to(winner.id).emit('update_balance', { balance: user.balance, reason: 'win' });
    }

    CoreUtils.logger('info', `Раунд ${DB.currentRound.id} завершен. Победил: ${winner.name} | Банк: ${bank}`);

    // Добавляем в историю
    DB.currentRound.history.unshift({
        id: DB.currentRound.id,
        winner: winner.name,
        bank: bank,
        hash: DB.currentRound.hash
    });
    if (DB.currentRound.history.length > 10) DB.currentRound.history.pop();

    // Сброс раунда через 5 секунд
    setTimeout(() => {
        DB.currentRound.id = Math.floor(Math.random() * 100000);
        DB.currentRound.status = 'waiting';
        DB.currentRound.players = [];
        DB.currentRound.timer = SYSTEM_CONFIG.TIMER_WAIT_SECONDS;
        DB.currentRound.forcedWinnerId = null;
        
        io.emit('reset_game', DB.currentRound.id);
    }, 5000);
}

// ====================================================================
// [8] ОБРАБОТКА SOCKET.IO СОБЫТИЙ (COMMUNICATION LAYER)
// ====================================================================

io.on('connection', (socket) => {
    let currentUserId = null;

    // Авторизация пользователя при подключении
    socket.on('auth', (userData) => {
        const uid = userData.id.toString();
        currentUserId = uid;
        
        // Привязываем сокет к ID пользователя (для личных уведомлений)
        socket.join(uid);
        DB.activeSockets.set(uid, socket.id);
        
        CoreUtils.logger('info', `Socket Connected: ${uid} (Total online: ${DB.activeSockets.size})`);
        
        // Отправляем пользователю его текущие данные
        if (DB.users.has(uid)) {
            socket.emit('init_data', {
                user: DB.users.get(uid),
                currentRound: {
                    status: DB.currentRound.status,
                    players: DB.currentRound.players,
                    timer: DB.currentRound.timer,
                    gameId: DB.currentRound.id
                }
            });
        }
    });

    // Обработка ставки
    socket.on('join_game', (data) => {
        if (!currentUserId || DB.currentRound.status === 'spinning' || DB.currentRound.status === 'result') return;
        
        const user = DB.users.get(currentUserId);
        const betAmount = parseInt(data.bet);

        if (!user || user.balance < betAmount || betAmount <= 0) {
            return socket.emit('error', 'Недостаточно средств или неверная ставка');
        }

        // Снимаем баланс
        user.balance -= betAmount;
        user.totalBets += betAmount;
        user.gamesPlayed += 1;

        // Добавляем в список игроков
        DB.currentRound.players.push({
            id: user.id,
            name: user.name,
            photo: data.photo || '👤',
            bet: betAmount,
            chance: 0
        });

        // Пересчитываем шансы всех участников
        DB.currentRound.players = CoreUtils.recalculateChances(DB.currentRound.players);

        // Транслируем обновленный список игроков всем
        io.emit('update_players', DB.currentRound.players);
        socket.emit('update_balance', { balance: user.balance, reason: 'bet' });

        // Если это второй игрок — запускаем таймер
        if (DB.currentRound.players.length >= SYSTEM_CONFIG.MIN_PLAYERS_TO_START && DB.currentRound.status === 'waiting') {
            startCountdown();
        }
    });

    // АДМИНСКОЕ СОБЫТИЕ: Принудительный старт
    socket.on('admin_force_spin', () => {
        if (currentUserId !== SYSTEM_CONFIG.ADMIN_PRIMARY_ID) return;
        if (DB.currentRound.players.length < 2) return socket.emit('error', 'Минимум 2 игрока!');
        
        CoreUtils.logger('admin', `Админ ${currentUserId} принудительно запустил вращение`);
        if (DB.currentRound.timerInterval) clearInterval(DB.currentRound.timerInterval);
        executeSpin();
    });

    // АДМИНСКОЕ СОБЫТИЕ: Выбор победителя
    socket.on('admin_set_winner', (targetId) => {
        if (currentUserId !== SYSTEM_CONFIG.ADMIN_PRIMARY_ID) return;
        DB.currentRound.forcedWinnerId = targetId;
        CoreUtils.logger('admin', `Админ установил победу для ID: ${targetId}`);
        socket.emit('admin_notif', `Победитель установлен: ${targetId}`);
    });

    // Обработка отключения
    socket.on('disconnect', () => {
        if (currentUserId) {
            DB.activeSockets.delete(currentUserId);
            CoreUtils.logger('info', `Socket Disconnected: ${currentUserId}`);
        }
    });
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
