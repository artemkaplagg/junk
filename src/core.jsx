// ==========================================
// LOOTSTARSX - CORE APPLICATION ENGINE
// Project: LootStarsX Telegram Mini App
// Lead Developer: IT Senior Developer
// Version: 2.0.0 (Real-time Focus)
// ==========================================

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  Star, Trophy, Crown, User, Home, 
  Gamepad2, PlusCircle, Bell, CheckCircle2,
  ExternalLink, Wallet, Settings as SettingsIcon,
  Navigation, Info, ShieldCheck, Zap, RefreshCw,
  TrendingUp, Users, AlertCircle, Coins
} from 'lucide-react';

// Имитация внешних утилит (если они еще не созданы)
const Utils = {
  formatNumber: (num) => new Intl.NumberFormat('ru-RU').format(num),
  generateGameHash: () => Math.random().toString(36).substring(2, 15),
  calculateChance: (bet, total) => total > 0 ? ((bet / total) * 100).toFixed(2) : 0
};

// Конфигурация приложения
const GLOBAL_CONFIG = {
  ADMIN_ID: '6185367393',
  TESTER_ID: '6738617654',
  CHANNEL_URL: 'https://t.me/LootstarsX',
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
  // 1. ИНИЦИАЛИЗАЦИЯ ПОЛЬЗОВАТЕЛЯ
  // ==========================================
  const getInitialUserData = () => {
    const tg = window.Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user) {
      return {
        id: tg.initDataUnsafe.user.id.toString(),
        name: tg.initDataUnsafe.user.first_name || 'Player',
        username: tg.initDataUnsafe.user.username || 'unknown',
        photo: tg.initDataUnsafe.user.photo_url || null,
        language: tg.initDataUnsafe.user.language_code
      };
    }
    // Режим разработки/тестирования
    return { id: '6185367393', name: 'Artem Admin', username: 'admin_dev', photo: null };
  };

  const [user, setUser] = useState(getInitialUserData());
  const isAdmin = user.id === GLOBAL_CONFIG.ADMIN_ID;

  // ==========================================
  // 2. БАЛАНС И ЭКОНОМИКА
  // ==========================================
  const [balance, setBalance] = useState(11325);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);
  const [bonusClaimed, setBonusClaimed] = useState(false);

  // ==========================================
  // 3. СОСТОЯНИЕ ИГРЫ (ROLL IT)
  // ==========================================
  const [currentTab, setCurrentTab] = useState('home'); // home, play, profile, tasks
  const [gameState, setGameState] = useState('waiting'); // waiting, countdown, spinning, result
  const [gameId, setGameId] = useState('#' + Math.floor(Math.random() * 90000 + 10000));
  const [players, setPlayers] = useState([]);
  const [timer, setTimer] = useState(GLOBAL_CONFIG.TIMER_DURATION);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState(null);
  
  // Управление ставками
  const [selectedBet, setSelectedBet] = useState(100);
  const [customBetInput, setCustomBetInput] = useState('');
  
  // Админ-панель и модалки
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [forcedWinnerId, setForcedWinnerId] = useState(null);

  // Референсы для анимаций
  const wheelRef = useRef(null);
  const timerInterval = useRef(null);

  // Продолжение следует...// ==========================================
  // 4. ЛОГИКА ПРОВЕРКИ ПОДПИСКИ (TELEGRAM BOT API)
  // ==========================================
  const checkSubscription = async () => {
    setCheckLoading(true);
    try {
      // В реальном приложении это запрос к твоему srv.js
      // Который вызывает: https://api.telegram.org/bot<TOKEN>/getChatMember
      // Параметры: chat_id: '@LootstarsX', user_id: user.id
      
      const response = await fetch(`https://api.telegram.org/bot8523431126:AAFw_cxi4tPBb6tqYgu0siJ7PXF1wFPBKkM/getChatMember?chat_id=@LootstarsX&user_id=${user.id}`);
      const data = await response.json();

      if (data.ok && (data.result.status === 'member' || data.result.status === 'administrator' || data.result.status === 'creator')) {
        if (!bonusClaimed) {
          setBalance(prev => prev + GLOBAL_CONFIG.BONUS_AMOUNT);
          setBonusClaimed(true);
          setIsSubscribed(true);
          alert('✅ Подписка подтверждена! Вам начислено 50 монет.');
        } else {
          alert('ℹ️ Вы уже получили бонус за подписку.');
        }
      } else {
        alert('❌ Вы не подписаны на канал @LootstarsX. Подпишитесь и попробуйте снова!');
      }
    } catch (error) {
      console.error('Sub check error:', error);
      alert('⚠️ Ошибка при проверке. Убедитесь, что бот добавлен в канал как администратор.');
    } finally {
      setCheckLoading(false);
    }
  };

  // ==========================================
  // 5. УПРАВЛЕНИЕ СТАВКАМИ И ВВОДОМ
  // ==========================================
  const handlePresetBet = (amount) => {
    if (gameState === 'spinning') return;
    setSelectedBet(amount);
    setCustomBetInput(''); // Очищаем кастомный ввод при выборе пресета
  };

  const handleCustomBetChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Только цифры
    setCustomBetInput(value);
    if (value) setSelectedBet(parseInt(value));
  };

  const joinGame = () => {
    if (gameState === 'spinning' || gameState === 'result') {
      alert('⏳ Дождитесь начала нового раунда!');
      return;
    }
    
    if (balance < selectedBet) {
      alert('💰 Недостаточно валюты на балансе!');
      return;
    }

    // Проверка, не сделал ли пользователь ставку уже (в этой версии разрешаем добавлять)
    const newPlayer = {
      id: user.id,
      name: user.name,
      username: user.username,
      bet: selectedBet,
      photo: user.photo || '👤',
      chance: 0 // Пересчитаем ниже
    };

    setBalance(prev => prev - selectedBet);
    
    setPlayers(prev => {
      const updated = [...prev, newPlayer];
      // Магия пересчета шансов для каждого игрока
      const total = updated.reduce((sum, p) => sum + p.bet, 0);
      return updated.map(p => ({
        ...p,
        chance: ((p.bet / total) * 100).toFixed(2)
      }));
    });
  };

  // ==========================================
  // 6. ТАЙМЕР И ИГРОВОЙ ЦИКЛ
  // ==========================================
  useEffect(() => {
    // Если игроков 2 или больше, и мы еще в ожидании - запускаем таймер
    if (players.length >= 2 && gameState === 'waiting') {
      setGameState('countdown');
      setTimer(GLOBAL_CONFIG.TIMER_DURATION);
    }

    if (gameState === 'countdown') {
      timerInterval.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerInterval.current);
            startSpin(); // Время вышло - крутим!
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timerInterval.current);
  }, [players.length, gameState]);

  // ==========================================
  // 7. МЕХАНИКА ВРАЩЕНИЯ И ВЫБОРА ПОБЕДИТЕЛЯ
  // ==========================================
  const startSpin = () => {
    if (gameState === 'spinning') return;
    setGameState('spinning');
    setShowWinModal(false);

    // Расчет победителя
    let winnerIndex = 0;
    
    // ПРОВЕРКА АДМИНСКОГО ПРЕДСКАЗАНИЯ
    if (forcedWinnerId) {
      winnerIndex = players.findIndex(p => p.id === forcedWinnerId);
      if (winnerIndex === -1) winnerIndex = calculateFairWinner();
    } else {
      winnerIndex = calculateFairWinner();
    }

    const winnerObject = players[winnerIndex];
    
    // Расчет угла остановки
    // Каждый сегмент занимает (360 / кол-во игроков) градусов
    const segmentDegree = 360 / players.length;
    const extraSpins = 5 + Math.floor(Math.random() * 5); // 5-10 полных кругов
    const stopAngle = (extraSpins * 360) + (winnerIndex * segmentDegree) + (segmentDegree / 2);
    
    setRotation(prev => prev + stopAngle);

    // Ждем окончания анимации (3.5 секунды)
    setTimeout(() => {
      const bank = players.reduce((sum, p) => sum + p.bet, 0);
      setWinner({
        ...winnerObject,
        prize: bank
      });
      
      // Начисляем выигрыш, если победил текущий пользователь
      if (winnerObject.id === user.id) {
        setBalance(prev => prev + bank);
      }

      setGameState('result');
      setShowWinModal(true);

      // Через 6 секунд сбрасываем игру для нового раунда
      setTimeout(resetGame, 6000);
    }, 3500);
  };

  const calculateFairWinner = () => {
    const totalBet = players.reduce((sum, p) => sum + p.bet, 0);
    let random = Math.random() * totalBet;
    let cumulative = 0;
    
    for (let i = 0; i < players.length; i++) {
      cumulative += players[i].bet;
      if (random <= cumulative) return i;
    }
    return 0;
  };

  const resetGame = () => {
    setPlayers([]);
    setGameState('waiting');
    setWinner(null);
    setShowWinModal(false);
    setForcedWinnerId(null);
    setGameId('#' + Math.floor(Math.random() * 90000 + 10000));
    setTimer(GLOBAL_CONFIG.TIMER_DURATION);
  };

  // ==========================================
  // 8. ФУНКЦИИ АДМИНА
  // ==========================================
  const adminAddBalance = (targetUserId, amount) => {
    if (!isAdmin) return;
    // В реальном онлайне это уйдет на сервер
    alert(`💰 Админ: Пользователю ${targetUserId} начислено ${amount} монет.`);
    // Если это текущий пользователь, обновляем локально
    if (targetUserId === user.id) setBalance(prev => prev + parseInt(amount));
  };

  const spinNow = () => {
    if (!isAdmin) return;
    if (players.length < 2) {
      alert('❌ Нужно минимум 2 игрока для спина!');
      return;
    }
    clearInterval(timerInterval.current);
    startSpin();
  };// ==========================================
  // 9. РЕНДЕРИНГ КОМПОНЕНТОВ (UI)
  // ==========================================

  // Компонент Колеса (SVG)
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
    return (
      <div className="relative w-full aspect-square max-w-[320px] mx-auto group">
        {/* Указатель сверху */}
        <div className="absolute top-[-15px] left-1/2 -translate-x-1/2 z-30 filter drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
          <div className="w-6 h-8 bg-gradient-to-b from-white to-purple-300 clip-path-triangle shadow-xl" 
               style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}></div>
        </div>

        <div 
          className="w-full h-full transition-transform duration-[3500ms] cubic-bezier(0.15, 0, 0.15, 1)"
          style={{ transform: `rotate(-${rotation}deg)` }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
            {players.map((player, index) => {
              const sliceAngle = (player.bet / players.reduce((s, p) => s + p.bet, 0)) * 360;
              const startAngle = currentAngle;
              currentAngle += sliceAngle;

              // Координаты для рисования сектора SVG
              const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
              const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
              const x2 = 50 + 50 * Math.cos((Math.PI * (startAngle + sliceAngle)) / 180);
              const y2 = 50 + 50 * Math.sin((Math.PI * (startAngle + sliceAngle)) / 180);

              const largeArcFlag = sliceAngle > 180 ? 1 : 0;
              const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

              return (
                <g key={index}>
                  <path 
                    d={pathData} 
                    fill={GLOBAL_CONFIG.WHEEL_COLORS[index % GLOBAL_CONFIG.WHEEL_COLORS.length]} 
                    stroke="#0f0c1d" 
                    strokeWidth="0.5"
                  />
                  {/* Аватарка игрока на его секторе (если сектор достаточно большой) */}
                  {sliceAngle > 15 && (
                    <text
                      x={50 + 35 * Math.cos((Math.PI * (startAngle + sliceAngle / 2)) / 180)}
                      y={50 + 35 * Math.sin((Math.PI * (startAngle + sliceAngle / 2)) / 180)}
                      fontSize="6"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="drop-shadow-sm pointer-events-none"
                    >
                      {player.photo !== '👤' ? '🖼️' : '👤'}
                    </text>
                  )}
                </g>
              );
            })}
            {/* Центральный круг */}
            <circle cx="50" cy="50" r="12" fill="#0f0c1d" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <text x="50" y="52" fontSize="5" textAnchor="middle" fill="white" className="font-bold">L-SX</text>
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0f0c1d] text-white font-sans overflow-x-hidden selection:bg-purple-600">
      
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-[#0f0c1d]/90 backdrop-blur-md border-b border-white/5 px-4 py-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 rotate-3">
            <Star className="text-white" fill="currentColor" size={20} />
          </div>
          <div>
            <div className="text-xl font-black tracking-tighter italic">LOOTSTARS<span className="text-purple-500">X</span></div>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Mini App Gaming</div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
          <div className="px-3 py-1 flex items-center gap-2">
            <Coins size={16} className="text-yellow-400" />
            <span className="font-bold">{Utils.formatNumber(balance)}</span>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-6 pb-32">
        
        {/* HOME TAB */}
        {currentTab === 'home' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 p-6 rounded-[2rem] border border-white/10 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all"></div>
              <div className="relative z-10">
                <h2 className="text-2xl font-black mb-1">Привет, {user.name}! 👋</h2>
                <p className="text-gray-400 text-sm mb-6">Добро пожаловать в элитный игровой клуб LootStarsX. Готов сорвать куш?</p>
                <button 
                  onClick={() => setCurrentTab('play')}
                  className="w-full bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-200 active:scale-95 transition-all shadow-xl shadow-white/10"
                >
                  <Gamepad2 size={20} /> ИГРАТЬ В ROLL IT
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 p-4 rounded-3xl">
                <div className="text-gray-500 text-xs font-bold uppercase mb-1">Мои игры</div>
                <div className="text-2xl font-black">124</div>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-3xl">
                <div className="text-gray-500 text-xs font-bold uppercase mb-1">Победы</div>
                <div className="text-2xl font-black text-green-400">42%</div>
              </div>
            </div>

            {/* Задание на подписку */}
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 p-5 rounded-[2rem]">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400">
                  <Bell size={24} />
                </div>
                <div>
                  <h3 className="font-black">Бонус за подписку</h3>
                  <p className="text-xs text-blue-200/60">Подпишись на наш канал и забери 50 монет</p>
                </div>
              </div>
              <div className="flex gap-2">
                <a 
                  href={GLOBAL_CONFIG.CHANNEL_URL} 
                  target="_blank" 
                  className="flex-1 bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold text-center text-sm transition-all"
                >
                  Канал
                </a>
                <button 
                  onClick={checkSubscription}
                  disabled={checkLoading || bonusClaimed}
                  className="flex-[1.5] bg-white/10 hover:bg-white/20 disabled:opacity-50 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                >
                  {checkLoading ? <RefreshCw className="animate-spin" size={16} /> : (bonusClaimed ? 'Получено' : 'Проверить')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PLAY TAB */}
        {currentTab === 'play' && (
          <div className="space-y-6 animate-in zoom-in-95 duration-300">
            <div className="text-center space-y-2">
              <div className="inline-block px-4 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Игра {gameId}
              </div>
              <h2 className="text-3xl font-black italic">ROLL IT!</h2>
              <p className="text-gray-400 text-xs px-10">Испытай удачу и забери весь банк! Чем выше твоя ставка — тем больше шанс.</p>
            </div>

            {/* Секция с Колесом */}
            <div className="relative py-4">
              <Wheel />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                {gameState === 'countdown' && (
                  <div className="text-5xl font-black animate-bounce text-purple-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                    {timer}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-gray-500 text-[10px] font-bold uppercase mb-1">На кону</div>
                  <div className="text-3xl font-black text-purple-400">{Utils.formatNumber(players.reduce((s, p) => s + p.bet, 0))} 🪙</div>
                </div>
                <div className="text-right">
                  <div className="text-gray-500 text-[10px] font-bold uppercase mb-1">Игроков</div>
                  <div className="text-xl font-black">{players.length}</div>
                </div>
              </div>

              {/* Выбор ставки */}
              <div className="space-y-3">
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {GLOBAL_CONFIG.PRESET_BETS.map(amt => (
                    <button 
                      key={amt}
                      onClick={() => handlePresetBet(amt)}
                      className={`px-5 py-3 rounded-2xl font-black transition-all border-2 ${selectedBet === amt ? 'bg-purple-600 border-purple-400 scale-105' : 'bg-white/5 border-transparent text-gray-400'}`}
                    >
                      {amt}
                    </button>
                  ))}
                  <input 
                    type="text" 
                    placeholder="Своя..." 
                    value={customBetInput}
                    onChange={handleCustomBetChange}
                    className="bg-white/5 border-2 border-dashed border-white/10 rounded-2xl px-4 py-3 w-24 text-center font-bold focus:border-purple-500 outline-none transition-all"
                  />
                </div>
                
                <button 
                  onClick={joinGame}
                  disabled={gameState === 'spinning'}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 disabled:grayscale py-5 rounded-[1.5rem] font-black text-lg shadow-xl shadow-purple-900/20 active:scale-95 transition-all"
                >
                  ПОСТАВИТЬ {selectedBet} 🪙
                </button>
              </div>
            </div>

            {/* Список игроков */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-2">Участники раунда</h3>
              {players.length === 0 ? (
                <div className="text-center py-10 text-white/10 font-bold italic">Тут пока пусто... Стань первым!</div>
              ) : (
                players.map((p, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-3xl flex justify-between items-center animate-in slide-in-from-right-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center text-xl font-bold border-2 border-white/10">
                        {p.photo !== '👤' ? <img src={p.photo} className="rounded-2xl" /> : '👤'}
                      </div>
                      <div>
                        <div className="font-black text-sm">{p.name}</div>
                        <div className="text-[10px] text-purple-400 font-bold">Шанс: {p.chance}%</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black">{p.bet} 🪙</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {currentTab === 'profile' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col items-center py-6">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-[2.5rem] flex items-center justify-center text-4xl mb-4 border-4 border-white/10 shadow-2xl">
                {user.photo ? <img src={user.photo} className="rounded-[2.5rem]" /> : <User size={48} />}
              </div>
              <h2 className="text-2xl font-black">{user.name}</h2>
              <div className="text-gray-500 font-bold text-sm">@{user.username}</div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 grid grid-cols-2 gap-6">
              <div>
                <div className="text-gray-500 text-[10px] font-bold uppercase mb-1">Общий баланс</div>
                <div className="text-xl font-black text-yellow-400">{Utils.formatNumber(balance)} 🪙</div>
              </div>
              <div>
                <div className="text-gray-500 text-[10px] font-bold uppercase mb-1">Статус</div>
                <div className="text-xl font-black text-purple-400">{isAdmin ? 'Администратор' : 'Игрок'}</div>
              </div>
              <div className="col-span-2 h-px bg-white/5"></div>
              <div>
                <div className="text-gray-500 text-[10px] font-bold uppercase mb-1">ID пользователя</div>
                <div className="text-sm font-mono text-gray-300">{user.id}</div>
              </div>
              <div className="text-right">
                <button className="text-xs text-gray-500 font-bold underline">История игр</button>
              </div>
            </div>

            <button className="w-full bg-white/5 border border-white/10 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
              <SettingsIcon size={18} /> Настройки профиля
            </button>
          </div>
        )}
      </div>

      {/* WIN MODAL (ПО РЕФЕРЕНСУ) */}
      {showWinModal && winner && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0f0c1d]/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-gradient-to-b from-white/10 to-transparent border border-white/20 rounded-[3rem] p-8 text-center space-y-6 shadow-[0_0_50px_rgba(168,85,247,0.3)]">
            <div className="text-gray-400 font-bold text-sm uppercase tracking-widest">Игра {gameId}</div>
            
            <div className="relative inline-block">
              <div className="w-32 h-32 bg-purple-600 rounded-[3rem] mx-auto flex items-center justify-center text-5xl border-4 border-white/20 shadow-2xl overflow-hidden">
                {winner.photo !== '👤' ? <img src={winner.photo} className="w-full h-full object-cover" /> : '👤'}
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                <Trophy size={20} className="text-black" />
              </div>
            </div>

            <div>
              <div className="text-2xl font-black mb-1">{winner.name}</div>
              <div className="text-gray-400 text-sm">
                выиграл <span className="text-white font-black">{Utils.formatNumber(winner.prize)} 🪙</span> с шансом <span className="text-purple-400 font-black">{winner.chance}%</span>
              </div>
            </div>

            <button 
              onClick={() => setShowWinModal(false)}
              className="w-full bg-white text-black font-black py-4 rounded-2xl text-lg hover:bg-gray-200 active:scale-95 transition-all"
            >
              Продолжить
            </button>
          </div>
        </div>
      )}

      {/* ADMIN PANEL OVERLAY */}
      {showAdminPanel && isAdmin && (
        <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md p-6 overflow-y-auto animate-in slide-in-from-top duration-500">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-black text-purple-400 italic flex items-center gap-2"><Crown size={32}/> ADMIN PANEL</h2>
            <button onClick={() => setShowAdminPanel(false)} className="w-10 h-10 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center">X</button>
          </div>

          <div className="space-y-8 pb-20">
            {/* Управление игрой */}
            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 space-y-4">
              <h3 className="font-black text-lg">Управление игрой</h3>
              <div className="flex gap-2">
                <button onClick={spinNow} className="flex-1 bg-green-600 py-4 rounded-xl font-black shadow-lg shadow-green-900/20">КРУТИТЬ СЕЙЧАС</button>
                <button onClick={resetGame} className="flex-1 bg-red-600 py-4 rounded-xl font-black shadow-lg shadow-red-900/20">СБРОС ИГРЫ</button>
              </div>
            </div>

            {/* Предсказание победителя */}
            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 space-y-4">
              <h3 className="font-black text-lg text-yellow-400">Подстроить победу (ID)</h3>
              <div className="space-y-2">
                {players.length === 0 ? <p className="text-gray-500 text-sm italic">Игроков пока нет...</p> : 
                players.map((p, i) => (
                  <button 
                    key={i} 
                    onClick={() => setForcedWinnerId(p.id)}
                    className={`w-full p-4 rounded-xl flex justify-between items-center border-2 transition-all ${forcedWinnerId === p.id ? 'border-yellow-400 bg-yellow-400/10' : 'border-white/5 bg-black/20'}`}
                  >
                    <span className="font-bold">{p.name}</span>
                    {forcedWinnerId === p.id && <CheckCircle2 className="text-yellow-400" size={18} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Накрутка баланса по ID */}
            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 space-y-4">
              <h3 className="font-black text-lg text-blue-400">Пополнить баланс по ID</h3>
              <input id="admin_target_id" placeholder="User ID" className="w-full bg-black/40 border border-white/10 p-4 rounded-xl outline-none focus:border-blue-500 transition-all font-mono text-sm" />
              <input id="admin_amount" placeholder="Количество 🪙" className="w-full bg-black/40 border border-white/10 p-4 rounded-xl outline-none focus:border-blue-500 transition-all font-bold" />
              <button 
                onClick={() => adminAddBalance(document.getElementById('admin_target_id').value, document.getElementById('admin_amount').value)}
                className="w-full bg-blue-600 py-4 rounded-xl font-black"
              >
                ЗАЧИСЛИТЬ ВАЛЮТУ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] z-40">
        <div className="bg-[#1a162d]/80 backdrop-blur-2xl border border-white/10 p-2 rounded-[2.5rem] flex justify-between items-center shadow-2xl">
          {[
            { id: 'home', icon: <Home size={22} />, label: 'Меню' },
            { id: 'play', icon: <Gamepad2 size={22} />, label: 'Играть' },
            { id: 'profile', icon: <User size={22} />, label: 'Профиль' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-[2rem] transition-all duration-300 ${currentTab === tab.id ? 'bg-white text-black scale-105 shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              {tab.icon}
              <span className={`text-[10px] font-black uppercase tracking-widest ${currentTab === tab.id ? 'block' : 'hidden'}`}>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default App;
