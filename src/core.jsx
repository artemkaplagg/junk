// ==========================================
// LOOTSTARSX - CORE APPLICATION ENGINE
// Project: LootStarsX Telegram Mini App
// Lead Developer: IT Senior Developer
// Version: 2.1.0 (Fixed & Online)
// ==========================================

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  Star, Trophy, Crown, User, Home, 
  Gamepad2, PlusCircle, Bell, CheckCircle2,
  ExternalLink, Wallet, Settings as SettingsIcon,
  Navigation, Info, ShieldCheck, Zap, RefreshCw,
  TrendingUp, Users, AlertCircle, Coins
} from 'lucide-react';
import io from 'socket.io-client';

// ==========================================
// 1. УТИЛИТЫ И КОНФИГУРАЦИЯ
// ==========================================
const Utils = {
  formatNumber: (num) => new Intl.NumberFormat('ru-RU').format(num),
  generateGameHash: () => Math.random().toString(36).substring(2, 15),
  calculateChance: (bet, total) => total > 0 ? ((bet / total) * 100).toFixed(2) : 0
};

const GLOBAL_CONFIG = {
  ADMIN_ID: '6185367393',
  TESTER_ID: '6738617654',
  CHANNEL_URL: 'https://t.me/LootstarsX',
  BOT_TOKEN: '8523431126:AAFw_cxi4tPBb6tqYgu0siJ7PXF1wFPBKkM',
  BONUS_AMOUNT: 50,
  TIMER_DURATION: 15,
  WHEEL_COLORS: [
    '#8b5cf6', '#ec4899', '#3b82f6', '#10b981', 
    '#f59e0b', '#ef4444', '#06b6d4', '#84cc16'
  ],
  PRESET_BETS: [5, 10, 50, 100, 500]
};

