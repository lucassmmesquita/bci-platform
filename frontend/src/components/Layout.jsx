import { useState, useMemo, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Rocket, GitBranch, Trophy, FileText, Users, Settings, LogOut, Menu, X, ChevronDown, Search, Shield, ClipboardList, Briefcase, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { getInitials } from '../utils/formatters';
import LogoWhite from '../assets/logo/BCI_Logo_C.svg';

const allNavigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, menuKey: 'dashboard' },
  { name: 'Dashboard Executivo', href: '/executive', icon: LayoutDashboard, menuKey: 'executive_dashboard' },
  { name: 'Dashboard Investidor', href: '/investor', icon: Briefcase, menuKey: 'investor_dashboard' },
  { name: 'Portal Startup', href: '/portal', icon: Eye, menuKey: 'portal' },
  { name: 'Startups', href: '/startups', icon: Rocket, menuKey: 'startups' },
  { name: 'Pipeline', href: '/pipeline', icon: GitBranch, menuKey: 'pipeline' },
  { name: 'Ranking', href: '/ranking', icon: Trophy, menuKey: 'ranking' },
  { name: 'Deal Flow', href: '/dealflow', icon: Briefcase, menuKey: 'dealflow' },
  { name: 'Relatórios', href: '/reports', icon: FileText, menuKey: 'reports' },
  { name: 'Usuários', href: '/users', icon: Users, menuKey: 'users' },
  { name: 'Score Config', href: '/scoring', icon: Settings, menuKey: 'scoring' },
  { name: 'Auditoria', href: '/audit', icon: Shield, menuKey: 'audit' },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { usuario, logout, hasMenu } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (isMobile) { setSidebarOpen(false); setSidebarCollapsed(false); }
    else if (isTablet) { setSidebarOpen(true); setSidebarCollapsed(true); }
    else { setSidebarOpen(true); setSidebarCollapsed(false); }
  }, [isMobile, isTablet, isDesktop]);

  const navigation = useMemo(() => allNavigation.filter(item => hasMenu(item.menuKey)), [usuario]);
  const hasSettingsAccess = useMemo(() => hasMenu('settings'), [usuario]);
  const handleLogout = () => { logout(); navigate('/login'); };
  const handleNavClick = () => { if (isMobile) setSidebarOpen(false); };
  const sidebarWidth = sidebarCollapsed ? 64 : 256;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--g50)' }}>
      {sidebarOpen && isMobile && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40, backdropFilter: 'blur(4px)' }} onClick={() => setSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside style={{
        position: 'fixed', top: 0, left: 0, zIndex: 50, height: '100vh',
        width: isMobile ? 256 : sidebarWidth,
        background: 'linear-gradient(180deg, #0D1117 0%, #161B22 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column',
        transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
        transition: 'width 0.3s cubic-bezier(.4,0,.2,1), transform 0.3s cubic-bezier(.4,0,.2,1)',
        overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ padding: sidebarCollapsed ? '20px 8px 16px' : '20px 20px 16px', display: 'flex', flexDirection: 'column', alignItems: sidebarCollapsed ? 'center' : 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'relative' }}>
          {sidebarCollapsed ? (
            <img src={LogoWhite} alt="BCI" style={{ width: 36, height: 'auto', objectFit: 'contain', filter: 'brightness(1.1)' }} />
          ) : (
            <img src={LogoWhite} alt="BCI Ventures" style={{ width: 180, height: 'auto', objectFit: 'contain', filter: 'brightness(1.1)' }} />
          )}
          {isMobile && (
            <button onClick={() => setSidebarOpen(false)} style={{ position: 'absolute', top: 16, right: 16, color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <X style={{ width: 20, height: 20 }} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav style={{ padding: sidebarCollapsed ? '16px 8px' : '16px 12px', flex: 1, overflowY: 'auto' }}>
          {!sidebarCollapsed && <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', padding: '8px 12px 8px' }}>Menu</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {navigation.map((item) => (
              <NavLink key={item.name} to={item.href} end={item.href === '/'} onClick={handleNavClick} title={sidebarCollapsed ? item.name : undefined}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: sidebarCollapsed ? 0 : 12,
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  padding: sidebarCollapsed ? '10px 0' : '10px 12px', borderRadius: 10,
                  fontSize: 14, fontWeight: isActive ? 600 : 500, textDecoration: 'none',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                  background: isActive ? 'rgba(10,93,194,0.2)' : 'transparent',
                  boxShadow: isActive ? 'inset 0 0 0 1px rgba(10,93,194,0.25)' : 'none',
                  transition: 'all 0.2s', position: 'relative', minHeight: 44,
                })}>
                {({ isActive }) => (<>
                  {isActive && !sidebarCollapsed && <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: 20, borderRadius: '0 3px 3px 0', background: 'var(--primary)' }} />}
                  <div style={{ width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: isActive ? 'rgba(10,93,194,0.25)' : 'transparent', transition: 'background 0.2s' }}>
                    <item.icon style={{ width: 18, height: 18, color: isActive ? 'var(--primary-light)' : 'rgba(255,255,255,0.55)' }} />
                  </div>
                  {!sidebarCollapsed && <span>{item.name}</span>}
                </>)}
              </NavLink>
            ))}
          </div>
        </nav>
      </aside>

      {/* MAIN */}
      <div style={{ paddingLeft: isMobile ? 0 : sidebarWidth, transition: 'padding-left 0.3s cubic-bezier(.4,0,.2,1)' }}>
        {/* Header */}
        <header style={{ position: 'sticky', top: 0, zIndex: 30, height: 56, background: 'rgba(248,249,252,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--g200)' }}>
          <div style={{ height: '100%', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
              {isMobile && <button onClick={() => setSidebarOpen(true)} style={{ padding: 8, borderRadius: 8, color: 'var(--g500)', background: 'none', border: 'none', cursor: 'pointer' }} className="touch-target"><Menu style={{ width: 22, height: 22 }} /></button>}
              {isTablet && <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ padding: 8, borderRadius: 8, color: 'var(--g500)', background: 'none', border: 'none', cursor: 'pointer' }} className="touch-target"><Menu style={{ width: 20, height: 20 }} /></button>}
            </div>
            {/* User menu */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', borderRadius: 10, background: 'none', border: 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--g100)'} onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                  {getInitials(usuario?.nome)}
                </div>
                {!isMobile && <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--g900)', margin: 0 }}>{usuario?.nome || 'Usuário'}</p>
                  <p style={{ fontSize: 11, color: 'var(--g400)', margin: 0, textTransform: 'capitalize' }}>{usuario?.perfil_nome || 'Visitante'}</p>
                </div>}
                <ChevronDown style={{ width: 16, height: 16, color: 'var(--g400)' }} />
              </button>
              {userMenuOpen && (<>
                <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setUserMenuOpen(false)} />
                <div style={{ position: 'absolute', right: 0, marginTop: 8, width: 192, background: '#fff', borderRadius: 12, boxShadow: 'var(--shadow-md)', border: '1px solid var(--g200)', padding: 4, zIndex: 20, animation: 'fadeIn 0.2s ease' }}>
                  {isMobile && <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--g100)', marginBottom: 4 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--g900)', margin: 0 }}>{usuario?.nome}</p>
                    <p style={{ fontSize: 11, color: 'var(--g400)', margin: 0 }}>{usuario?.perfil_nome}</p>
                  </div>}
                  <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', fontSize: 13, fontWeight: 500, color: 'var(--accent-red)', background: 'none', border: 'none', borderRadius: 8, cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,71,87,0.06)'} onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>
                    <LogOut style={{ width: 16, height: 16 }} /> Sair
                  </button>
                </div>
              </>)}
            </div>
          </div>
        </header>

        <main style={{ padding: isMobile ? '16px 16px 80px' : '24px 24px 40px' }}>
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
