function TurnosRegulares() {
  return (
    <div className="w-full flex flex-col justify-between bg-white rounded-md shadow p-4">
      <div className="shadow-sm p-6 rounded-lg bg-white border border-gray-200">
        <h1 className="text-xl text-[#5B85D5] font-bold">Turnos Regulares</h1>
        <div className="rounded-lg overflow-y-auto mt-10 h-[470px] overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Turnos Regulares</th>
                <th className="px-4 py-2 text-center">
                  Manhã
                  <br />
                  <span className="text-xs text-gray-400">(06h - 14h)</span>
                </th>
                <th className="px-4 py-2 text-center">
                  Tarde
                  <br />
                  <span className="text-xs text-gray-400">(14h às 22h)</span>
                </th>
                <th className="px-4 py-2 text-center">
                  Noite
                  <br />
                  <span className="text-xs text-gray-400">(22h às 06h)</span>
                </th>
                <th className="px-4 py-2 text-center">Frequência</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <td className="px-4 py-2">Segunda-feira</td>
                <td className="px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    checked
                    readOnly
                    className="accent-blue-600 w-5 h-5"
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    checked
                    readOnly
                    className="accent-blue-600 w-5 h-5"
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    checked
                    readOnly
                    className="accent-blue-600 w-5 h-5"
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <select className="border rounded p-1">
                    <option>Diário</option>
                    <option>Semanal</option>
                    <option>Quinzenal</option>
                    <option>Mensal</option>
                    <option>Não Trabalha</option>
                  </select>
                </td>
              </tr>
              <tr className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <td className="px-4 py-2">Terça-feira</td>
                <td className="px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    checked
                    readOnly
                    className="accent-blue-600 w-5 h-5"
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    checked
                    readOnly
                    className="accent-blue-600 w-5 h-5"
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    checked
                    readOnly
                    className="accent-blue-600 w-5 h-5"
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <select className="border rounded p-1">
                    <option>Diário</option>
                    <option>Semanal</option>
                    <option>Quinzenal</option>
                    <option>Mensal</option>
                    <option>Não Trabalha</option>
                  </select>
                </td>
              </tr>
              <tr className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <td className="px-4 py-2">Quarta-feira</td>
                <td className="px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    checked
                    readOnly
                    className="accent-blue-600 w-5 h-5"
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    checked
                    readOnly
                    className="accent-blue-600 w-5 h-5"
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    checked
                    readOnly
                    className="accent-blue-600 w-5 h-5"
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <select className="border rounded p-1">
                    <option>Diário</option>
                    <option>Semanal</option>
                    <option>Quinzenal</option>
                    <option>Mensal</option>
                    <option>Não Trabalha</option>
                  </select>
                </td>
              </tr>
              <tr className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <td className="px-4 py-2">Quinta-feira</td>
                <td className="px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    checked
                    readOnly
                    className="accent-blue-600 w-5 h-5"
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    checked
                    readOnly
                    className="accent-blue-600 w-5 h-5"
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    checked
                    readOnly
                    className="accent-blue-600 w-5 h-5"
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <select className="border rounded p-1">
                    <option>Diário</option>
                    <option>Semanal</option>
                    <option>Quinzenal</option>
                    <option>Mensal</option>
                    <option>Não Trabalha</option>
                  </select>
                </td>
              </tr>
              <tr className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <td className="px-4 py-2">Sexta-feira</td>
                <td className="px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    checked
                    readOnly
                    className="accent-blue-600 w-5 h-5"
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    checked
                    readOnly
                    className="accent-blue-600 w-5 h-5"
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    checked
                    readOnly
                    className="accent-blue-600 w-5 h-5"
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <select className="border rounded p-1">
                    <option>Diário</option>
                    <option>Semanal</option>
                    <option>Quinzenal</option>
                    <option>Mensal</option>
                    <option>Não Trabalha</option>
                  </select>
                </td>
              </tr>
              <tr className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <td className="px-4 py-2">Sábado-feira</td>
                <td className="px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    checked
                    readOnly
                    className="accent-blue-600 w-5 h-5"
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <input type="checkbox" className="accent-blue-600 w-5 h-5" />
                </td>
                <td className="px-4 py-2 text-center">
                  <input type="checkbox" className="accent-blue-600 w-5 h-5" />
                </td>
                <td className="px-4 py-2 text-center">
                  <select className="border rounded p-1">
                    <option>Diário</option>
                    <option>Semanal</option>
                    <option>Quinzenal</option>
                    <option>Mensal</option>
                    <option>Não Trabalha</option>
                  </select>
                </td>
              </tr>
              <tr className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <td className="px-4 py-2">Domingo-feira</td>
                <td className="px-4 py-2 text-center">
                  <input type="checkbox" className="accent-blue-600 w-5 h-5" />
                </td>
                <td className="px-4 py-2 text-center">
                  <input type="checkbox" className="accent-blue-600 w-5 h-5" />
                </td>
                <td className="px-4 py-2 text-center">
                  <input type="checkbox" className="accent-blue-600 w-5 h-5" />
                </td>
                <td className="px-4 py-2 text-center">
                  <select className="border rounded p-1">
                    <option>Diário</option>
                    <option>Semanal</option>
                    <option>Quinzenal</option>
                    <option>Mensal</option>
                    <option>Não Trabalha</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex items-end justify-end mt-4">
        <button
          // onClick={() => {
          //   setComposicao({
          //     id: 0,
          //     produto: "",
          //     garrasmetalicas: 0,
          //     suporteaco: 0,
          //     master: 0,
          //     peadvirgem: 0,
          //     pevirgem: 0,
          //     ppvirgem: 0,
          //     ppreciclado: 0,
          //   });
          // }}
          className="cursor-pointer text-sm md:text-base inline-flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Prosseguir
        </button>
      </div>
    </div>
  );
}

export default TurnosRegulares;