const App = () => {
  // ==========================================
  // 2. СОСТОЯНИЕ И ДАННЫЕ
  // ==========================================
  const getInitialUserData = () => {
    const tg = window.Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user) {
      return {
        id: tg.initDataUnsafe.user.id.toString(),
        name: tg.initDataUnsafe.user.first_name || 'Player',
        username: tg.initDataUnsafe.user.username || 'unknown',
        photo: tg.initDataUnsafe.user.photo_url || null
      };
    }
    return { id: '6185367393', name: 'Artem Admin', username: 'admin_dev', photo: null };
  };

  const [user, setUser] = useState(getInitialUserData());
  const [socket, setSocket] = useState(null); 
  const isAdmin = user.id === GLOBAL_CONFIG.ADMIN_ID;

  const [balance, setBalance] = useState(0);
  const [bonusClaimed, setBonusClaimed] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);

  // Состояние игры
  const [currentTab, setCurrentTab] = useState('home');
  const [gameState, setGameState] = useState('waiting');
  const [gameId, setGameId] = useState('#00000');
  const [players, setPlayers] = useState([]);
  const [timer, setTimer] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState(null);
  
  const [selectedBet, setSelectedBet] = useState(100);
  const [customBetInput, setCustomBetInput] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [forcedWinnerId, setForcedWinnerId] = useState(null);

  const wheelRef = useRef(null);

  // ==========================================
  // 3. ПОДКЛЮЧЕНИЕ К СЕРВЕРУ (ONLINE)
  // ==========================================
  useEffect(() => {
    const newSocket = io('https://junk-dn2k.onrender.com'); 
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to Server');
      newSocket.emit('auth', user);
    });

    newSocket.on('init_data', (data) => {
       setBalance(data.user.balance);
       setGameState(data.currentRound.status);
       setPlayers(data.currentRound.players);
       setTimer(data.currentRound.timer);
       setGameId('#' + data.currentRound.gameId);
    });

    newSocket.on('update_balance', (data) => {
      setBalance(data.balance);
    });

    newSocket.on('update_players', (serverPlayers) => {
      setPlayers(serverPlayers);
    });

    newSocket.on('timer_tick', (timeLeft) => {
      setTimer(timeLeft);
      if (timeLeft > 0) setGameState('countdown');
    });

    newSocket.on('start_spin', (data) => {
      setGameState('spinning');
      setRotation(data.finalRotation);
      setTimeout(() => {
        setWinner(data.winData);
        setShowWinModal(true);
        setGameState('result');
      }, 3500);
    });

    newSocket.on('reset_game', (nextId) => {
      setPlayers([]);
      setGameState('waiting');
      setWinner(null);
      setShowWinModal(false);
      setGameId('#' + nextId);
      setRotation(0);
      setForcedWinnerId(null);
    });

    return () => newSocket.close();
  }, []);

  // ==========================================
  // 4. ЛОГИКА ФУНКЦИЙ
  // ==========================================
  const joinGame = () => {
    if (gameState === 'spinning' || gameState === 'result') return alert('⏳ Ждите раунд');
    if (balance < selectedBet) return alert('💰 Мало монет');
    if (socket) {
      socket.emit('join_game', {
        bet: selectedBet,
        photo: user.photo || '👤'
      });
    }
  };

  const spinNow = () => {
    if (isAdmin && socket) socket.emit('admin_force_spin');
  };

  const forceWinner = (id) => {
    if (isAdmin && socket) {
      setForcedWinnerId(id);
      socket.emit('admin_set_winner', id);
    }
  };

  const handlePresetBet = (amount) => {
    if (gameState === 'spinning') return;
    setSelectedBet(amount);
    setCustomBetInput('');
  };

  const handleCustomBetChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setCustomBetInput(value);
    if (value) setSelectedBet(parseInt(value));
  };

  const checkSubscription = async () => {
    setCheckLoading(true);
    try {
      const response = await fetch(`https://api.telegram.org/bot${GLOBAL_CONFIG.BOT_TOKEN}/getChatMember?chat_id=@LootstarsX&user_id=${user.id}`);
      const data = await response.json();
      if (data.ok && ['member', 'administrator', 'creator'].includes(data.result.status)) {
        if (!bonusClaimed) {
          setBalance(prev => prev + GLOBAL_CONFIG.BONUS_AMOUNT);
          setBonusClaimed(true);
          alert('✅ Подписка подтверждена! +50 монет.');
        }
      } else {
        alert('❌ Вы не подписаны на канал @LootstarsX');
      }
    } catch (e) {
      alert('⚠️ Ошибка API. Бот должен быть админом в канале.');
    } finally {
      setCheckLoading(false);
    }
  };

  const adminAddBalance = (targetId, amount) => {
    if (!isAdmin) return;
    alert(`💰 Команда отправлена для ID: ${targetId}`);
    // В реальном приложении тут был бы emit на сервер
  };

  // ==========================================
  // 5. РЕНДЕРИНГ КОМПОНЕНТОВ
  // ==========================================
  const Wheel = () => {
    if (players.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-full aspect-square border-4 border-dashed border-white/10 animate-pulse">
          <Gamepad2 size={64} className="text-white/20 mb-4" />
          <div className="text-white/40 font-bold uppercase tracking-widest text-sm">Ожидание игроков</div>
        </div>
      );
    }

    let currentAngle = 0;
    const totalBank = players.reduce((s, p) => s + p.bet, 0);

    return (
      <div className="relative w-full aspect-square max-w-[320px] mx-auto group">
        <div className="absolute top-[-15px] left-1/2 -translate-x-1/2 z-30 filter drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
          <div className="w-6 h-8 bg-white" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}></div>
        </div>

        <div className="w-full h-full transition-transform duration-[3500ms] cubic-bezier(0.15, 0, 0.15, 1)"
             style={{ transform: `rotate(-${rotation}deg)` }}>
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
            {players.map((player, index) => {
              const sliceAngle = (player.bet / totalBank) * 360;
              const startAngle = currentAngle;
              currentAngle += sliceAngle;
              const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
              const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
              const x2 = 50 + 50 * Math.cos((Math.PI * (startAngle + sliceAngle)) / 180);
              const y2 = 50 + 50 * Math.sin((Math.PI * (startAngle + sliceAngle)) / 180);
              const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${sliceAngle > 180 ? 1 : 0} 1 ${x2} ${y2} Z`;
              return (
                <path key={index} d={pathData} fill={GLOBAL_CONFIG.WHEEL_COLORS[index % 8]} stroke="#0f0c1d" strokeWidth="0.5" />
              );
            })}
            <circle cx="50" cy="50" r="12" fill="#0f0c1d" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0f0c1d] text-white font-sans overflow-x-hidden pb-32">
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-[#0f0c1d]/90 backdrop-blur-md border-b border-white/5 px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg rotate-3">
            <Star className="text-white" fill="currentColor" size={20} />
          </div>
          <div className="text-xl font-black italic uppercase">LOOTSTARS<span className="text-purple-500">X</span></div>
        </div>
        <div className="bg-white/5 px-4 py-2 rounded-2xl border border-white/10 font-bold flex items-center gap-2">
          <Coins size={16} className="text-yellow-400" />
          <span>{Utils.formatNumber(balance)}</span>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-6">
        {currentTab === 'home' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 p-6 rounded-[2rem] border border-white/10">
              <h2 className="text-2xl font-black mb-1">Привет, {user.name}! 👋</h2>
              <p className="text-gray-400 text-sm mb-6">Добро пожаловать в элитный игровой клуб LootStarsX.</p>
              <button onClick={() => setCurrentTab('play')} className="w-full bg-white text-black font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-all">ИГРАТЬ В ROLL IT</button>
            </div>
            <div className="bg-blue-600/20 border border-blue-500/30 p-5 rounded-[2rem]">
              <h3 className="font-black">Бонус за подписку</h3>
              <p className="text-xs text-blue-200/60 mb-4">Подпишись на канал и забери 50 монет</p>
              <div className="flex gap-2">
                <a href={GLOBAL_CONFIG.CHANNEL_URL} target="_blank" className="flex-1 bg-blue-600 py-3 rounded-xl font-bold text-center text-sm">Канал</a>
                <button onClick={checkSubscription} disabled={checkLoading || bonusClaimed} className="flex-1 bg-white/10 py-3 rounded-xl font-bold text-sm">
                  {bonusClaimed ? 'Получено' : 'Проверить'}
                </button>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'play' && (
          <div className="space-y-6 animate-in zoom-in-95">
            <div className="text-center space-y-1">
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Игра {gameId}</div>
              <h2 className="text-3xl font-black italic uppercase">ROLL IT!</h2>
            </div>
            <div className="relative py-4">
              <Wheel />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                {gameState === 'countdown' && <div className="text-5xl font-black text-purple-500">{timer}</div>}
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 space-y-5">
              <div className="flex justify-between items-end">
                <div className="text-2xl font-black text-purple-400">{Utils.formatNumber(players.reduce((s, p) => s + p.bet, 0))} 🪙</div>
                <div className="text-xl font-black">{players.length}👤</div>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {GLOBAL_CONFIG.PRESET_BETS.map(amt => (
                  <button key={amt} onClick={() => handlePresetBet(amt)} className={`px-5 py-3 rounded-2xl font-black transition-all ${selectedBet === amt ? 'bg-purple-600' : 'bg-white/5 text-gray-400'}`}>{amt}</button>
                ))}
                <input placeholder="Своя..." value={customBetInput} onChange={handleCustomBetChange} className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 w-24 text-center font-bold outline-none" />
              </div>
              <button onClick={joinGame} disabled={gameState === 'spinning'} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 py-5 rounded-[1.5rem] font-black text-lg active:scale-95 transition-all">ПОСТАВИТЬ {selectedBet} 🪙</button>
            </div>
            <div className="space-y-2">
              {players.map((p, i) => (
                <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-3xl flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center font-bold">{p.photo !== '👤' ? '🖼️' : '👤'}</div>
                    <div>
                      <div className="font-black text-sm">{p.name}</div>
                      <div className="text-[10px] text-purple-400 font-bold">Шанс: {p.chance}%</div>
                    </div>
                  </div>
                  <div className="font-black">{p.bet} 🪙</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentTab === 'profile' && (
          <div className="space-y-6 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-[2.5rem] mx-auto flex items-center justify-center text-4xl border-4 border-white/10 shadow-2xl">
              <User size={48} />
            </div>
            <h2 className="text-2xl font-black">{user.name}</h2>
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 text-left space-y-4">
              <div><div className="text-[10px] text-gray-500 uppercase mb-1">Общий баланс</div><div className="text-xl font-black text-yellow-400">{Utils.formatNumber(balance)} 🪙</div></div>
              <div><div className="text-[10px] text-gray-500 uppercase mb-1">ID пользователя</div><div className="text-sm font-mono text-gray-300">{user.id}</div></div>
            </div>
          </div>
        )}
      </div>

      {/* WIN MODAL */}
      {showWinModal && winner && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0f0c1d]/95 backdrop-blur-xl">
          <div className="w-full max-w-sm bg-white/5 border border-white/20 rounded-[3rem] p-8 text-center space-y-6">
            <div className="w-32 h-32 bg-purple-600 rounded-[3rem] mx-auto flex items-center justify-center text-5xl border-4 border-white/20 shadow-2xl overflow-hidden">
               {winner.photo !== '👤' ? '🖼️' : '👤'}
            </div>
            <div className="text-2xl font-black">{winner.name}</div>
            <div className="text-gray-400 text-sm">
              выиграл <span className="text-white font-black">{Utils.formatNumber(winner.prize)} 🪙</span> с шансом <span className="text-purple-400 font-black">{winner.chance}%</span>
            </div>
            <button onClick={() => setShowWinModal(false)} className="w-full bg-white text-black font-black py-4 rounded-2xl text-lg">Продолжить</button>
          </div>
        </div>
      )}

      {/* ADMIN PANEL */}
      {showAdminPanel && isAdmin && (
        <div className="fixed inset-0 z-[110] bg-black/90 p-6 overflow-y-auto">
          <div className="flex justify-between mb-8">
            <h2 className="text-2xl font-black text-purple-400 uppercase italic">Admin Panel</h2>
            <button onClick={() => setShowAdminPanel(false)} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">X</button>
          </div>
          <div className="space-y-4">
            <button onClick={spinNow} className="w-full bg-green-600 py-4 rounded-xl font-black shadow-lg">КРУТИТЬ СЕЙЧАС</button>
            <div className="bg-white/5 p-4 rounded-xl space-y-2">
              <h3 className="mb-2 font-bold uppercase text-xs text-gray-500">Предсказать победителя:</h3>
              {players.map(p => (
                <button key={p.id} onClick={() => forceWinner(p.id)} className={`w-full p-4 rounded-xl flex justify-between items-center border-2 transition-all ${forcedWinnerId === p.id ? 'border-yellow-400 bg-yellow-400/10' : 'border-white/5 bg-black/20'}`}>
                  <span className="font-bold">{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] z-40 bg-[#1a162d]/80 backdrop-blur-2xl border border-white/10 p-2 rounded-[2.5rem] flex justify-between items-center shadow-2xl">
        {[
          { id: 'home', icon: <Home size={22} />, label: 'Меню' },
          { id: 'play', icon: <Gamepad2 size={22} />, label: 'Играть' },
          { id: 'profile', icon: <User size={22} />, label: 'Профиль' }
        ].map(tab => (
          <button key={tab.id} onClick={() => setCurrentTab(tab.id)} className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-[2rem] transition-all duration-300 ${currentTab === tab.id ? 'bg-white text-black scale-105 shadow-lg' : 'text-gray-500 hover:text-white'}`}>
            {tab.icon}
            <span className={`text-[10px] font-black uppercase tracking-widest ${currentTab === tab.id ? 'block' : 'hidden'}`}>{tab.label}</span>
          </button>
        ))}
      </nav>
      {isAdmin && <button onClick={() => setShowAdminPanel(true)} className="fixed bottom-32 right-6 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center shadow-xl z-50"><Crown size={24}/></button>}
    </div>
  );
};

export default App;
