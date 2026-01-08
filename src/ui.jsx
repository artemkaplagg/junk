/**
 * ====================================================================
 * LOOTSTARSX - ADVANCED UI ARCHITECTURE
 * ====================================================================
 * Brand: LootStarsX
 * Version: 3.0.0 (High Fidelity UI)
 * Components: Atomic Design Pattern
 * ====================================================================
 */

import React, { useMemo, useState } from 'react';
import { 
  Star, Trophy, Crown, User, Home, Gamepad2, 
  Bell, CheckCircle2, ExternalLink, Wallet, 
  Settings, Info, ShieldCheck, Zap, RefreshCw, 
  TrendingUp, Users, AlertCircle, Coins, 
  ChevronRight, Award, History, Share2, MousePointer2,
  X, PlusCircle // Я добавил X и PlusCircle, так как они используются в коде
} from 'lucide-react';

// ====================================================================
// [1] ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ (UI ATOMS)
// ====================================================================

/**
 * LSXBadge - Компактный индикатор статуса
 */
export const LSXBadge = ({ children, color = 'purple', className = '' }) => {
    const colors = {
        purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        green: 'bg-green-500/20 text-green-400 border-green-500/30',
        yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        red: 'bg-red-500/20 text-red-400 border-red-500/30',
        gray: 'bg-white/5 text-gray-400 border-white/10'
    };
    
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${colors[color]} ${className}`}>
            {children}
        </span>
    );
};

/**
 * LSXButton - Универсальная кнопка с эффектами LootStarsX
 */
export const LSXButton = ({ 
    children, 
    onClick, 
    variant = 'primary', 
    size = 'md', 
    disabled = false, 
    loading = false,
    icon: Icon = null,
    className = ''
}) => {
    const variants = {
        primary: 'bg-white text-black hover:bg-gray-200 shadow-white/5',
        secondary: 'bg-white/5 text-white border border-white/10 hover:bg-white/10',
        accent: 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-purple-900/20',
        ghost: 'bg-transparent text-gray-400 hover:text-white',
        danger: 'bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/30'
    };

    const sizes = {
        sm: 'py-2 px-4 text-xs rounded-xl',
        md: 'py-3.5 px-6 text-sm rounded-2xl',
        lg: 'py-5 px-8 text-lg rounded-[1.5rem]'
    };

    return (
        <button 
            onClick={onClick}
            disabled={disabled || loading}
            className={`
                relative flex items-center justify-center gap-2 font-black transition-all active:scale-95 
                disabled:opacity-50 disabled:active:scale-100 disabled:grayscale
                ${variants[variant]} ${sizes[size]} ${className}
            `}
        >
            {loading ? (
                <RefreshCw size={20} className="animate-spin" />
            ) : (
                <>
                    {Icon && <Icon size={size === 'lg' ? 24 : 18} />}
                    {children}
                </>
            )}
        </button>
    );
};

/**
 * LSXCard - Оболочка для блоков контента
 */
export const LSXCard = ({ children, className = '', glow = false }) => {
    return (
        <div className={`
            relative bg-white/5 border border-white/10 rounded-[2.5rem] p-6 overflow-hidden
            ${glow ? 'shadow-[0_0_40px_rgba(168,85,247,0.1)]' : ''}
            ${className}
        `}>
            {glow && (
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
            )}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

/**
 * LSXInput - Стилизованное поле ввода
 */
export const LSXInput = ({ value, onChange, placeholder, label = null }) => {
    return (
        <div className="space-y-1.5">
            {label && <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-4">{label}</label>}
            <input 
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full bg-white/5 border-2 border-white/5 rounded-2xl px-5 py-3.5 outline-none focus:border-purple-500 focus:bg-white/10 transition-all font-bold text-sm"
            />
        </div>
    );
};

//
// ====================================================================
// [2] ГЛАВНЫЙ ЭКРАН (HOME TAB COMPONENTS)
// ====================================================================

/**
 * HomeTab - Основной контейнер главной страницы
 * Здесь собрана вся входная информация для игрока
 */
export const HomeTab = ({ user, balance, bonusClaimed, onClaimBonus, onPlay }) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-10">
            
            {/* HERO SECTION - Рекламный баннер LootStarsX */}
            <section className="relative group px-1">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-[#16132b] rounded-[2.5rem] p-8 border border-white/10 overflow-hidden">
                    {/* Декоративные элементы фона */}
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-white/5 backdrop-blur-xl rounded-3xl flex items-center justify-center mb-6 border border-white/10 shadow-2xl rotate-3 group-hover:rotate-6 transition-transform">
                            <Gamepad2 size={42} className="text-purple-400" />
                        </div>
                        
                        <h1 className="text-3xl font-black tracking-tighter italic mb-2">
                            ДОБРО ПОЖАЛОВАТЬ В <span className="text-purple-500">LOOTSTARSX</span>
                        </h1>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-[250px] mb-8">
                            Твой путь к миллионам начинается здесь. Участвуй в битвах и забирай банк!
                        </p>

                        <LSXButton 
                            variant="accent" 
                            size="lg" 
                            className="w-full shadow-2xl shadow-purple-500/20"
                            onClick={onPlay}
                            icon={Zap}
                        >
                            НАЧАТЬ ИГРАТЬ
                        </LSXButton>
                    </div>
                </div>
            </section>

            {/* LIVE FEED - Живая лента побед (имитация) */}
            <section className="space-y-3">
                <div className="flex justify-between items-center px-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                        <TrendingUp size={14} className="text-green-400" /> Живая лента
                    </h3>
                    <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-[10px] font-bold text-green-500">LIVE</span>
                    </div>
                </div>

                <div className="flex gap-3 overflow-x-auto no-scrollbar px-4">
                    {[
                        { user: 'Artem', win: '1,200', color: 'purple' },
                        { user: 'Alex', win: '450', color: 'blue' },
                        { user: 'Dmitry', win: '2,800', color: 'yellow' },
                        { user: 'LootMaster', win: '9,000', color: 'green' }
                    ].map((win, i) => (
                        <div key={i} className="flex-shrink-0 bg-white/5 border border-white/10 rounded-2xl py-3 px-4 flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full bg-${win.color}-500/20 flex items-center justify-center text-xs font-black text-${win.color}-400`}>
                                {win.user[0]}
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-gray-400">{win.user}</div>
                                <div className="text-xs font-black text-white">+{win.win} 🪙</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* STATS GRID - Сетка статистики пользователя */}
            <section className="grid grid-cols-2 gap-4">
                <LSXCard className="flex flex-col items-center text-center py-8">
                    <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-yellow-400 mb-3 border border-yellow-500/20">
                        <Award size={24} />
                    </div>
                    <div className="text-2xl font-black">12/89</div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Победы / Игры</div>
                </LSXCard>

                <LSXCard className="flex flex-col items-center text-center py-8">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 mb-3 border border-blue-500/20">
                        <TrendingUp size={24} />
                    </div>
                    <div className="text-2xl font-black">42%</div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Винрейт</div>
                </LSXCard>
            </section>

            {/* MISSIONS / TASKS - Система заданий */}
            <section className="space-y-4">
                <div className="px-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Доступные миссии</h3>
                </div>

                <div className="space-y-3">
                    {/* Задание: Подписка на канал */}
                    <div className={`
                        relative p-5 rounded-[2rem] border transition-all duration-500
                        ${bonusClaimed 
                            ? 'bg-green-500/5 border-green-500/20 opacity-70' 
                            : 'bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-blue-500/30'}
                    `}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${bonusClaimed ? 'bg-green-500/20 text-green-400' : 'bg-blue-600/20 text-blue-400'}`}>
                                    {bonusClaimed ? <CheckCircle2 size={32} /> : <Bell size={32} />}
                                </div>
                                <div>
                                    <h4 className="font-black text-lg">LootStarsX Channel</h4>
                                    <div className="flex items-center gap-2">
                                        <LSXBadge color={bonusClaimed ? 'green' : 'blue'}>
                                            {bonusClaimed ? 'Выполнено' : '+50 🪙'}
                                        </LSXBadge>
                                        <span className="text-[10px] font-bold text-gray-500 underline flex items-center gap-1">
                                            Условия <Info size={10} />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {!bonusClaimed && (
                            <div className="flex gap-3">
                                <a 
                                    href="https://t.me/LootstarsX" 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="flex-1 bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-black text-center text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <ExternalLink size={16} /> ПОДПИСАТЬСЯ
                                </a>
                                <button 
                                    onClick={onClaimBonus}
                                    className="flex-1 bg-white/10 hover:bg-white/20 py-4 rounded-2xl font-black text-sm border border-white/10 transition-all"
                                >
                                    ПРОВЕРИТЬ
                                </button>
                            </div>
                        )}
                        
                        {bonusClaimed && (
                            <div className="text-center py-2 text-green-400 font-bold text-xs flex items-center justify-center gap-2">
                                <ShieldCheck size={14} /> Награда зачислена на ваш баланс
                            </div>
                        )}
                    </div>

                    {/* Заглушка: Будущие миссии */}
                    <div className="p-5 rounded-[2rem] bg-white/5 border border-dashed border-white/10 opacity-50">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500">
                                <Users size={32} />
                            </div>
                            <div>
                                <h4 className="font-black text-gray-500">Пригласи 5 друзей</h4>
                                <LSXBadge color="gray">СКОРО</LSXBadge>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* DAILY REWARD PREVIEW */}
            <section className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black italic flex items-center gap-2">
                        <Star size={18} className="text-yellow-400" fill="currentColor" /> ЕЖЕДНЕВНЫЙ БОНУС
                    </h3>
                    <div className="text-[10px] font-bold text-gray-500">ДЕНЬ 1/7</div>
                </div>
                <div className="flex gap-2">
                    {[10, 20, 30, 40, 50, 100, 500].map((val, i) => (
                        <div key={i} className={`flex-1 aspect-square rounded-xl border flex flex-col items-center justify-center gap-1 ${i === 0 ? 'bg-yellow-500/20 border-yellow-500/50' : 'bg-white/5 border-white/10 opacity-40'}`}>
                            <span className="text-[8px] font-black">{i+1}д</span>
                            <span className="text-[10px] font-black">{val}</span>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

//// ====================================================================
// [3] ЭКРАН ИГРЫ (PLAY TAB & ROULETTE UI)
// ====================================================================

/**
 * PlayTab - НОВЫЙ ДИЗАЙН (Светлая тема + Центральный таймер)
 */
export const PlayTab = ({ gameState, players, totalBank, timer, rotation, gameNumber, onJoin }) => {
    return (
        <div className="min-h-screen bg-[#f8faff] text-[#1a1c2e] p-4 pb-32 animate-in fade-in">
            {/* Header как на 4 фото */}
            <div className="flex justify-between items-center mb-8 px-2">
                <div className="w-12 h-12 bg-[#5d5fef] rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">
                    AP
                </div>
                <div className="flex gap-2">
                    <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2">
                        <Star size={16} className="text-yellow-400" fill="currentColor"/>
                        <span className="font-bold text-sm text-gray-600">50</span>
                    </div>
                    <div className="bg-[#5d5fef] px-4 py-2 rounded-2xl shadow-lg shadow-indigo-100 flex items-center gap-2 text-white">
                        <span className="font-bold text-sm">{totalBank.toLocaleString()}</span>
                        <Coins size={16} />
                    </div>
                </div>
            </div>

            <h2 className="text-center text-2xl font-black italic text-[#2a2d7c] mb-6">PWP ROLL 🎰</h2>

            {/* WHEEL - Белое кольцо с аватарами */}
            <div className="relative flex justify-center mb-10">
                <div className="relative w-72 h-72 rounded-full bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-4">
                    {/* Указатель сверху */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-50">
                        <div className="w-1.5 h-10 bg-[#5d5fef] rounded-full"></div>
                    </div>

                    <div 
                        className="w-full h-full transition-transform duration-[4000ms] cubic-bezier(0.15, 0, 0.15, 1)"
                        style={{ transform: `rotate(-${rotation}deg)` }}
                    >
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                            {players.map((p, i) => {
                                const total = players.reduce((s, p) => s + p.bet, 0);
                                let offset = 0;
                                for(let j=0; j<i; j++) offset += (players[j].bet / total) * 360;
                                const angle = (p.bet / total) * 360;
                                
                                const x1 = 50 + 50 * Math.cos((Math.PI * offset) / 180);
                                const y1 = 50 + 50 * Math.sin((Math.PI * offset) / 180);
                                const x2 = 50 + 50 * Math.cos((Math.PI * (offset + angle)) / 180);
                                const y2 = 50 + 50 * Math.sin((Math.PI * (offset + angle)) / 180);

                                return (
                                    <path 
                                        key={i} 
                                        d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${angle > 180 ? 1 : 0} 1 ${x2} ${y2} Z`} 
                                        fill={i % 2 === 0 ? '#5d5fef' : '#a5a6f6'} 
                                        stroke="white" 
                                        strokeWidth="1.5"
                                    />
                                );
                            })}
                        </svg>
                        
                        {/* Аватарки на колесе как стикеры */}
                        {players.map((p, i) => {
                            const total = players.reduce((s, p) => s + p.bet, 0);
                            let offset = 0;
                            for(let j=0; j<i; j++) offset += (players[j].bet / total) * 360;
                            const angle = (p.bet / total) * 360;
                            const midAngle = offset + (angle / 2);
                            
                            const x = 50 + 32 * Math.cos((Math.PI * midAngle) / 180);
                            const y = 50 + 32 * Math.sin((Math.PI * midAngle) / 180);

                            return (
                                <div 
                                    key={i}
                                    className="absolute w-8 h-8 rounded-full border-2 border-white shadow-md overflow-hidden bg-white"
                                    style={{ 
                                        left: `${x}%`, 
                                        top: `${y}%`, 
                                        transform: 'translate(-50%, -50%)',
                                        zIndex: 20
                                    }}
                                >
                                    {p.photo !== '👤' ? <img src={p.photo} className="w-full h-full" /> : <div className="text-[10px] text-center mt-1">👤</div>}
                                </div>
                            );
                        })}
                    </div>

                    {/* Центр колеса с таймером */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white rounded-full shadow-inner flex items-center justify-center z-40">
                        <span className="text-3xl font-black text-[#2a2d7c] italic">
                            {gameState === 'countdown' ? `${timer}s` : '---'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Кнопки ставок */}
            <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100 space-y-6">
                <div className="flex gap-2 justify-center">
                    {[5, 10, 25, 50, 100].map(val => (
                        <button key={val} onClick={() => onJoin(val)} className="w-12 h-10 bg-[#f0f3ff] rounded-xl text-[#5d5fef] font-bold text-xs hover:bg-[#5d5fef] hover:text-white transition-all">+{val}</button>
                    ))}
                </div>
                <button 
                   onClick={() => onJoin(500)}
                   className="w-full bg-gradient-to-r from-[#5d5fef] to-[#8688f2] text-white py-5 rounded-3xl font-black text-lg shadow-xl shadow-indigo-100 active:scale-95 transition-all"
                >
                    ПОСТАВИТЬ 500 🪙
                </button>
            </div>
        </div>
    );
};

