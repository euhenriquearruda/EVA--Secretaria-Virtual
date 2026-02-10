
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { mockAuthService } from '../services/mockAuthService';
import { User } from '../types';

interface AuthPageProps {
  onAuthSuccess: (user: User) => void;
}

const AuthPage = ({ onAuthSuccess }: AuthPageProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isLogin) {
        const user = mockAuthService.login(email, password);
        if (user) {
          onAuthSuccess(user);
          navigate('/dashboard');
        } else {
          setError('Acesso negado. Credenciais inválidas.');
        }
      } else {
        if (!name || name.trim().length < 2) throw new Error('Identificação necessária.');
        if (!email.includes('@')) throw new Error('E-mail inválido.');
        if (password.length < 6) throw new Error('Mínimo de 6 caracteres.');
        
        const user = mockAuthService.register(name, email, password);
        onAuthSuccess(user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Falha na conexão.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex flex-col p-8 md:p-12 relative overflow-hidden">
      {/* HEADER FIXO - LOGO E BOTÃO SAIR */}
      <div className="flex justify-between items-start relative z-50 w-full max-w-7xl mx-auto mb-10">
        <Link to="/" className="flex flex-col group">
          <div className="flex items-center gap-4">
            <div className="relative w-10 h-8 flex flex-col justify-between">
              <div className="h-1.5 w-full bg-blue-400 rounded-full relative">
                 <div className="absolute -right-1 -top-1 w-3 h-3 bg-blue-300 rounded-full shadow-[0_0_12px_rgba(96,165,250,0.8)]"></div>
              </div>
              <div className="h-1.5 w-[85%] bg-blue-500 rounded-full relative">
                 <div className="absolute -right-1 -top-1 w-3 h-3 bg-blue-400 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.8)]"></div>
              </div>
              <div className="h-1.5 w-full bg-blue-700 rounded-full relative">
                 <div className="absolute -right-1 -top-1 w-3 h-3 bg-blue-600 rounded-full shadow-[0_0_12px_rgba(37,99,235,0.8)]"></div>
              </div>
            </div>
            <span className="text-3xl font-black tracking-tighter text-white">EVA</span>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-3 ml-1">
            Secretária Virtual Inteligente
          </span>
        </Link>

        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-3 px-6 py-3 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/10 transition-all group"
        >
          <span className="text-[10px] font-black text-slate-400 group-hover:text-white uppercase tracking-[0.2em]">Voltar</span>
          <i className="fas fa-arrow-right-from-bracket text-[10px] text-slate-500 group-hover:text-rose-500"></i>
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="max-w-md w-full bg-[#111827]/40 border border-white/5 p-10 md:p-12 rounded-[3.5rem] backdrop-blur-3xl shadow-2xl">
          <div className="mb-10 text-center">
             <h1 className="text-3xl font-black text-white tracking-tighter mb-2">
               {isLogin ? 'Retomar Comando' : 'Ativar Unidade'}
             </h1>
             <p className="text-slate-500 text-sm">Protocolo de segurança EVA OS</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
             {error && (
               <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-widest p-4 rounded-2xl text-center">
                 {error}
               </div>
             )}

             {!isLogin && (
               <input 
                 type="text" required
                 className="w-full px-6 py-4 rounded-2xl bg-[#1e293b] border border-white/10 text-white font-bold outline-none focus:border-blue-500/50" 
                 placeholder="Seu Nome" 
                 value={name} onChange={e => setName(e.target.value)} 
               />
             )}

             <input 
               type="email" required
               className="w-full px-6 py-4 rounded-2xl bg-[#1e293b] border border-white/10 text-white font-bold outline-none focus:border-blue-500/50" 
               placeholder="E-mail" 
               value={email} onChange={e => setEmail(e.target.value)} 
             />

             <div className="relative">
               <input 
                 type={showPassword ? "text" : "password"} required
                 className="w-full px-6 py-4 rounded-2xl bg-[#1e293b] border border-white/10 text-white font-bold outline-none focus:border-blue-500/50" 
                 placeholder="Senha" 
                 value={password} onChange={e => setPassword(e.target.value)} 
               />
               <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500">
                 <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
               </button>
             </div>

             <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full eva-gradient text-white font-black py-5 rounded-2xl shadow-xl hover:scale-[1.02] transition-all text-xs uppercase tracking-widest mt-4"
             >
               {isSubmitting ? 'Sincronizando...' : (isLogin ? 'Iniciar Sessão' : 'Criar Conta')}
             </button>
          </form>

          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }} 
            className="w-full mt-8 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-blue-400"
          >
            {isLogin ? 'Não tem conta? Cadastre-se' : 'Já possui registro? Entrar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
