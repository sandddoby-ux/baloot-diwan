import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { CardView, CardBack } from './CardView';
import { BiddingModal } from './BiddingModal';
import { GameOverModal } from './GameOverModal';
import { RoundEndModal } from './RoundEndModal';
import { SUIT_NAMES_AR } from '../../engine/deck';
import { isMoveLegal } from '../../engine/rules';
import { soundService } from '../../services/sound';
import { getUserProfile } from '../../services/storage';
import { BalootLogo } from '../common/BalootLogo';

export const BalootTable: React.FC = () => {
  const {
    gameState,
    mode,
    playCard,
    playerBid,
    leaveGame,
    restartMatch,
    proceedToNextRound,
    trainingHint,
    chatMessages,
    sendChatMessage,
  } = useGame();

  const [soundEnabled, setSoundEnabled] = useState(soundService.enabled);
  const [showChat, setShowChat] = useState(false);
  const [showScoreDetail, setShowScoreDetail] = useState(false);
  const [customChatInput, setCustomChatInput] = useState('');

  const turnTimeoutTotal = gameState?.turnTimeoutSeconds || 30;
  const [remainingSeconds, setRemainingSeconds] = useState(turnTimeoutTotal);

  useEffect(() => {
    if (!gameState) return;
    setRemainingSeconds(gameState.turnTimeoutSeconds || 30);

    if (
      gameState.isTrickResolving ||
      gameState.phase === 'round_end' ||
      gameState.phase === 'match_end'
    ) {
      return;
    }

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          // Time expired! Auto-play if human turn
          if (gameState.turnIndex === 0 && !gameState.isTrickResolving) {
            if (gameState.phase === 'playing' && gameState.contract) {
              const human = gameState.players[0];
              if (human.hand.length > 0) {
                const legalCard =
                  human.hand.find((c) =>
                    isMoveLegal(c, human.hand, gameState.currentTrick.cards, gameState.contract!, 0).legal
                  ) || human.hand[0];
                playCard(legalCard);
              }
            } else if (
              gameState.phase === 'bidding_round_1' ||
              gameState.phase === 'bidding_round_2'
            ) {
              playerBid('pass');
            }
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [
    gameState?.turnIndex,
    gameState?.turnSequenceId,
    gameState?.currentTrick.cards.length,
    gameState?.phase,
    gameState?.isTrickResolving,
    gameState?.turnTimeoutSeconds,
  ]);

  if (!gameState) return null;

  const userProfile = getUserProfile();
  const humanPlayer = gameState.players[0];
  const rightPlayer = gameState.players[1];
  const topPartner = gameState.players[2];
  const leftPlayer = gameState.players[3];

  const currentTurn = gameState.turnIndex;
  const isHumanTurn = currentTurn === 0;

  const toggleSound = () => {
    soundService.enabled = !soundService.enabled;
    setSoundEnabled(soundService.enabled);
  };

  const quickPhrases = [
    'كفو يا خوي! 👏',
    'دقها لا ترحمهم! ⚔️',
    'أكل خويك يا ذيب 🦅',
    'خيرها بغيرها 🤝',
    'منهو اللي شرا؟ 🤔',
    'حي عينك والله! 🌟',
  ];

  const handleSendQuickPhrase = (phrase: string) => {
    sendChatMessage(phrase);
  };

  const handleSendCustomChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customChatInput.trim()) return;
    sendChatMessage(customChatInput.trim());
    setCustomChatInput('');
  };

  const playedCards = gameState.currentTrick.cards;
  const bottomPlayed = playedCards.find((p) => p.playerIndex === 0)?.card;
  const rightPlayed = playedCards.find((p) => p.playerIndex === 1)?.card;
  const topPlayed = playedCards.find((p) => p.playerIndex === 2)?.card;
  const leftPlayed = playedCards.find((p) => p.playerIndex === 3)?.card;

  return (
    <div className="relative w-full h-[100dvh] sm:h-[calc(100vh-64px)] bg-[#07130e] flex flex-col justify-between overflow-hidden select-none">
      {/* Background Ambience & Lighting */}
      <div className="absolute inset-0 bg-radial from-[#123628] via-[#081812] to-[#040c09] opacity-90 pointer-events-none" />

      {/* TOP COMPACT BAR / SCOREBOARD & CONTROLS */}
      <header className="relative z-30 px-2 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between bg-black/50 backdrop-blur-md border-b border-[#c5a059]/20 shrink-0">
        {/* Left: Mode Badge & Exit */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={leaveGame}
            className="px-2.5 sm:px-3 py-1 rounded-lg bg-red-950/70 hover:bg-red-900 border border-red-500/40 text-red-200 text-[11px] sm:text-xs font-bold transition-all"
          >
            خروج 🚪
          </button>
          <div className="flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-lg bg-emerald-950/80 border border-emerald-600/30 text-[10px] sm:text-xs">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400" />
            <span className="text-gray-300 font-semibold truncate max-w-[90px] sm:max-w-none">
              {mode === 'bot'
                ? 'تدريب الروبوت'
                : mode === 'training'
                ? 'نمط التعليم'
                : mode === 'private'
                ? `غرفة (${gameState.roomCode})`
                : 'مباراة سريعة'}
            </span>
          </div>

          {/* Turn Countdown Timer */}
          <div
            className={`flex items-center gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-xl border font-mono font-black text-xs sm:text-sm transition-all shadow-md ${
              remainingSeconds <= 5
                ? 'bg-rose-950/95 border-rose-500 text-rose-300 animate-pulse ring-2 ring-rose-500/40 scale-105'
                : remainingSeconds <= 10
                ? 'bg-amber-950/85 border-amber-500/60 text-amber-300'
                : 'bg-black/70 border-emerald-500/50 text-emerald-300'
            }`}
            title={`الوقت المحدد لكل رمية: ${turnTimeoutTotal} ثانية`}
          >
            <span className="text-xs sm:text-sm">⏱️</span>
            <span>{remainingSeconds}ث</span>
            <span className="text-[10px] text-gray-400 font-sans hidden sm:inline">
              /{turnTimeoutTotal}ث
            </span>
          </div>
        </div>

        {/* Center: Ghayd Scoreboard (لنا / لهم) */}
        <div
          onClick={() => setShowScoreDetail(!showScoreDetail)}
          className="flex items-center gap-2 sm:gap-4 px-2.5 sm:px-4 py-1 rounded-xl bg-[#0d2219]/90 border border-[#c5a059]/40 shadow-lg cursor-pointer hover:border-amber-400 transition-all"
        >
          {/* Us Score */}
          <div className="text-center">
            <span className="text-[9px] sm:text-[10px] text-amber-300/80 font-bold block leading-tight">
              لنا
            </span>
            <span className="text-base sm:text-xl font-black text-amber-300 leading-none">
              {gameState.matchScore.us}
            </span>
          </div>

          <div className="text-gray-500 font-bold text-[10px] sm:text-xs">/ 152</div>

          {/* Them Score */}
          <div className="text-center">
            <span className="text-[9px] sm:text-[10px] text-gray-400 font-bold block leading-tight">
              لهم
            </span>
            <span className="text-base sm:text-xl font-black text-white leading-none">
              {gameState.matchScore.them}
            </span>
          </div>

          {/* Round Indicator */}
          <div className="border-r border-[#c5a059]/30 pr-2 mr-0.5 text-[10px] sm:text-[11px] text-gray-300 font-semibold">
            ن#{gameState.currentRoundNumber}
          </div>
        </div>

        {/* Right: Audio & Chat */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={toggleSound}
            className={`p-1.5 sm:p-2 rounded-lg border text-xs sm:text-sm transition-all ${
              soundEnabled
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                : 'bg-white/5 border-white/10 text-gray-400'
            }`}
            title="الصوت"
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
          <button
            type="button"
            onClick={() => setShowChat(!showChat)}
            className="p-1.5 sm:p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 text-xs sm:text-sm transition-all relative"
            title="الدردشة والعبارات"
          >
            💬
            {chatMessages.length > 1 && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 rounded-full" />
            )}
          </button>
        </div>
      </header>

      {/* Training Hint Banner */}
      {trainingHint && (
        <div className="relative z-20 bg-amber-500/15 border-b border-amber-500/30 px-2 sm:px-4 py-1 text-center text-[11px] sm:text-xs text-amber-200 flex items-center justify-center gap-1.5 shrink-0">
          <span>💡</span>
          <span className="truncate">{trainingHint}</span>
        </div>
      )}

      {/* THE RESPONSIVE BALOOT TABLE FELT */}
      <main className="relative flex-1 min-h-0 flex items-center justify-center p-1 sm:p-3 md:p-4 overflow-hidden">
        {/* Felt Outer Oval Wood Ring */}
        <div className="relative w-full max-w-5xl h-full max-h-[580px] sm:max-h-[640px] md:max-h-[700px] rounded-[30px] sm:rounded-[60px] md:rounded-[90px] p-1.5 sm:p-3 md:p-5 bg-gradient-to-b from-[#211710] to-[#120c08] border-2 sm:border-4 border-[#3e2b1c] shadow-[0_15px_50px_rgba(0,0,0,0.9),inset_0_2px_4px_rgba(255,255,255,0.1)] flex flex-col justify-between">
          {/* Inner Green Felt Area */}
          <div className="relative w-full h-full rounded-[22px] sm:rounded-[45px] md:rounded-[70px] bg-gradient-to-b from-[#0f3d2b] to-[#072419] border border-[#c5a059]/30 sm:border-2 shadow-[inset_0_0_60px_rgba(0,0,0,0.6)] flex flex-col justify-between p-1.5 sm:p-3 overflow-hidden">
            {/* Center Felt Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
              <div className="w-36 h-36 sm:w-56 sm:h-56 rounded-full border-2 sm:border-4 border-[#c5a059] flex items-center justify-center">
                <span className="text-4xl sm:text-7xl font-serif text-[#c5a059]">⚜️</span>
              </div>
            </div>

            {/* TOP SEAT: PARTNER (Player 2) */}
            <div className="flex flex-col items-center z-10 shrink-0">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full backdrop-blur-md border transition-all ${
                  currentTurn === 2
                    ? 'border-amber-400 bg-amber-500/20 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                    : 'border-white/10 bg-black/40'
                }`}
              >
                <span className="text-base sm:text-lg">{topPartner.avatar}</span>
                <div className="text-right">
                  <span className="text-[10px] sm:text-xs font-bold text-gray-200 block leading-tight truncate max-w-[100px] sm:max-w-none">
                    {topPartner.name}
                  </span>
                  <span className="text-[9px] text-emerald-400 font-medium">خويّك</span>
                </div>
                {gameState.dealerIndex === 2 && (
                  <span className="w-4 h-4 rounded-full bg-amber-400 text-black text-[9px] font-black flex items-center justify-center">
                    م
                  </span>
                )}
              </div>
              {/* Partner Card Stash */}
              <div className="flex -space-x-3 sm:-space-x-4 mt-0.5">
                {topPartner.hand.slice(0, 5).map((_, i) => (
                  <CardBack key={i} isSmall={true} className="transform -translate-y-0.5 scale-90 sm:scale-100" />
                ))}
              </div>
            </div>

            {/* MIDDLE ROW: OPPONENTS & TABLE CENTER */}
            <div className="flex items-center justify-between w-full z-10 px-0.5 sm:px-2 flex-1 min-h-0">
              {/* LEFT SEAT: OPPONENT 2 (Player 3) */}
              <div className="flex flex-col items-center shrink-0">
                <div
                  className={`flex flex-col items-center p-1 sm:p-2 rounded-xl sm:rounded-2xl backdrop-blur-md border transition-all ${
                    currentTurn === 3
                      ? 'border-amber-400 bg-amber-500/20 shadow-[0_0_12px_rgba(251,191,36,0.4)]'
                      : 'border-white/10 bg-black/40'
                  }`}
                >
                  <span className="text-lg sm:text-xl">{leftPlayer.avatar}</span>
                  <span className="text-[9px] sm:text-xs font-bold text-gray-200 truncate max-w-[65px] sm:max-w-[90px]">
                    {leftPlayer.name}
                  </span>
                  <span className="text-[8px] sm:text-[9px] text-rose-400">يسارك</span>
                  {gameState.dealerIndex === 3 && (
                    <span className="mt-0.5 px-1 py-0.2 rounded-full bg-amber-400 text-black text-[8px] font-black">
                      موزع
                    </span>
                  )}
                </div>
                <div className="flex -space-x-3 mt-1">
                  {leftPlayer.hand.slice(0, 3).map((_, i) => (
                    <CardBack key={i} isSmall={true} className="scale-75 sm:scale-90" />
                  ))}
                </div>
              </div>

              {/* TABLE CENTER: PLAYED CARDS / BIDDING */}
              <div className="relative flex-1 max-w-[240px] sm:max-w-[320px] md:max-w-[360px] h-[150px] sm:h-[190px] md:h-[220px] flex items-center justify-center mx-1">
                {/* Active Contract Badge */}
                {gameState.contract && (
                  <div className="absolute top-0 text-center bg-black/60 border border-[#c5a059]/40 rounded-full px-2.5 py-0.5 text-[10px] sm:text-xs text-amber-200 shadow-md z-20">
                    <span>
                      {gameState.contract.type === 'sun'
                        ? '☀️ صن'
                        : `⚔️ حكم (${SUIT_NAMES_AR[gameState.contract.suit!]})`}
                    </span>
                  </div>
                )}

                {/* BIDDING INTERFACE */}
                {(gameState.phase === 'bidding_round_1' || gameState.phase === 'bidding_round_2') && (
                  <div className="w-full z-30 scale-90 sm:scale-100">
                    <BiddingModal
                      floorCard={gameState.floorCard}
                      phase={gameState.phase}
                      isPlayerTurn={isHumanTurn}
                      onBid={playerBid}
                    />
                  </div>
                )}

                {/* PLAYED CARDS CROSS LAYOUT */}
                {gameState.phase === 'playing' && (
                  <div className="relative w-full h-full flex items-center justify-center">
                    {/* Trick Resolving Winner Banner */}
                    {gameState.isTrickResolving && (
                      <div className="absolute z-40 px-3.5 py-1.5 rounded-2xl bg-black/85 border-2 border-amber-400 text-amber-300 font-black text-xs sm:text-sm shadow-[0_0_25px_rgba(251,191,36,0.6)] animate-in zoom-in-95 duration-200">
                        ✨ أكلة لـ {gameState.players[gameState.turnIndex]?.name}
                      </div>
                    )}

                    {/* Top Player's Card */}
                    {topPlayed && (
                      <div className={`absolute top-1 sm:top-2 animate-in fade-in slide-in-from-top-4 duration-200 transition-all ${
                        gameState.isTrickResolving && gameState.turnIndex === 2 ? 'scale-110 ring-4 ring-amber-400 rounded-xl z-30 shadow-2xl' : ''
                      }`}>
                        <CardView card={topPlayed} isSmall={true} isPlayable={false} />
                      </div>
                    )}

                    {/* Left Player's Card */}
                    {leftPlayed && (
                      <div className={`absolute left-1 sm:left-4 animate-in fade-in slide-in-from-left-4 duration-200 transition-all ${
                        gameState.isTrickResolving && gameState.turnIndex === 3 ? 'scale-110 ring-4 ring-amber-400 rounded-xl z-30 shadow-2xl' : ''
                      }`}>
                        <CardView card={leftPlayed} isSmall={true} isPlayable={false} />
                      </div>
                    )}

                    {/* Right Player's Card */}
                    {rightPlayed && (
                      <div className={`absolute right-1 sm:right-4 animate-in fade-in slide-in-from-right-4 duration-200 transition-all ${
                        gameState.isTrickResolving && gameState.turnIndex === 1 ? 'scale-110 ring-4 ring-amber-400 rounded-xl z-30 shadow-2xl' : ''
                      }`}>
                        <CardView card={rightPlayed} isSmall={true} isPlayable={false} />
                      </div>
                    )}

                    {/* Bottom Player's Card */}
                    {bottomPlayed && (
                      <div className={`absolute bottom-1 sm:bottom-2 animate-in fade-in slide-in-from-bottom-4 duration-200 transition-all ${
                        gameState.isTrickResolving && gameState.turnIndex === 0 ? 'scale-110 ring-4 ring-amber-400 rounded-xl z-30 shadow-2xl' : ''
                      }`}>
                        <CardView card={bottomPlayed} isSmall={true} isPlayable={false} />
                      </div>
                    )}

                    {/* Center Trick Status with Luxury Baloot Watermark */}
                    {playedCards.length === 0 && !gameState.isTrickResolving && (
                      <div className="flex flex-col items-center gap-1.5 animate-in fade-in duration-300">
                        <div className="opacity-40 hover:opacity-80 transition-opacity">
                          <BalootLogo size="sm" withGlow={false} />
                        </div>
                        <div className="text-center text-[10px] sm:text-xs text-emerald-300/80 bg-black/50 px-2.5 py-0.5 rounded-xl border border-emerald-500/20">
                          أكلة {gameState.completedTricks.length + 1} من 8
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* RIGHT SEAT: OPPONENT 1 (Player 1) */}
              <div className="flex flex-col items-center shrink-0">
                <div
                  className={`flex flex-col items-center p-1 sm:p-2 rounded-xl sm:rounded-2xl backdrop-blur-md border transition-all ${
                    currentTurn === 1
                      ? 'border-amber-400 bg-amber-500/20 shadow-[0_0_12px_rgba(251,191,36,0.4)]'
                      : 'border-white/10 bg-black/40'
                  }`}
                >
                  <span className="text-lg sm:text-xl">{rightPlayer.avatar}</span>
                  <span className="text-[9px] sm:text-xs font-bold text-gray-200 truncate max-w-[65px] sm:max-w-[90px]">
                    {rightPlayer.name}
                  </span>
                  <span className="text-[8px] sm:text-[9px] text-rose-400">يمينك</span>
                  {gameState.dealerIndex === 1 && (
                    <span className="mt-0.5 px-1 py-0.2 rounded-full bg-amber-400 text-black text-[8px] font-black">
                      موزع
                    </span>
                  )}
                </div>
                <div className="flex -space-x-3 mt-1">
                  {rightPlayer.hand.slice(0, 3).map((_, i) => (
                    <CardBack key={i} isSmall={true} className="scale-75 sm:scale-90" />
                  ))}
                </div>
              </div>
            </div>

            {/* BOTTOM SEAT: HUMAN PLAYER HAND */}
            <div className="flex flex-col items-center z-20 shrink-0">
              {/* Turn notification */}
              {isHumanTurn && gameState.phase === 'playing' && !gameState.isTrickResolving && (
                <div
                  className={`mb-0.5 sm:mb-1 text-[10px] sm:text-xs px-3 py-0.5 rounded-full font-black shadow-md flex items-center gap-1.5 transition-all ${
                    remainingSeconds <= 5
                      ? 'bg-rose-500 text-white animate-bounce shadow-[0_0_15px_rgba(239,68,68,0.6)]'
                      : 'bg-amber-400 text-black shadow-amber-900/40'
                  }`}
                >
                  <span>دورك للعب الورقة 👇</span>
                  <span className="font-mono bg-black/20 px-1.5 rounded text-[10px] font-bold">
                    {remainingSeconds}ث
                  </span>
                </div>
              )}

              {/* Interactive Player Hand */}
              <div className="flex justify-center items-end -space-x-2.5 sm:-space-x-3.5 md:-space-x-4 max-w-full overflow-x-visible pb-0.5">
                {humanPlayer.hand.map((card) => {
                  const isPlayable = isHumanTurn && gameState.phase === 'playing' && !gameState.isTrickResolving;

                  return (
                    <div key={card.id} className="transition-transform">
                      <CardView
                        card={card}
                        isPlayable={isPlayable}
                        isHighlighted={isPlayable}
                        onClick={() => playCard(card)}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Player Avatar Chip */}
              <div className="flex items-center gap-1.5 mt-0.5 px-2.5 py-0.5 rounded-full bg-black/60 border border-[#c5a059]/40">
                <span className="text-xs sm:text-sm">{humanPlayer.avatar}</span>
                <span className="text-[10px] sm:text-xs font-bold text-amber-200 truncate max-w-[110px]">
                  {humanPlayer.name}
                </span>
                {gameState.dealerIndex === 0 && (
                  <span className="px-1 py-0.2 rounded-full bg-amber-400 text-black text-[8px] font-black">
                    موزع
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* QUICK GULF CHAT BAR */}
      <footer className="relative z-30 px-2 sm:px-3 py-1 sm:py-1.5 bg-black/60 backdrop-blur-md border-t border-[#c5a059]/20 flex items-center justify-between gap-1 shrink-0 overflow-x-auto">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[10px] text-gray-400 font-semibold shrink-0 ml-1">عبارات:</span>
          {quickPhrases.map((phrase, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendQuickPhrase(phrase)}
              className="text-[11px] px-2 py-0.5 rounded-lg bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-400/40 text-gray-200 hover:text-amber-200 whitespace-nowrap transition-all"
            >
              {phrase}
            </button>
          ))}
        </div>
      </footer>

      {/* CHAT OVERLAY DRAWER */}
      {showChat && (
        <div className="absolute bottom-12 right-2 sm:right-4 z-40 w-72 sm:w-80 max-w-[calc(100vw-16px)] bg-[#10221a]/95 backdrop-blur-lg border border-[#c5a059]/40 rounded-2xl shadow-2xl p-3 flex flex-col h-72 sm:h-80">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
            <span className="text-xs font-bold text-amber-300">دردشة ديوان البلوت 💬</span>
            <button
              type="button"
              onClick={() => setShowChat(false)}
              className="text-gray-400 hover:text-white text-sm"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 text-xs p-1">
            {chatMessages.map((msg, i) => (
              <div key={i} className="bg-black/30 p-1.5 rounded-lg border border-white/5">
                <div className="flex justify-between text-[9px] text-gray-400 mb-0.5">
                  <span className="font-bold text-amber-200">{msg.sender}</span>
                  <span>{msg.time}</span>
                </div>
                <p className="text-gray-200 text-[11px]">{msg.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendCustomChat} className="flex gap-1.5 mt-2 pt-2 border-t border-white/10">
            <input
              type="text"
              value={customChatInput}
              onChange={(e) => setCustomChatInput(e.target.value)}
              placeholder="اكتب رسالة..."
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
              maxLength={80}
            />
            <button
              type="submit"
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg transition-all"
            >
              إرسال
            </button>
          </form>
        </div>
      )}

      {/* ROUND END SCORING MODAL */}
      {gameState.phase === 'round_end' && (
        <RoundEndModal
          roundScore={gameState.lastRoundScore}
          matchScore={gameState.matchScore}
          roundNumber={gameState.currentRoundNumber}
          onNextRound={proceedToNextRound}
        />
      )}

      {/* GAME OVER RESULTS MODAL */}
      {gameState.phase === 'match_end' && (
        <GameOverModal
          score={gameState.matchScore}
          onRematch={restartMatch}
          onLeave={leaveGame}
        />
      )}
    </div>
  );
};
