import React, { useState, useEffect } from 'react';
import { PlusCircle, Search, Edit, Trash2, Mail, Phone, Monitor, Code, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { getClients, saveClient, deleteClient } from '../utils/storage';
import { Client } from '../types';
import { formatPhone, formatCNPJ, formatCEP, removeFormatting, isValidCNPJ, isValidPhone } from '../utils/formatters';

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    cnpj: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    type: 'avulso' as 'contrato' | 'avulso'
  });
  
  // Função para lidar com mudanças nos campos formatados
  const handleFormattedChange = (field: string, value: string) => {
    let formattedValue = value;
    let error = '';
    
    switch (field) {
      case 'phone':
        formattedValue = formatPhone(value);
        if (value && !isValidPhone(formattedValue)) {
          error = 'Telefone deve ter 10 ou 11 dígitos';
        }
        break;
      case 'cnpj':
        formattedValue = formatCNPJ(value);
        if (value && !isValidCNPJ(formattedValue)) {
          error = 'CNPJ inválido';
        }
        break;
      case 'zipCode':
        formattedValue = formatCEP(value);
        if (value && removeFormatting(value).length !== 8) {
          error = 'CEP deve ter 8 dígitos';
        }
        break;
      default:
        formattedValue = value;
    }
    
    setFormData({ ...formData, [field]: formattedValue });
    setValidationErrors({ ...validationErrors, [field]: error });
  };
  
  useEffect(() => {
    const loadClients = async () => {
      const clientsData = await getClients();
      setClients(clientsData);
    };
    loadClients();
  }, []);
  
  const filteredClients = clients.filter(client =>
    (client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (typeFilter === 'all' || client.type === typeFilter)
  );
  
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      cnpj: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
      type: 'avulso'
    });
    setEditingClient(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar se há erros de validação
    const hasErrors = Object.values(validationErrors).some(error => error !== '');
    if (hasErrors) {
      alert('Por favor, corrija os erros de validação antes de continuar.');
      return;
    }
    
    console.log('Iniciando cadastro de cliente com dados:', formData);
    
    try {
      const client: Client = {
        id: editingClient?.id || uuidv4(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        cnpj: formData.cnpj || undefined,
        // Remove formatação antes de salvar
        phone: removeFormatting(formData.phone),
        street: formData.street,
        number: formData.number,
        complement: formData.complement || undefined,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        // Salva CNPJ sem formatação
        cnpj: formData.cnpj ? removeFormatting(formData.cnpj) : undefined,
        type: formData.type,
        createdAt: editingClient?.createdAt || new Date()
      };
      
      console.log('Cliente a ser salvo:', client);
      
      await saveClient(client);
      
      console.log('Cliente salvo, recarregando lista...');
      const clientsData = await getClients();
      console.log('Nova lista de clientes:', clientsData);
      
      setClients(clientsData);
      setShowModal(false);
      resetForm();
      console.log('Cliente salvo com sucesso:', client);
      alert('Cliente cadastrado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      alert(`Erro ao salvar cliente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };
  
  const handleEdit = (client: Client) => {
    setEditingClient(client);
    // Formatar dados ao carregar para edição
    setFormData({
      name: client.name,
      email: client.email,
      phone: formatPhone(client.phone),
      company: client.company,
      cnpj: client.cnpj ? formatCNPJ(client.cnpj) : '',
      street: client.street,
      number: client.number,
      complement: client.complement || '',
      neighborhood: client.neighborhood,
      city: client.city,
      state: client.state,
      zipCode: formatCEP(client.zipCode),
      type: client.type
    });
    setValidationErrors({});
    setShowModal(true);
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      await deleteClient(id);
      const clientsData = await getClients();
      setClients(clientsData);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600">Gerencie sua base de clientes</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors duration-200"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Novo Cliente
        </button>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="all">Todos os Tipos</option>
              <option value="contrato">Contrato</option>
              <option value="avulso">Avulso</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <div key={client.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{client.company}</h3>
                <p className="text-sm text-gray-600">{client.name}</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                  client.type === 'contrato' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {client.type === 'contrato' ? 'Contrato' : 'Avulso'}
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(client)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(client.id)}
                  className="text-gray-400 hover:text-red-600 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                <a href={`mailto:${client.email}`} className="hover:text-cyan-600">
                  {client.email}
                </a>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                <a href={`tel:${client.phone}`} className="hover:text-cyan-600">
                  {formatPhone(client.phone)}
                </a>
              </div>
              {client.cnpj && (
                <p className="text-sm text-gray-600">
                  CNPJ: {formatCNPJ(client.cnpj)}
                </p>
              )}
              <p className="text-sm text-gray-600">
                {client.street}, {client.number}
                {client.complement && ` - ${client.complement}`}
              </p>
              <p className="text-sm text-gray-600">
                {client.neighborhood} - {client.city}/{client.state}
              </p>
              <p className="text-sm text-gray-600">
                CEP: {formatCEP(client.zipCode)}
              </p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Cliente desde {new Date(client.createdAt).toLocaleDateString('pt-BR')}
              </p>
              
              {/* Inventory Actions */}
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  to={`/clients/${client.id}/hardware`}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full hover:bg-blue-200 transition-colors duration-200 no-underline"
                >
                  <Monitor className="w-3 h-3 mr-1" />
                  Hardware
                </Link>
                <Link
                  to={`/clients/${client.id}/software`}
                  className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full hover:bg-purple-200 transition-colors duration-200 no-underline"
                >
                  <Code className="w-3 h-3 mr-1" />
                  Software
                </Link>
                <Link
                  to={`/clients/${client.id}/service-records`}
                  className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full hover:bg-green-200 transition-colors duration-200 no-underline"
                >
                  <Clock className="w-3 h-3 mr-1" />
                  Atendimentos
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum cliente encontrado
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? 'Tente ajustar o termo de busca' 
              : 'Cadastre seu primeiro cliente para começar'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors duration-200"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Cadastrar primeiro cliente
            </button>
          )}
        </div>
      )}
      
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Nome completo do contato"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa *
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Nome da empresa"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="email@empresa.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleFormattedChange('phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                    validationErrors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                  required
                />
                {validationErrors.phone && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CNPJ
                </label>
                <input
                  type="text"
                  value={formData.cnpj}
                  onChange={(e) => handleFormattedChange('cnpj', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                    validationErrors.cnpj ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="00.000.000/0001-00"
                  maxLength={18}
                />
                {validationErrors.cnpj && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.cnpj}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Cliente *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'contrato' | 'avulso' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                >
                  <option value="avulso">Avulso</option>
                  <option value="contrato">Contrato</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Endereço
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Rua/Avenida *"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={formData.number}
                      onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Número *"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={formData.complement}
                      onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Complemento"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={formData.neighborhood}
                      onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Bairro *"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Cidade *"
                      required
                    />
                  </div>
                  <div>
                    <select
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      required
                    >
                      <option value="">UF *</option>
                      <option value="AC">AC</option>
                      <option value="AL">AL</option>
                      <option value="AP">AP</option>
                      <option value="AM">AM</option>
                      <option value="BA">BA</option>
                      <option value="CE">CE</option>
                      <option value="DF">DF</option>
                      <option value="ES">ES</option>
                      <option value="GO">GO</option>
                      <option value="MA">MA</option>
                      <option value="MT">MT</option>
                      <option value="MS">MS</option>
                      <option value="MG">MG</option>
                      <option value="PA">PA</option>
                      <option value="PB">PB</option>
                      <option value="PR">PR</option>
                      <option value="PE">PE</option>
                      <option value="PI">PI</option>
                      <option value="RJ">RJ</option>
                      <option value="RN">RN</option>
                      <option value="RS">RS</option>
                      <option value="RO">RO</option>
                      <option value="RR">RR</option>
                      <option value="SC">SC</option>
                      <option value="SP">SP</option>
                      <option value="SE">SE</option>
                      <option value="TO">TO</option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => handleFormattedChange('zipCode', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                        validationErrors.zipCode ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="CEP *"
                      maxLength={10}
                      required
                    />
                    {validationErrors.zipCode && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.zipCode}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors duration-200"
                >
                  {editingClient ? 'Atualizar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;