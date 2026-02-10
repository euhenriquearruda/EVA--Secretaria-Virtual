
import React from 'react';
import { User } from '../types';

interface SidebarProps {
  user: User;
  onLogout: () => void;
  activeTab: 'chat' | 'tasks' | 'team' | 'goals' | 'plans' | 'settings';
  onTabChange: (tab: 'chat' | 'tasks' | 'team' | 'goals' | 'plans' | 'settings') => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ user, onLogout, activeTab, onTabChange, isOpen, onClose }: SidebarProps) => {
  return (
    <aside className={`fixed lg:static inset-y-0 left-0 w-72 bg-[#0d1321] h-full flex flex-col shrink-0 text-white transition-all duration-500 border-r border-white/5 shadow-2xl z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      <div className="p-8 flex-1 flex flex-col">
        {/* EVA LOGO */}
        <div className="flex flex-col mb-10 group cursor-pointer" onClick={() => onTabChange('chat')}>
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
            <span className="text-3xl font-black tracking-tighter leading-none text-white">EVA</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-3 ml-1 block">
            INTELIGÊNCIA ALFA
          </span>
        </div>
        
        <nav className="space-y-2">
          <SidebarItem 
            icon="fa-brain" 
            label="Comando" 
            active={activeTab === 'chat'} 
            onClick={() => onTabChange('chat')} 
          />
          <SidebarItem 
            icon="fa-calendar-days" 
            label="Agenda" 
            active={activeTab === 'tasks'} 
            onClick={() => onTabChange('tasks')} 
          />
          <SidebarItem 
            icon="fa-trophy" 
            label="Metas" 
            active={activeTab === 'goals'} 
            onClick={() => onTabChange('goals')} 
          />
          <SidebarItem 
            icon="fa-map-location-dot" 
            label="Planos" 
            active={activeTab === 'plans'} 
            onClick={() => onTabChange('plans')} 
          />
          <SidebarItem 
            icon="fa-users" 
            label="Equipe" 
            active={activeTab === 'team'} 
            onClick={() => onTabChange('team')} 
          />
          <SidebarItem 
            icon="fa-sliders-h" 
            label="Sistema" 
            active={activeTab === 'settings'} 
            onClick={() => onTabChange('settings')} 
          />
        </nav>
      </div>

      <div className="p-8 border-t border-white/5 bg-black/10">
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 text-slate-400 hover:text-rose-400 transition-all text-[11px] font-black uppercase tracking-[0.2em] py-4 bg-white/5 hover:bg-rose-500/10 rounded-xl border border-white/5 group"
        >
          <i className="fas fa-power-off text-[10px] group-hover:scale-110 transition-transform"></i> Sair
        </button>
      </div>

      {/* Botão para fechar no mobile dentro da sidebar */}
      <button 
        onClick={onClose}
        className="lg:hidden absolute top-8 right-6 w-10 h-10 flex items-center justify-center text-slate-500"
      >
        <i className="fas fa-times"></i>
      </button>
    </aside>
  );
};

const SidebarItem = ({ icon, label, active, onClick }: { icon: string, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm ${active ? 'eva-gradient text-white shadow-xl shadow-blue-600/20 scale-[1.02]' : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'}`}
  >
    <i className={`fas ${icon} text-base ${active ? 'text-white' : 'text-slate-700'}`}></i>
    <span className="truncate tracking-tight">{label}</span>
  </button>
);

export default Sidebar;
