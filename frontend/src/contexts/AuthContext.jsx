import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { mockUsers, ROLE_MENUS } from '../mocks/users';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('bci_usuario');
    if (saved) {
      try { setUsuario(JSON.parse(saved)); } catch { localStorage.removeItem('bci_usuario'); }
    }
    setLoading(false);
  }, []);

  // Mock passwords
  const MOCK_PASSWORDS = {
    'admin@bciventures.com.br': 'Bci@2026',
    'ana@bciventures.com.br': 'Ana@2026',
    'carlos@bciventures.com.br': 'Carlos@2026',
    'diretor@bciventures.com.br': 'Diretor@2026',
    'alfa@investimentos.com.br': 'Alfa@2026',
    'lucas@a2itech.com.br': 'Lucas@2026',
    'gestor@bciventures.com.br': 'Gestor@2026',
  };

  const login = useCallback(async (email, senha) => {
    const user = mockUsers.find(u => u.email === email);
    if (!user) return { success: false, error: 'Usuário não encontrado' };
    const expectedPassword = MOCK_PASSWORDS[email];
    if (expectedPassword && senha !== expectedPassword) return { success: false, error: 'Senha incorreta' };
    const menus = ROLE_MENUS[user.role] || [];
    const enrichedUser = { ...user, permissoes: { menus, features: {} } };
    setUsuario(enrichedUser);
    localStorage.setItem('bci_usuario', JSON.stringify(enrichedUser));
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUsuario(null);
    localStorage.removeItem('bci_usuario');
  }, []);

  const userMenus = useMemo(() => usuario?.permissoes?.menus || [], [usuario]);

  const value = useMemo(() => ({
    usuario,
    loading,
    isAuthenticated: !!usuario,
    isAdmin: usuario?.role === 'admin',
    isAnalyst: usuario?.role === 'analyst' || usuario?.role === 'manager' || usuario?.role === 'admin',
    isExecutive: usuario?.role === 'executive',
    isInvestor: usuario?.role === 'investor',
    isStartup: usuario?.role === 'startup',
    hasMenu: (key) => userMenus.includes(key),
    permissoes: usuario?.permissoes || { menus: [], features: {} },
    login,
    logout,
  }), [usuario, loading, userMenus, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
