import { useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { toast } from "react-toastify";
import type { ICriarFeriadoBody } from "../../../schemas/feriado";
import { apiClient } from "../../../utils/apiClient";
import Modal from "../modal";
import FeriadosEstaduais from "./components/feriadosEstaduais";
import FeriadosMunicipais from "./components/feriadosMunicipais";
import FeriadosNacionais from "./components/feriadosNacionais";
import FormCadastrarFeriado from "./formCadastrarFeriado";

function Feriados() {
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpen = () => setModalOpen(true);
  const handleClose = () => setModalOpen(false);

  const handleSubmit = async (data: ICriarFeriadoBody) => {
    try {
      await apiClient.post(`/feriados`, data);
      handleClose();
    } catch (error) {
      console.log("Erro ao cadastrar feriado:", error);
      toast.error("Erro ao cadastrar feriado. Tente novamente mais tarde.");
    }
  };

  return (
    <div className="w-full flex flex-col rounded-md shadow p-4 overflow-auto">
      <h1 className="text-xl text-[#5B85D5] font-bold">Feriados</h1>
      <div className="w-full flex justify-end items-center">
        <button
          className="flex gap-2 cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-150"
          onClick={handleOpen}
        >
          <CiCirclePlus className="size-6" />
          Adicionar Feriado
        </button>
      </div>
      <div className="grid grid-cols-3 mt-10 gap-6">
        <FeriadosNacionais />
        <FeriadosEstaduais />
        <FeriadosMunicipais />
      </div>
      <Modal.Root isVisible={modalOpen}>
        <Modal.Container>
          <Modal.Header title="Cadastrar Feriado" onClose={handleClose} />
          <FormCadastrarFeriado
            onSubmit={handleSubmit}
            onCancel={handleClose}
          />
        </Modal.Container>
      </Modal.Root>
    </div>
  );
}

export default Feriados;
