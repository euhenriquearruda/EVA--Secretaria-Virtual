
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const HowItWorks = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white font-sans selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0f1a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 h-24 flex justify-between items-center">
          <Link to="/" className="flex flex-col hover:opacity-80 transition-opacity">
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
              <span className="text-3xl font-black tracking-tighter text-white leading-none">EVA</span>
            </div>
            <span className="text-[7px] font-medium uppercase tracking-[0.25em] text-slate-500 mt-2 ml-1">
              Secretária Virtual Inteligente
            </span>
          </Link>

          <div className="flex items-center gap-6 md:gap-10">
            <Link to="/auth" className="text-sm font-bold text-slate-400 hover:text-blue-400 transition-colors">Entrar</Link>
            <Link to="/auth" className="hidden md:block eva-gradient text-white px-8 py-3 rounded-2xl text-sm font-black shadow-xl shadow-blue-500/20">
              Ativar Central
            </Link>
            
            <button 
              onClick={() => navigate('/')}
              className="group flex items-center gap-3 px-4 py-2 rounded-full border border-white/5 bg-white/[0.02] hover:bg-white/10 hover:border-white/20 transition-all"
            >
              <span className="text-[9px] font-black text-slate-500 group-hover:text-white uppercase tracking-[0.2em] transition-colors">Sair</span>
              <i className="fas fa-arrow-right-from-bracket text-[9px] text-slate-600 group-hover:text-rose-500 transition-colors"></i>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-48 pb-20 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-none">
            A Ciência da <br />
            <span className="eva-text-gradient">Alta Performance.</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
            Mais que um chatbot. A EVA é um sistema operacional humano que utiliza a Gemini 3 Flash para gerenciar sua vida enquanto você vive.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          
          {/* O QUE FAZ */}
          <div className="mb-40">
            <div className="flex items-center gap-4 mb-12">
               <span className="h-[1px] flex-1 bg-white/10"></span>
               <h2 className="text-xs font-black uppercase tracking-[0.5em] text-blue-500">O que a EVA faz por você</h2>
               <span className="h-[1px] flex-1 bg-white/10"></span>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard 
                icon="fa-comments" 
                title="Conversa em Tempo Real" 
                desc="Interaja via voz com latência zero. A EVA ouve, processa e responde instantaneamente como uma secretária ao seu lado."
              />
              <FeatureCard 
                icon="fa-calendar-check" 
                title="Gestão de Agenda" 
                desc="Extrai compromissos de conversas informais e os organiza por prioridade, data, hora e local automaticamente."
              />
              <FeatureCard 
                icon="fa-users-gear" 
                title="Delegação Inteligente" 
                desc="Conhece sua equipe. Ao receber um comando, ela decide quem é o melhor executor baseado no cargo e carga de trabalho."
              />
              <FeatureCard 
                icon="fa-shield-halved" 
                title="Blindagem Cognitiva" 
                desc="Ela filtra o ruído operacional. Você só se preocupa com o que exige sua visão estratégica, ela cuida do 'como'."
              />
            </div>
          </div>

          {/* PARA QUEM SERVE */}
          <div className="mb-40">
            <h2 className="text-4xl font-black tracking-tighter mb-16 text-center">Desenhada para Protagonistas</h2>
            <div className="grid md:grid-cols-3 gap-10">
              <ProfileCard 
                profile="Empresários & CEOs"
                icon="fa-briefcase"
                points={[
                  "Visão global de todas as tarefas da equipe",
                  "Redução de 70% nas mensagens de alinhamento",
                  "Agenda executiva sempre atualizada via voz"
                ]}
              />
              <ProfileCard 
                profile="Profissionais Autônomos"
                icon="fa-laptop-code"
                points={[
                  "Gestão de múltiplos clientes sem confusão",
                  "Lembretes inteligentes de prazos e entregas",
                  "Organização de rotina de estudos e trabalho"
                ]}
              />
              <ProfileCard 
                profile="Estudantes de Elite"
                icon="fa-graduation-cap"
                points={[
                  "Planejamento de ciclos de estudo automáticos",
                  "Controle de prazos de trabalhos e provas",
                  "Fim da procrastinação operacional"
                ]}
              />
            </div>
          </div>

          {/* BENEFICIOS */}
          <div className="bg-white/[0.02] border border-white/5 rounded-[4rem] p-12 md:p-24 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[120px]"></div>
            <div className="max-w-4xl relative z-10">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-12">Os Benefícios da <br/> Era da Inteligência.</h2>
              <div className="space-y-12">
                <BenefitRow title="Clareza Mental" desc="Pare de tentar lembrar de tudo. Se está na EVA, está sob controle." />
                <BenefitRow title="Velocidade de Execução" desc="Comandos que levariam 10 minutos para digitar agora levam 5 segundos de voz." />
                <BenefitRow title="Escalabilidade Humana" desc="Gerencie um time de 10 pessoas com a mesma facilidade que gerencia 1." />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="py-40 text-center">
        <h2 className="text-4xl font-black mb-10">Pronto para a nova ordem?</h2>
        <Link to="/auth" className="eva-gradient text-white px-16 py-6 rounded-[2rem] text-xl font-black shadow-2xl shadow-blue-600/20 hover:scale-105 transition-all inline-block">
          Ativar Minha Central Agora
        </Link>
      </section>

      <footer className="py-20 border-t border-white/5 text-center text-slate-600 text-[10px] font-black uppercase tracking-[0.5em]">
        EVA OS • PROTOCOLO DE EXCELÊNCIA
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: string, title: string, desc: string }) => (
  <div className="p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/5 hover:border-blue-500/20 transition-all">
    <div className="w-14 h-14 rounded-2xl bg-blue-600/10 flex items-center justify-center mb-8 border border-blue-500/10">
      <i className={`fas ${icon} text-blue-400 text-xl`}></i>
    </div>
    <h3 className="text-xl font-black mb-4 tracking-tight">{title}</h3>
    <p className="text-slate-500 text-sm font-medium leading-relaxed">{desc}</p>
  </div>
);

const ProfileCard = ({ profile, icon, points }: { profile: string, icon: string, points: string[] }) => (
  <div className="bg-[#111827]/40 p-10 rounded-[3rem] border border-white/5">
    <div className="flex items-center gap-4 mb-8">
      <i className={`fas ${icon} text-2xl text-blue-500`}></i>
      <h3 className="text-2xl font-black tracking-tighter">{profile}</h3>
    </div>
    <ul className="space-y-4">
      {points.map((p, i) => (
        <li key={i} className="flex gap-3 text-slate-400 text-sm font-medium">
          <i className="fas fa-check text-blue-500/40 mt-1"></i>
          <span>{p}</span>
        </li>
      ))}
    </ul>
  </div>
);

const BenefitRow = ({ title, desc }: { title: string, desc: string }) => (
  <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-12">
    <h4 className="text-2xl font-black text-white md:w-64 shrink-0 tracking-tight">{title}</h4>
    <p className="text-slate-400 font-medium">{desc}</p>
  </div>
);

export default HowItWorks;
