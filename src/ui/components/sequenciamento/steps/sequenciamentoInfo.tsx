function SequenciamentoInfo() {
  return (
    <div className="bg-white w-full overflow-y-auto max-h-full rounded-lg p-4">
      <h2 className="text-[#3573C9] text-lg font-bold mb-2">Sequenciamento</h2>

      <form className="flex flex-col gap-8 mt-2">
        <div>
          <label className="font-semibold mb-4">Início do Sequenciamento</label>
          <div className="flex gap-4 mt-2">
            <div className="flex gap-2 items-center">
              <label className="font-semibold text-gray-700">Dia:</label>
              <input type="date" className="border rounded px-2 py-1 w-32" />
            </div>
            <div className="flex gap-2 items-center">
              <label className="font-semibold text-gray-700">Hora:</label>
              <input type="time" className="border rounded px-2 py-1 w-24" />
            </div>
          </div>
        </div>
        <div>
          <label className="block mb-4 font-semibold">
            Horário Limite de Faturamento no Dia
          </label>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-gray-700 max-w-40 font-semibold">
              Hora limite de faturamento no dia
            </span>
            <input
              type="time"
              className="border rounded px-2 py-1 w-24"
              defaultValue="16:59"
            />
          </div>
        </div>
        <div className="mt-2">
          <label className="block font-semibold mb-1">
            O sábado seguinte a esta data é dia de trabalho regular?
          </label>
          <div className="flex gap-4 items-center">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="sabado"
                className="accent-[#3573C9]"
                value="sim"
              />
              <span>Sim</span>
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="sabado"
                className="accent-[#3573C9]"
                value="nao"
              />
              <span>Não</span>
            </label>
          </div>
        </div>
      </form>
    </div>
  );
}

export default SequenciamentoInfo;
