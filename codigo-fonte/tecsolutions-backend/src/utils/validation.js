import { body, param, query } from 'express-validator';

// Validações comuns
const commonValidations = {
  // UUID validation
  uuid: (field = 'id') => param(field).isUUID().withMessage(`${field} deve ser um UUID válido`),
  
  // Email validation
  email: (field = 'email') => body(field).isEmail().withMessage('Email inválido'),
  
  // Phone validation (formato brasileiro)
  phone: (field = 'phone') => body(field)
    .optional()
    .matches(/^(\+55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/)
    .withMessage('Telefone deve estar no formato brasileiro válido'),
  
  // CPF validation
  cpf: (field = 'cpf') => body(field)
    .optional()
    .custom((value) => {
      if (!value) return true;
      
      // Remove caracteres não numéricos
      const cpf = value.replace(/\D/g, '');
      
      // Verifica se tem 11 dígitos
      if (cpf.length !== 11) return false;
      
      // Verifica se todos os dígitos são iguais
      if (/^(\d)\1{10}$/.test(cpf)) return false;
      
      // Validação do algoritmo do CPF
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
      }
      let remainder = (sum * 10) % 11;
      if (remainder === 10 || remainder === 11) remainder = 0;
      if (remainder !== parseInt(cpf.charAt(9))) return false;
      
      sum = 0;
      for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
      }
      remainder = (sum * 10) % 11;
      if (remainder === 10 || remainder === 11) remainder = 0;
      if (remainder !== parseInt(cpf.charAt(10))) return false;
      
      return true;
    })
    .withMessage('CPF inválido'),
  
  // CNPJ validation
  cnpj: (field = 'cnpj') => body(field)
    .optional()
    .custom((value) => {
      if (!value) return true;
      
      // Remove caracteres não numéricos
      const cnpj = value.replace(/\D/g, '');
      
      // Verifica se tem 14 dígitos
      if (cnpj.length !== 14) return false;
      
      // Verifica se todos os dígitos são iguais
      if (/^(\d)\1{13}$/.test(cnpj)) return false;
      
      // Validação do algoritmo do CNPJ
      let length = cnpj.length - 2;
      let numbers = cnpj.substring(0, length);
      let digits = cnpj.substring(length);
      let sum = 0;
      let pos = length - 7;
      
      for (let i = length; i >= 1; i--) {
        sum += numbers.charAt(length - i) * pos--;
        if (pos < 2) pos = 9;
      }
      
      let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
      if (result !== parseInt(digits.charAt(0))) return false;
      
      length = length + 1;
      numbers = cnpj.substring(0, length);
      sum = 0;
      pos = length - 7;
      
      for (let i = length; i >= 1; i--) {
        sum += numbers.charAt(length - i) * pos--;
        if (pos < 2) pos = 9;
      }
      
      result = sum % 11 < 2 ? 0 : 11 - sum % 11;
      if (result !== parseInt(digits.charAt(1))) return false;
      
      return true;
    })
    .withMessage('CNPJ inválido'),
  
  // CEP validation
  cep: (field = 'cep') => body(field)
    .optional()
    .matches(/^\d{5}-?\d{3}$/)
    .withMessage('CEP deve estar no formato 00000-000'),
  
  // Password validation
  password: (field = 'password', minLength = 6) => body(field)
    .isLength({ min: minLength })
    .withMessage(`Senha deve ter pelo menos ${minLength} caracteres`)
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'),
  
  // Date validation
  date: (field) => body(field)
    .optional()
    .isISO8601()
    .withMessage(`${field} deve ser uma data válida no formato ISO 8601`),
  
  // Decimal validation
  decimal: (field, min = 0) => body(field)
    .optional()
    .isDecimal({ decimal_digits: '0,2' })
    .custom((value) => parseFloat(value) >= min)
    .withMessage(`${field} deve ser um número decimal válido maior ou igual a ${min}`),
  
  // Integer validation
  integer: (field, min = 0) => body(field)
    .optional()
    .isInt({ min })
    .withMessage(`${field} deve ser um número inteiro maior ou igual a ${min}`),
  
  // Array validation
  array: (field, minLength = 1) => body(field)
    .isArray({ min: minLength })
    .withMessage(`${field} deve ser um array com pelo menos ${minLength} item(s)`),
  
  // Enum validation
  enum: (field, values) => body(field)
    .isIn(values)
    .withMessage(`${field} deve ser um dos valores: ${values.join(', ')}`),
  
  // URL validation
  url: (field) => body(field)
    .optional()
    .isURL()
    .withMessage(`${field} deve ser uma URL válida`)
};

// Validações específicas para paginação
const paginationValidations = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número inteiro maior que 0'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser um número inteiro entre 1 e 100'),
  query('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Busca deve ter entre 1 e 100 caracteres')
];

// Validações para filtros de data
const dateRangeValidations = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Data inicial deve ser uma data válida'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Data final deve ser uma data válida')
    .custom((endDate, { req }) => {
      if (req.query.startDate && endDate) {
        const start = new Date(req.query.startDate);
        const end = new Date(endDate);
        if (end < start) {
          throw new Error('Data final deve ser posterior à data inicial');
        }
      }
      return true;
    })
];

// Validações específicas para upload de arquivos
const fileValidations = {
  image: (field = 'image') => body(field)
    .optional()
    .custom((value, { req }) => {
      if (req.file) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(req.file.mimetype)) {
          throw new Error('Arquivo deve ser uma imagem (JPEG, PNG, GIF ou WebP)');
        }
        
        // Limite de 5MB
        if (req.file.size > 5 * 1024 * 1024) {
          throw new Error('Arquivo deve ter no máximo 5MB');
        }
      }
      return true;
    }),
  
  document: (field = 'document') => body(field)
    .optional()
    .custom((value, { req }) => {
      if (req.file) {
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(req.file.mimetype)) {
          throw new Error('Arquivo deve ser um documento (PDF, DOC ou DOCX)');
        }
        
        // Limite de 10MB
        if (req.file.size > 10 * 1024 * 1024) {
          throw new Error('Arquivo deve ter no máximo 10MB');
        }
      }
      return true;
    })
};

// Função para sanitizar dados de entrada
const sanitizeInput = (data) => {
  if (typeof data === 'string') {
    return data.trim();
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return data;
};

// Função para validar se um valor é um UUID válido
const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Função para validar formato de moeda brasileira
const isValidCurrency = (value) => {
  const currencyRegex = /^\d+(\.\d{1,2})?$/;
  return currencyRegex.test(value) && parseFloat(value) >= 0;
};

// Função para normalizar telefone brasileiro
const normalizePhone = (phone) => {
  if (!phone) return null;
  
  // Remove todos os caracteres não numéricos
  const numbers = phone.replace(/\D/g, '');
  
  // Se tem 11 dígitos (celular com 9)
  if (numbers.length === 11) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  }
  
  // Se tem 10 dígitos (fixo)
  if (numbers.length === 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  }
  
  return phone;
};

// Função para normalizar CPF
const normalizeCPF = (cpf) => {
  if (!cpf) return null;
  
  const numbers = cpf.replace(/\D/g, '');
  if (numbers.length === 11) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
  }
  
  return cpf;
};

// Função para normalizar CNPJ
const normalizeCNPJ = (cnpj) => {
  if (!cnpj) return null;
  
  const numbers = cnpj.replace(/\D/g, '');
  if (numbers.length === 14) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12)}`;
  }
  
  return cnpj;
};

// Função para normalizar CEP
const normalizeCEP = (cep) => {
  if (!cep) return null;
  
  const numbers = cep.replace(/\D/g, '');
  if (numbers.length === 8) {
    return `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
  }
  
  return cep;
};

export {
  commonValidations,
  paginationValidations,
  dateRangeValidations,
  fileValidations,
  sanitizeInput,
  isValidUUID,
  isValidCurrency,
  normalizePhone,
  normalizeCPF,
  normalizeCNPJ,
  normalizeCEP
};