import { useState } from 'react';
import { Users, Plus, Search, Edit2, Trash2, X, Check, Shield } from 'lucide-react';
import { Card } from '../components/ui';
import { mockUsers } from '../mocks/users';
import { USER_ROLES } from '../constants';
import { formatDateTime, getInitials } from '../utils/formatters';

export default function UserManagement() {
  const [users, setUsers] = useState(mockUsers.map(u => ({ ...u })));
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ nome: '', email: '', role: 'analyst', ativo: true });

  const filtered = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.nome.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const openNew = () => { setEditUser(null); setForm({ nome: '', email: '', role: 'analyst', ativo: true }); setShowModal(true); };
  const openEdit = (u) => { setEditUser(u); setForm({ nome: u.nome, email: u.email, role: u.role, ativo: u.ativo }); setShowModal(true); };

  const handleSave = () => {
    if (!form.nome || !form.email) return;
    if (editUser) {
      setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...form, perfil_nome: USER_ROLES.find(r => r.value === form.role)?.label } : u));
    } else {
      const newUser = { id: Date.now(), ...form, perfil_nome: USER_ROLES.find(r => r.value === form.role)?.label, ultimo_acesso: new Date().toISOString() };
      setUsers(prev => [...prev, newUser]);
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (confirm('Remover este usuário?')) setUsers(prev => prev.filter(u => u.id !== id));
  };

  const toggleActive = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ativo: !u.ativo } : u));
  };

  const roleColors = { admin: '#7C5CFC', manager: '#0A5DC2', analyst: '#2880F6', executive: '#00C48C', investor: '#FFB020', startup: '#FF8C42' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fadeIn">
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h1 className="font-display" style={{ fontSize: 24, fontWeight: 700, color: 'var(--g900)', margin: 0 }}>Gestão de Usuários</h1>
          <p style={{ fontSize: 14, color: 'var(--g500)', margin: '4px 0 0' }}>{users.length} usuários cadastrados</p>
        </div>
        <button onClick={openNew} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: 'var(--primary-gradient)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: 'var(--shadow-primary)' }}>
          <Plus style={{ width: 16, height: 16 }} /> Novo Usuário
        </button>
      </div>

      <div style={{ position: 'relative', maxWidth: 400 }}>
        <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: 'var(--g400)' }} />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome ou email..." style={{ width: '100%', padding: '10px 12px 10px 40px', border: '1.5px solid var(--g200)', borderRadius: 10, fontSize: 14, background: '#fff', outline: 'none', color: 'var(--g900)' }} />
      </div>

      {/* Role Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
        {USER_ROLES.map(role => {
          const count = users.filter(u => u.role === role.value).length;
          return (
            <div key={role.value} style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', border: '1px solid var(--g200)', textAlign: 'center' }}>
              <div style={{ width: 10, height: 10, borderRadius: 4, background: roleColors[role.value], display: 'inline-block', marginBottom: 6 }} />
              <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--g900)' }}>{count}</p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--g500)' }}>{role.label}</p>
            </div>
          );
        })}
      </div>

      {/* Users Table */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--g200)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--g100)' }}>
                {['Usuário', 'E-mail', 'Papel', 'Status', 'Último Acesso', 'Ações'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--g500)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--g100)', opacity: u.ativo ? 1 : 0.5 }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${roleColors[u.role]}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: roleColors[u.role], flexShrink: 0 }}>{getInitials(u.nome)}</div>
                      <span style={{ fontWeight: 600, color: 'var(--g900)' }}>{u.nome}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--g600)' }}>{u.email}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 6, background: `${roleColors[u.role]}15`, color: roleColors[u.role], border: `1px solid ${roleColors[u.role]}30` }}>
                      {u.perfil_nome}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <button onClick={() => toggleActive(u.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 999, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: u.ativo ? 'rgba(0,196,140,0.1)' : 'rgba(255,71,87,0.1)', color: u.ativo ? '#00966B' : '#CC3844' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: u.ativo ? 'var(--accent-green)' : 'var(--accent-red)' }} /> {u.ativo ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--g500)', fontSize: 13 }}>{formatDateTime(u.ultimo_acesso)}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => openEdit(u)} style={{ padding: 6, borderRadius: 6, border: '1px solid var(--g200)', background: '#fff', cursor: 'pointer', color: 'var(--g500)' }}><Edit2 style={{ width: 14, height: 14 }} /></button>
                      <button onClick={() => handleDelete(u.id)} style={{ padding: 6, borderRadius: 6, border: '1px solid rgba(255,71,87,0.2)', background: 'rgba(255,71,87,0.05)', cursor: 'pointer', color: 'var(--accent-red)' }}><Trash2 style={{ width: 14, height: 14 }} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (<>
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 100 }} onClick={() => setShowModal(false)} />
        <div className="animate-scaleIn" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 101, background: '#fff', borderRadius: 16, padding: 28, width: '90%', maxWidth: 440, boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--g900)', margin: 0 }}>{editUser ? 'Editar Usuário' : 'Novo Usuário'}</h2>
            <button onClick={() => setShowModal(false)} style={{ padding: 4, borderRadius: 6, border: 'none', background: 'var(--g100)', cursor: 'pointer', color: 'var(--g500)' }}><X style={{ width: 16, height: 16 }} /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--g700)', display: 'block', marginBottom: 4 }}>Nome</label>
              <input type="text" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Nome completo" style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--g200)', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--g700)', display: 'block', marginBottom: 4 }}>E-mail</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com" style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--g200)', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--g700)', display: 'block', marginBottom: 4 }}>Papel</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--g200)', borderRadius: 10, fontSize: 14, background: '#fff', boxSizing: 'border-box' }}>
                {USER_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={form.ativo} onChange={e => setForm({ ...form, ativo: e.target.checked })} style={{ accentColor: 'var(--primary)' }} />
              <label style={{ fontSize: 13, color: 'var(--g700)' }}>Usuário ativo</label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px 16px', border: '1.5px solid var(--g200)', borderRadius: 10, background: '#fff', fontSize: 13, fontWeight: 600, color: 'var(--g600)', cursor: 'pointer' }}>Cancelar</button>
            <button onClick={handleSave} style={{ flex: 1, padding: '10px 16px', border: 'none', borderRadius: 10, background: 'var(--primary-gradient)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: 'var(--shadow-primary)' }}>
              <Check style={{ width: 14, height: 14, display: 'inline', verticalAlign: 'middle', marginRight: 4 }} /> Salvar
            </button>
          </div>
        </div>
      </>)}
    </div>
  );
}
