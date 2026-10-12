import React, { useState, useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { FirebaseAuthProvider, useFirebaseAuth } from './firebase/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { BalootTable } from './components/game/BalootTable';
import { HomePage } from './components/pages/HomePage';
import { PlayHubPage } from './components/pages/PlayHubPage';
import { BotPracticePage } from './components/pages/BotPracticePage';
import { PrivateRoomPage } from './components/pages/PrivateRoomPage';
import { LearnBalootPage } from './components/pages/LearnBalootPage';
import { RulesPage } from './components/pages/RulesPage';
import { ScoringCalculatorPage } from './components/pages/ScoringCalculatorPage';
import { ProjectsGuidePage } from './components/pages/ProjectsGuidePage';
import { StrategyGuidePage } from './components/pages/StrategyGuidePage';
import { LeaderboardPage } from './components/pages/LeaderboardPage';
import { ChallengesPage } from './components/pages/ChallengesPage';
import { ProfilePage } from './components/pages/ProfilePage';
import { GameHistoryPage } from './components/pages/GameHistoryPage';
import { FriendsPage } from './components/pages/FriendsPage';
import { SubscriptionPage } from './components/pages/SubscriptionPage';
import { SubscriptionManagePage } from './components/pages/SubscriptionManagePage';
import { AccountSettingsPage } from './components/pages/AccountSettingsPage';
import { FaqPage } from './components/pages/FaqPage';
import { ContactPage } from './components/pages/ContactPage';
import { LegalPage } from './components/pages/LegalPage';
import {
  subscribeToUserInvitations,
  respondToRoomInvitation,
  updateUserPresence,
  RoomInvitation,
} from './firebase/onlineGameService';
import { soundService } from './services/sound';
import { runEngineTests } from './engine/engine.test';

const AppContent: React.FC = () => {
  const { gameState, startNewGame } = useGame();
  const { userProfile, currentUser } = useFirebaseAuth();
  const [activeTab, setActiveTab] = useState<string>('home');
  const [pendingInvitation, setPendingInvitation] = useState<RoomInvitation | null>(null);
  const [invitationRoomCode, setInvitationRoomCode] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Run Baloot rules engine automated test suite on mount
    try {
      runEngineTests();
    } catch (e) {
      console.error('Failed to run engine tests:', e);
    }
  }, []);

  // Update user presence periodically (heartbeat)
  useEffect(() => {
    updateUserPresence('online');
    const interval = setInterval(() => {
      updateUserPresence('online');
    }, 45000);

    return () => {
      clearInterval(interval);
      updateUserPresence('offline');
    };
  }, []);

  // Subscribe to in-app room invitations in real time
  useEffect(() => {
    const targetUserId = currentUser?.uid || userProfile?.id;
    if (!targetUserId) return;

    const unsubscribe = subscribeToUserInvitations(targetUserId, (invitations) => {
      if (invitations.length > 0) {
        const latest = invitations[0];
        setPendingInvitation(latest);
        soundService.playCardDeal();
      } else {
        setPendingInvitation(null);
      }
    });

    return () => unsubscribe();
  }, [currentUser?.uid, userProfile?.id]);

  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartGame = (
    mode: 'quick' | 'bot' | 'private' | 'training',
    customRoomCode?: string,
    roomId?: string,
    customTurnTimer?: number
  ) => {
    startNewGame(mode, customRoomCode, roomId, customTurnTimer);
  };

  const handleAcceptInvitation = async () => {
    if (!pendingInvitation) return;
    soundService.playClick();
    const inv = pendingInvitation;
    setPendingInvitation(null);
    await respondToRoomInvitation(inv.id, 'accepted');
    setInvitationRoomCode(inv.roomCode);
    setActiveTab('rooms');
  };

  const handleDeclineInvitation = async () => {
    if (!pendingInvitation) return;
    soundService.playClick();
    const invId = pendingInvitation.id;
    setPendingInvitation(null);
    await respondToRoomInvitation(invId, 'declined');
  };

  // If a game is active, render the playable table view!
  if (gameState) {
    return <BalootTable />;
  }

  return (
    <div className="min-h-screen bg-[#07130e] text-[#f2ede4] flex flex-col justify-between selection:bg-amber-400 selection:text-black relative">
      {/* Real-time In-App Room Invitation Banner */}
      {pendingInvitation && (
        <div className="fixed top-18 right-3 left-3 sm:left-auto sm:right-6 sm:w-[380px] z-50 bg-[#10291e] border-2 border-amber-400 rounded-3xl p-4 shadow-[0_10px_35px_rgba(0,0,0,0.8)] animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-start gap-3">
            <span className="text-3xl">📬</span>
            <div className="flex-1 text-right">
              <strong className="text-sm font-black text-amber-300 block">
                دعوة للعب في ديوانية خاصة!
              </strong>
              <p className="text-xs text-gray-200 mt-1 leading-relaxed">
                دعاك اللاعب <span className="font-black text-white">{pendingInvitation.senderName}</span> للعب معه في غرفته الخاصة (رمز: <span className="font-mono font-bold text-amber-300 bg-black/40 px-1.5 py-0.5 rounded">{pendingInvitation.roomCode}</span>).
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={handleAcceptInvitation}
                  className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-black text-xs shadow-md transition-all cursor-pointer"
                >
                  انضمام فوري 🚪
                </button>
                <button
                  type="button"
                  onClick={handleDeclineInvitation}
                  className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 text-xs font-bold transition-all cursor-pointer"
                >
                  تجاهل ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar activeTab={activeTab} onSelectTab={handleSelectTab} />

      {/* Main Page Body */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomePage onSelectTab={handleSelectTab} onStartGame={handleStartGame} />
        )}
        {activeTab === 'play' && (
          <PlayHubPage onStartGame={handleStartGame} onSelectTab={handleSelectTab} />
        )}
        {activeTab === 'practice' && (
          <BotPracticePage onStartGame={() => handleStartGame('bot')} />
        )}
        {activeTab === 'rooms' && (
          <PrivateRoomPage
            onStartGame={handleStartGame}
            initialRoomCode={invitationRoomCode}
            onSelectTab={handleSelectTab}
          />
        )}
        {activeTab === 'learn' && (
          <LearnBalootPage onStartGame={handleStartGame} onSelectTab={handleSelectTab} />
        )}
        {activeTab === 'rules' && <RulesPage />}
        {activeTab === 'scoring' && <ScoringCalculatorPage />}
        {activeTab === 'projects_guide' && <ProjectsGuidePage />}
        {activeTab === 'strategies' && <StrategyGuidePage />}
        {activeTab === 'leaderboard' && <LeaderboardPage />}
        {activeTab === 'challenges' && (
          <ChallengesPage onStartGame={handleStartGame} onSelectTab={handleSelectTab} />
        )}
        {activeTab === 'profile' && (
          <ProfilePage onSelectTab={handleSelectTab} onStartGame={handleStartGame} />
        )}
        {activeTab === 'history' && <GameHistoryPage />}
        {activeTab === 'friends' && (
          <FriendsPage
            onStartPrivateWithFriend={(roomCode) => {
              setInvitationRoomCode(roomCode);
              setActiveTab('rooms');
            }}
          />
        )}
        {activeTab === 'subscription' && <SubscriptionPage onSelectTab={handleSelectTab} />}
        {activeTab === 'subscription_manage' && <SubscriptionManagePage onSelectTab={handleSelectTab} />}
        {activeTab === 'settings' && <AccountSettingsPage />}
        {activeTab === 'faq' && <FaqPage />}
        {activeTab === 'contact' && <ContactPage />}
        {(activeTab === 'legal' || activeTab === 'delete_account') && <LegalPage />}
      </main>

      {/* SEO & Knowledge Footer */}
      <Footer onSelectTab={handleSelectTab} />
    </div>
  );
};

export default function App() {
  return (
    <FirebaseAuthProvider>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </FirebaseAuthProvider>
  );
}
