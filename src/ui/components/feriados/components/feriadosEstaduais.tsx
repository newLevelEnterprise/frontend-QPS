import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { FiEdit2 } from "react-icons/fi";
import { toast } from "react-toastify";
import type { IFeriadoType } from "../../../../types/Feriado";
import { apiClient } from "../../../../utils/apiClient";
import Loader from "../../Loader";
import Modal from "../../modal";
import EditarFeriadoForm from "../formEditarFeriado";

function FeriadosEstaduais() {
  const [modalOpen, setModalOpen] = useState(false);
  const [feriadoSelecionado, setFeriadoSelecionado] = useState<IFeriadoType>({
    date: "",
    id: 0,
    name: "",
    level: "",
    city: "",
    state: "",
  });

  const { data: feriadosData, isFetching } = useQuery({
    queryKey: ["get", "all", "feriados"],
    queryFn: async () => {
      const { data } = await apiClient.get<IFeriadoType[]>("/feriados/");
      return data;
    },
  });

  const handleEdit = (feriado: IFeriadoType) => {
    setFeriadoSelecionado({
      id: feriado.id,
      date: feriado.date,
      name: feriado.name,
      level: feriado.level,
      city: feriado.city,
      state: feriado.state,
    });
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setFeriadoSelecionado({
      date: "",
      id: 0,
      name: "",
      level: "",
      city: "",
      state: "",
    });
  };

  const handleSubmit = async (data: IFeriadoType) => {
    try {
      await apiClient.put(`/feriados/${data.id}`, data);
      handleClose();
    } catch (error) {
      console.log("Erro ao atualizar feriado:", error);
      toast.error("Erro ao atualizar feriado. Tente novamente mais tarde.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 w-full min-w-fit">
      <h2 className="text-base font-semibold mb-3">Feriados Estaduais</h2>
      {isFetching && <Loader message="Carregando feriados estaduais" />}
      {!isFetching && (
        <>
          <ul className="flex flex-col gap-1">
            {feriadosData
              ?.filter((feriado) => feriado.level === "Estadual")
              .map((feriado) => (
                <li
                  key={feriado.date + feriado.name}
                  className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-3 py-2"
                >
                  <span className="w-20 font-medium text-gray-700">
                    {feriado.date}
                  </span>
                  <span className="flex-1 ml-2 text-gray-700 text-sm truncate">
                    {feriado.name}
                  </span>
                  <button
                    className="ml-2 p-1 rounded hover:bg-gray-100 transition-colors"
                    onClick={() => handleEdit(feriado)}
                  >
                    <FiEdit2 className="w-4 h-4 text-blue-500" />
                  </button>
                </li>
              ))}
          </ul>
          <Modal.Root isVisible={modalOpen}>
            <Modal.Container>
              <Modal.Header title="Editar Feriado" onClose={handleClose} />
              {feriadoSelecionado && (
                <EditarFeriadoForm
                  initialData={feriadoSelecionado}
                  onSubmit={handleSubmit}
                  onCancel={handleClose}
                />
              )}
            </Modal.Container>
          </Modal.Root>
        </>
      )}
    </div>
  );
}

export default FeriadosEstaduais;
