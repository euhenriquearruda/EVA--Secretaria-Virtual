
export enum UserRole {
  STUDENT = 'STUDENT',
  ENTREPRENEUR = 'ENTREPRENEUR',
  FREELANCER = 'FREELANCER',
  CEO = 'CEO'
}

export interface User {
  id: string;
  email: string;
  password?: string;
  name?: string;
  isPaid: boolean;
  role?: UserRole;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
}

export interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  category: 'work' | 'study' | 'personal';
  assignee: 'me' | string;
  priority: 'low' | 'medium' | 'high';
  deadline?: string;
  time?: string;
  location?: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  isAchieved: boolean;
  category: string;
  impact: 'low' | 'medium' | 'high'; // Novo campo
}

export interface Plan {
  id: string;
  title: string;
  objective: string;
  steps: { id: string; text: string; completed: boolean }[];
  status: 'draft' | 'active' | 'archived';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
