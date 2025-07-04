import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../utils/apiClient";

interface HistoryItem {
  sequencing_start: string;
  machine_status: "On Time" | "Late";
  id: number;
}

function HistoryPage() {
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getHistory() {
      try {
        setIsLoading(true);
        const { data } = await apiClient.get<HistoryItem[]>(
          "/production-schedule"
        );
        setHistoryData(data);
      } catch (error) {
        console.log(error);
        setHistoryData([]);
      } finally {
        setIsLoading(false);
      }
    }
    getHistory();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: "On Time" | "Late") => {
    return status === "On Time"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const handleCardClick = (id: number) => {
    navigate({
      pathname: "/resultados",
      search: `?id=${id}`,
    });
    return;
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col w-full gap-6 overflow-hidden">
        <h1 className="text-lg md:text-xl lg:text-2xl text-[#878C9B] font-semibold">
          Histórico de Processamentos
        </h1>
        
        <div className="flex items-center justify-center py-12 overflow-y-auto">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <div className="text-gray-500 text-lg">Carregando histórico...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col w-full gap-6 overflow-hidden">
      <h1 className="text-lg md:text-xl lg:text-2xl text-[#878C9B] font-semibold">
        Histórico de Processamentos
      </h1>
      
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pb-4">
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
                <div
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    item.machine_status
                  )}`}
                >
                  {item.machine_status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {historyData.length === 0 && !isLoading && (
        <div className="flex flex-col w-full h-full items-center justify-center py-12">
          <div className="text-gray-400 text-lg mb-2">
            Nenhum histórico encontrado
          </div>
        </div>
      )}
    </div>
  );
}

export default HistoryPage;
