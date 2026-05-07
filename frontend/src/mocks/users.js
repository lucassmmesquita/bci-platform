export const mockUsers = [
  { id: 1, nome: 'Admin BCI', email: 'admin@bciventures.com.br', role: 'admin', perfil_nome: 'Administrador', ativo: true, ultimo_acesso: '2025-08-22T14:30:00Z' },
  { id: 2, nome: 'Ana Souza', email: 'ana@bciventures.com.br', role: 'analyst', perfil_nome: 'Analista', ativo: true, ultimo_acesso: '2025-08-22T10:00:00Z' },
  { id: 3, nome: 'Carlos Mendes', email: 'carlos@bciventures.com.br', role: 'analyst', perfil_nome: 'Analista', ativo: true, ultimo_acesso: '2025-08-21T16:45:00Z' },
  { id: 4, nome: 'Diretor BCI', email: 'diretor@bciventures.com.br', role: 'executive', perfil_nome: 'Executivo', ativo: true, ultimo_acesso: '2025-08-22T09:00:00Z' },
  { id: 5, nome: 'Investidor Alfa', email: 'alfa@investimentos.com.br', role: 'investor', perfil_nome: 'Investidor', ativo: true, ultimo_acesso: '2025-08-20T11:30:00Z' },
  { id: 6, nome: 'Lucas Mesquita', email: 'lucas@a2itech.com.br', role: 'startup', perfil_nome: 'Startup', ativo: true, ultimo_acesso: '2025-08-22T08:00:00Z', startup_id: 1 },
  { id: 7, nome: 'Gestor BCI', email: 'gestor@bciventures.com.br', role: 'manager', perfil_nome: 'Gestor', ativo: true, ultimo_acesso: '2025-08-22T13:00:00Z' },
];

// Menu permissions per role
export const ROLE_MENUS = {
  admin: ['dashboard', 'startups', 'pipeline', 'ranking', 'reports', 'users', 'scoring', 'audit', 'settings'],
  manager: ['dashboard', 'startups', 'pipeline', 'ranking', 'reports', 'scoring'],
  analyst: ['dashboard', 'startups', 'pipeline', 'ranking', 'reports'],
  executive: ['executive_dashboard', 'ranking', 'reports'],
  investor: ['investor_dashboard', 'dealflow'],
  startup: ['portal'],
};
