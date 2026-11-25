import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  BrainCircuitIcon, LayoutDashboardIcon, LogOutIcon, MenuIcon, XCircleIcon, 
  UserIcon, SettingsIcon, BookOpenIcon, 
  TrophyIcon, AwardIcon, MessageSquareIcon, ArrowLeftIcon
} from './Icons';

interface HeaderProps {
  userName: string;
  variant?: 'default' | 'dashboard';
  isAdmin?: boolean;
  avatarUrl?: string | null;
}

function normalizeActiveHash(rawHash: string): string {
  const h = rawHash || '#userDashboard';
  if (h === '#dashboard' || h === '#lesson') return '#levelSelection';
  if (h === '#profile') return '#settings';
  return h;
}

// ── Shared Profile Dropdown Component ──────────────────────────────────────
const ProfileDropdownMenu = ({
  isOpen,
  onNav,
  onSignOut,
  className = "absolute top-12 right-0 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2"
}: {
  isOpen: boolean;
  onNav: (hash: string) => void;
  onSignOut: () => void;
  className?: string;
}) => {
  if (!isOpen) return null;
  return (
    <div 
      className={className} 
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button 
        type="button"
        onClick={() => onNav('#settings')} 
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
      >
        <UserIcon className="w-4 h-4 text-slate-400" /> Profile
      </button>
      <button 
        type="button"
        onClick={() => onNav('#settings')} 
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
      >
        <SettingsIcon className="w-4 h-4 text-slate-400" /> Settings
      </button>
      <div className="h-px bg-slate-100 my-1"></div>
      <button 
        type="button"
        onClick={onSignOut} 
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
      >
        <LogOutIcon className="w-4 h-4 text-red-500" /> Sign Out
      </button>
    </div>
  );
};

