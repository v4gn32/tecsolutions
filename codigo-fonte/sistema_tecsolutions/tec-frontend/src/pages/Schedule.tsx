import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Clock,
  User,
  MapPin,
  Edit,
  Trash2,
  Filter,
  Search
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { getClients } from '../utils/storage';
import { Client } from '../types';

interface ScheduleEvent {
  id: string;
  clientId: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: 'remote' | 'onsite' | 'laboratory' | 'third_party';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  location?: string;
  notes?: string;
  createdAt: Date;
}

const Schedule: React.FC = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    clientId: '',
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    type: 'onsite' as ScheduleEvent['type'],
    status: 'scheduled' as ScheduleEvent['status'],
    location: '',
    notes: ''
  });

  const eventTypes = [
    { value: 'remote', label: 'Atendimento Remoto', color: 'bg-blue-500', textColor: 'text-blue-700' },
    { value: 'onsite', label: 'Atendimento Presencial', color: 'bg-green-500', textColor: 'text-green-700' },
    { value: 'laboratory', label: 'Serviços de Laboratório', color: 'bg-purple-500', textColor: 'text-purple-700' },
    { value: 'third_party', label: 'Serviços de Terceiros', color: 'bg-orange-500', textColor: 'text-orange-700' }
  ];

  const statusTypes = [
    { value: 'scheduled', label: 'Agendado', color: 'bg-blue-100 text-blue-800' },
    { value: 'in_progress', label: 'Em Andamento', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'completed', label: 'Concluído', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelado', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    const loadData = async () => {
      const clientsData = await getClients();
      setClients(clientsData);
      
      // Load events from localStorage
      const savedEvents = localStorage.getItem('tecsolutions_schedule_events');
      if (savedEvents) {
        const parsedEvents = JSON.parse(savedEvents).map((event: any) => ({
          ...event,
          date: new Date(event.date),
          createdAt: new Date(event.createdAt)
        }));
        setEvents(parsedEvents);
      }
    };
    loadData();
  }, []);

  const saveEvents = (newEvents: ScheduleEvent[]) => {
    localStorage.setItem('tecsolutions_schedule_events', JSON.stringify(newEvents));
    setEvents(newEvents);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const getFilteredEvents = () => {
    return events.filter(event => {
      const matchesType = filterType === 'all' || event.type === filterType;
      const matchesSearch = searchTerm === '' || 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clients.find(c => c.id === event.clientId)?.company.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesType && matchesSearch;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create date using local timezone to avoid date shifting
    const [year, month, day] = formData.date.split('-').map(Number);
    const eventDate = new Date(year, month - 1, day);
    
    const event: ScheduleEvent = {
      id: editingEvent?.id || uuidv4(),
      clientId: formData.clientId,
      title: formData.title,
      description: formData.description,
      date: eventDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      type: formData.type,
      status: formData.status,
      location: formData.location,
      notes: formData.notes,
      createdAt: editingEvent?.createdAt || new Date()
    };

    const updatedEvents = editingEvent
      ? events.map(e => e.id === editingEvent.id ? event : e)
      : [...events, event];

    saveEvents(updatedEvents);
    setShowModal(false);
    resetForm();
  };

  const handleEdit = (event: ScheduleEvent) => {
    setEditingEvent(event);
    // Fix timezone issue when editing
    const year = event.date.getFullYear();
    const month = String(event.date.getMonth() + 1).padStart(2, '0');
    const day = String(event.date.getDate()).padStart(2, '0');
    const localDateString = `${year}-${month}-${day}`;
    
    setFormData({
      clientId: event.clientId,
      title: event.title,
      description: event.description,
      date: localDateString,
      startTime: event.startTime,
      endTime: event.endTime,
      type: event.type,
      status: event.status,
      location: event.location || '',
      notes: event.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      const updatedEvents = events.filter(e => e.id !== id);
      saveEvents(updatedEvents);
    }
  };

  const resetForm = () => {
    setFormData({
      clientId: '',
      title: '',
      description: '',
      date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
      startTime: '',
      endTime: '',
      type: 'onsite',
      status: 'scheduled',
      location: '',
      notes: ''
    });
    setEditingEvent(null);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    // Fix timezone issue by using local date string
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const localDateString = `${year}-${month}-${day}`;
    
    setFormData(prev => ({
      ...prev,
      date: localDateString
    }));
    setShowModal(true);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getTypeConfig = (type: string) => {
    return eventTypes.find(t => t.value === type) || eventTypes[0];
  };

  const getStatusConfig = (status: string) => {
    return statusTypes.find(s => s.value === status) || statusTypes[0];
  };

  const handleCompleteEvent = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      // Navigate to service records page with pre-filled data
      navigate(`/clients/${event.clientId}/service-records`, {
        state: { 
          prefilledData: {
            type: event.type,
            date: event.date.toISOString().split('T')[0],
            description: event.description,
            startTime: event.startTime,
            endTime: event.endTime
          }
        }
      });
    }
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const workDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda de Atendimentos</h1>
          <p className="text-gray-600">Organize e gerencie seus agendamentos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Agendamento
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
                placeholder="Buscar agendamentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="all">Todos os Tipos</option>
              {eventTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Calendar Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            Hoje
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-5 gap-1">
          {/* Week day headers */}
          {workDays.map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 bg-gray-50">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {getDaysInMonth(currentDate)
            .filter(date => date && date.getDay() !== 0 && date.getDay() !== 6) // Remove domingo (0) e sábado (6)
            .map((date, index) => {
            if (!date) {
              return null;
            }
            
            const dayEvents = getEventsForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={index}
                className={`p-2 h-28 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${
                  isToday ? 'bg-cyan-50 border-cyan-200' : 'bg-white'
                }`}
                onClick={() => handleDateClick(date)}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isToday ? 'text-cyan-600' : 'text-gray-900'
                }`}>
                  {date.getDate()}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map(event => {
                    const typeConfig = getTypeConfig(event.type);
                    return (
                      <div
                        key={event.id}
                        className={`text-xs px-1 py-0.5 rounded truncate ${typeConfig.color} text-white`}
                        title={event.title}
                      >
                        {event.startTime} - {event.title}
                      </div>
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{dayEvents.length - 3} mais
                    </div>
                  )}
                </div>
              </div>
            );
          }).filter(Boolean)}
        </div>
      </div>

      {/* Events List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Próximos Agendamentos</h3>
        </div>
        <div className="p-6">
          {getFilteredEvents()
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .slice(0, 10)
            .map(event => {
              const client = clients.find(c => c.id === event.clientId);
              const typeConfig = getTypeConfig(event.type);
              const statusConfig = getStatusConfig(event.status);
              
              return (
                <div key={event.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg mb-4 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center space-x-4">
                    <div className={`w-4 h-4 rounded-full ${typeConfig.color}`}></div>
                    <div>
                      <h4 className="font-medium text-gray-900">{event.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {event.date.toLocaleDateString('pt-BR')}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {event.startTime} - {event.endTime}
                        </div>
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {client?.company || 'Cliente não encontrado'}
                        </div>
                        {event.location && (
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {event.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                    
                    {event.status === 'scheduled' && (
                      <button
                        onClick={() => handleCompleteEvent(event.id)}
                        className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-lg hover:bg-green-200 transition-colors duration-200"
                      >
                        Concluir
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleEdit(event)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="text-gray-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          
          {getFilteredEvents().length === 0 && (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum agendamento encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                Crie seu primeiro agendamento para começar
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Agendamento
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingEvent ? 'Editar Agendamento' : 'Novo Agendamento'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cliente *
                  </label>
                  <select
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione um cliente</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.company} - {client.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Atendimento *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as ScheduleEvent['type'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  >
                    {eventTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Ex: Manutenção preventiva"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Descreva o atendimento..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horário Início *
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horário Fim *
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ScheduleEvent['status'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    {statusTypes.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Local
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Endereço ou local do atendimento"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Observações adicionais..."
                />
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
                  {editingEvent ? 'Atualizar' : 'Agendar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;