import React from 'react';
import { 
  FileText, 
  Calendar, 
  User, 
  Clock, 
  Monitor, 
  Wrench, 
  Building,
  Download,
  Edit,
  X,
  CheckCircle
} from 'lucide-react';
import { Client, ServiceRecord } from '../types';

interface ReportPreviewProps {
  reportData: {
    client: Client;
    records: ServiceRecord[];
    period: { start: Date; end: Date };
  };
  onConfirm: () => void;
  onCancel: () => void;
  onEdit: () => void;
}

const ReportPreview: React.FC<ReportPreviewProps> = ({ 
  reportData, 
  onConfirm, 
  onCancel, 
  onEdit 
}) => {
  const { client, records, period } = reportData;

  const serviceTypes = [
    { value: 'remote', label: 'Atendimento Remoto', icon: Monitor, color: 'bg-blue-100 text-blue-800' },
    { value: 'onsite', label: 'Atendimento Presencial', icon: User, color: 'bg-green-100 text-green-800' },
    { value: 'laboratory', label: 'Serviços de Laboratório', icon: Wrench, color: 'bg-purple-100 text-purple-800' },
    { value: 'third_party', label: 'Serviços de Terceiros', icon: Building, color: 'bg-orange-100 text-orange-800' }
  ];

  const getTypeConfig = (type: string) => {
    return serviceTypes.find(t => t.value === type) || serviceTypes[0];
  };

  // Calcular estatísticas
  const totalAtendimentos = records.length;
  const atendimentosPorTipo = serviceTypes.map(type => ({
    ...type,
    count: records.filter(r => r.type === type.value).length
  }));

  const horasPresencial = records
    .filter(r => r.type === 'onsite' && r.totalHours)
    .reduce((sum, r) => sum + (r.totalHours || 0), 0);

  const horasRemoto = records
    .filter(r => r.type === 'remote' && r.totalHours)
    .reduce((sum, r) => sum + (r.totalHours || 0), 0);

  const horasLaboratorio = records
    .filter(r => r.type === 'laboratory' && r.totalHours)
    .reduce((sum, r) => sum + (r.totalHours || 0), 0);

  const totalHoras = horasPresencial + horasRemoto + horasLaboratorio;

  // Agrupar por data
  const recordsByDate = records.reduce((acc, record) => {
    const dateKey = new Date(record.date).toLocaleDateString('pt-BR');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(record);
    return acc;
  }, {} as Record<string, ServiceRecord[]>);

  const sortedDates = Object.keys(recordsByDate).sort((a, b) => {
    const dateA = new Date(a.split('/').reverse().join('-'));
    const dateB = new Date(b.split('/').reverse().join('-'));
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="w-6 h-6 text-green-600 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Preview do Relatório de Atendimentos
              </h3>
              <p className="text-sm text-gray-600">
                Revise as informações antes de gerar o PDF
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Client Info */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-gray-600" />
              Informações do Cliente
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Empresa:</span>
                <p className="text-gray-900">{client.company}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Contato:</span>
                <p className="text-gray-900">{client.name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">E-mail:</span>
                <p className="text-gray-900">{client.email}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Telefone:</span>
                <p className="text-gray-900">{client.phone}</p>
              </div>
            </div>
          </div>

          {/* Period */}
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Período do Relatório
            </h4>
            <p className="text-gray-900">
              <span className="font-medium">De:</span> {period.start.toLocaleDateString('pt-BR')} 
              <span className="mx-2">até</span>
              <span className="font-medium">Até:</span> {period.end.toLocaleDateString('pt-BR')}
            </p>
          </div>

          {/* Statistics */}
          <div className="bg-green-50 rounded-lg p-6 mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              Resumo Estatístico
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{totalAtendimentos}</div>
                <div className="text-sm text-gray-600">Total de Atendimentos</div>
              </div>
              {totalHoras > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{totalHoras.toFixed(1)}h</div>
                  <div className="text-sm text-gray-600">Total de Horas</div>
                </div>
              )}
              {horasPresencial > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{horasPresencial.toFixed(1)}h</div>
                  <div className="text-sm text-gray-600">Horas Presenciais</div>
                </div>
              )}
              {horasRemoto > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{horasRemoto.toFixed(1)}h</div>
                  <div className="text-sm text-gray-600">Horas Remotas</div>
                </div>
              )}
            </div>

            {/* Distribution by type */}
            <div className="space-y-2">
              <h5 className="font-medium text-gray-900 mb-3">Distribuição por Tipo:</h5>
              {atendimentosPorTipo.filter(type => type.count > 0).map(type => {
                const Icon = type.icon;
                return (
                  <div key={type.value} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div className="flex items-center">
                      <Icon className="w-4 h-4 mr-2 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">{type.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{type.count} atendimentos</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Records by Date */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-gray-600" />
              Atendimentos por Data
            </h4>
            
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {sortedDates.map(date => {
                const dayRecords = recordsByDate[date];
                return (
                  <div key={date} className="border-l-4 border-cyan-500 pl-4">
                    <h5 className="font-semibold text-gray-900 mb-2">📅 {date}</h5>
                    <div className="space-y-2">
                      {dayRecords.map(record => {
                        const typeConfig = getTypeConfig(record.type);
                        const Icon = typeConfig.icon;
                        return (
                          <div key={record.id} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start">
                                <Icon className="w-4 h-4 mr-2 mt-1 text-gray-600" />
                                <div>
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${typeConfig.color} mr-2`}>
                                    {typeConfig.label}
                                  </span>
                                  <p className="text-sm text-gray-900 font-medium">{record.description}</p>
                                  {record.services && record.services.length > 0 && (
                                    <p className="text-xs text-gray-600 mt-1">
                                      Serviços: {record.services.slice(0, 3).join(', ')}
                                      {record.services.length > 3 && ` +${record.services.length - 3} mais`}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {record.totalHours && (
                                <span className="text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded">
                                  {record.totalHours.toFixed(1)}h
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              onClick={onEdit}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar Filtros
            </button>
            <button
              onClick={onCancel}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              <Download className="w-4 h-4 mr-2" />
              Gerar PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPreview;