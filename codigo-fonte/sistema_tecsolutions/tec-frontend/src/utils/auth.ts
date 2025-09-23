import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import { User, LoginCredentials } from '../types/auth';

const AUTH_STORAGE_KEY = 'tecsolutions_auth';
const USERS_STORAGE_KEY = 'tecsolutions_users';

// Default admin user template
const defaultAdminTemplate = {
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
  
  // Check if admin user exists and has valid UUID
  const adminUser = users.find(u => u.email === 'admin@tecsolutions.com.br');
  
  if (!adminUser) {
    // Create new admin user with valid UUID
    const newAdmin: User = {
      ...defaultAdminTemplate,
      id: uuidv4()
    };
    const updatedUsers = [...users, newAdmin];
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    localStorage.setItem('tecsolutions_passwords', JSON.stringify(defaultPasswords));
  } else if (!uuidValidate(adminUser.id)) {
    // Fix existing admin user with invalid UUID
    const updatedUsers = users.map(user => 
      user.email === 'admin@tecsolutions.com.br' 
        ? { ...user, id: uuidv4() }
        : user
    );
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    
    // Update current session if logged in as admin
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.email === 'admin@tecsolutions.com.br') {
      const updatedAdmin = updatedUsers.find(u => u.email === 'admin@tecsolutions.com.br');
      if (updatedAdmin) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedAdmin));
      }
    }
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
  
  console.log('Usuário salvo:', user);
  console.log('Total de usuários após salvar:', users.length);
  console.log('Dados salvos no localStorage:', localStorage.getItem(USERS_STORAGE_KEY));
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