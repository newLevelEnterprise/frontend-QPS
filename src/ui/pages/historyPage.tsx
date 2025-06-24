import { useState } from 'react';

// Interface para os dados da API
interface HistoryItem {
  sequencing_start: string;
  machine_status: "On Time" | "Late";
  id: number;
}


const mockHistoryData: HistoryItem[] = [
  { 
    id: 1, 
    sequencing_start: "2024-01-15T14:30:42.391Z", 
    machine_status: "On Time" 
  },
  { 
    id: 2, 
    sequencing_start: "2024-01-14T09:15:22.123Z", 
    machine_status: "Late" 
  },
  { 
    id: 3, 
    sequencing_start: "2024-01-13T16:45:15.789Z", 
    machine_status: "On Time" 
  },
  { 
    id: 4, 
    sequencing_start: "2024-01-12T11:20:33.456Z", 
    machine_status: "On Time" 
  },
  { 
    id: 5, 
    sequencing_start: "2024-01-11T13:55:18.234Z", 
    machine_status: "Late" 
  },
];

function HistoryPage() {
  const [historyData] = useState<HistoryItem[]>(mockHistoryData);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: "On Time" | "Late") => {
    return status === "On Time" 
      ? "bg-green-100 text-green-800" 
      : "bg-red-100 text-red-800";
  };

  const handleCardClick = (id: number) => {
    console.log(`ID do processamento: ${id}`);
  };

  return (
    <div className="h-full flex flex-col w-full gap-6">
      <h1 className="text-lg md:text-xl lg:text-2xl text-[#878C9B] font-semibold">
        Histórico de Processamentos
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {historyData.map((item) => (
          <div
            key={item.id}
            onClick={() => handleCardClick(item.id)}
            className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
          >
            <div className="flex flex-col items-center text-center">
              <div className="text-lg font-bold text-gray-800 mb-1">
                {formatDate(item.sequencing_start)}
              </div>
              <div className="text-xs text-gray-600 mb-2">
                {formatTime(item.sequencing_start)}
              </div>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.machine_status)}`}>
                {item.machine_status}
              </div>
            </div>
          </div>
        ))}
      </div>

      {historyData.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-gray-400 text-lg mb-2">
            Nenhum histórico encontrado
          </div>
          <div className="text-gray-300 text-sm">
            Os processamentos aparecerão aqui
          </div>
        </div>
      )}
    </div>
  );
}

export default HistoryPage;
