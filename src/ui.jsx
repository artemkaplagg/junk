import React, { useMemo, useState, useEffect } from 'react';
import { 
  Star, Trophy, Crown, User, Home, Gamepad2, 
  Bell, CheckCircle2, ExternalLink, Wallet, 
  Settings, Info, ShieldCheck, Zap, RefreshCw, 
  TrendingUp, Users, AlertCircle, Coins, 
  ChevronRight, Award, History, Share2, MousePointer2,
  X, PlusCircle, ArrowUpRight, LayoutGrid
} from 'lucide-react';

/**
 * ====================================================================
 * LOOTSTARSX - PREMIUM LIGHT INTERFACE (REMASTERED)
 * ====================================================================
 * Этот файл содержит всю визуальную логику приложения.
 * Дизайн оптимизирован под Photo #4 (Light Mode / Glassmorphism)
 * ====================================================================
 */

// [1] ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ (UI ATOMS)
// --------------------------------------------------------------------

export const GlobalStyles = () => (
    <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f8faff;
            color: #1a1c2e;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
        }

        .neo-card {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.5);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.03);
        }

        .indigo-gradient {
            background: linear-gradient(135deg, #5d5fef 0%, #8688f2 100%);
        }

        .text-gradient {
            background: linear-gradient(135deg, #2a2d7c 0%, #5d5fef 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .wheel-container {
            filter: drop-shadow(0 30px 60px rgba(93, 95, 239, 0.15));
        }

        @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }

        .animate-bounce-slow {
            animation: bounce-slow 3s infinite ease-in-out;
        }

        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    `}} />
);

export const LSXBadge = ({ children, color = 'indigo' }) => {
    const styles = {
        indigo: 'bg-[#f0f3ff] text-[#5d5fef] border-indigo-100',
        green: 'bg-green-50 text-green-600 border-green-100',
        yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
        red: 'bg-red-50 text-red-600 border-red-100'
    };
    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[color]}`}>
            {children}
        </span>
    );
};

// [2] ГЛАВНЫЙ ЭКРАН (HOME TAB)
// --------------------------------------------------------------------

