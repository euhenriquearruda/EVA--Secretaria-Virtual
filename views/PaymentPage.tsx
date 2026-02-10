
import React, { useState } from 'react';
import { User } from '../types';

interface PaymentPageProps {
  onPaymentSuccess?: (user: User) => void;
}

const PaymentPage = ({ onPaymentSuccess }: PaymentPageProps) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handlePayment = () => {
    if (!email) {
      setError('E-mail necessário.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Formato inválido.');
      return;
    }
    localStorage.setItem("pending_payment_email", email);
    window.location.href = "https://pay.kiwify.com.br/9TxKk1H";
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex flex-col p-8 md:p-12 relative">
      {/* EVA LOGO - TOP LEFT */}
      <div className="flex flex-col mb-14 relative z-20">
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
        <span className="text-[7px] font-medium uppercase tracking-[0.25em] text-slate-500 mt-2 ml-1">
          Secretária Virtual Inteligente
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-6xl w-full bg-[#111827]/50 rounded-[4rem] shadow-2xl overflow-hidden border border-white/5 flex flex-col lg:flex-row">
          
          {/* Painel Esquerdo */}
          <div className="lg:w-7/12 bg-slate-900/40 p-12 md:p-20 text-white flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 blur-[120px] rounded-full"></div>
            
            <div className="relative z-10">
              <h1 className="text-5xl md:text-6xl font-black mb-10 leading-[0.9] tracking-tighter">
                Acesso de <br />
                <span className="eva-text-gradient">Elite Pro.</span>
              </h1>
              
              <div className="space-y-10 mt-16">
                <BenefitItem icon="fa-brain" title="IA Gemini 3 Pro" desc="O cérebro mais avançado para decisões complexas." />
                <BenefitItem icon="fa-sitemap" title="Delegação Ilimitada" desc="Gerencie múltiplos funcionários através da EVA." />
                <BenefitItem icon="fa-bolt" title="Alta Performance" desc="Reduza seu trabalho operacional em até 80%." />
              </div>
            </div>
          </div>

          {/* Painel Direito - Checkout */}
          <div className="lg:w-5/12 p-12 md:p-20 flex flex-col justify-center bg-white/5 text-center">
            <div className="mb-12">
              <span className="inline-block px-5 py-2 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8 border border-blue-500/20">
                Licença Individual Enterprise
              </span>
              <div className="flex justify-center items-baseline gap-2">
                <span className="text-xl font-black text-slate-500">R$</span>
                <span className="text-8xl font-black text-white tracking-tighter">47</span>
                <span className="text-xl font-bold text-slate-500">/mês</span>
              </div>
            </div>

            <div className="mb-12 text-left">
              <div className="flex justify-between items-center mb-3 px-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">E-mail de Ativação</label>
                {error && <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{error}</span>}
              </div>
              <input 
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                className={`w-full px-8 py-6 rounded-3xl bg-white/5 border ${error ? 'border-rose-500/50' : 'border-white/10 focus:border-blue-500/50'} outline-none transition-all font-bold text-white text-lg placeholder:text-slate-800`}
                placeholder="seu@executivo.com"
              />
            </div>

            <button 
              onClick={handlePayment}
              className="w-full eva-gradient text-white font-black py-7 rounded-[2rem] transition-all shadow-2xl shadow-blue-500/10 hover:scale-[1.03] active:scale-[0.98] text-2xl flex items-center justify-center gap-4"
            >
              <span>ATIVAR AGORA</span>
              <i className="fas fa-arrow-right text-sm"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BenefitItem = ({ icon, title, desc }: { icon: string, title: string, desc: string }) => (
  <div className="flex gap-6 items-start">
    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 shadow-xl">
      <i className={`fas ${icon} text-blue-500 text-xl`}></i>
    </div>
    <div>
      <h4 className="font-black text-white text-lg mb-1 tracking-tight">{title}</h4>
      <p className="text-slate-400 text-sm leading-relaxed font-medium">{desc}</p>
    </div>
  </div>
);

export default PaymentPage;
