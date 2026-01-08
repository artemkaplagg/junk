import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { 
  HomeTab, PlayTab, ProfileTab, 
  BottomNav, WinModal, GlobalStyles,
  LeaderboardTab, NotificationHub, SplashLoader
} from './ui';

const GLOBAL_CONFIG = {
  ADMIN_ID: '6185367393',
  CHANNEL_URL: 'https://t.me/LootstarsX',
  BOT_TOKEN: '8523431126:AAFw_cxi4tPBb6tqYgu0siJ7PXF1wFPBKkM',
  BONUS_AMOUNT: 50,
};

const App = () => {
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [currentTab, setCurrentTab] = useState('home');
  
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

  const [user] = useState(getInitialUserData());
  const [balance, setBalance] = useState(0);
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
      console.log('Connected to Server');
      newSocket.emit('auth', user);
      setTimeout(() => setLoading(false), 2000);
    });

    newSocket.on('init_data', (data) => {
       setBalance(data.user.balance);
       setGameState(data.currentRound.status);
       setPlayers(data.currentRound.players);
       setTimer(data.currentRound.timer);
       setGameId('#' + data.currentRound.id);
    });

    newSocket.on('update_balance', (data) => setBalance(data.balance));
    newSocket.on('update_players', (serverPlayers) => setPlayers(serverPlayers));
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
  }, [user]);

  const joinGame = (amount) => {
    if (gameState === 'spinning') return alert('⏳ Идет вращение');
    if (balance < amount) return alert('💰 Мало монет');
    socket?.emit('join_game', { bet: amount, photo: user.photo || '👤' });
  };

  if (loading) return <SplashLoader />;

  return (
    <>
      <GlobalStyles />
      <div className="min-h-screen bg-[#f8faff] pb-32">
        {currentTab === 'home' && (
          <HomeTab user={user} balance={balance} onPlay={() => setCurrentTab('play')} />
        )}
        {currentTab === 'play' && (
          <PlayTab 
            gameState={gameState} 
            players={players} 
            totalBank={players.reduce((s, p) => s + p.bet, 0)}
            timer={timer} 
            rotation={rotation} 
            gameNumber={gameId} 
            onJoin={joinGame} 
          />
        )}
        {currentTab === 'profile' && (
          <ProfileTab user={user} balance={balance} stats={{wins: 0, games: 0}} />
        )}
        
        {showWinModal && winner && (
          <WinModal winner={winner} onClose={() => setShowWinModal(false)} />
        )}
        <BottomNav activeTab={currentTab} setTab={setCurrentTab} />
      </div>
    </>
  );
};

export default App;
