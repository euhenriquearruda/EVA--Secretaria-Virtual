
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User, Task, Employee, Goal, Plan } from '../types';
import EvaChat from '../components/EvaChat';
import Sidebar from '../components/Sidebar';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'tasks' | 'team' | 'goals' | 'plans' | 'settings'>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Modals visibility
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [viewingEmployeeTasks, setViewingEmployeeTasks] = useState<Employee | null>(null);
  
  // Task Tab Filters
  const [taskStatusFilter, setTaskStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [taskSortOrder, setTaskSortOrder] = useState<'near' | 'far'>('near');

  // Custom dropdown for assignee search
  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
  const assigneeDropdownRef = useRef<HTMLDivElement>(null);

  // Helper for capitalization - garante primeira letra de cada palavra em maiúsculo
  const capitalize = (str: string) => {
    if (!str) return '';
    return str.toLowerCase().replace(/(?:^|\s)\S/g, a => a.toUpperCase());
  };

  // State for items being edited
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);

  // Search
  const [taskSearch, setTaskSearch] = useState('');
  const [teamSearch, setTeamSearch] = useState('');

  // Data states
  const STORAGE_KEYS = useMemo(() => ({
    tasks: `eva_tasks_fixed_${user.id}`,
    team: `eva_team_fixed_${user.id}`,
    goals: `eva_goals_fixed_${user.id}`,
    plans: `eva_plans_fixed_${user.id}`
  }), [user.id]);

  const [tasks, setTasks] = useState<Task[]>(() => JSON.parse(localStorage.getItem(STORAGE_KEYS.tasks) || '[]'));
  const [employees, setEmployees] = useState<Employee[]>(() => JSON.parse(localStorage.getItem(STORAGE_KEYS.team) || '[]'));
  const [goals, setGoals] = useState<Goal[]>(() => JSON.parse(localStorage.getItem(STORAGE_KEYS.goals) || '[]'));
  const [plans, setPlans] = useState<Plan[]>(() => JSON.parse(localStorage.getItem(STORAGE_KEYS.plans) || '[]'));

  // Sync with LocalStorage
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks)); }, [tasks, STORAGE_KEYS.tasks]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.team, JSON.stringify(employees)); }, [employees, STORAGE_KEYS.team]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(goals)); }, [goals, STORAGE_KEYS.goals]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.plans, JSON.stringify(plans)); }, [plans, STORAGE_KEYS.plans]);

  // Click outside to close assignee dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (assigneeDropdownRef.current && !assigneeDropdownRef.current.contains(event.target as Node)) {
        setIsAssigneeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Form states initialization
  const [newTaskData, setNewTaskData] = useState<Partial<Task>>({ title: '', assignee: 'me', priority: 'medium', deadline: '', time: '', location: '' });
  const [newEmp, setNewEmp] = useState({ name: '', role: '' });
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({ title: '', category: 'Executivo', impact: 'medium', description: '', targetDate: '' });
  const [newPlan, setNewPlan] = useState<Partial<Plan>>({ title: '', objective: '', steps: [], status: 'active' });
  const [stepInput, setStepInput] = useState('');

  // Auxiliares
  const getEmployeeTasks = (name: string) => tasks.filter(t => t.assignee === name);

  // Date Parsing for sorting
  // FIX: Ensure parseDate always returns a number for safe arithmetic operations
  const parseDate = (dateStr: string): number => {
    if (!dateStr) return 8640000000000000; // Far future timestamp
    const [day, month, year] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    const time = date.getTime();
    return isNaN(time) ? 8640000000000000 : time;
  };

  // Funções de Máscara
  const maskDate = (valor: string) => {
    let v = valor.replace(/\D/g, "");
    if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
    if (v.length > 5) v = v.slice(0, 5) + "/" + v.slice(5, 9);
    return v.slice(0, 10);
  };

  const maskTime = (valor: string) => {
    let v = valor.replace(/\D/g, "");
    if (v.length > 2) v = v.slice(0, 2) + ":" + v.slice(2);
    return v.slice(0, 5);
  };

  // Open Edit Modals
  const openEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setNewTaskData({
      title: task.title,
      assignee: task.assignee,
      priority: task.priority,
      deadline: task.deadline,
      time: task.time,
      location: task.location
    });
    setIsTaskModalOpen(true);
  };

  const openEditGoal = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setNewGoal({
      title: goal.title,
      description: goal.description,
      targetDate: goal.targetDate,
      category: goal.category,
      impact: goal.impact
    });
    setIsGoalModalOpen(true);
  };

  const openEditPlan = (plan: Plan) => {
    setEditingPlanId(plan.id);
    setNewPlan({
      title: plan.title,
      objective: plan.objective,
      steps: plan.steps,
      status: plan.status
    });
    setIsPlanModalOpen(true);
  };

  const openEditEmployee = (emp: Employee) => {
    setEditingEmployeeId(emp.id);
    setNewEmp({
      name: emp.name,
      role: emp.role
    });
    setIsAddModalOpen(true);
  };

  // Handlers
  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskData.title) return;

    // Aplica Capitalize no responsável se não for "me"
    const formattedAssignee = newTaskData.assignee === 'me' ? 'me' : capitalize(newTaskData.assignee || '');

    if (editingTaskId) {
      setTasks(tasks.map(t => t.id === editingTaskId ? { ...t, ...newTaskData, assignee: formattedAssignee } as Task : t));
    } else {
      const task: Task = {
        id: Math.random().toString(36).substr(2, 9),
        title: newTaskData.title!,
        assignee: formattedAssignee,
        priority: (newTaskData.priority as any) || 'medium',
        category: 'work',
        status: 'pending',
        deadline: newTaskData.deadline,
        time: newTaskData.time,
        location: newTaskData.location
      };
      setTasks([task, ...tasks]);
    }

    setIsTaskModalOpen(false);
    setEditingTaskId(null);
    setNewTaskData({ title: '', assignee: 'me', priority: 'medium', deadline: '', time: '', location: '' });
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.name) return;

    // Aplica Capitalize no nome do funcionário
    const formattedName = capitalize(newEmp.name);

    if (editingEmployeeId) {
      setEmployees(employees.map(emp => emp.id === editingEmployeeId ? { ...emp, name: formattedName, role: newEmp.role } : emp));
    } else {
      const colors = ['bg-blue-600', 'bg-indigo-600', 'bg-purple-600', 'bg-emerald-600', 'bg-rose-600'];
      const emp: Employee = {
        id: Math.random().toString(36).substr(2, 9),
        name: formattedName,
        role: newEmp.role || 'Estrategista',
        avatarColor: colors[Math.floor(Math.random() * colors.length)]
      };
      setEmployees([...employees, emp]);
    }

    setIsAddModalOpen(false);
    setEditingEmployeeId(null);
    setNewEmp({ name: '', role: '' });
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title) return;

    if (editingGoalId) {
      setGoals(goals.map(g => g.id === editingGoalId ? { ...g, ...newGoal } as Goal : g));
    } else {
      const goal: Goal = {
        id: Math.random().toString(36).substr(2, 9),
        title: newGoal.title!,
        description: newGoal.description || '',
        targetDate: newGoal.targetDate || '',
        category: newGoal.category || 'Executivo',
        isAchieved: false,
        impact: (newGoal.impact as any) || 'medium'
      };
      setGoals(prev => [goal, ...prev]);
    }

    setIsGoalModalOpen(false);
    setEditingGoalId(null);
    setNewGoal({ title: '', category: 'Executivo', impact: 'medium', description: '', targetDate: '' });
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.title) return;

    if (editingPlanId) {
      setPlans(plans.map(p => p.id === editingPlanId ? { ...p, ...newPlan } as Plan : p));
    } else {
      const plan: Plan = {
        id: Math.random().toString(36).substr(2, 9),
        title: newPlan.title!,
        objective: newPlan.objective || '',
        steps: newPlan.steps || [],
        status: 'active'
      };
      setPlans(prev => [plan, ...prev]);
    }

    setIsPlanModalOpen(false);
    setEditingPlanId(null);
    setNewPlan({ title: '', objective: '', steps: [], status: 'active' });
    setStepInput('');
  };

  const addStepToNewPlan = () => {
    if (!stepInput.trim()) return;
    setNewPlan(prev => ({
      ...prev,
      steps: [...(prev.steps || []), { id: Math.random().toString(36).substr(2, 5), text: stepInput, completed: false }]
    }));
    setStepInput('');
  };

  const togglePlanStep = (planId: string, stepId: string) => {
    setPlans(plans.map(p => {
      if (p.id === planId) {
        return {
          ...p,
          steps: p.steps.map(s => s.id === stepId ? { ...s, completed: !s.completed } : s)
        };
      }
      return p;
    }));
  };

  const togglePlanStatus = (planId: string) => {
    setPlans(plans.map(p => {
      if (p.id === planId) {
        return { ...p, status: p.status === 'archived' ? 'active' : 'archived' };
      }
      return p;
    }));
  };

  const filteredAssignees = useMemo(() => {
    const search = (newTaskData.assignee === 'me' ? 'Você' : newTaskData.assignee || '').toLowerCase();
    const list = [{ id: 'me', name: 'Você' }, ...employees];
    if (!search || !isAssigneeDropdownOpen) return list;
    return list.filter(item => item.name.toLowerCase().includes(search));
  }, [employees, newTaskData.assignee, isAssigneeDropdownOpen]);

  // FINAL FILTERED AND SORTED TASKS
  const processedTasks = useMemo(() => {
    let result = tasks.filter(t => 
      t.title.toLowerCase().includes(taskSearch.toLowerCase()) || 
      (t.assignee === 'me' ? 'você' : t.assignee).toLowerCase().includes(taskSearch.toLowerCase())
    );

    if (taskStatusFilter === 'pending') {
      result = result.filter(t => t.status !== 'completed');
    } else if (taskStatusFilter === 'completed') {
      result = result.filter(t => t.status === 'completed');
    }

    result.sort((a, b) => {
      const dateA = parseDate(a.deadline || '');
      const dateB = parseDate(b.deadline || '');
      return taskSortOrder === 'near' ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [tasks, taskSearch, taskStatusFilter, taskSortOrder]);

  return (
    <div className="flex h-screen bg-[#0a0f1a] overflow-hidden text-slate-100 font-sans relative">
      <Sidebar 
        user={user} 
        onLogout={onLogout} 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          setActiveTab(tab);
          setIsSidebarOpen(false);
        }} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 md:h-20 border-b border-white/5 bg-[#0a0f1a]/40 backdrop-blur-xl flex items-center justify-between px-4 md:px-10 shrink-0 z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-blue-400"
            >
              <i className="fas fa-bars"></i>
            </button>
            <div className="hidden sm:flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"></div>
              <h2 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">SISTEMA • {activeTab === 'tasks' ? 'AGENDA' : activeTab.toUpperCase()}</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-white">{user.name}</p>
                <p className="text-[8px] text-slate-500 uppercase tracking-widest font-black">ALPHA ATIVA</p>
             </div>
             <div className="w-10 h-10 rounded-xl eva-gradient flex items-center justify-center font-black text-white text-xs">{(user.name?.[0] || 'U').toUpperCase()}</div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative z-10">
          {activeTab === 'chat' && <EvaChat user={user} tasks={tasks} employees={employees} onTaskCreated={(t) => setTasks(prev => [t, ...prev])} />}
          
          {activeTab === 'tasks' && (
            <div className="p-4 md:p-10 h-full overflow-y-auto custom-scrollbar">
               <div className="max-w-6xl mx-auto space-y-8">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="w-full">
                      <h1 className="text-3xl md:text-4xl font-black tracking-tighter mb-4">Agenda Operacional</h1>
                      <div className="relative group">
                        <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-blue-500 transition-colors"></i>
                        <input 
                          type="text" 
                          value={taskSearch}
                          onChange={(e) => setTaskSearch(e.target.value)}
                          placeholder="Buscar por título ou nome do responsável..." 
                          className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 w-full md:w-[400px] outline-none focus:border-blue-500/30 font-bold text-white transition-all shadow-inner text-sm" 
                        />
                      </div>
                    </div>
                    <button onClick={() => { setEditingTaskId(null); setNewTaskData({ title: '', assignee: 'me', priority: 'medium', deadline: '', time: '', location: '' }); setIsTaskModalOpen(true); }} className="eva-gradient text-white px-8 py-4 rounded-2xl font-black text-xs shadow-xl active:scale-95 transition-all w-full md:w-auto uppercase tracking-widest">Novo Compromisso</button>
                  </div>

                  {/* CRONOLOGIA E STATUS FILTERS */}
                  <div className="flex flex-wrap gap-4 items-center bg-[#111827]/40 p-4 rounded-3xl border border-white/5 backdrop-blur-md">
                     <div className="flex gap-1.5 p-1.5 bg-black/20 rounded-2xl border border-white/5">
                        <button 
                          onClick={() => setTaskStatusFilter('all')}
                          className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${taskStatusFilter === 'all' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >Todas</button>
                        <button 
                          onClick={() => setTaskStatusFilter('pending')}
                          className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${taskStatusFilter === 'pending' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >Pendentes</button>
                        <button 
                          onClick={() => setTaskStatusFilter('completed')}
                          className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${taskStatusFilter === 'completed' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >Concluídas</button>
                     </div>

                     <div className="h-8 w-[1px] bg-white/5 hidden md:block"></div>

                     <div className="flex gap-1.5 p-1.5 bg-black/20 rounded-2xl border border-white/5">
                        <button 
                          onClick={() => setTaskSortOrder('near')}
                          className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${taskSortOrder === 'near' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                          <i className="fas fa-arrow-down-short-wide mr-2"></i> Próximas
                        </button>
                        <button 
                          onClick={() => setTaskSortOrder('far')}
                          className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${taskSortOrder === 'far' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                          <i className="fas fa-arrow-up-wide-short mr-2"></i> Distantes
                        </button>
                     </div>

                     <div className="ml-auto px-4 text-[9px] font-black text-slate-700 uppercase tracking-widest italic">
                        {processedTasks.length} {processedTasks.length === 1 ? 'item' : 'itens'} filtrados
                     </div>
                  </div>

                  <div className="grid gap-4">
                    {processedTasks.length === 0 ? (
                      <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
                         <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-slate-800 text-2xl">
                           <i className="fas fa-calendar-xmark"></i>
                         </div>
                         <p className="text-slate-600 font-black uppercase tracking-[0.3em] text-[10px]">Nenhum compromisso encontrado para este filtro.</p>
                      </div>
                    ) : (
                      processedTasks.map(t => (
                        <div key={t.id} className={`bg-[#111827]/40 p-5 md:p-6 rounded-[2rem] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:border-blue-500/20 group ${t.status === 'completed' ? 'opacity-40 grayscale' : 'shadow-2xl'}`}>
                          <div className="flex items-center gap-4">
                            <button onClick={() => setTasks(tasks.map(x => x.id === t.id ? {...x, status: x.status === 'completed' ? 'pending' : 'completed'} : x))} className={`shrink-0 w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${t.status === 'completed' ? 'bg-blue-600 border-blue-600 shadow-[0_0_15px_#3b82f644]' : 'border-white/10 hover:border-blue-500'}`}>
                              {t.status === 'completed' && <i className="fas fa-check text-[10px] text-white"></i>}
                            </button>
                            <div className="space-y-1">
                              <h4 className={`text-base md:text-lg font-bold leading-tight ${t.status === 'completed' ? 'line-through text-slate-500' : 'text-white'}`}>{t.title}</h4>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[9px] font-black uppercase tracking-widest text-slate-500">
                                <span className={t.assignee === 'me' ? 'text-blue-500' : 'text-amber-500'}>{t.assignee === 'me' ? 'VOCÊ' : t.assignee}</span>
                                {t.deadline && <span className={parseDate(t.deadline) < Date.now() && t.status !== 'completed' ? 'text-rose-500' : ''}><i className="far fa-calendar mr-1"></i> {t.deadline}</span>}
                                {t.time && <span><i className="far fa-clock mr-1"></i> {t.time}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 self-end md:self-auto">
                            <button onClick={() => openEditTask(t)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-600 hover:text-blue-400 transition-all">
                               <i className="fas fa-edit"></i>
                            </button>
                            <button onClick={() => setTasks(tasks.filter(x => x.id !== t.id))} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-600 hover:text-rose-500 transition-all">
                               <i className="fas fa-trash-alt"></i>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="p-4 md:p-10 h-full overflow-y-auto custom-scrollbar">
              <div className="max-w-6xl mx-auto space-y-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                  <h1 className="text-3xl md:text-4xl font-black tracking-tighter">Metas Alpha</h1>
                  <button onClick={() => { setEditingGoalId(null); setNewGoal({ title: '', category: 'Executivo', impact: 'medium', description: '', targetDate: '' }); setIsGoalModalOpen(true); }} className="eva-gradient text-white px-8 py-4 rounded-2xl font-black text-xs shadow-xl active:scale-95 transition-all w-full md:w-auto">NOVA META</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {goals.map(goal => (
                     <div key={goal.id} className={`p-8 rounded-[3rem] border transition-all relative overflow-hidden group ${goal.isAchieved ? 'bg-emerald-500/5 border-emerald-500/20 shadow-none' : 'bg-[#111827]/40 border-white/5 shadow-2xl'}`}>
                        <div className="flex justify-between items-start mb-6">
                           <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${goal.impact === 'high' ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-400'}`}>{goal.category}</span>
                           <div className="flex gap-2">
                            <button onClick={() => openEditGoal(goal)} className="text-slate-700 hover:text-blue-400 transition-colors"><i className="fas fa-edit text-sm"></i></button>
                            <button onClick={() => setGoals(goals.filter(g => g.id !== goal.id))} className="text-slate-700 hover:text-rose-500 transition-colors"><i className="fas fa-trash-alt text-sm"></i></button>
                           </div>
                        </div>
                        <h3 className={`text-xl font-black mb-4 leading-tight ${goal.isAchieved ? 'text-emerald-500/60 line-through' : 'text-white'}`}>{goal.title}</h3>
                        <p className="text-slate-500 text-xs font-medium leading-relaxed mb-8">{goal.description}</p>
                        <div className="flex items-center justify-between pt-6 border-t border-white/5">
                           <div className="flex flex-col">
                              <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Prazo</span>
                              <span className="text-xs font-black text-slate-300">{goal.targetDate || 'A definir'}</span>
                           </div>
                           <button onClick={() => setGoals(goals.map(g => g.id === goal.id ? {...g, isAchieved: !g.isAchieved} : g))} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${goal.isAchieved ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white/5 border border-white/10 text-slate-500'}`}>
                              <i className={`fas ${goal.isAchieved ? 'fa-trophy' : 'fa-check'}`}></i>
                           </button>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'plans' && (
            <div className="p-4 md:p-10 h-full overflow-y-auto custom-scrollbar">
              <div className="max-w-6xl mx-auto space-y-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <h1 className="text-3xl md:text-4xl font-black tracking-tighter">Planos Estratégicos</h1>
                  <button onClick={() => { setEditingPlanId(null); setNewPlan({ title: '', objective: '', steps: [], status: 'active' }); setIsPlanModalOpen(true); }} className="eva-gradient text-white px-8 py-4 rounded-2xl font-black text-xs shadow-xl w-full md:w-auto">NOVA ESTRATÉGIA</button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   {plans.map(plan => (
                     <div key={plan.id} className={`bg-[#111827]/40 p-8 md:p-12 rounded-[4rem] border border-white/5 relative group ${plan.status === 'archived' ? 'opacity-60' : ''}`}>
                        {plan.status === 'archived' && (
                          <div className="absolute top-10 right-10 bg-emerald-500 text-white px-4 py-2 rounded-full font-black text-[9px] uppercase tracking-widest shadow-lg">
                             <i className="fas fa-check-circle mr-2"></i> Concluído
                          </div>
                        )}
                        <div className="flex justify-between items-start mb-8 pr-20">
                          <h3 className={`text-3xl font-black tracking-tighter text-white leading-tight ${plan.status === 'archived' ? 'line-through' : ''}`}>{plan.title}</h3>
                          <div className="flex gap-3">
                            <button onClick={() => openEditPlan(plan)} className="text-slate-700 hover:text-blue-400 transition-colors"><i className="fas fa-edit"></i></button>
                            <button onClick={() => setPlans(plans.filter(p => p.id !== plan.id))} className="text-slate-700 hover:text-rose-500 transition-colors"><i className="fas fa-trash-alt"></i></button>
                          </div>
                        </div>
                        <p className="text-slate-500 text-sm mb-10 font-medium italic">"{plan.objective}"</p>
                        <div className="space-y-3 mb-10">
                           {plan.steps.map(step => (
                             <div 
                                key={step.id} 
                                onClick={() => plan.status !== 'archived' && togglePlanStep(plan.id, step.id)}
                                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${step.completed ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/5'}`}
                             >
                                <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${step.completed ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-700'}`}>
                                   <i className={`fas ${step.completed ? 'fa-check' : 'fa-circle'} text-[10px]`}></i>
                                </div>
                                <span className={`text-[13px] font-bold ${step.completed ? 'text-emerald-500 line-through' : 'text-slate-200'}`}>{step.text}</span>
                             </div>
                           ))}
                        </div>
                        <button 
                          onClick={() => togglePlanStatus(plan.id)}
                          className={`w-full py-5 rounded-[2rem] font-black text-[9px] uppercase tracking-[0.3em] transition-all ${plan.status === 'archived' ? 'bg-white/5 text-slate-400' : 'eva-gradient text-white shadow-xl'}`}
                        >
                          {plan.status === 'archived' ? 'Reativar' : 'Concluir Plano'}
                        </button>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="p-4 md:p-10 h-full overflow-y-auto custom-scrollbar">
              <div className="max-w-6xl mx-auto space-y-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div className="w-full">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter mb-4">Equipe Alpha</h1>
                    <div className="relative group">
                      <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-blue-500 transition-colors"></i>
                      <input 
                        type="text" 
                        value={teamSearch}
                        onChange={(e) => setTeamSearch(e.target.value)}
                        placeholder="Pesquisar integrante..." 
                        className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 w-full md:w-[400px] outline-none focus:border-blue-500/30 font-bold text-white transition-all shadow-inner text-sm" 
                      />
                    </div>
                  </div>
                  <button onClick={() => { setEditingEmployeeId(null); setNewEmp({ name: '', role: '' }); setIsAddModalOpen(true); }} className="eva-gradient text-white px-8 py-4 rounded-2xl font-black text-xs shadow-xl w-full md:w-auto uppercase tracking-widest active:scale-95 transition-all">Novo Integrante</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {employees.filter(e => e.name.toLowerCase().includes(teamSearch.toLowerCase())).map(emp => (
                     <div key={emp.id} className="bg-[#111827]/40 p-8 rounded-[3.5rem] border border-white/5 flex flex-col items-center text-center gap-6 shadow-2xl relative transition-all hover:border-blue-500/20 group">
                        <div className="absolute top-6 right-8">
                           <button onClick={() => openEditEmployee(emp)} className="text-slate-800 hover:text-blue-400 transition-colors"><i className="fas fa-edit"></i></button>
                        </div>
                        <div className={`w-24 h-24 ${emp.avatarColor} rounded-[2rem] flex items-center justify-center font-black text-white text-4xl shadow-2xl transition-transform group-hover:scale-105`}>{emp.name[0].toUpperCase()}</div>
                        <div>
                          <p className="text-2xl font-black text-white tracking-tighter">{emp.name}</p>
                          <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.3em] mt-1">{emp.role}</p>
                        </div>
                        <div className="flex flex-col w-full gap-2 mt-4">
                          <button onClick={() => setViewingEmployeeTasks(emp)} className="w-full bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 font-black py-4 rounded-2xl text-[9px] uppercase tracking-widest transition-all">Ver Trabalhos</button>
                          <button onClick={() => setEmployees(employees.filter(e => e.id !== emp.id))} className="w-full bg-white/5 hover:bg-rose-500/10 text-slate-600 hover:text-rose-500 font-black py-4 rounded-2xl text-[9px] uppercase tracking-widest transition-all">Desvincular</button>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
             <div className="p-12 h-full flex flex-col items-center justify-center text-center space-y-8">
                <div className="w-24 h-24 rounded-full eva-gradient flex items-center justify-center text-4xl text-white animate-pulse">
                   <i className="fas fa-microchip"></i>
                </div>
                <div>
                   <h2 className="text-3xl font-black tracking-tighter">EVA OS Alpha v2.5</h2>
                   <p className="text-slate-600 font-black uppercase tracking-[0.4em] text-[10px] mt-2">Segurança Ativa</p>
                </div>
                <button onClick={onLogout} className="bg-rose-500/10 text-rose-500 font-black py-6 px-16 rounded-[2rem] border border-rose-500/20 text-xs tracking-[0.3em] active:scale-95 transition-all uppercase hover:bg-rose-500 hover:text-white">Encerrar Sessão</button>
             </div>
          )}
        </div>
      </main>

      {/* MODAL AGENDA (CREATE & EDIT) */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="bg-[#111827] border border-white/10 w-full max-w-lg rounded-[3.5rem] p-12 shadow-2xl overflow-y-auto max-h-[95vh]">
            <h2 className="text-3xl font-black text-white mb-10 tracking-tighter">
              {editingTaskId ? 'Editar Compromisso' : 'Agendar Compromisso'}
            </h2>
            <form onSubmit={handleSaveTask} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-2">Título</label>
                <input required className="w-full bg-[#1e293b] border border-white/10 rounded-2xl px-6 py-5 outline-none text-white font-bold focus:border-blue-500/30" placeholder="Título" value={newTaskData.title} onChange={e => setNewTaskData({...newTaskData, title: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2" ref={assigneeDropdownRef}>
                   <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-2">Responsável</label>
                   <div className="relative group">
                     <input 
                      required 
                      className="w-full bg-[#1e293b] border border-white/10 rounded-2xl px-6 py-5 pr-14 outline-none text-white font-bold focus:border-blue-500/30" 
                      placeholder="Pesquisar responsável..." 
                      value={newTaskData.assignee === 'me' ? 'Você' : newTaskData.assignee} 
                      onFocus={() => setIsAssigneeDropdownOpen(true)}
                      onChange={e => {
                        const val = e.target.value;
                        setNewTaskData({...newTaskData, assignee: val === 'Você' ? 'me' : val});
                        setIsAssigneeDropdownOpen(true);
                      }} 
                     />
                     <button 
                       type="button" 
                       onClick={() => setIsAssigneeDropdownOpen(!isAssigneeDropdownOpen)}
                       className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-400 transition-colors"
                     >
                       <i className={`fas ${isAssigneeDropdownOpen ? 'fa-chevron-up' : 'fa-search'} text-xs`}></i>
                     </button>

                     {isAssigneeDropdownOpen && (
                       <div className="absolute top-full left-0 w-full mt-2 bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
                         {filteredAssignees.length === 0 ? (
                           <div className="p-4 text-[10px] text-slate-500 uppercase font-black text-center italic">Nenhum integrante encontrado</div>
                         ) : (
                           filteredAssignees.map(item => (
                             <button
                               key={item.id}
                               type="button"
                               onClick={() => {
                                 setNewTaskData({...newTaskData, assignee: item.id === 'me' ? 'me' : item.name});
                                 setIsAssigneeDropdownOpen(false);
                               }}
                               className="w-full px-6 py-4 text-left hover:bg-white/5 flex items-center justify-between group"
                             >
                               <span className="text-sm font-bold text-slate-300 group-hover:text-blue-400 transition-colors">{item.name}</span>
                               {item.name === (newTaskData.assignee === 'me' ? 'Você' : newTaskData.assignee) && (
                                 <i className="fas fa-check text-blue-500 text-[10px]"></i>
                               )}
                             </button>
                           ))
                         )}
                       </div>
                     )}
                   </div>
                 </div>
                 <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-2">Prioridade</label>
                   <select className="w-full bg-[#1e293b] border border-white/10 rounded-2xl px-6 py-5 outline-none text-white font-bold" value={newTaskData.priority} onChange={e => setNewTaskData({...newTaskData, priority: e.target.value as any})}>
                     <option value="low">Baixa</option>
                     <option value="medium">Média</option>
                     <option value="high">Alta</option>
                   </select>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-2">Data</label>
                   <input 
                    required 
                    className="w-full bg-[#1e293b] border border-white/10 rounded-2xl px-6 py-5 outline-none text-white font-bold focus:border-blue-500/30" 
                    placeholder="DD/MM/AAAA" 
                    value={newTaskData.deadline} 
                    onChange={e => setNewTaskData({...newTaskData, deadline: maskDate(e.target.value)})} 
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-2">Hora</label>
                   <input 
                    className="w-full bg-[#1e293b] border border-white/10 rounded-2xl px-6 py-5 outline-none text-white font-bold focus:border-blue-500/30" 
                    placeholder="HH:MM" 
                    value={newTaskData.time} 
                    onChange={e => setNewTaskData({...newTaskData, time: maskTime(e.target.value)})} 
                   />
                 </div>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => { setIsTaskModalOpen(false); setEditingTaskId(null); }} className="flex-1 font-black text-slate-600 text-[10px] uppercase tracking-widest py-6">Cancelar</button>
                <button type="submit" className="flex-1 eva-gradient py-6 rounded-2xl font-black text-white text-[10px] uppercase tracking-widest shadow-xl">
                  {editingTaskId ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL META (CREATE & EDIT) */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="bg-[#111827] border border-white/10 w-full max-w-lg rounded-[3.5rem] p-12 shadow-2xl overflow-y-auto max-h-[95vh]">
            <h2 className="text-3xl font-black text-white mb-10 tracking-tighter">
              {editingGoalId ? 'Editar Meta' : 'Definir Meta'}
            </h2>
            <form onSubmit={handleSaveGoal} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-2">Título</label>
                <input required className="w-full bg-[#1e293b] border border-white/10 rounded-2xl px-6 py-5 outline-none text-white font-bold focus:border-blue-500/30" placeholder="Ex: Aumentar faturamento" value={newGoal.title} onChange={e => setNewGoal({...newGoal, title: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                   <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-2">Impacto</label>
                   <select className="w-full bg-[#1e293b] border border-white/10 rounded-2xl px-6 py-5 outline-none text-white font-bold" value={newGoal.impact} onChange={e => setNewGoal({...newGoal, impact: e.target.value as any})}>
                     <option value="high">Crítico</option>
                     <option value="medium">Médio</option>
                     <option value="low">Baixo</option>
                   </select>
                </div>
                <div className="space-y-1.5">
                   <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-2">Prazo</label>
                   <input 
                    required 
                    className="w-full bg-[#1e293b] border border-white/10 rounded-2xl px-6 py-5 outline-none text-white font-bold focus:border-blue-500/30" 
                    placeholder="DD/MM/AAAA" 
                    value={newGoal.targetDate} 
                    onChange={e => setNewGoal({...newGoal, targetDate: maskDate(e.target.value)})} 
                   />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-2">Descrição</label>
                <textarea className="w-full bg-[#1e293b] border border-white/10 rounded-2xl px-6 py-5 outline-none text-white font-bold h-24 resize-none" placeholder="Detalhes da meta..." value={newGoal.description} onChange={e => setNewGoal({...newGoal, description: e.target.value})}></textarea>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => { setIsGoalModalOpen(false); setEditingGoalId(null); }} className="flex-1 font-black text-slate-600 text-[10px] uppercase tracking-widest py-6">Cancelar</button>
                <button type="submit" className="flex-1 eva-gradient py-6 rounded-2xl font-black text-white text-[10px] uppercase tracking-widest shadow-xl">
                  {editingGoalId ? 'Atualizar Meta' : 'Salvar Meta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PLANO (CREATE & EDIT) */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="bg-[#111827] border border-white/10 w-full max-w-xl rounded-[4rem] p-12 shadow-2xl overflow-y-auto max-h-[95vh]">
            <h2 className="text-3xl font-black text-white mb-10 tracking-tighter">
              {editingPlanId ? 'Ajustar Estratégia' : 'Nova Estratégia'}
            </h2>
            <form onSubmit={handleSavePlan} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-2">Nome do Plano</label>
                <input required className="w-full bg-[#1e293b] border border-white/10 rounded-2xl px-6 py-5 outline-none text-white font-bold focus:border-blue-500/30" placeholder="Ex: Lançamento de Produto" value={newPlan.title} onChange={e => setNewPlan({...newPlan, title: e.target.value})} />
              </div>
              
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-2">Objetivo Central</label>
                <input required className="w-full bg-[#1e293b] border border-white/10 rounded-2xl px-6 py-5 outline-none text-white font-bold focus:border-blue-500/30" placeholder="Qual o resultado final esperado?" value={newPlan.objective} onChange={e => setNewPlan({...newPlan, objective: e.target.value})} />
              </div>

              {!editingPlanId && (
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-2">Adicionar Etapas</label>
                  <div className="flex gap-3">
                    <input className="flex-1 bg-[#1e293b] border border-white/10 rounded-2xl px-6 py-4 outline-none text-white font-bold text-sm" placeholder="Digite uma etapa e pressione Enter..." value={stepInput} onChange={e => setStepInput(e.target.value)} onKeyDown={e => { if(e.key === 'Enter') { e.preventDefault(); addStepToNewPlan(); } }} />
                    <button type="button" onClick={addStepToNewPlan} className="bg-blue-600 w-12 h-12 rounded-2xl text-white hover:bg-blue-500 transition-colors flex items-center justify-center shadow-lg"><i className="fas fa-plus"></i></button>
                  </div>
                </div>
              )}

              <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                {newPlan.steps?.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 group">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-xs font-bold text-slate-300 flex-1">{step.text}</span>
                    <button type="button" onClick={() => setNewPlan({...newPlan, steps: newPlan.steps?.filter((_, i) => i !== idx)})} className="text-slate-600 hover:text-rose-500"><i className="fas fa-times"></i></button>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => { setIsPlanModalOpen(false); setEditingPlanId(null); }} className="flex-1 font-black text-slate-600 text-[10px] uppercase tracking-widest py-6">Cancelar</button>
                <button type="submit" className="flex-1 eva-gradient py-6 rounded-2xl font-black text-white text-[10px] uppercase tracking-widest shadow-xl">
                  {editingPlanId ? 'Atualizar Plano' : 'Salvar Plano'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EQUIPE (CREATE & EDIT) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="bg-[#111827] border border-white/10 w-full max-w-md rounded-[3.5rem] p-12 shadow-2xl">
            <h2 className="text-3xl font-black text-white mb-10 tracking-tighter">
               {editingEmployeeId ? 'Editar Integrante' : 'Novo Integrante'}
            </h2>
            <form onSubmit={handleSaveEmployee} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-2">Nome</label>
                <input required className="w-full bg-[#1e293b] border border-white/10 rounded-2xl px-6 py-5 outline-none text-white font-bold focus:border-blue-500/30" placeholder="Ex: João Silva" value={newEmp.name} onChange={e => setNewEmp({...newEmp, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-2">Cargo/Função</label>
                <input required className="w-full bg-[#1e293b] border border-white/10 rounded-2xl px-6 py-5 outline-none text-white font-bold focus:border-blue-500/30" placeholder="Ex: Gerente de Vendas" value={newEmp.role} onChange={e => setNewEmp({...newEmp, role: e.target.value})} />
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => { setIsAddModalOpen(false); setEditingEmployeeId(null); }} className="flex-1 font-black text-slate-600 text-[10px] uppercase tracking-widest py-6">Cancelar</button>
                <button type="submit" className="flex-1 eva-gradient py-6 rounded-2xl font-black text-white text-[10px] uppercase tracking-widest shadow-xl">
                  {editingEmployeeId ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TRABALHOS DO FUNCIONÁRIO */}
      {viewingEmployeeTasks && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
          <div className="bg-[#111827] border border-white/10 w-full max-w-2xl rounded-[3.5rem] p-12 shadow-2xl relative flex flex-col max-h-[90vh]">
            <button 
              onClick={() => setViewingEmployeeTasks(null)}
              className="absolute top-8 right-8 text-slate-600 hover:text-white transition-colors"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
            <div className="flex items-center gap-6 mb-10">
              <div className={`shrink-0 w-16 h-16 ${viewingEmployeeTasks.avatarColor} rounded-2xl flex items-center justify-center font-black text-white text-2xl`}>
                {viewingEmployeeTasks.name[0].toUpperCase()}
              </div>
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter">{viewingEmployeeTasks.name}</h2>
                <p className="text-[10px] text-blue-500 font-black uppercase tracking-[0.3em]">{viewingEmployeeTasks.role}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
               {/* TRABALHO PENDENTE */}
               <div className="mb-10">
                  <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] mb-4 border-b border-amber-500/10 pb-2">TRABALHO PENDENTE</h3>
                  <div className="space-y-4">
                    {getEmployeeTasks(viewingEmployeeTasks.name).filter(t => t.status !== 'completed').length === 0 ? (
                      <p className="text-slate-700 italic text-[10px] uppercase tracking-widest py-4">Nenhuma pendência operacional</p>
                    ) : (
                      getEmployeeTasks(viewingEmployeeTasks.name).filter(t => t.status !== 'completed').map(t => (
                        <div key={t.id} className="bg-white/5 border border-white/5 p-6 rounded-3xl flex justify-between items-center group transition-all hover:border-blue-500/20">
                          <div>
                            <p className="text-white font-bold">{t.title}</p>
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">{t.deadline} • {t.time}</p>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => { setViewingEmployeeTasks(null); openEditTask(t); }} className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"><i className="fas fa-edit"></i></button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
               </div>

               {/* TRABALHO FEITO */}
               <div className="mb-6">
                  <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-4 border-b border-emerald-500/10 pb-2">TRABALHO FEITO</h3>
                  <div className="space-y-4">
                    {getEmployeeTasks(viewingEmployeeTasks.name).filter(t => t.status === 'completed').length === 0 ? (
                      <p className="text-slate-700 italic text-[10px] uppercase tracking-widest py-4">Nenhum registro de conclusão</p>
                    ) : (
                      getEmployeeTasks(viewingEmployeeTasks.name).filter(t => t.status === 'completed').map(t => (
                        <div key={t.id} className="bg-white/5 border border-white/5 p-6 rounded-3xl flex justify-between items-center group transition-all opacity-60">
                          <div>
                            <p className="text-slate-400 font-bold line-through">{t.title}</p>
                            <p className="text-[10px] text-emerald-500 uppercase font-black tracking-widest mt-1">Concluído</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
