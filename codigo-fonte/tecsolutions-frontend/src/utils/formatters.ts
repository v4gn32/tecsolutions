// Formatação automática para telefone
export const formatPhone = (value: string | undefined | null): string => {
  if (!value) return '';
  
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Aplica a máscara baseada no tamanho
  if (numbers.length <= 10) {
    // Telefone fixo: (11) 1234-5678
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else {
    // Celular: (11) 99999-9999
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
};

// Formatação automática para CNPJ
export const formatCNPJ = (value: string | undefined | null): string => {
  if (!value) return '';
  
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Aplica a máscara: 12.345.678/0001-90
  return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

// Formatação automática para CEP
export const formatCEP = (value: string | undefined | null): string => {
  if (!value) return '';
  
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Aplica a máscara: 12345-678
  return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
};

// Função para remover formatação (útil para salvar no banco)
export const removeFormatting = (value: string | undefined | null): string => {
  if (!value) return '';
  return value.replace(/\D/g, '');
};

// Validação de CNPJ
export const isValidCNPJ = (cnpj: string | undefined | null): boolean => {
  if (!cnpj) return false;
  
  const numbers = cnpj.replace(/\D/g, '');
  
  if (numbers.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(numbers)) return false;
  
  // Validação dos dígitos verificadores
  let sum = 0;
  let weight = 2;
  
  // Primeiro dígito verificador
  for (let i = 11; i >= 0; i--) {
    sum += parseInt(numbers[i]) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  
  let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (parseInt(numbers[12]) !== digit) return false;
  
  // Segundo dígito verificador
  sum = 0;
  weight = 2;
  
  for (let i = 12; i >= 0; i--) {
    sum += parseInt(numbers[i]) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  
  digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return parseInt(numbers[13]) === digit;
};

// Validação de telefone
export const isValidPhone = (phone: string | undefined | null): boolean => {
  if (!phone) return false;
  
  const numbers = phone.replace(/\D/g, '');
  return numbers.length === 10 || numbers.length === 11;
};