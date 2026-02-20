function EstadoAtualMaquina() {
  return (
    <div className="bg-white w-full h-full rounded-lg p-4">
      <h2 className="text-xl text-[#5B85D5] font-bold mb-4">
        Estado Atual da Máquina
      </h2>
      <div className="overflow-auto max-h-[370px] w-full max-w-[1000px]">
        <table className="text-xs min-w-full">
          <thead>
            <tr>
              <th className="px-2 py-2">Máquinas Cadastradas</th>
              <th className="px-2 py-2">Utilização</th>
              <th className="px-2 py-2">
                Código do Molde em Máquina no Início do Sequenciamento
              </th>
              <th className="px-2 py-2">
                Produto em Máquina no Início do Sequenciamento
              </th>
              <th className="px-2 py-2">
                Status do Pedido na Máquina no Início do Sequenciamento
              </th>
              <th className="px-2 py-2">Número do Pedido</th>
              <th className="px-2 py-2">Cliente</th>
              <th className="px-2 py-2">
                Tempo restantes de produção na Injetora (min)
              </th>
              <th className="px-2 py-2">
                Tempo restantes de produção pós Injetora (min)
              </th>
              <th className="px-2 py-2">Demanda</th>
              <th className="px-2 py-2">Valor a ser Faturado</th>
              <th className="px-2 py-2">Data Limite de Faturamento</th>
              <th className="px-2 py-2">Horário Limite de Faturamento</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5, 6].map((row, idx) => (
              <tr key={idx} className="odd:bg-white even:bg-gray-50">
                <td className="px-2 py-2 border">
                  <select className="border rounded px-1 py-0.5">
                    <option>Maq 1</option>
                    <option>Maq 2</option>
                  </select>
                </td>
                <td className="px-2 py-2 border text-center">
                  <input
                    type="checkbox"
                    checked={idx % 2 === 1}
                    readOnly
                    className="accent-[#5B85D5]"
                  />
                </td>
                <td className="px-2 py-2 border">
                  <input
                    type="text"
                    value="M1"
                    readOnly
                    className="border rounded px-1 py-0.5 w-16 text-center"
                  />
                </td>
                <td className="px-2 py-2 border">
                  <select className="border rounded px-1 py-0.5">
                    <option>Pote Turim Verde</option>
                  </select>
                </td>
                <td className="px-2 py-2 border">
                  <select className="border rounded px-1 py-0.5">
                    <option>
                      {idx % 2 === 0 ? "Concluído" : "Não Concluído"}
                    </option>
                  </select>
                </td>
                <td className="px-2 py-2 border text-center">
                  {idx % 2 === 0 ? "123" : "789"}
                </td>
                <td className="px-2 py-2 border">Cliente E</td>
                <td className="px-2 py-2 border text-center">1380</td>
                <td className="px-2 py-2 border text-center">500</td>
                <td className="px-2 py-2 border text-center">70.000</td>
                <td className="px-2 py-2 border text-center">R$ 20.000,00</td>
                <td className="px-2 py-2 border text-center">13/08/2025</td>
                <td className="px-2 py-2 border text-center">12:00</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EstadoAtualMaquina;
