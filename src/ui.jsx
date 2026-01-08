import React, { useMemo, useState } from 'react';
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
 * LOOTSTARSX - PREMIUM LIGHT INTERFACE v3.5 (STABLE)
 * ====================================================================
 */

// [1] ГЛОБАЛЬНЫЕ СТИЛИ И АНИМАЦИИ
export const GlobalStyles = () => (
    <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        body { font-family: 'Inter', sans-serif; background-color: #f8faff; color: #1a1c2e; overflow-x: hidden; }
        .indigo-gradient { background: linear-gradient(135deg, #5d5fef 0%, #8688f2 100%); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes draw-path { to { stroke-dashoffset: 0; } }
        .animate-draw-path { animation: draw-path 3s forwards ease-out; }
    `}} />
);

// [2] БЕЙДЖИ И КНОПКИ
export const LSXBadge = ({ children, color = 'indigo' }) => {
    const styles = {
        indigo: 'bg-[#f0f3ff] text-[#5d5fef] border-indigo-100',
        green: 'bg-green-50 text-green-600 border-green-100',
        yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100'
    };
    return <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[color]}`}>{children}</span>;
};

// [3] ГЛАВНЫЙ ЭКРАН
export const HomeTab = ({ user, balance, onPlay }) => (
    <div className="p-6 space-y-8 animate-in fade-in duration-700">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 text-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-3xl mx-auto flex items-center justify-center mb-4">
                <Gamepad2 size={40} className="text-[#5d5fef]" />
            </div>
            <h1 className="text-2xl font-black text-[#1a1c2e] mb-2 uppercase italic">LootStars<span className="text-[#5d5fef]">X</span></h1>
            <p className="text-gray-400 text-sm mb-6">Готов к игре, {user.name}?</p>
            <button onClick={onPlay} className="w-full bg-[#5d5fef] text-white py-5 rounded-3xl font-black shadow-lg shadow-indigo-200 active:scale-95 transition-all">ИГРАТЬ В ROLL IT</button>
        </div>

        <div className="bg-white rounded-[2rem] p-6 border border-gray-100 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-500"><Coins /></div>
                <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase">Баланс</div>
                    <div className="text-xl font-black text-[#1a1c2e]">{balance.toLocaleString()} 🪙</div>
                </div>
            </div>
        </div>
    </div>
);

// [4] ЭКРАН ИГРЫ (PHOTO #4 STYLE)
export const PlayTab = ({ gameState, players, totalBank, timer, rotation, onJoin }) => (
    <div className="p-4 space-y-6 animate-in fade-in">
        <div className="flex justify-between items-center px-2 py-4">
            <div className="w-12 h-12 bg-[#5d5fef] rounded-2xl flex items-center justify-center text-white font-bold shadow-lg">AP</div>
            <div className="flex gap-2">
                <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2 font-bold text-gray-600 text-sm">
                    <Star size={16} className="text-yellow-400" fill="currentColor"/> 50
                </div>
                <div className="bg-[#5d5fef] px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2 text-white font-bold text-sm">
                    {totalBank.toLocaleString()} <Coins size={16} />
                </div>
            </div>
        </div>

        <h2 className="text-center text-2xl font-black italic text-[#2a2d7c] uppercase tracking-tighter">PWP ROLL 🎰</h2>

        {/* WHITE WHEEL */}
        <div className="relative flex justify-center py-6">
            <div className="relative w-72 h-72 rounded-full bg-white shadow-2xl p-4 border border-gray-50">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-50 w-1.5 h-10 bg-[#5d5fef] rounded-full shadow-md"></div>
                <div className="w-full h-full transition-transform duration-[4000ms] cubic-bezier(0.15, 0, 0.15, 1)" style={{ transform: `rotate(-${rotation}deg)` }}>
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
                            return <path key={i} d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${angle > 180 ? 1 : 0} 1 ${x2} ${y2} Z`} fill={i % 2 === 0 ? '#5d5fef' : '#a5a6f6'} stroke="white" strokeWidth="1"/>;
                        })}
                    </svg>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white rounded-full shadow-inner flex items-center justify-center z-40 border border-gray-50">
                    <span className="text-3xl font-black text-[#2a2d7c] italic">{gameState === 'countdown' ? `${timer}s` : '---'}</span>
                </div>
            </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100 space-y-4">
            <div className="flex gap-2 justify-center">
                {[5, 10, 25, 50, 100].map(val => (
                    <button key={val} onClick={() => onJoin(val)} className="w-12 h-10 bg-[#f0f3ff] rounded-xl text-[#5d5fef] font-bold text-xs">+{val}</button>
                ))}
            </div>
            <button onClick={() => onJoin(500)} className="w-full indigo-gradient text-white py-5 rounded-3xl font-black text-lg shadow-xl active:scale-95 transition-all">ПОСТАВИТЬ 500 🪙</button>
        </div>
    </div>
);

// [5] МОДАЛКА ПОБЕДЫ
export const WinModal = ({ winner, onClose }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#1a1c2e]/90 backdrop-blur-xl animate-in fade-in">
        <div className="w-full max-w-sm bg-white rounded-[3rem] p-10 text-center space-y-6 shadow-2xl">
            <div className="relative inline-block">
                <div className="w-32 h-32 bg-indigo-500 rounded-[2.5rem] mx-auto flex items-center justify-center text-white text-5xl font-bold border-4 border-white shadow-lg overflow-hidden">
                    {winner.photo !== '👤' ? <img src={winner.photo} className="w-full h-full object-cover"/> : winner.name[0]}
                </div>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg rotate-12"><Trophy size={24} className="text-white"/></div>
            </div>
            <div className="text-2xl font-black text-[#1a1c2e]">{winner.name}</div>
            <div className="text-gray-400 text-sm">выиграл <span className="text-[#5d5fef] font-black">{winner.prize.toLocaleString()} 🪙</span></div>
            <button onClick={onClose} className="w-full bg-[#1a1c2e] text-white font-black py-4 rounded-2xl text-lg">Продолжить</button>
        </div>
    </div>
);

// [6] КРАШ ПРЕВЬЮ
export const CrashGamePreview = () => (
    <div className="p-6 pb-32 space-y-8 animate-in fade-in">
        <div className="text-center"><h2 className="text-2xl font-black text-[#1a1c2e] uppercase italic italic tracking-tighter">CRASH ENGINE 🚀</h2><LSXBadge color="yellow">COMING SOON</LSXBadge></div>
        <div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-xl h-80 flex flex-col justify-center items-center relative overflow-hidden">
            <svg className="absolute inset-0 w-full h-full p-10 overflow-visible opacity-10">
                <path d="M 0 200 Q 50 180, 100 150 T 350 20" fill="transparent" stroke="#5d5fef" strokeWidth="6" strokeLinecap="round" className="animate-draw-path" style={{ strokeDasharray: 1000, strokeDashoffset: 1000 }}/>
            </svg>
            <div className="text-6xl font-black italic text-[#5d5fef] tracking-tighter animate-pulse">x8.42</div>
        </div>
    </div>
);

// [7] ОБУЧЕНИЕ
export const InstructionModal = ({ onClose }) => (
    <div className="fixed inset-0 z-[150] bg-[#f8faff] p-8 flex flex-col items-center justify-center animate-in fade-in">
        <h2 className="text-4xl font-black italic text-[#1a1c2e] uppercase mb-10">КАК ИГРАТЬ?</h2>
        <div className="space-y-8 max-w-xs">
            <div className="flex gap-4"><div className="text-4xl font-black text-gray-100 italic">01</div><p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">Сделай свою ставку. Больше монет — больше шанс.</p></div>
            <div className="flex gap-4"><div className="text-4xl font-black text-gray-100 italic">02</div><p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">Дождись оппонентов. Раунд начнется автоматически.</p></div>
            <div className="flex gap-4"><div className="text-4xl font-black text-gray-100 italic">03</div><p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">Сорви джекпот. Колесо определит счастливчика.</p></div>
        </div>
        <button onClick={onClose} className="mt-12 w-full max-w-xs bg-[#1a1c2e] text-white py-5 rounded-[2rem] font-black text-lg">ПОНЯТНО!</button>
    </div>
);

// [8] ЗАГРУЗКА
export const SplashLoader = () => (
    <div className="fixed inset-0 z-[200] bg-[#f8faff] flex flex-col items-center justify-center p-12">
        <div className="relative mb-10">
            <div className="absolute inset-0 bg-[#5d5fef] rounded-[2.5rem] blur-[60px] opacity-10 animate-pulse"></div>
            <div className="relative w-24 h-24 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center rotate-12 border border-indigo-50">
                <Star fill="#5d5fef" size={48} className="text-[#5d5fef]" />
            </div>
        </div>
        <div className="text-center space-y-4">
            <h1 className="text-3xl font-black italic tracking-tighter text-[#1a1c2e] uppercase">
                LOOTSTARS<span className="text-[#5d5fef]">X</span>
            </h1>
            <div className="flex flex-col items-center gap-3">
                <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#5d5fef] rounded-full w-1/3 animate-pulse"></div>
                </div>
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.5em] animate-pulse">
                    Connecting to secure engine...
                </p>
            </div>
        </div>
    </div>
);

// [9] НАВИГАЦИЯ
export const BottomNav = ({ activeTab, setTab }) => (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[400px] z-50">
        <div className="bg-white/90 backdrop-blur-2xl border border-gray-100 p-2 rounded-[2.2rem] flex justify-between shadow-2xl pointer-events-auto">
            {[{id:'home', icon:Home, label:'Меню'}, {id:'play', icon:Trophy, label:'Играть'}, {id:'profile', icon:User, label:'Профиль'}].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-[1.8rem] transition-all duration-300 ${activeTab === t.id ? 'bg-[#5d5fef] text-white scale-105' : 'text-gray-300'}`}>
                    <t.icon size={22} />
                    {activeTab === t.id && <span className="text-[9px] font-black uppercase tracking-widest">{t.label}</span>}
                </button>
            ))}
        </div>
    </nav>
);

// [10] ПРОФИЛЬ
export const ProfileTab = ({ user, balance }) => (
    <div className="p-6 space-y-6 text-center animate-in fade-in">
        <div className="w-28 h-28 bg-white rounded-[2.5rem] mx-auto flex items-center justify-center border border-gray-100 shadow-sm relative">
            {user.photo ? <img src={user.photo} className="rounded-[2.5rem]" /> : <User size={48} className="text-gray-200" />}
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#5d5fef] rounded-xl flex items-center justify-center text-white border-4 border-[#f8faff]"><Zap size={14} fill="currentColor"/></div>
        </div>
        <h2 className="text-2xl font-black text-[#1a1c2e] tracking-tight">{user.name}</h2>
        <div className="bg-white rounded-[2.5rem] p-8 text-left border border-gray-100 shadow-sm space-y-6">
            <div><div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Баланс</div><div className="text-3xl font-black text-[#5d5fef] italic">{balance.toLocaleString()} 🪙</div></div>
            <div className="h-px bg-gray-50 w-full"></div>
            <div className="flex justify-between text-xs"><span className="text-gray-400 font-bold uppercase">ID</span><span className="text-[#1a1c2e] font-black font-mono">{user.id}</span></div>
        </div>
    </div>
);