//// ====================================================================
// [4] ЭКРАН ПРОФИЛЯ (PROFILE TAB & SETTINGS)
// ====================================================================

/**
 * StatBox - Маленькая карточка статистики
 */
const StatBox = ({ label, value, icon: Icon, color = 'purple' }) => (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-4 flex flex-col items-center justify-center text-center group hover:bg-white/10 transition-all">
        <div className={`w-10 h-10 rounded-2xl bg-${color}-500/10 flex items-center justify-center text-${color}-400 mb-2 border border-${color}-500/20 group-hover:scale-110 transition-transform`}>
            <Icon size={20} />
        </div>
        <div className="text-lg font-black tracking-tight">{value}</div>
        <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{label}</div>
    </div>
);

/**
 * HistoryItem - Строка в истории игр
 */
const HistoryItem = ({ id, prize, isWin, date }) => (
    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-white/10 transition-all">
        <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isWin ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {isWin ? <Trophy size={20} /> : <AlertCircle size={20} />}
            </div>
            <div>
                <div className="text-xs font-black">Раунд #{id}</div>
                <div className="text-[10px] text-gray-500">{date}</div>
            </div>
        </div>
        <div className="text-right">
            <div className={`font-black ${isWin ? 'text-green-400' : 'text-gray-500'}`}>
                {isWin ? '+' : '-'}{prize.toLocaleString()} 🪙
            </div>
            <div className="text-[8px] font-bold text-gray-600 uppercase flex items-center justify-end gap-1">
                Verified <ShieldCheck size={8} />
            </div>
        </div>
    </div>
);

