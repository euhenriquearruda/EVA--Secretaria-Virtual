
import { User } from '../types';

// CHAVES FIXAS - NÃO ALTERAR PARA MANTER SESSÃO DO USUÁRIO
const USERS_DB_KEY = 'eva_users_db_v2';
const CURRENT_USER_KEY = 'eva_current_user_v2';

const capitalize = (str: string) => {
  if (!str) return '';
  return str.toLowerCase().replace(/(?:^|\s)\S/g, a => a.toUpperCase());
};

const getUsers = (): User[] => {
  const data = localStorage.getItem(USERS_DB_KEY);
  return data ? JSON.parse(data) : [];
};

const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
};

export const mockAuthService = {
  login: (email: string, password: string): User | null => {
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
      return userWithoutPassword as User;
    }
    return null;
  },
  
  register: (name: string, email: string, password: string): User => {
    const users = getUsers();
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (existing) {
      throw new Error("E-mail já cadastrado no sistema.");
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: email.toLowerCase(),
      password,
      name: capitalize(name),
      isPaid: true
    };

    users.push(newUser);
    saveUsers(users);
    
    const { password: _, ...userWithoutPassword } = newUser;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
    return userWithoutPassword as User;
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};
