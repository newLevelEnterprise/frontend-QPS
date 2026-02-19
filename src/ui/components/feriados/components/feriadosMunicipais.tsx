import { useState } from "react";
import { FiEdit2 } from "react-icons/fi";
import type { IFeriado } from "../../../../types/Feriado";
import Modal from "../../modal";
import EditarFeriadoForm from "../formEditarFeriado";

const feriados = [
  {
    id: 0,
    dia: "01/jan",
    nome: "Confraternização universal",
    tipo: "Municipal",
  },
  { id: 1, dia: "21/abr", nome: "Tiradentes", tipo: "Municipal" },
  { id: 2, dia: "01/mai", nome: "Dia do trabalhador", tipo: "Municipal" },
  { id: 3, dia: "16/jun", nome: "Corpus Christi", tipo: "Municipal" },
  { id: 4, dia: "07/set", nome: "Independência", tipo: "Municipal" },
  { id: 5, dia: "12/out", nome: "Padroeira do Brasil", tipo: "Municipal" },
  { id: 6, dia: "02/nov", nome: "Finados", tipo: "Municipal" },
  { id: 7, dia: "15/nov", nome: "Proclamação da República", tipo: "Municipal" },
  { id: 8, dia: "20/nov", nome: "Consciência Negra", tipo: "Municipal" },
  { id: 9, dia: "25/dez", nome: "Natal", tipo: "Municipal" },
  { id: 10, dia: "Variável", nome: "Paixão de Cristo", tipo: "Municipal" },
];

function FeriadosMunicipais() {
  const [modalOpen, setModalOpen] = useState(false);
  const [feriadoSelecionado, setFeriadoSelecionado] = useState<IFeriado>({
    dia: "",
    id: 0,
    nome: "",
    tipo: "",
  });

  const handleEdit = (feriado: IFeriado) => {
    setFeriadoSelecionado({
      id: feriado.id,
      dia: feriado.dia,
      nome: feriado.nome,
      tipo: feriado.tipo,
    });
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setFeriadoSelecionado({
      dia: "",
      id: 0,
      nome: "",
      tipo: "",
    });
  };

  const handleSubmit = (data: IFeriado) => {
    // Aqui você pode atualizar o feriado na lista ou fazer uma chamada à API
    console.log("Feriado atualizado:", data);
    handleClose();
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 w-full min-w-fit">
      <h2 className="text-base font-semibold mb-3">Feriados Municipais</h2>
      <ul className="flex flex-col gap-1">
        {feriados.map((feriado) => (
          <li
            key={feriado.dia + feriado.nome}
            className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-3 py-2"
          >
            <span className="w-20 font-medium text-gray-700">
              {feriado.dia}
            </span>
            <span className="flex-1 ml-2 text-gray-700 text-sm truncate">
              {feriado.nome}
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
    </div>
  );
}

export default FeriadosMunicipais;