/**
 * ProfileTab - Интерфейс личного кабинета
 */
export const ProfileTab = ({ user, balance, stats }) => {
    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-24">
            
            {/* USER HEADER - Профиль и основная информация */}
            <section className="flex flex-col items-center pt-4">
                <div className="relative group">
                    {/* Анимированный ореол вокруг аватарки */}
                    <div className="absolute -inset-1.5 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-[2.8rem] blur opacity-40 group-hover:opacity-70 animate-pulse transition duration-1000"></div>
                    
                    <div className="relative w-28 h-28 bg-[#1a162d] rounded-[2.5rem] flex items-center justify-center text-5xl border-4 border-[#0f0c1d] shadow-2xl overflow-hidden">
                        {user.photo ? (
                            <img src={user.photo} className="w-full h-full object-cover" alt="avatar" />
                        ) : (
                            <User size={48} className="text-white/20" />
                        )}
                    </div>
                    
                    {/* Бейдж уровня/статуса */}
                    <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-black px-3 py-1 rounded-xl text-[10px] font-black italic shadow-lg border-2 border-[#0f0c1d]">
                        PRO USER
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <h2 className="text-2xl font-black tracking-tight">{user.name}</h2>
                    <div className="flex items-center justify-center gap-2 mt-1">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">@{user.username}</span>
                        <LSXBadge color="purple">ID: {user.id}</LSXBadge>
                    </div>
                </div>
            </section>

            {/* WALLET CARD - Управление балансом */}
            <section>
                <LSXCard glow className="relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Wallet size={80} />
                    </div>
                    
                    <div className="flex flex-col items-center text-center relative z-10">
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Доступный баланс</div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-yellow-500/20 rounded-2xl flex items-center justify-center text-yellow-400">
                                <Coins size={24} />
                            </div>
                            <div className="text-4xl font-black italic tracking-tighter text-white">
                                {balance.toLocaleString()}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 w-full">
                            <LSXButton variant="primary" size="md" className="w-full" icon={PlusCircle}>
                                ПОПОЛНИТЬ
                            </LSXButton>
                            <LSXButton variant="secondary" size="md" className="w-full" icon={ExternalLink}>
                                ВЫВЕСТИ
                            </LSXButton>
                        </div>
                    </div>
                </LSXCard>
            </section>

            {/* ANALYTICS GRID - Детальная статистика */}
            <section className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 px-4">Аналитика игрока</h3>
                <div className="grid grid-cols-3 gap-3">
                    <StatBox label="Всего игр" value={stats.games} icon={Gamepad2} color="blue" />
                    <StatBox label="Побед" value={stats.wins} icon={Trophy} color="yellow" />
                    <StatBox label="Винрейт" value={`${Math.round((stats.wins/stats.games)*100)}%`} icon={TrendingUp} color="green" />
                    <StatBox label="Оборот" value="45K" icon={Wallet} color="purple" />
                    <StatBox label="Max Ставка" value="1.2K" icon={Zap} color="red" />
                    <StatBox label="Реферал" value="4" icon={Users} color="cyan" />
                </div>
            </section>

            {/* MATCH HISTORY - Последние игры */}
            <section className="space-y-4">
                <div className="flex justify-between items-center px-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">История матчей</h3>
                    <button className="text-[10px] font-bold text-purple-400 uppercase tracking-widest hover:underline">См. все</button>
                </div>
                
                <div className="space-y-2">
                    <HistoryItem id="62160" prize={1200} isWin={true} date="Сегодня, 14:20" />
                    <HistoryItem id="62158" prize={500} isWin={false} date="Сегодня, 14:05" />
                    <HistoryItem id="62155" prize={2400} isWin={true} date="Сегодня, 13:50" />
                    <HistoryItem id="62152" prize={100} isWin={false} date="Вчера, 23:45" />
                </div>
            </section>

            {/* APP SETTINGS - Настройки приложения */}
            <section className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 px-4">Настройки</h3>
                <LSXCard className="p-2">
                    <div className="divide-y divide-white/5">
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <div className="text-purple-400"><Bell size={18} /></div>
                                <div className="text-sm font-bold">Уведомления</div>
                            </div>
                            <div className="w-10 h-5 bg-purple-600 rounded-full relative">
                                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <div className="text-purple-400"><Settings size={18} /></div>
                                <div className="text-sm font-bold">Звуковые эффекты</div>
                            </div>
                            <div className="w-10 h-5 bg-white/10 rounded-full relative border border-white/5">
                                <div className="absolute left-1 top-1 w-3 h-3 bg-white/20 rounded-full"></div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 group cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="text-purple-400"><Share2 size={18} /></div>
                                <div className="text-sm font-bold">Пригласить друга</div>
                            </div>
                            <ChevronRight size={18} className="text-gray-600 group-hover:text-white transition-colors" />
                        </div>
                    </div>
                </LSXCard>
            </section>

            {/* LOGOUT / DANGER AREA */}
            <section className="px-4">
                <button className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-red-400 transition-colors py-4 text-xs font-bold uppercase tracking-widest">
                    <AlertCircle size={14} /> Сообщить о проблеме
                </button>
            </section>
        </div>
    );
};

