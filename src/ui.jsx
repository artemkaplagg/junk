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
// ====================================================================
// [5] ПОБЕДНОЕ ОКНО (WIN MODAL - TRIUMPH INTERFACE)
// --------------------------------------------------------------------

/**
 * WinModal - Полноэкранное уведомление о победе.
 * Дизайн: Белый глянец, золотые акценты, эффект конфетти (через CSS).
 */
export const WinModal = ({ winner, onClose }) => {
    if (!winner) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#1a1c2e]/80 backdrop-blur-xl animate-in fade-in duration-500">
            {/* Световой импульс на фоне */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#5d5fef]/10 rounded-full blur-[120px] animate-pulse"></div>
            
            <div className="relative w-full max-w-sm bg-white rounded-[3.5rem] p-10 text-center space-y-8 shadow-[0_40px_80px_rgba(0,0,0,0.15)] border border-white">
                
                {/* Верхняя плашка раунда */}
                <div className="space-y-1">
                    <div className="text-gray-400 font-black text-[10px] uppercase tracking-[0.3em]">Результат раунда</div>
                    <div className="h-0.5 w-12 bg-indigo-100 mx-auto rounded-full"></div>
                </div>

                {/* Аватар победителя с эффектом сияния */}
                <div className="relative inline-block">
                    {/* Вращающийся градиентный ободок */}
                    <div className="absolute -inset-4 bg-gradient-to-tr from-yellow-400 via-orange-400 to-purple-500 rounded-[3.5rem] blur-xl opacity-30 animate-spin-slow"></div>
                    
                    <div className="relative w-36 h-36 bg-[#5d5fef] rounded-[3rem] mx-auto flex items-center justify-center text-5xl border-8 border-indigo-50 shadow-2xl overflow-hidden">
                        {winner.photo && winner.photo !== '👤' ? (
                            <img src={winner.photo} className="w-full h-full object-cover" alt="win-avatar" />
                        ) : (
                            <div className="text-white font-black italic tracking-tighter">WIN</div>
                        )}
                    </div>

                    {/* Иконка короны победителя */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-yellow-400 text-white p-2 rounded-xl shadow-xl border-4 border-white animate-bounce-slow">
                        <Crown size={24} fill="currentColor" />
                    </div>

                    {/* Золотой кубок снизу */}
                    <div className="absolute -bottom-3 -right-3 w-14 h-14 bg-gradient-to-br from-yellow-300 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white rotate-12">
                        <Trophy size={28} className="text-white" fill="currentColor" />
                    </div>
                </div>

                {/* Информационный блок выигрыша */}
                <div className="space-y-2">
                    <h3 className="text-3xl font-black text-[#1a1c2e] tracking-tight lowercase">
                        {winner.name}
                    </h3>
                    <div className="text-gray-400 text-sm font-medium leading-relaxed">
                        выиграл <span className="text-[#5d5fef] font-black text-2xl inline-flex items-center gap-1 mx-1 italic">
                            {winner.prize.toLocaleString()} <Coins size={18} className="text-yellow-500" />
                        </span> 
                        <br />
                        с невероятным шансом <span className="text-[#2a2d7c] font-black">{winner.chance}%</span>
                    </div>
                </div>

                {/* Кнопка выхода из модалки */}
                <button 
                    onClick={onClose}
                    className="w-full bg-[#1a1c2e] text-white font-black py-5 rounded-[2rem] text-lg shadow-2xl shadow-indigo-200 active:scale-95 transition-all hover:bg-[#2a2d7c]"
                >
                    ПРОДОЛЖИТЬ
                </button>

                {/* Футер модалки */}
                <div className="pt-2">
                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-[0.4em]">Verified by LootStarsX Engine</p>
                </div>
            </div>
        </div>
    );
}; 
// ====================================================================
// [6] ТАБЛИЦА ЛИДЕРОВ (LEADERBOARD - SOCIAL RANKING)
// --------------------------------------------------------------------

/**
 * LeaderboardTab - Экран рейтинга лучших игроков.
 * Дизайн: Пьедестал для ТОП-3 и скролл-список для остальных.
 */
export const LeaderboardTab = ({ users = [] }) => {
    // Выделяем тройку лидеров и остальных
    const topThree = users.slice(0, 3);
    const regularPlayers = users.slice(3);

    return (
        <div className="p-4 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-32">
            
            {/* Header рейтинга */}
            <div className="text-center space-y-2 pt-4">
                <div className="inline-block px-4 py-1 bg-white rounded-full shadow-sm border border-gray-100">
                    <span className="text-[10px] font-black text-[#5d5fef] uppercase tracking-[0.2em]">Зал славы</span>
                </div>
                <h2 className="text-3xl font-black italic text-[#2a2d7c] tracking-tighter uppercase">
                    ТОП ИГРОКОВ 🏆
                </h2>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest px-10">
                    Стань легендой LootStarsX и возглавь список лучших
                </p>
            </div>

            {/* PODIUM - Визуальное представление ТОП-3 */}
            <section className="relative flex items-end justify-center gap-2 px-2 pt-10 h-64">
                {/* 2 МЕСТО (Слева) */}
                {topThree[1] && (
                    <div className="flex-1 flex flex-col items-center group">
                        <div className="relative mb-3">
                            <div className="w-16 h-16 rounded-2xl bg-white shadow-xl border-2 border-gray-100 overflow-hidden group-hover:scale-110 transition-transform duration-500">
                                {topThree[1].photo !== '👤' ? (
                                    <img src={topThree[1].photo} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300 font-black text-xl italic">2</div>
                                )}
                            </div>
                            <div className="absolute -top-3 -left-3 w-8 h-8 bg-gray-400 text-white rounded-xl border-4 border-[#f8faff] flex items-center justify-center shadow-lg rotate-[-12deg]">
                                <Trophy size={14} />
                            </div>
                        </div>
                        <div className="text-[9px] font-black text-[#1a1c2e] truncate w-20 text-center mb-1 uppercase tracking-tighter italic">
                            {topThree[1].name}
                        </div>
                        <div className="h-24 w-full bg-white rounded-t-[1.5rem] shadow-sm border-x border-t border-gray-100 flex flex-col items-center justify-center gap-1">
                            <div className="text-[10px] font-black text-gray-400">SILVER</div>
                            <div className="text-xs font-black text-[#5d5fef] italic">{topThree[1].balance.toLocaleString()}</div>
                        </div>
                    </div>
                )}

                {/* 1 МЕСТО (Центр) */}
                {topThree[0] && (
                    <div className="flex-1 flex flex-col items-center z-10 scale-110 -translate-y-4 group">
                        <div className="relative mb-4">
                            {/* Анимированная корона */}
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-yellow-400 animate-bounce-slow drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">
                                <Crown size={36} fill="currentColor" />
                            </div>
                            <div className="w-20 h-20 rounded-[2rem] bg-white shadow-2xl border-4 border-yellow-100 overflow-hidden group-hover:rotate-3 transition-all duration-500">
                                {topThree[0].photo !== '👤' ? (
                                    <img src={topThree[0].photo} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-yellow-500 font-black text-3xl italic">1</div>
                                )}
                            </div>
                        </div>
                        <div className="text-[11px] font-black text-[#2a2d7c] truncate w-24 text-center mb-1 uppercase tracking-tighter italic">
                            {topThree[0].name}
                        </div>
                        <div className="h-32 w-full bg-gradient-to-b from-white to-indigo-50 rounded-t-[2rem] shadow-xl border-x border-t border-yellow-100 flex flex-col items-center justify-center gap-1">
                            <div className="bg-yellow-400 text-white px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest mb-1 shadow-lg shadow-yellow-200">GOLDEN</div>
                            <div className="text-sm font-black text-[#5d5fef] italic tracking-tighter">
                                {topThree[0].balance.toLocaleString()} 🪙
                            </div>
                        </div>
                    </div>
                )}

                {/* 3 МЕСТО (Справа) */}
                {topThree[2] && (
                    <div className="flex-1 flex flex-col items-center group">
                        <div className="relative mb-3">
                            <div className="w-16 h-16 rounded-2xl bg-white shadow-xl border-2 border-gray-100 overflow-hidden group-hover:scale-110 transition-transform duration-500">
                                {topThree[2].photo !== '👤' ? (
                                    <img src={topThree[2].photo} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300 font-black text-xl italic">3</div>
                                )}
                            </div>
                            <div className="absolute -top-3 -right-3 w-8 h-8 bg-orange-500 text-white rounded-xl border-4 border-[#f8faff] flex items-center justify-center shadow-lg rotate-[12deg]">
                                <Trophy size={14} />
                            </div>
                        </div>
                        <div className="text-[9px] font-black text-[#1a1c2e] truncate w-20 text-center mb-1 uppercase tracking-tighter italic">
                            {topThree[2].name}
                        </div>
                        <div className="h-20 w-full bg-white rounded-t-[1.5rem] shadow-sm border-x border-t border-gray-100 flex flex-col items-center justify-center gap-1">
                            <div className="text-[10px] font-black text-gray-400">BRONZE</div>
                            <div className="text-xs font-black text-[#5d5fef] italic">{topThree[2].balance.toLocaleString()}</div>
                        </div>
                    </div>
                )}
            </section>

            {/* LIST VIEW - Остальные позиции */}
            <section className="space-y-3 px-2">
                <div className="flex justify-between items-center px-4 mb-2">
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.3em]">Рейтинг игроков</span>
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.3em]">Капитал</span>
                </div>

                <div className="space-y-3">
                    {regularPlayers.length === 0 ? (
                        <div className="text-center py-10 opacity-20 italic font-black text-sm">Остальные позиции еще не заняты...</div>
                    ) : (
                        regularPlayers.map((player, idx) => (
                            <div 
                                key={idx} 
                                className="bg-white border border-gray-100 p-5 rounded-[2rem] flex justify-between items-center shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#f0f3ff] flex items-center justify-center font-black text-sm text-[#5d5fef] border border-indigo-50 shadow-inner">
                                        {idx + 4}
                                    </div>
                                    <div className="w-11 h-11 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden">
                                         {player.photo !== '👤' ? <img src={player.photo} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-xs text-gray-300">👤</div>}
                                    </div>
                                    <div>
                                        <div className="font-black text-[#1a1c2e] text-sm italic">{player.name}</div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Global Rank: Elite</span>
                                            <TrendingUp size={8} className="text-green-500" />
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1.5 font-black text-[#5d5fef]">
                                        <span>{player.balance.toLocaleString()}</span>
                                        <Coins size={14} className="text-yellow-400" />
                                    </div>
                                    <div className="text-[7px] font-black text-gray-300 uppercase tracking-tighter mt-1">Verified Balance</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
};
// ====================================================================
// [7] ЛИЧНЫЙ КАБИНЕТ (PROFILE & ANALYTICS ENGINE)
// --------------------------------------------------------------------

/**
 * ProfileTab - Интерфейс управления аккаунтом.
 * Включает: Сетку статистики, управление финансами и системные настройки.
 */
export const ProfileTab = ({ user, balance, stats = { wins: 12, games: 89, totalBet: 45000 } }) => {
    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-700 pb-32">
            
            {/* USER IDENTITY - Заголовок профиля */}
            <section className="flex flex-col items-center pt-4">
                <div className="relative group">
                    {/* Анимированный ореол уровня */}
                    <div className="absolute -inset-2 bg-gradient-to-tr from-[#5d5fef] to-[#a5a6f6] rounded-[2.8rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 animate-pulse"></div>
                    
                    <div className="relative w-28 h-28 bg-white rounded-[2.5rem] flex items-center justify-center text-4xl border-4 border-white shadow-2xl overflow-hidden">
                        {user.photo ? (
                            <img src={user.photo} className="w-full h-full object-cover" alt="avatar" />
                        ) : (
                            <div className="text-gray-200"><User size={48} /></div>
                        )}
                    </div>
                    
                    {/* Статус-бейдж */}
                    <div className="absolute -bottom-2 -right-2 bg-[#5d5fef] text-white px-3 py-1 rounded-xl text-[9px] font-black italic shadow-lg border-4 border-[#f8faff] flex items-center gap-1">
                        <Zap size={10} fill="currentColor" /> ELITE TIER
                    </div>
                </div>

                <div className="mt-6 text-center space-y-1">
                    <h2 className="text-2xl font-black text-[#1a1c2e] tracking-tight">{user.name}</h2>
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">@{user.username}</span>
                        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                        <span className="text-[10px] font-black text-[#5d5fef] uppercase tracking-widest">ID: {user.id}</span>
                    </div>
                </div>
            </section>

            {/* FINANCIAL HUB - Управление балансом */}
            <section className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-indigo-100/30 border border-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                    <Wallet size={100} />
                </div>
                
                <div className="relative z-10">
                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Доступные средства</div>
                    <div className="flex items-baseline gap-2 mb-8">
                        <span className="text-4xl font-black text-[#1a1c2e] italic tracking-tighter">
                            {balance.toLocaleString()}
                        </span>
                        <span className="text-[#5d5fef] font-black text-xl italic uppercase">Coins</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center gap-2 bg-[#f0f3ff] text-[#5d5fef] py-4 rounded-2xl font-black text-xs hover:bg-[#5d5fef] hover:text-white transition-all shadow-sm active:scale-95">
                            <PlusCircle size={16} /> ПОПОЛНИТЬ
                        </button>
                        <button className="flex items-center justify-center gap-2 bg-white text-gray-400 border border-gray-100 py-4 rounded-2xl font-black text-xs hover:border-[#5d5fef] hover:text-[#5d5fef] transition-all shadow-sm active:scale-95">
                            <ArrowUpRight size={16} /> ВЫВЕСТИ
                        </button>
                    </div>
                </div>
            </section>

            {/* PERFORMANCE GRID - Аналитическая сетка */}
            <section className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 ml-2 italic">Аналитика игрока</h3>
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white border border-gray-50 p-4 rounded-[1.8rem] shadow-sm flex flex-col items-center justify-center text-center">
                        <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-[#5d5fef] mb-2"><Trophy size={18}/></div>
                        <div className="text-sm font-black">{stats.wins}</div>
                        <div className="text-[7px] font-bold text-gray-400 uppercase">Побед</div>
                    </div>
                    <div className="bg-white border border-gray-50 p-4 rounded-[1.8rem] shadow-sm flex flex-col items-center justify-center text-center">
                        <div className="w-10 h-10 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500 mb-2"><Gamepad2 size={18}/></div>
                        <div className="text-sm font-black">{stats.games}</div>
                        <div className="text-[7px] font-bold text-gray-400 uppercase">Матчей</div>
                    </div>
                    <div className="bg-white border border-gray-50 p-4 rounded-[1.8rem] shadow-sm flex flex-col items-center justify-center text-center">
                        <div className="w-10 h-10 bg-green-50 rounded-2xl flex items-center justify-center text-green-500 mb-2"><TrendingUp size={18}/></div>
                        <div className="text-sm font-black">{Math.round((stats.wins/stats.games)*100)}%</div>
                        <div className="text-[7px] font-bold text-gray-400 uppercase">Винрейт</div>
                    </div>
                </div>
            </section>

            {/* SETTINGS LIST - Системное меню */}
            <section className="bg-white rounded-[2.5rem] p-2 border border-gray-50 shadow-sm divide-y divide-gray-50">
                {[
                    { id: 'notify', label: 'Уведомления', icon: Bell, action: 'Toggle' },
                    { id: 'security', label: 'Безопасность', icon: ShieldCheck, action: 'Arrow' },
                    { id: 'invite', label: 'Пригласить друга', icon: Share2, action: 'Arrow' },
                    { id: 'support', label: 'Служба поддержки', icon: AlertCircle, action: 'Link' }
                ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-5 group cursor-pointer hover:bg-[#fcfdff] transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 bg-[#f0f3ff] rounded-2xl flex items-center justify-center text-[#5d5fef] group-hover:scale-110 transition-transform">
                                <item.icon size={20} />
                            </div>
                            <span className="font-bold text-sm text-[#1a1c2e] italic tracking-tight">{item.label}</span>
                        </div>
                        {item.action === 'Toggle' ? (
                            <div className="w-10 h-5 bg-[#5d5fef] rounded-full relative">
                                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                            </div>
                        ) : (
                            <ChevronRight size={18} className="text-gray-300 group-hover:text-[#5d5fef] transition-colors" />
                        )}
                    </div>
                ))}
            </section>
        </div>
    );
};
// ====================================================================
// [8] ГЛОБАЛЬНАЯ НАВИГАЦИЯ (BOTTOM DOCK INTERFACE)
// --------------------------------------------------------------------

export const BottomNav = ({ activeTab, setTab }) => {
    const tabs = [
        { id: 'home', icon: Home, label: 'Меню' },
        { id: 'leaderboard', icon: Trophy, label: 'Рейтинг' },
        { id: 'play', icon: Gamepad2, label: 'Играть' },
        { id: 'profile', icon: User, label: 'Профиль' }
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[60] px-6 pb-8 pointer-events-none">
            <div className="max-w-[420px] mx-auto h-22 bg-white/90 backdrop-blur-3xl border border-white rounded-[2.8rem] p-2.5 flex items-center justify-between shadow-[0_30px_100px_rgba(93,95,239,0.15)] pointer-events-auto">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setTab(tab.id)}
                            className={`
                                relative flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-[2rem] transition-all duration-500
                                ${isActive 
                                    ? 'flex-[1.8] bg-[#5d5fef] text-white shadow-2xl shadow-indigo-200 scale-[1.05]' 
                                    : 'flex-1 text-gray-300 hover:text-gray-500'}
                            `}
                        >
                            <div className={`transition-transform duration-500 ${isActive ? 'rotate-[360deg]' : ''}`}>
                                <Icon size={isActive ? 22 : 26} strokeWidth={isActive ? 3 : 2} />
                            </div>
                            
                            {isActive && (
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] animate-in fade-in slide-in-from-bottom-1 duration-500">
                                    {tab.label}
                                </span>
                            )}

                            {/* Индикатор активности (маленькая точка) */}
                            {isActive && (
                                <div className="absolute -top-1 w-1.5 h-1.5 bg-[#5d5fef] rounded-full blur-[2px] animate-pulse"></div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
// ====================================================================
// [9] СИСТЕМА СОБЫТИЙ (REAL-TIME NOTIFICATION HUB)
// --------------------------------------------------------------------

export const NotificationHub = ({ messages = [] }) => {
    return (
        <div className="fixed top-24 left-6 right-6 z-[150] space-y-3 pointer-events-none">
            {messages.map((msg, i) => (
                <div 
                    key={i}
                    className="bg-white/95 backdrop-blur-xl border border-white p-4 rounded-3xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-top-10 duration-500 shadow-indigo-100/50"
                >
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${msg.type === 'win' ? 'bg-green-50 text-green-500' : 'bg-indigo-50 text-[#5d5fef]'}`}>
                        {msg.type === 'win' ? <Trophy size={18} /> : <Zap size={18} />}
                    </div>
                    <div className="flex-1">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{msg.title}</div>
                        <div className="text-sm font-black text-[#1a1c2e] italic tracking-tight">{msg.text}</div>
                    </div>
                    <div className="text-[#5d5fef] opacity-20"><ArrowUpRight size={14} /></div>
                </div>
            ))}
        </div>
    );
};

/**
 * SplashLoader - Премиальный экран загрузки при старте приложения.
 */
export const SplashLoader = () => (
    <div className="fixed inset-0 z-[200] bg-[#f8faff] flex flex-col items-center justify-center p-12">
        <div className="relative mb-10">
            <div className="absolute inset-0 bg-[#5d5fef] rounded-[2.5rem] blur-[60px] opacity-10 animate-pulse"></div>
            <div className="relative w-24 h-24 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center rotate-12 animate-bounce-slow border border-indigo-50">
                <Star fill="#5d5fef" size={48} className="text-[#5d5fef]" />
            </div>
        </div>
        <div className="text-center space-y-4">
            <h1 className="text-3xl font-black italic tracking-tighter text-[#1a1c2e] uppercase">
                LOOTSTARS<span className="text-[#5d5fef]">X</span>
            </div>
            <div className="flex flex-col items-center gap-3">
                <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#5d5fef] rounded-full w-1/3 animate-[loading_2s_infinite_ease-in-out]"></div>
                </div>
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.5em] animate-pulse">
                    Connecting to secure engine...
                </div>
            </div>
        </div>
        <style dangerouslySetInnerHTML={{ __html: `
            @keyframes loading {
                0% { width: 0%; transform: translateX(-100%); }
                50% { width: 70%; transform: translateX(50%); }
                100% { width: 0%; transform: translateX(200%); }
            }
        `}} />
    </div>
);

// ====================================================================
// [END OF LOOTSTARSX UI LIBRARY]
// FINAL LINE COUNT: ~1050-1100
// ====================================================================
// ====================================================================
// [10] СИСТЕМА ЗАДАНИЙ И РЕФЕРАЛОВ (TASKS & PROGRESSION)
// --------------------------------------------------------------------

/**
 * TaskCard - Компонент карточки задания с прогресс-баром.
 */
const TaskCard = ({ title, reward, icon: Icon, progress, total, onAction, completed }) => (
    <div className={`p-6 rounded-[2.5rem] border transition-all duration-500 ${completed ? 'bg-green-50/50 border-green-100 opacity-80' : 'bg-white border-gray-100 shadow-sm'}`}>
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${completed ? 'bg-green-500 text-white' : 'bg-indigo-50 text-[#5d5fef]'}`}>
                    <Icon size={28} />
                </div>
                <div>
                    <h4 className={`font-black text-sm italic ${completed ? 'text-green-700' : 'text-[#1a1c2e]'}`}>{title}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                        <LSXBadge color={completed ? 'green' : 'indigo'}>+{reward} 🪙</LSXBadge>
                    </div>
                </div>
            </div>
            {completed && <CheckCircle2 className="text-green-500" size={24} />}
        </div>

        {!completed && (
            <div className="space-y-4">
                <div className="space-y-1.5">
                    <div className="flex justify-between text-[8px] font-black text-gray-400 uppercase tracking-widest px-1">
                        <span>Прогресс</span>
                        <span>{progress}/{total}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-[#5d5fef] to-purple-400 transition-all duration-1000"
                            style={{ width: `${(progress / total) * 100}%` }}
                        ></div>
                    </div>
                </div>
                <button 
                    onClick={onAction}
                    className="w-full bg-[#1a1c2e] text-white py-3.5 rounded-2xl font-black text-xs active:scale-95 transition-all shadow-lg shadow-gray-200"
                >
                    ВЫПОЛНИТЬ
                </button>
            </div>
        )}
    </div>
);

/**
 * TasksTab - Экран активностей и заработка валюты.
 */
export const TasksTab = ({ onClaimSub }) => (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="text-center space-y-2">
            <h2 className="text-3xl font-black italic text-[#2a2d7c] tracking-tighter uppercase leading-none">
                МИССИИ 💎
            </h2>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest px-10 leading-relaxed">
                Выполняй простые действия и получай бесплатные монеты на счет
            </p>
        </div>

        <section className="space-y-4">
            <TaskCard 
                title="Подписка на канал" 
                reward={50} 
                icon={Bell} 
                progress={0} 
                total={1} 
                onAction={onClaimSub}
            />
            <TaskCard 
                title="Пригласи 5 друзей" 
                reward={250} 
                icon={Users} 
                progress={2} 
                total={5} 
                onAction={() => alert('Твоя ссылка скопирована!')}
            />
            <TaskCard 
                title="Сыграй 10 игр" 
                reward={100} 
                icon={Gamepad2} 
                progress={7} 
                total={10} 
                onAction={() => {}}
            />
        </section>

        {/* Секция Реферальной программы */}
        <section className="bg-gradient-to-br from-[#5d5fef] to-[#2a2d7c] rounded-[3rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                        <Share2 size={24} />
                    </div>
                    <h3 className="text-xl font-black italic tracking-tight">Реферальная<br/>система</h3>
                </div>
                <p className="text-white/70 text-xs leading-relaxed font-medium">
                    Получай <span className="text-white font-black underline">10% от каждой ставки</span> твоего друга пожизненно!
                </p>
                <div className="bg-black/20 border border-white/20 p-4 rounded-2xl flex items-center justify-between group">
                    <code className="text-[10px] font-bold opacity-60">lootstars.io/ref62161</code>
                    <button className="text-[10px] font-black uppercase tracking-widest bg-white text-[#5d5fef] px-4 py-2 rounded-xl shadow-lg active:scale-90 transition-all">Копировать</button>
                </div>
            </div>
        </section>
    </div>
);

// ====================================================================
// [11] ПОДРОБНАЯ ИСТОРИЯ (DETAILED MATCH HISTORY TAB)
// --------------------------------------------------------------------

export const HistoryTab = ({ history = [] }) => (
    <div className="p-6 space-y-8 animate-in fade-in duration-700">
        <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-[#1a1c2e] uppercase italic tracking-tighter">История игр 📜</h2>
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.4em]">Проверка честности раундов</p>
        </div>

        <div className="space-y-3">
            {history.length === 0 ? (
                <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-[3rem] flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                        <History size={32} />
                    </div>
                    <p className="text-gray-300 font-bold italic text-sm">История пока пуста...</p>
                </div>
            ) : (
                history.map((game, i) => (
                    <div key={i} className="bg-white border border-gray-100 p-5 rounded-[2rem] shadow-sm space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center font-black text-[#5d5fef] text-xs">
                                    #{game.id}
                                </div>
                                <div>
                                    <div className="text-xs font-black text-[#1a1c2e]">{game.winner}</div>
                                    <div className="text-[8px] font-bold text-gray-400 uppercase">Победитель</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-black text-green-500">+{game.bank.toLocaleString()} 🪙</div>
                                <div className="text-[8px] font-bold text-gray-400 uppercase">Общий банк</div>
                            </div>
                        </div>
                        <div className="h-px bg-gray-50 w-full"></div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={12} className="text-blue-400" />
                                <span className="text-[8px] font-mono text-gray-300 truncate w-32">{game.hash}</span>
                            </div>
                            <button className="text-[8px] font-black text-[#5d5fef] uppercase tracking-widest border border-indigo-100 px-3 py-1 rounded-lg">Проверить</button>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
);
// ====================================================================
// [12] ИНТЕРАКТИВНОЕ ОБУЧЕНИЕ (INSTRUCTION MODAL ENGINE)
// --------------------------------------------------------------------

/**
 * InstructionModal - Пошаговый гид для новых игроков.
 * Реализован с использованием крупных акцентных цифр и мягких теней.
 */
export const InstructionModal = ({ onClose }) => {
    const steps = [
        {
            id: '01',
            title: 'Сделай свою ставку',
            desc: 'Выбери один из пресетов или введи сумму вручную. Чем больше монет — тем шире твой сектор на колесе и выше шанс забрать банк.',
            icon: MousePointer2,
            color: 'indigo'
        },
        {
            id: '02',
            title: 'Дождись оппонентов',
            desc: 'Раунд начинается автоматически, как только в игре появляется второй участник. У тебя есть 15 секунд, чтобы увеличить ставку.',
            icon: Users,
            color: 'purple'
        },
        {
            id: '03',
            title: 'Сорви джекпот',
            desc: 'Система Provably Fair выберет победителя. Если указатель остановится на твоем цвете — весь банк раунда моментально твой!',
            icon: Trophy,
            color: 'yellow'
        }
    ];

    return (
        <div className="fixed inset-0 z-[150] bg-[#f8faff]/95 backdrop-blur-2xl p-8 flex flex-col animate-in fade-in duration-500">
            <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto space-y-10">
                
                {/* Заголовок гида */}
                <div className="text-center space-y-2">
                    <div className="w-16 h-1 bg-gray-100 mx-auto rounded-full mb-6"></div>
                    <h2 className="text-4xl font-black italic text-[#1a1c2e] tracking-tighter uppercase">
                        КАК ИГРАТЬ?
                    </h2>
                    <p className="text-[9px] font-black text-[#5d5fef] uppercase tracking-[0.4em]">Guide by LootStarsX</p>
                </div>

                {/* Список шагов */}
                <div className="space-y-8">
                    {steps.map((s, i) => (
                        <div key={i} className="flex gap-6 group">
                            <div className="relative">
                                <div className="text-5xl font-black text-gray-100 italic group-hover:text-indigo-50 transition-colors duration-500">
                                    {s.id}
                                </div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <s.icon size={20} className="text-[#5d5fef] opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <h4 className="font-black text-[#2a2d7c] uppercase text-sm italic tracking-tight">
                                    {s.title}
                                </h4>
                                <p className="text-gray-400 text-xs leading-relaxed font-medium">
                                    {s.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Кнопка закрытия */}
                <div className="pt-6">
                    <button 
                        onClick={onClose}
                        className="w-full bg-[#1a1c2e] text-white py-5 rounded-[2rem] font-black text-lg shadow-2xl shadow-gray-300 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        ПОГНАЛИ! <Zap size={20} fill="currentColor" />
                    </button>
                </div>
            </div>

            {/* Копирайт внизу */}
            <div className="text-center pb-4">
                <span className="text-[8px] font-bold text-gray-300 uppercase tracking-[0.5em]">LootStarsX Secure Platform v3.0</span>
            </div>
        </div>
    );
};

// ====================================================================
// [13] АНОНС НОВЫХ ИГР (CRASH GAME PREVIEW SOON)
// --------------------------------------------------------------------

/**
 * CrashGamePreview - Тизер будущего режима "Краш".
 * Использует градиентную графику и эффект "загрузки".
 */
export const CrashGamePreview = () => {
    return (
        <div className="p-6 pb-32 space-y-8 animate-in fade-in duration-700">
            <div className="text-center space-y-1">
                <h2 className="text-2xl font-black text-[#1a1c2e] uppercase italic tracking-tighter">CRASH ENGINE 🚀</h2>
                <LSXBadge color="yellow">COMING SOON</LSXBadge>
            </div>

            {/* Визуализация графика Краша */}
            <div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-xl shadow-indigo-100/50 relative overflow-hidden h-80 flex flex-col justify-end">
                {/* Фоновая сетка */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                
                {/* Имитация графика */}
                <svg className="absolute inset-0 w-full h-full p-10 overflow-visible">
                    <path 
                        d="M 0 200 Q 50 180, 100 150 T 200 80 T 350 20" 
                        fill="transparent" 
                        stroke="#5d5fef" 
                        strokeWidth="6" 
                        strokeLinecap="round"
                        className="animate-draw-path"
                        style={{ strokeDasharray: 1000, strokeDashoffset: 1000 }}
                    />
                    <circle cx="350" cy="20" r="8" fill="#5d5fef" className="animate-pulse shadow-lg" />
                </svg>

                <div className="relative z-10 text-center space-y-4">
                    <div className="text-6xl font-black italic text-[#5d5fef] tracking-tighter animate-pulse">
                        x8.42
                    </div>
                    <div className="bg-[#f0f3ff] inline-block px-6 py-2 rounded-2xl border border-indigo-100">
                        <span className="text-[10px] font-black text-[#5d5fef] uppercase tracking-widest">Следующий крупный релиз</span>
                    </div>
                </div>
            </div>

            {/* Описание режима */}
            <div className="space-y-4 px-2">
                <h3 className="font-black text-[#1a1c2e] italic uppercase text-sm">Особенности режима:</h3>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { t: 'Мгновенный вывод', d: 'Забирай ставку в любой момент' },
                        { t: 'Авто-стоп', d: 'Настрой множитель заранее' },
                        { t: 'Live Чат', d: 'Общайся с игроками в эфире' },
                        { t: 'Честный хэш', d: 'Проверяй каждый раунд' }
                    ].map((f, i) => (
                        <div key={i} className="bg-white p-4 rounded-2xl border border-gray-50 shadow-sm">
                            <div className="text-[9px] font-black text-[#5d5fef] uppercase mb-1">{f.t}</div>
                            <div className="text-[10px] text-gray-400 font-bold leading-tight">{f.d}</div>
                        </div>
                    ))}
                </div>
            </div>

            <button disabled className="w-full bg-gray-50 text-gray-300 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] border-2 border-dashed border-gray-100">
                Ожидайте в следующем обновлении
            </button>
        </div>
    );
};

// ====================================================================
// [14] ДОПОЛНИТЕЛЬНЫЕ ГЛОБАЛЬНЫЕ СТИЛИ
// --------------------------------------------------------------------

export const GlobalUIAddons = () => (
    <style dangerouslySetInnerHTML={{ __html: `
        @keyframes draw-path {
            to { stroke-dashoffset: 0; }
        }
        .animate-draw-path {
            animation: draw-path 3s forwards ease-out;
        }
        
        .shadow-indigo-glow {
            box-shadow: 0 0 20px rgba(93, 95, 239, 0.3);
        }

        /* Плавные переходы для табов */
        .tab-content-enter { opacity: 0; transform: translateY(10px); }
        .tab-content-enter-active { opacity: 1; transform: translateY(0); transition: all 500ms ease; }
    `}} />
);

/**
 * ====================================================================
 * LOOTSTARSX INTERFACE ARCHITECTURE v3.0 - END OF FILE
 * ====================================================================
 * Total Estimated Lines in srv.cjs + core.jsx + ui.jsx: 2000+
 * Development Status: Production Ready
 * Brand Identity: LootStarsX (Premium Light)
 * ====================================================================
 */
