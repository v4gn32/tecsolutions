import { User, LoginCredentials } from '../types/auth';

const AUTH_STORAGE_KEY = 'tecsolutions_auth';
const USERS_STORAGE_KEY = 'tecsolutions_users';

// Default admin user
const defaultAdmin: User = {
  id: 'admin-1',
  name: 'Administrador',
  email: 'admin@tecsolutions.com.br',
  role: 'admin',
  createdAt: new Date('2024-01-01')
};

// Default password for demo (in production, use proper hashing)
const defaultPasswords: Record<string, string> = {
  'admin@tecsolutions.com.br': 'admin123'
};

export const initializeAuth = (): void => {
  const users = getUsers();
  if (users.length === 0) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([defaultAdmin]));
    localStorage.setItem('tecsolutions_passwords', JSON.stringify(defaultPasswords));
  }
};

export const getUsers = (): User[] => {
  const data = localStorage.getItem(USERS_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveUser = (user: User, password: string): void => {
  const users = getUsers();
  const existingIndex = users.findIndex(u => u.id === user.id);
  
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  
  // Save password (in production, hash this!)
  const passwords = getPasswords();
  passwords[user.email] = password;
  localStorage.setItem('tecsolutions_passwords', JSON.stringify(passwords));
};

export const deleteUser = (id: string): void => {
  const users = getUsers().filter(u => u.id !== id);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

export const login = (credentials: LoginCredentials): User | null => {
  const users = getUsers();
  const passwords = getPasswords();
  
  const user = users.find(u => u.email === credentials.email);
  if (user && passwords[credentials.email] === credentials.password) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    return user;
  }
  
  return null;
};

export const logout = (): void => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(AUTH_STORAGE_KEY);
  return data ? JSON.parse(data) : null;
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === 'admin';
};

const getPasswords = (): Record<string, string> => {
  const data = localStorage.getItem('tecsolutions_passwords');
  return data ? JSON.parse(data) : {};
};