//// ====================================================================
// [5] МОДАЛЬНЫЕ ОКНА (WIN MODAL & ADMIN OVERLAYS)
// ====================================================================

/**
 * WinModal - Окно победы (реализация по твоему скриншоту)
 */
export const WinModal = ({ winner, onClose }) => {
    if (!winner) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0f0c1d]/95 backdrop-blur-2xl animate-in fade-in duration-500">
            {/* Вспышка на заднем плане */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-purple-600/10 rounded-full blur-[120px] animate-pulse"></div>
            
            <div className="relative w-full max-w-sm bg-gradient-to-b from-white/10 to-transparent border border-white/20 rounded-[3.5rem] p-10 text-center space-y-8 shadow-[0_0_80px_rgba(168,85,247,0.3)]">
                
                {/* Заголовок раунда */}
                <div className="space-y-1">
                    <div className="text-gray-500 font-black text-[10px] uppercase tracking-[0.3em]">Победа зафиксирована</div>
                    <h3 className="text-white/40 font-bold text-xs">РАУНД ИДЕТ В ИСТОРИЮ</h3>
                </div>

                {/* Аватар победителя с короной */}
                <div className="relative inline-block">
                    {/* Вращающееся свечение за авой */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 to-purple-600 rounded-[3rem] blur-xl opacity-50 animate-spin-slow"></div>
                    
                    <div className="relative w-36 h-36 bg-purple-600 rounded-[3rem] mx-auto flex items-center justify-center text-5xl border-4 border-white/20 shadow-2xl overflow-hidden">
                        {winner.photo && winner.photo !== '👤' ? (
                            <img src={winner.photo} className="w-full h-full object-cover" alt="win-avatar" />
                        ) : (
                            <div className="text-white font-black italic">WIN</div>
                        )}
                    </div>

                    {/* Золотая иконка кубка */}
                    <div className="absolute -bottom-3 -right-3 w-14 h-14 bg-gradient-to-br from-yellow-300 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl border-4 border-[#0f0c1d] rotate-12">
                        <Trophy size={28} className="text-black" />
                    </div>
                </div>

                {/* Текст выигрыша */}
                <div className="space-y-2">
                    <div className="text-3xl font-black tracking-tight">{winner.name}</div>
                    <div className="text-gray-400 text-sm leading-relaxed">
                        выиграл <span className="text-white font-black inline-flex items-center gap-1 italic">
                            {winner.prize.toLocaleString()} <Coins size={14} className="text-yellow-400" />
                        </span> 
                        <br />с шансом <span className="text-purple-400 font-black">{winner.chance}%</span>
                    </div>
                </div>

                {/* Кнопка продолжить */}
                <LSXButton 
                    variant="primary" 
                    size="lg" 
                    className="w-full shadow-2xl shadow-white/10"
                    onClick={onClose}
                >
                    ПРОДОЛЖИТЬ
                </LSXButton>
            </div>
        </div>
    );
};

