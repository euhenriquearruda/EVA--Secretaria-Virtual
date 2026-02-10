
import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white font-sans selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0f1a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 h-24 flex justify-between items-center">
          {/* EVA LOGO */}
          <div className="flex flex-col">
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

          <div className="hidden md:flex items-center gap-10">
            <Link to="/como-funciona" className="text-sm font-bold text-slate-400 hover:text-blue-400 transition-colors">Como Funcionamos</Link>
            <Link to="/auth" className="text-sm font-bold text-slate-400 hover:text-blue-400 transition-colors">Entrar</Link>
            <Link to="/auth" className="eva-gradient text-white px-8 py-3 rounded-2xl text-sm font-black hover:shadow-2xl hover:shadow-blue-500/40 transition-all transform hover:-translate-y-0.5">
              Ativar Central
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] bg-blue-600/20 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[50%] bg-blue-900/20 blur-[150px] rounded-full"></div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-12 animate-pulse">
            Sua Mente em Modo Executivo
          </div>
          
          <h1 className="text-6xl md:text-[7.5rem] font-black mb-12 leading-[0.85] tracking-[-0.05em] max-w-5xl mx-auto">
            Organize o caos com <br />
            <span className="eva-text-gradient">Inteligência Real.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-400 mb-16 max-w-3xl mx-auto leading-relaxed font-medium">
            A secretária virtual definitiva para CEOs e Gestores. <br />
            Organize sua rotina, delegue para sua equipe e retome seu tempo.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link to="/auth" className="w-full sm:w-auto eva-gradient text-white px-14 py-6 rounded-3xl text-xl font-black shadow-2xl shadow-blue-600/20 hover:scale-105 transition-all">
              Ativar Minha EVA Pro
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SUMMARY */}
      <section id="como-funciona" className="py-40 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] mb-4">Protocolo de Operação</h2>
            <h3 className="text-4xl md:text-6xl font-black tracking-tighter">Como a EVA domina sua rotina</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            <WorkflowStep 
              step="01"
              icon="fa-microphone-lines"
              title="Comando Natural"
              desc="Você não preenche formulários. Você apenas fala ou digita sua diretriz como faria com uma secretária humana."
              glowColor="blue"
            />
            <WorkflowStep 
              step="02"
              icon="fa-brain"
              title="Análise Estratégica"
              desc="Em milissegundos, a EVA processa quem é o melhor funcionário para a tarefa e qual a prioridade real do compromisso."
              glowColor="purple"
            />
            <WorkflowStep 
              step="03"
              icon="fa-bolt-lightning"
              title="Execução Autônoma"
              desc="Tarefas são agendadas, colaboradores são notificados e sua agenda é blindada. Tudo sincronizado sem você tocar no mouse."
              glowColor="emerald"
            />
            <div className="hidden lg:block absolute top-1/2 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent -z-10"></div>
          </div>

          <div className="mt-20 text-center">
            <Link to="/como-funciona" className="text-blue-400 font-black uppercase tracking-widest text-xs hover:text-blue-300 transition-colors flex items-center justify-center gap-3">
              Ver detalhes da nossa tecnologia <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-20 border-t border-white/5 text-center">
        <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.5em]">EVA • Secretária Virtual Inteligente</p>
      </footer>
    </div>
  );
};

const WorkflowStep = ({ step, icon, title, desc, glowColor }: { step: string, icon: string, title: string, desc: string, glowColor: string }) => {
  const glows: any = {
    blue: 'bg-blue-500/20 shadow-blue-500/20',
    purple: 'bg-purple-500/20 shadow-purple-500/20',
    emerald: 'bg-emerald-500/20 shadow-emerald-500/20'
  };

  return (
    <div className="relative group">
      <div className="p-12 rounded-[3rem] bg-[#111827]/40 border border-white/5 hover:border-blue-500/30 transition-all h-full flex flex-col items-center text-center">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-2xl eva-gradient flex items-center justify-center text-xs font-black text-white shadow-xl">
          {step}
        </div>
        
        <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-10 transition-transform group-hover:scale-110 ${glows[glowColor]} border border-white/5`}>
          <i className={`fas ${icon} text-3xl text-white`}></i>
        </div>

        <h3 className="text-2xl font-black mb-6 tracking-tight">{title}</h3>
        <p className="text-slate-400 font-medium leading-relaxed text-sm">{desc}</p>
      </div>
    </div>
  );
};

export default LandingPage;
