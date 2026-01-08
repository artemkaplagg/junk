import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  Star, Trophy, User, Home, Gamepad2, PlusCircle, Bell, 
  CheckCircle2, ExternalLink, Wallet, Navigation, Info, 
  ShieldCheck, Zap, RefreshCw, TrendingUp, Users, AlertCircle, Coins
} from 'lucide-react';
import io from 'socket.io-client';

const Utils = {
  formatNumber: (num) => new Intl.NumberFormat('ru-RU').format(num),
};

const GLOBAL_CONFIG = {
  ADMIN_ID: '6185367393',
  CHANNEL_URL: 'https://t.me/LootstarsX',
  BOT_TOKEN: '8523431126:AAFw_cxi4tPBb6tqYgu0siJ7PXF1wFPBKkM',
  BONUS_AMOUNT: 50,
};

const App = () => {
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
  const [showWinModal, setShowWinModal] = useState(false);

  useEffect(() => {
    const newSocket = io('https://junk-dn2k.onrender.com'); 
    setSocket(newSocket);

    newSocket.on('connect', () => {
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
    });

    return () => newSocket.close();
  }, []);

  const joinGame = (amount) => {
    if (gameState === 'spinning' || gameState === 'result') return alert('⏳ Ждите раунд');
    if (balance < amount) return alert('💰 Мало монет');
    if (socket) {
      socket.emit('join_game', {
        bet: amount,
        photo: user.photo || '👤'
      });
    }
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
          alert('✅ Подписка подтверждена!');
        }
      } else {
        alert('❌ Вы не подписаны');
      }
    } catch (e) {
      alert('⚠️ Ошибка API');
    } finally {
      setCheckLoading(false);
    }
  };

  // ==========================================
  // ТУТ МЫ ИМПОРТИРУЕМ НОВЫЙ ДИЗАЙН ИЗ UI.JSX
  // ==========================================
  // Вместо того чтобы писать верстку здесь, 
  // мы будем использовать компоненты из твоего ui.jsx

  return (
    <div className="min-h-screen bg-[#f8faff]">
      {/* 
        Здесь будет вызов PlayTab из ui.jsx 
        Я скину обновленный ui.jsx в следующем сообщении 
      */}
      <div className="p-4 text-center">
         Загрузка LootStarsX... (Проверь ui.jsx)
      </div>
    </div>
  );
};

export default App;