/**
 * AdminPanel - Панель управления проектом (Senior Edition)
 */
export const AdminPanel = ({ players, onClose, onForceWinner, onSpinNow, socket }) => {
    const [activeTab, setActiveTab] = React.useState('game'); // game, users, economy
    const [targetId, setTargetId] = React.useState('');
    const [amount, setAmount] = React.useState('');

    return (
        <div className="fixed inset-0 z-[110] bg-[#0f0c1d]/98 backdrop-blur-3xl animate-in slide-in-from-top duration-700">
            <div className="max-w-md mx-auto h-full flex flex-col">
                
                {/* Header админки */}
                <div className="p-6 flex justify-between items-center border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-500/20 text-yellow-500 rounded-xl flex items-center justify-center">
                            <Crown size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black italic">LOOTSTARS<span className="text-purple-500">X</span> ADMIN</h2>
                            <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Control Management System</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-500/20 hover:text-red-500 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs для админки */}
                <div className="flex p-4 gap-2">
                    {['game', 'users', 'economy'].map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'bg-white/5 text-gray-500'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content админки */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                    
                    {activeTab === 'game' && (
                        <>
                            {/* Секция: Быстрые команды */}
                            <section className="space-y-4">
                                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest ml-2">Быстрые команды</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={onSpinNow}
                                        className="bg-green-500/10 border border-green-500/30 p-5 rounded-3xl flex flex-col items-center gap-2 hover:bg-green-500/20 transition-all"
                                    >
                                        <Zap size={24} className="text-green-500" />
                                        <span className="text-[10px] font-black uppercase">Spin Now</span>
                                    </button>
                                    <button 
                                        onClick={() => socket?.emit('admin_reset')}
                                        className="bg-red-500/10 border border-red-500/30 p-5 rounded-3xl flex flex-col items-center gap-2 hover:bg-red-500/20 transition-all"
                                    >
                                        <RefreshCw size={24} className="text-red-500" />
                                        <span className="text-[10px] font-black uppercase">Reset Game</span>
                                    </button>
                                </div>
                            </section>

                            {/* Секция: Подкрутка */}
                            <section className="space-y-4">
                                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest ml-2">Выбрать победителя</h3>
                                {players.length === 0 ? (
                                    <div className="bg-white/5 p-8 rounded-3xl text-center text-gray-600 font-bold italic border-2 border-dashed border-white/5">
                                        В игре пока нет участников
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {players.map((p, i) => (
                                            <button 
                                                key={i}
                                                onClick={() => onForceWinner(p.id)}
                                                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl flex justify-between items-center hover:border-purple-500/50 transition-all group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center font-black text-xs">
                                                        {p.name[0]}
                                                    </div>
                                                    <span className="font-bold text-sm">{p.name}</span>
                                                </div>
                                                <div className="text-[10px] font-black text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity uppercase">
                                                    Назначить фаворитом
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </>
                    )}

                    {activeTab === 'users' && (
                        <section className="space-y-6">
                            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest ml-2">Управление балансом</h3>
                            <div className="space-y-4">
                                <LSXInput 
                                    label="ID Пользователя" 
                                    placeholder="Введите Telegram ID..." 
                                    value={targetId}
                                    onChange={(e) => setTargetId(e.target.value)}
                                />
                                <LSXInput 
                                    label="Сумма (🪙)" 
                                    placeholder="Например: 1000" 
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                                <div className="flex gap-2 pt-2">
                                    <LSXButton 
                                        variant="accent" 
                                        className="flex-1"
                                        onClick={() => socket?.emit('admin_give', { targetId, amount: parseInt(amount) })}
                                    >
                                        ЗАЧИСЛИТЬ
                                    </LSXButton>
                                    <LSXButton 
                                        variant="danger" 
                                        className="flex-1"
                                        onClick={() => socket?.emit('admin_set', { targetId, amount: parseInt(amount) })}
                                    >
                                        УСТАНОВИТЬ
                                    </LSXButton>
                                </div>
                            </div>
                        </section>
                    )}
                </div>

                <div className="p-6 border-t border-white/5 text-center">
                    <p className="text-[8px] font-bold text-gray-700 uppercase tracking-[0.4em]">Internal Security Protected</p>
                </div>
            </div>
        </div>
    );
};

//// ====================================================================
// [6] ТАБЛИЦА ЛИДЕРОВ И НАВИГАЦИЯ (SOCIAL & NAVIGATION)
// ====================================================================

/**
 * LeaderboardItem - Строка в таблице лидеров
 */
const LeaderboardItem = ({ rank, name, balance, isCurrentUser }) => {
    const getRankStyles = (r) => {
        if (r === 1) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 ring-4 ring-yellow-500/10';
        if (r === 2) return 'bg-gray-300/20 text-gray-300 border-gray-300/30';
        if (r === 3) return 'bg-orange-600/20 text-orange-400 border-orange-600/30';
        return 'bg-white/5 text-gray-500 border-white/5';
    };

    return (
        <div className={`
            flex items-center justify-between p-5 rounded-[2rem] border transition-all duration-300
            ${isCurrentUser ? 'bg-purple-600/10 border-purple-500/50 scale-[1.02] shadow-xl' : 'bg-white/5 border-white/5'}
        `}>
            <div className="flex items-center gap-4">
                {/* Место в рейтинге */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border ${getRankStyles(rank)}`}>
                    {rank <= 3 ? <Trophy size={16} /> : rank}
                </div>
                
                {/* Инфо игрока */}
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="font-black text-sm">{name}</span>
                        {isCurrentUser && <LSXBadge color="purple" className="text-[7px]">YOU</LSXBadge>}
                    </div>
                    <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                        Tier: {rank <= 5 ? 'Elite' : 'Rookie'}
                    </div>
                </div>
            </div>

            <div className="text-right">
                <div className="text-sm font-black text-white flex items-center gap-1.5 justify-end">
                    {balance.toLocaleString()} <Coins size={14} className="text-yellow-400" />
                </div>
                <div className="text-[8px] font-bold text-gray-500 uppercase">Суммарный капитал</div>
            </div>
        </div>
    );
};

/**
 * LeaderboardTab - Экран топ-игроков LootStarsX
 */
export const LeaderboardTab = ({ users }) => {
    const topThree = users?.slice(0, 3) || [];
    const others = users?.slice(3) || [];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-24">
            
            {/* Подиум для ТОП-3 */}
            <section className="pt-6">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-2">Зал славы</h2>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Лучшие игроки текущего сезона</p>
                </div>

                <div className="flex items-end justify-center gap-2 px-2">
                    {/* 2 МЕСТО */}
                    {topThree[1] && (
                        <div className="flex-1 flex flex-col items-center">
                            <div className="w-16 h-16 rounded-2xl bg-gray-400/20 border-2 border-gray-400/40 mb-3 flex items-center justify-center overflow-hidden">
                                <span className="text-2xl font-black text-gray-400 italic">2</span>
                            </div>
                            <div className="text-[10px] font-black truncate w-20 text-center mb-1">{topThree[1].name}</div>
                            <div className="h-20 w-full bg-gradient-to-t from-gray-400/20 to-transparent rounded-t-2xl"></div>
                        </div>
                    )}

                    {/* 1 МЕСТО */}
                    {topThree[0] && (
                        <div className="flex-1 flex flex-col items-center scale-110 z-10">
                            <div className="relative mb-4">
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-400 animate-bounce">
                                    <Crown size={32} />
                                </div>
                                <div className="w-20 h-20 rounded-3xl bg-yellow-400/20 border-2 border-yellow-400/50 flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(250,204,21,0.2)]">
                                    <span className="text-3xl font-black text-yellow-400 italic">1</span>
                                </div>
                            </div>
                            <div className="text-xs font-black truncate w-24 text-center mb-1 text-yellow-400">{topThree[0].name}</div>
                            <div className="h-32 w-full bg-gradient-to-t from-yellow-400/20 to-transparent rounded-t-3xl"></div>
                        </div>
                    )}

                    {/* 3 МЕСТО */}
                    {topThree[2] && (
                        <div className="flex-1 flex flex-col items-center">
                            <div className="w-16 h-16 rounded-2xl bg-orange-600/20 border-2 border-orange-600/40 mb-3 flex items-center justify-center overflow-hidden">
                                <span className="text-2xl font-black text-orange-600 italic">3</span>
                            </div>
                            <div className="text-[10px] font-black truncate w-20 text-center mb-1">{topThree[2].name}</div>
                            <div className="h-16 w-full bg-gradient-to-t from-orange-600/20 to-transparent rounded-t-2xl"></div>
                        </div>
                    )}
                </div>
            </section>

            {/* Полный список */}
            <section className="space-y-3">
                <div className="px-4 flex justify-between items-center text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                    <span>Рейтинг игроков</span>
                    <span>Баланс</span>
                </div>
                
                <div className="space-y-3">
                    {others.length > 0 ? (
                        others.map((u, i) => (
                            <LeaderboardItem 
                                key={i}
                                rank={i + 4}
                                name={u.name}
                                balance={u.balance}
                                isCurrentUser={false}
                            />
                        ))
                    ) : (
                        <div className="text-center py-10 opacity-30 italic font-bold">Остальные позиции еще не заняты...</div>
                    )}
                </div>
            </section>
        </div>
    );
};

/**
 * BottomNav - Глобальное навигационное меню
 */
export const BottomNav = ({ activeTab, setTab }) => {
    const menuItems = [
        { id: 'home', icon: Home, label: 'Меню' },
        { id: 'leaderboard', icon: Trophy, label: 'ТОП' },
        { id: 'play', icon: Gamepad2, label: 'Roll It', accent: true },
        { id: 'profile', icon: User, label: 'Кабинет' }
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pointer-events-none">
            <div className="max-w-md mx-auto h-20 bg-[#16132b]/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-2 flex items-center justify-between pointer-events-auto shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                {menuItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.id}
                            onClick={() => setTab(item.id)}
                            className={`
                                relative flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-2xl transition-all duration-300
                                ${isActive ? 'flex-[1.5] bg-white text-black shadow-lg scale-105' : 'flex-1 text-gray-500 hover:text-white'}
                                ${item.accent && !isActive ? 'text-purple-400' : ''}
                            `}
                        >
                            <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}>
                                <Icon size={isActive ? 20 : 24} strokeWidth={isActive ? 3 : 2} />
                            </div>
                            
                            {isActive && (
                                <span className="text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-bottom-1 duration-300">
                                    {item.label}
                                </span>
                            )}

                            {!isActive && item.accent && (
                                <div className="absolute top-1 right-3 w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping"></div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

//// ====================================================================
// [7] ГЛОБАЛЬНЫЕ СИСТЕМЫ И ФИНАЛИЗАЦИЯ (CORE UI ENGINE)
// ====================================================================

/**
 * NotificationToast - Одиночное уведомление
 */
const NotificationToast = ({ message, type = 'info' }) => (
    <div className="animate-in slide-in-from-top-full duration-500 bg-[#1a162d]/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${type === 'win' ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'}`}>
            {type === 'win' ? <Trophy size={16} /> : <Zap size={16} />}
        </div>
        <div className="text-xs font-bold leading-tight">{message}</div>
    </div>
);

/**
 * NotificationHub - Контейнер для всех уведомлений системы
 */
export const NotificationHub = ({ notifications }) => (
    <div className="fixed top-20 left-4 right-4 z-[120] pointer-events-none space-y-2">
        {notifications.map((n, i) => (
            <NotificationToast key={i} message={n.text} type={n.type} />
        ))}
    </div>
);

/**
 * InstructionModal - Окно обучения (How to Play)
 */
export const InstructionModal = ({ onClose }) => (
    <div className="fixed inset-0 z-[150] bg-[#0f0c1d]/98 backdrop-blur-xl p-8 flex flex-col animate-in fade-in duration-500">
        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-4xl font-black italic tracking-tighter uppercase">Как играть?</h2>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em]">LootStarsX Guide</p>
            </div>

            <div className="space-y-6">
                {[
                    { step: '01', title: 'Сделай ставку', desc: 'Выбери сумму монет или введи свою. Твоя ставка увеличивает твой сектор на колесе.' },
                    { step: '02', title: 'Дождись игроков', desc: 'Как только зайдет минимум 2 игрока, начнется 15-секундный обратный отсчет.' },
                    { step: '03', title: 'Крути и побеждай', desc: 'Колесо определит победителя случайным образом. Весь банк раунда достается одному!' }
                ].map((s, i) => (
                    <div key={i} className="flex gap-6">
                        <div className="text-4xl font-black text-white/5 italic">{s.step}</div>
                        <div className="space-y-1">
                            <h4 className="font-black text-purple-400 uppercase text-sm italic">{s.title}</h4>
                            <p className="text-gray-400 text-xs leading-relaxed">{s.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            <LSXButton variant="accent" size="lg" className="w-full" onClick={onClose}>
                ПОНЯТНО, ПОЕХАЛИ!
            </LSXButton>
        </div>
    </div>
);

/**
 * SplashLoader - Экран загрузки при входе
 */
export const SplashLoader = () => (
    <div className="fixed inset-0 z-[200] bg-[#0f0c1d] flex flex-col items-center justify-center p-10">
        <div className="relative mb-8">
            <div className="absolute inset-0 bg-purple-600 rounded-3xl blur-3xl opacity-20 animate-pulse"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-purple-600 to-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl rotate-12">
                <Star fill="white" size={48} className="text-white" />
            </div>
        </div>
        <div className="text-center space-y-4">
            <div className="text-3xl font-black italic tracking-tighter uppercase">
                LOOTSTARS<span className="text-purple-500">X</span>
            </div>
            <div className="flex flex-col items-center gap-2">
                <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600 animate-loading-bar"></div>
                </div>
                <div className="text-[8px] font-bold text-gray-600 uppercase tracking-[0.5em] animate-pulse">
                    Connecting to engine...
                </div>
            </div>
        </div>
    </div>
);

/**
 * GlobalStyles - Инъекция кастомных стилей LootStarsX
 * Добавляет анимации, которых нет в стандартном Tailwind
 */
export const GlobalStyles = () => (
    <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loading-bar {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 100%; }
        }
        .animate-loading-bar {
            animation: loading-bar 2s infinite ease-in-out;
        }
        .animate-spin-slow {
            animation: spin 8s linear infinite;
        }
        .clip-path-triangle {
            clip-path: polygon(50% 100%, 0 0, 100% 0);
        }
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
        }
    `}} />
);

// ====================================================================
// LOOTSTARSX INTERFACE LIBRARY - END OF FILE
// Total Lines: ~1200
// ====================================================================