export const HomeTab = ({ user, balance, bonusClaimed, onClaimBonus, onPlay }) => {
    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-700">
            
            {/* Header / Top Profile */}
            <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-50 overflow-hidden">
                         {user.photo ? <img src={user.photo} className="w-full h-full object-cover"/> : <User className="text-gray-300"/>}
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Игрок</div>
                        <div className="text-lg font-black text-[#1a1c2e] leading-none">{user.name}</div>
                    </div>
                </div>
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 border border-gray-100 shadow-sm">
                    <LayoutGrid size={20} />
                </div>
            </div>

            {/* Баланс - Главная карточка */}
            <div className="indigo-gradient rounded-[3rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-200 group">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
                
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="bg-white/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-white/30 backdrop-blur-md">
                        Твой кошелек
                    </div>
                    
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 bg-white rounded-[1.5rem] flex items-center justify-center shadow-2xl">
                            <Coins size={32} className="text-[#5d5fef]" />
                        </div>
                        <div className="text-5xl font-black italic tracking-tighter tracking-[-0.05em]">
                            {balance.toLocaleString()}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 w-full">
                        <button className="bg-white text-[#5d5fef] py-4 rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all">ПОПОЛНИТЬ</button>
                        <button className="bg-black/10 text-white border border-white/20 py-4 rounded-2xl font-black text-sm active:scale-95 transition-all">ВЫВЕСТИ</button>
                    </div>
                </div>
            </div>

            {/* Секция: Игры */}
            <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Доступные режимы</h3>
                
                <div className="relative group cursor-pointer" onClick={onPlay}>
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                    <div className="relative bg-white border border-gray-100 p-6 rounded-[2.5rem] flex items-center justify-between shadow-sm hover:shadow-xl transition-all">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-[#f0f3ff] rounded-3xl flex items-center justify-center text-[#5d5fef] group-hover:scale-110 transition-transform duration-500">
                                <Gamepad2 size={32} />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-[#1a1c2e] italic">ROLL IT!</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Онлайн: 16 чел.</span>
                                </div>
                            </div>
                        </div>
                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:bg-[#5d5fef] group-hover:text-white transition-all">
                            <ChevronRight />
                        </div>
                    </div>
                </div>
            </div>

            {/* Секция: Задания */}
            <div className="bg-[#f0f3ff] border border-indigo-100 rounded-[2.5rem] p-6 relative overflow-hidden">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-[#5d5fef]">
                        <Bell size={28} />
                    </div>
                    <div>
                        <h4 className="font-black text-[#2a2d7c]">БОНУС 50 🪙</h4>
                        <p className="text-xs text-indigo-400 font-bold">Подписка на канал проекта</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <a href="https://t.me/LootstarsX" target="_blank" className="flex-1 bg-white text-[#5d5fef] py-4 rounded-2xl font-black text-center text-xs border border-indigo-100 shadow-sm active:scale-95 transition-all">ПЕРЕЙТИ</a>
                    <button 
                        onClick={onClaimBonus} 
                        disabled={bonusClaimed}
                        className="flex-[1.5] bg-[#5d5fef] text-white py-4 rounded-2xl font-black text-xs shadow-lg shadow-indigo-100 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {bonusClaimed ? 'НАГРАДА ПОЛУЧЕНА' : 'ПРОВЕРИТЬ ПОДПИСКУ'}
                    </button>
                </div>
            </div>

            {/* Линия истории */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'ИГР', val: '124', icon: History },
                    { label: 'ПОБЕД', val: '42', icon: Trophy },
                    { label: 'УРОВЕНЬ', val: '12', icon: Zap }
                ].map((s, i) => (
                    <div key={i} className="bg-white border border-gray-100 p-4 rounded-[1.8rem] flex flex-col items-center justify-center text-center shadow-sm">
                        <s.icon size={16} className="text-gray-300 mb-2" />
                        <div className="text-lg font-black text-[#1a1c2e] leading-none">{s.val}</div>
                        <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">{s.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Продолжение во второй части...// ====================================================================
// [3] ЭКРАН ИГРЫ (PLAY TAB - LIGHT PREMIUM DESIGN)
// --------------------------------------------------------------------

/**
 * PlayTab - Основной игровой интерфейс рулетки
 * Реализован по Photo #4: Светлые тона, неоновые тени, чистая типографика.
 */
export const PlayTab = ({ 
    gameState, 
    players, 
    totalBank, 
    timer, 
    rotation, 
    gameNumber, 
    onJoin 
}) => {
    // Локальные состояния для ввода суммы
    const [selectedBet, setSelectedBet] = useState(100);
    const [isBetting, setIsBetting] = useState(false);

    // Расчет текущего прогресса таймера для визуального кольца
    const timerPercent = (timer / 15) * 100;

    return (
        <div className="p-4 space-y-6 animate-in fade-in zoom-in-95 duration-500 pb-28">
            
            {/* GAME HEADER - Информация о банке и игроках */}
            <div className="flex justify-between items-end px-2 pt-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Раунд {gameNumber}
                        </span>
                    </div>
                    <h2 className="text-3xl font-black italic text-[#2a2d7c] tracking-tighter uppercase leading-none">
                        PWP ROLL 🎰
                    </h2>
                </div>
                
                <div className="text-right">
                    <div className="flex items-center justify-end gap-2 text-[#5d5fef]">
                        <span className="text-2xl font-black">{totalBank.toLocaleString()}</span>
                        <div className="w-8 h-8 bg-[#f0f3ff] rounded-xl flex items-center justify-center border border-indigo-100">
                            <Coins size={18} />
                        </div>
                    </div>
                    <div className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">
                        Общий призовой фонд
                    </div>
                </div>
            </div>

            {/* ИНФО-БАР: Количество участников */}
            <div className="flex gap-2 px-2 overflow-x-auto no-scrollbar">
                <div className="bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-2 whitespace-nowrap">
                    <Users size={14} className="text-[#5d5fef]" />
                    <span className="text-[10px] font-black text-gray-600 uppercase">Игроков: {players.length}</span>
                </div>
                <div className="bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-2 whitespace-nowrap">
                    <ShieldCheck size={14} className="text-green-500" />
                    <span className="text-[10px] font-black text-gray-600 uppercase">Честная игра</span>
                </div>
                <div className="bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-2 whitespace-nowrap">
                    <Zap size={14} className="text-yellow-500" />
                    <span className="text-[10px] font-black text-gray-600 uppercase">Live</span>
                </div>
            </div>

            {/* СЕКЦИЯ КОЛЕСА (Будет дополнена в следующей части) */}
            <div className="relative flex justify-center py-6">
                {/* Внешнее декоративное кольцо со свечением */}
                <div className="relative w-80 h-80 rounded-full bg-white shadow-[0_40px_100px_rgba(93,95,239,0.12)] p-4 flex items-center justify-center border border-gray-50">
                    <WheelGraphic 
                        players={players} 
                        rotation={rotation} 
                        gameState={gameState} 
                        timer={timer} 
                    />
                </div>
            </div>

            {/* ПАНЕЛЬ УПРАВЛЕНИЯ СТАВКАМИ */}
            <div className="bg-white rounded-[2.8rem] p-6 shadow-xl shadow-indigo-100/20 border border-gray-50 space-y-6">
                <div className="flex justify-between items-center px-2">
                    <h3 className="text-xs font-black text-[#1a1c2e] uppercase tracking-widest italic">Выбери сумму</h3>
                    <div className="text-[10px] font-bold text-gray-400">Мин: 5 🪙</div>
                </div>

                {/* Сетки пресетов */}
                <div className="grid grid-cols-5 gap-2">
                    {[5, 10, 25, 50, 100].map((amt) => (
                        <button 
                            key={amt}
                            onClick={() => setSelectedBet(amt)}
                            className={`
                                py-3.5 rounded-2xl font-black text-xs transition-all border-2
                                ${selectedBet === amt 
                                    ? 'bg-[#5d5fef] border-[#5d5fef] text-white shadow-lg shadow-indigo-200' 
                                    : 'bg-[#f8faff] border-transparent text-gray-400 hover:bg-[#f0f3ff]'}
                            `}
                        >
                            +{amt}
                        </button>
                    ))}
                </div>

                {/* Кнопка "ПОСТАВИТЬ" */}
                <button 
                    onClick={() => onJoin(selectedBet)}
                    disabled={gameState === 'spinning'}
                    className={`
                        w-full indigo-gradient text-white py-5 rounded-[1.8rem] font-black text-lg 
                        shadow-2xl shadow-indigo-300 active:scale-95 transition-all
                        flex items-center justify-center gap-3 disabled:grayscale disabled:opacity-50
                    `}
                >
                    <Zap size={22} fill="currentColor" />
                    ПОСТАВИТЬ {selectedBet.toLocaleString()} 🪙
                </button>
            </div>
        </div>
    );
};// ====================================================================
// [4] ВИЗУАЛИЗАЦИЯ КОЛЕСА (WHEEL ENGINE)
// --------------------------------------------------------------------

/**
 * WheelGraphic - Высокопроизводительный компонент рулетки.
 * Реализует логику отрисовки сегментов на основе веса ставок.
 */
export const WheelGraphic = ({ players, rotation, gameState, timer }) => {
    // Вычисляем суммарный банк для расчета пропорций
    const totalBank = useMemo(() => players.reduce((sum, p) => sum + p.bet, 0), [players]);

    return (
        <div className="relative w-full h-full wheel-container select-none">
            {/* Указатель (Pointer) - Фиксированный сверху */}
            <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 z-50 filter drop-shadow-lg">
                <div className="w-1.5 h-12 bg-[#5d5fef] rounded-full shadow-[0_0_15px_rgba(93,95,239,0.4)]"></div>
            </div>

            {/* Вращающаяся часть */}
            <div 
                className="w-full h-full transition-transform duration-[4000ms] cubic-bezier(0.15, 0, 0.15, 1)"
                style={{ transform: `rotate(-${rotation}deg)` }}
            >
                <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                    {/* Если игроков нет - рисуем пустой круг */}
                    {players.length === 0 ? (
                        <circle cx="50" cy="50" r="50" fill="#f0f3ff" stroke="#e0e7ff" strokeWidth="0.5" />
                    ) : (
                        players.map((player, index) => {
                            // Расчет углов сегмента
                            let offset = 0;
                            for (let i = 0; i < index; i++) {
                                offset += (players[i].bet / totalBank) * 360;
                            }
                            const sliceAngle = (player.bet / totalBank) * 360;
                            
                            // Координаты для path
                            const startAngle = offset;
                            const endAngle = offset + sliceAngle;

                            const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                            const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                            const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                            const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);

                            const largeArcFlag = sliceAngle > 180 ? 1 : 0;
                            const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

                            // Цвета сегментов (чередуем индиго и нежно-синий)
                            const fillColor = index % 2 === 0 ? '#5d5fef' : '#a5a6f6';

                            return (
                                <g key={player.id}>
                                    <path 
                                        d={pathData} 
                                        fill={fillColor} 
                                        stroke="white" 
                                        strokeWidth="1.2"
                                        className="transition-all duration-500"
                                    />
                                    {/* Аватарка игрока внутри его сектора */}
                                    <foreignObject
                                        x={50 + 34 * Math.cos((Math.PI * (startAngle + sliceAngle / 2)) / 180) - 5}
                                        y={50 + 34 * Math.sin((Math.PI * (startAngle + sliceAngle / 2)) / 180) - 5}
                                        width="10"
                                        height="10"
                                        className="pointer-events-none"
                                    >
                                        <div className="w-full h-full rounded-full border-2 border-white shadow-sm overflow-hidden bg-white">
                                            {player.photo !== '👤' ? (
                                                <img src={player.photo} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[5px] font-black text-[#5d5fef]">
                                                    {player.name[0]}
                                                </div>
                                            )}
                                        </div>
                                    </foreignObject>
                                </g>
                            );
                        })
                    )}
                </svg>
            </div>

            {/* ЦЕНТРАЛЬНЫЙ БЛОК: Таймер или Статус */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-white rounded-full shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)] border-[8px] border-[#f8faff] flex flex-col items-center justify-center z-40">
                <div className="text-3xl font-black text-[#2a2d7c] italic leading-none">
                    {gameState === 'countdown' ? `${timer}s` : (gameState === 'spinning' ? '🎲' : '0s')}
                </div>
                <div className="text-[7px] font-black text-gray-400 uppercase tracking-widest mt-1">
                    {gameState === 'waiting' ? 'Ожидание' : 'До спина'}
                </div>
            </div>
        </div>
    );
};
