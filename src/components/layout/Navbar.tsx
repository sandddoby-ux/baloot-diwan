import React, { useState } from 'react';
import { useFirebaseAuth } from '../../firebase/AuthContext';
import { BalootLogo } from '../common/BalootLogo';

interface NavbarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSelectTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, userProfile, loginWithGoogle, logout } = useFirebaseAuth();

  const navItems = [
    { id: 'home', label: 'الرئيسية' },
    { id: 'play', label: 'العب الآن 🃏' },
    { id: 'practice', label: 'ضد الكمبيوتر 🤖' },
    { id: 'rooms', label: 'غرف خاصة 🚪' },
    { id: 'challenges', label: 'التحديات 🎯' },
    { id: 'learn', label: 'دليل القوانين 📜' },
    { id: 'scoring', label: 'حاسبة النقاط 🧮' },
    { id: 'leaderboard', label: 'المتصدرون 🏆' },
    { id: 'subscription', label: 'ديوان بلس ⭐' },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-[#0a1813]/95 backdrop-blur-md border-b border-[#c5a059]/25 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-2 cursor-pointer group select-none"
          >
            <BalootLogo size="sm" showText={true} withGlow={true} />
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs xl:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-sm'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right Actions: Auth & Profile Chip */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Always accessible Profile Button */}
            <button
              type="button"
              onClick={() => onSelectTab('profile')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'border-amber-400 bg-amber-500/20 shadow-md ring-1 ring-amber-400'
                  : 'bg-black/40 border-[#c5a059]/30 hover:border-amber-400/70'
              }`}
              title="الملف الشخصي"
            >
              <span className="text-xl">{userProfile.avatar || '🦅'}</span>
              <div className="text-right hidden sm:block">
                <span className="text-xs font-black text-gray-200 block leading-tight truncate max-w-[120px]">
                  {userProfile.name}
                </span>
                <span className="text-[10px] text-amber-300 font-semibold flex items-center gap-1">
                  {userProfile.coins.toLocaleString()} 🪙 • لفل {userProfile.level}
                </span>
              </div>
            </button>

            {currentUser ? (
              <button
                type="button"
                onClick={logout}
                title="تسجيل الخروج"
                className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-900/30 text-gray-400 hover:text-rose-300 text-xs border border-white/10 transition-all cursor-pointer"
              >
                🚪
              </button>
            ) : (
              <button
                type="button"
                onClick={loginWithGoogle}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-400/40 text-amber-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>🌐</span>
                <span className="hidden sm:inline">دخول Google</span>
                <span className="sm:hidden">دخول</span>
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white"
            >
              <span className="text-xl">{mobileMenuOpen ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0c1e17] border-b border-[#c5a059]/30 px-4 pt-2 pb-4 space-y-1 animate-in slide-in-from-top-4 duration-200">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelectTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-right px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === item.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                  : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-white/10 flex gap-2">
            <button
              type="button"
              onClick={() => {
                onSelectTab('profile');
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2 text-center text-xs bg-amber-500/20 text-amber-300 font-bold rounded-lg border border-amber-500/40"
            >
              👤 ملف اللاعب
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectTab('friends');
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2 text-center text-xs bg-black/30 rounded-lg text-gray-300 hover:text-white border border-white/10"
            >
              👥 الأصدقاء
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