// ── Shared Mobile Hamburger Menu Overlay ──────────────────────────────────
const MobileHamburgerMenuOverlay = ({
  isOpen,
  onClose,
  onNav,
  onSignOut,
  navItems,
  activeHash
}: {
  isOpen: boolean;
  onClose: () => void;
  onNav: (hash: string) => void;
  onSignOut: () => void;
  navItems: Array<{ label: string; icon: React.ReactNode; hash: string }>;
  activeHash: string;
}) => {
  if (!isOpen) return null;
  return (
    <div className="md:hidden fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
      <div className="absolute top-0 left-0 bottom-0 w-[280px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-left" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNav('#userDashboard')}>
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center bg-[#3466F6] text-white shrink-0">
              <BrainCircuitIcon className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-black tracking-[0.08em] text-[#0F172A] font-serif leading-none mb-0.5">SYLLOSPHERE</span>
            </div>
          </div>
          <button className="p-2 text-slate-400 hover:text-slate-600" onClick={onClose}>
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <div className="flex flex-col px-3 gap-1">
            {navItems.map((item) => {
              const isActive = activeHash === item.hash;
              return (
                <button 
                  key={item.hash}
                  type="button"
                  onClick={() => onNav(item.hash)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-[12px] text-sm transition-colors ${
                    isActive
                      ? 'bg-[#EFF6FF] text-[#3466F6] font-bold'
                      : 'text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A] font-medium'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-100">
          <button 
            type="button"
            onClick={onSignOut}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors"
          >
            <LogOutIcon className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export const Header: React.FC<HeaderProps> = ({ userName, variant = 'default', isAdmin = false, avatarUrl }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [activeHash, setActiveHash] = useState<string>(() =>
    typeof window !== 'undefined' ? normalizeActiveHash(window.location.hash) : '#userDashboard'
  );
  const mobileProfileMenuRef = useRef<HTMLDivElement>(null);
  const desktopProfileMenuRef = useRef<HTMLDivElement>(null);

  // Sync active hash when route changes
  useEffect(() => {
    const syncHash = () => setActiveHash(normalizeActiveHash(window.location.hash));
    syncHash();
    window.addEventListener('hashchange', syncHash);
    window.addEventListener('popstate', syncHash);
    return () => {
      window.removeEventListener('hashchange', syncHash);
      window.removeEventListener('popstate', syncHash);
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const inMobile = mobileProfileMenuRef.current?.contains(target);
      const inDesktop = desktopProfileMenuRef.current?.contains(target);
      if (!inMobile && !inDesktop) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
    window.location.hash = '';
    await supabase.auth.signOut();
    window.location.href = window.location.origin + window.location.pathname;
  };

  // Consistent nav order: Dashboard, Lessons, Leaderboard, Certificates, [Consult Desk for admin], Settings
  const baseNavItems = [
    { label: 'Dashboard', icon: <LayoutDashboardIcon className="w-5 h-5" />, hash: '#userDashboard' },
    { label: 'Lessons', icon: <BookOpenIcon className="w-5 h-5" />, hash: '#levelSelection' },
    { label: 'Leaderboard', icon: <TrophyIcon className="w-5 h-5" />, hash: '#leaderboard' },
    { label: 'Certificates', icon: <AwardIcon className="w-5 h-5" />, hash: '#certificate' },
  ];

  const navItems = isAdmin 
    ? [...baseNavItems, { label: 'Consult Desk', icon: <MessageSquareIcon className="w-5 h-5" />, hash: '#adminConsult' }, { label: 'Settings', icon: <SettingsIcon className="w-5 h-5" />, hash: '#settings' }]
    : [...baseNavItems, { label: 'Settings', icon: <SettingsIcon className="w-5 h-5" />, hash: '#settings' }];

  const handleNav = (hash: string) => {
    window.location.hash = hash;
    setActiveHash(normalizeActiveHash(hash));
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  const displayInitial = userName ? userName.charAt(0).toUpperCase() : 'A';

  if (variant === 'dashboard') {
    return (
      <>
        <header className="h-[64px] md:h-[72px] border-b border-[#E2E8F0] bg-white flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-1 text-[#0F172A]" onClick={() => setIsMobileMenuOpen(true)} aria-label="Open menu">
              <MenuIcon className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 md:hidden cursor-pointer" onClick={() => handleNav('#userDashboard')}>
              <div className="w-8 h-8 bg-[#3466F6] rounded-lg flex items-center justify-center text-white shrink-0">
                <BrainCircuitIcon className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-[12px] font-bold tracking-[0.1em] text-[#0F172A] font-serif leading-none mb-0.5">SYLLOSPHERE</h1>
                <p className="text-[5px] font-bold text-[#64748B] tracking-widest uppercase">Master Logic.</p>
              </div>
            </div>
            <button onClick={() => handleNav('#landing')} className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 rounded-full text-[#64748B] font-semibold text-[13px] transition-all border border-[#E2E8F0] shadow-sm">
              <ArrowLeftIcon className="w-4 h-4" /> Home
            </button>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="flex items-center gap-3 pl-4 md:pl-6 border-l border-[#E2E8F0] relative" ref={desktopProfileMenuRef}>
              <button onClick={(e) => { e.stopPropagation(); setIsProfileMenuOpen(!isProfileMenuOpen); }} className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-[#EFF6FF] rounded-full flex items-center justify-center text-[#3466F6] font-bold text-sm md:text-lg border border-blue-100 relative overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    displayInitial
                  )}
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white z-10"></div>
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-bold text-[#0F172A] leading-none mb-1">{userName || 'Admin'}</p>
                  <p className="text-[11px] text-[#64748B] font-medium">Active Candidate</p>
                </div>
              </button>

              <ProfileDropdownMenu 
                isOpen={isProfileMenuOpen} 
                onNav={handleNav} 
                onSignOut={handleSignOut} 
              />
            </div>
          </div>
        </header>

        <MobileHamburgerMenuOverlay 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)} 
          onNav={handleNav} 
          onSignOut={handleSignOut} 
          navItems={navItems} 
          activeHash={activeHash}
        />
      </>
    );
  }

  return (
    <>
      <header className="w-full flex items-center justify-between px-4 md:px-8 py-3 md:py-3.5 z-30 shrink-0 bg-white border-b border-[#E2E8F0]/80 shadow-sm md:bg-gradient-to-r md:from-[#0F2B8F] md:via-[#1D4ED8] md:to-[#1E40AF] md:border-b md:border-white/[0.08] md:shadow-lg sticky top-0">
        
        {/* MOBILE HEADER (md:hidden) */}
        <div className="flex items-center justify-between w-full md:hidden">
          <button className="p-2 -ml-2 text-[#0F172A]" onClick={() => setIsMobileMenuOpen(true)} aria-label="Open menu">
            <MenuIcon className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-2 flex-1 ml-2 cursor-pointer" onClick={() => handleNav('#userDashboard')}>
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center bg-[#3466F6] text-white shrink-0">
              <BrainCircuitIcon className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-black tracking-[0.08em] text-[#0F172A] font-serif leading-none mb-0.5">SYLLOSPHERE</span>
              <span className="text-[5px] text-[#64748B] font-bold tracking-[0.1em] uppercase leading-none">MASTER LOGIC. ACE EVERY EXAM.</span>
            </div>
          </div>

          <div className="flex items-center gap-3 relative" ref={mobileProfileMenuRef}>
            <button className="relative" onClick={(e) => { e.stopPropagation(); setIsProfileMenuOpen(!isProfileMenuOpen); }}>
              <div className="w-8 h-8 rounded-full bg-[#EFF6FF] border border-blue-100 text-[#3466F6] flex items-center justify-center font-bold text-sm shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                ) : (
                  displayInitial
                )}
              </div>
              <div className="absolute bottom-0 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></div>
            </button>
            <ProfileDropdownMenu 
              isOpen={isProfileMenuOpen} 
              onNav={handleNav} 
              onSignOut={handleSignOut} 
              className="md:hidden absolute top-10 right-0 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2"
            />
          </div>
        </div>

        {/* DESKTOP & TABLET HEADER (hidden md:flex) */}
        <div className="hidden md:flex items-center justify-between w-full">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNav('#userDashboard')}>
            <div className="w-10 h-10 border border-white/20 rounded-xl flex items-center justify-center bg-white/5 text-white">
              <BrainCircuitIcon className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-[18px] font-bold tracking-[0.15em] text-white font-serif leading-none mb-1">SYLLOSPHERE</span>
              <span className="text-[9px] text-slate-400 font-bold tracking-[0.15em] uppercase leading-none">LEARNING PLATFORM</span>
            </div>
          </div>
          <div className="flex items-center gap-3 lg:gap-4">
            {isAdmin && (
              <button
                onClick={() => handleNav('#adminConsult')}
                className={`flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase px-4 py-2 rounded-lg transition-all duration-300 border ${
                  activeHash === '#adminConsult'
                    ? 'bg-white text-[#1D4ED8] border-white shadow-sm'
                    : 'text-white bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30 hover:shadow-[0_0_15px_rgba(255,255,255,0.15)]'
                }`}
              >
                <MessageSquareIcon className="w-3.5 h-3.5" /> CONSULT DESK
              </button>
            )}
            <button onClick={() => handleNav('#userDashboard')} className="flex items-center gap-2 text-[10px] text-white font-bold tracking-widest uppercase bg-white/5 border border-white/20 px-4 py-2 rounded-lg hover:bg-white/10 hover:border-white/30 hover:shadow-[0_0_15px_rgba(255,255,255,0.15)] transition-all duration-300">
              <LayoutDashboardIcon className="w-3.5 h-3.5" /> DASHBOARD
            </button>
            <div className="flex items-center gap-3 pl-4 lg:pl-5 border-l border-white/10 relative" ref={desktopProfileMenuRef}>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsProfileMenuOpen(!isProfileMenuOpen); }}
                className="flex items-center gap-3 text-left group"
              >
                <div className="w-9 h-9 rounded-full bg-[#3466F6] border border-blue-400 text-white flex items-center justify-center font-bold text-sm shrink-0 transition-transform group-hover:scale-105">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    displayInitial
                  )}
                </div>
                <div className="text-right hidden lg:block">
                  <p className="text-[11px] text-white font-bold leading-none mb-1">{userName || 'Admin'}</p>
                  <p className="text-[8px] text-blue-200 font-bold tracking-widest uppercase leading-none">ACTIVE CANDIDATE</p>
                </div>
              </button>
              
              <ProfileDropdownMenu 
                isOpen={isProfileMenuOpen} 
                onNav={handleNav} 
                onSignOut={handleSignOut} 
              />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Hamburger Menu Overlay */}
      <MobileHamburgerMenuOverlay 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
        onNav={handleNav} 
        onSignOut={handleSignOut} 
        navItems={navItems} 
        activeHash={activeHash}
      />
    </>
  );
};
export default Header;
