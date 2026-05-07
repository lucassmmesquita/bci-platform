import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LogoBCI from '../assets/logo/BCI_Logo_B.svg';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, senha);
      if (result.success) navigate('/');
      else setError(result.error);
    } catch { setError('Erro ao fazer login.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="hex-bg"></div>
      <div className="login-container">
        <div className="logo-section">
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <img src={LogoBCI} alt="BCI Ventures" style={{ width: 220, height: 'auto', paddingLeft: 16 }} />
          </div>
          <p className="logo-sub">Smart Venture Studio as a Service</p>
        </div>
        <div className="login-card">
          <h2 className="login-title">Acesse sua conta</h2>
          {error && <div className="error-msg"><AlertCircle style={{width:18,height:18,flexShrink:0}} />{error}</div>}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label className="input-label">E-mail</label>
              <div className="input-wrap">
                <Mail className="input-icon" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Digite seu e-mail" className="input-field" required />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Senha</label>
              <div className="input-wrap">
                <Lock className="input-icon" />
                <input type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="Digite sua senha" className="input-field" required />
              </div>
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? <><Loader2 className="spin-icon" />Entrando...</> : <>Entrar<ArrowRight style={{width:18,height:18}} /></>}
            </button>
          </form>
        </div>
        <p className="copyright">© 2026 BCI Ventures — Todos os direitos reservados</p>
      </div>
      <style>{`
        .login-page { min-height:100dvh; background:var(--g50); display:flex; align-items:center; justify-content:center; padding:16px; position:relative; overflow:hidden; }
        .hex-bg { position:absolute; inset:0; background-image:radial-gradient(circle,rgba(10,93,194,.06) 1px,transparent 1px),radial-gradient(circle,rgba(13,17,23,.03) 1px,transparent 1px); background-size:48px 48px,80px 80px; background-position:0 0,24px 24px; opacity:0.8; }
        .login-container { position:relative; z-index:10; width:100%; max-width:420px; animation:fadeUp 0.8s cubic-bezier(.4,0,.2,1) both; }
        .logo-section { text-align:center; margin-bottom:32px; }
        .logo-box { width:56px; height:56px; border-radius:14px; background:var(--primary-gradient); display:inline-flex; align-items:center; justify-content:center; font-size:18px; font-weight:800; color:#fff; margin-bottom:12px; box-shadow:var(--shadow-primary); font-family:'Plus Jakarta Sans',sans-serif; }
        .logo-title { font-size:28px; font-weight:800; color:var(--g900); margin:0 0 4px; font-family:'Plus Jakarta Sans',sans-serif; }
        .logo-sub { font-size:13px; font-weight:500; color:var(--g500); margin:0; letter-spacing:0.02em; }
        .login-card { background:#fff; border-radius:16px; padding:32px; box-shadow:var(--shadow-md); border:1px solid var(--g200); }
        .login-title { font-size:20px; font-weight:700; color:var(--g900); margin:0 0 8px; text-align:center; }
        .login-hint { font-size:11px; color:var(--g400); text-align:center; margin:0 0 20px; line-height:1.5; }
        .error-msg { display:flex; align-items:center; gap:10px; padding:12px 16px; background:rgba(255,71,87,0.06); border:1px solid rgba(255,71,87,0.2); border-radius:10px; color:#CC3844; font-size:13px; font-weight:500; margin-bottom:16px; }
        .login-form { display:flex; flex-direction:column; gap:16px; }
        .input-group { display:flex; flex-direction:column; gap:6px; }
        .input-label { font-size:13px; font-weight:600; color:var(--g700); }
        .input-wrap { position:relative; }
        .input-icon { position:absolute; left:14px; top:50%; transform:translateY(-50%); width:18px; height:18px; color:var(--g400); }
        .input-field { width:100%; padding:12px 14px 12px 46px; border:1.5px solid var(--g200); border-radius:10px; font-size:14px; font-family:'Inter',sans-serif; color:var(--g900); background:#fff; transition:all 0.2s; box-sizing:border-box; outline:none; min-height:44px; }
        .input-field:focus { border-color:var(--primary); box-shadow:0 0 0 4px rgba(10,93,194,0.12); }
        .input-field::placeholder { color:var(--g400); }
        .submit-btn { display:flex; align-items:center; justify-content:center; gap:8px; width:100%; padding:14px 32px; background:var(--primary-gradient); color:#fff; font-size:15px; font-weight:600; font-family:'Inter',sans-serif; border:none; border-radius:999px; cursor:pointer; transition:all 0.22s; margin-top:8px; box-shadow:var(--shadow-primary); position:relative; overflow:hidden; }
        .submit-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 12px 32px rgba(10,93,194,.4); }
        .submit-btn:active:not(:disabled) { transform:translateY(0); }
        .submit-btn:disabled { opacity:0.7; cursor:not-allowed; }
        .spin-icon { width:18px; height:18px; animation:spin 1s linear infinite; }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .copyright { text-align:center; font-size:12px; color:var(--g400); margin-top:24px; font-weight:500; }
        @media(max-width:639px) { .login-card{padding:24px} .input-field{font-size:16px!important} }
      `}</style>
    </div>
  );
}
