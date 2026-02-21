import type { IComposicao } from "../../../types/Composicao";

function ComposicaoTable() {
  const produtos: IComposicao[] = [
    {
      id: 1,
      produto: "Pote Turim Verde",
      garrasmetalicas: 10,
      suporteaco: 5,
      master: 2,
      peadvirgem: 3,
      pevirgem: 4,
      ppvirgem: 6,
      ppreciclado: 1,
    },
    {
      id: 2,
      produto: "Pote Turim Azul",
      garrasmetalicas: 12,
      suporteaco: 6,
      master: 3,
      peadvirgem: 4,
      pevirgem: 5,
      ppvirgem: 7,
      ppreciclado: 2,
    },
    {
      id: 3,
      produto: "Tampa Turim",
      garrasmetalicas: 8,
      suporteaco: 4,
      master: 1,
      peadvirgem: 2,
      pevirgem: 3,
      ppvirgem: 5,
      ppreciclado: 1,
    },
    {
      id: 4,
      produto: "Frasco Barcelona",
      garrasmetalicas: 15,
      suporteaco: 7,
      master: 4,
      peadvirgem: 5,
      pevirgem: 6,
      ppvirgem: 8,
      ppreciclado: 3,
    },
    {
      id: 5,
      produto: "Frasco Roll-on",
      garrasmetalicas: 9,
      suporteaco: 3,
      master: 2,
      peadvirgem: 2,
      pevirgem: 2,
      ppvirgem: 4,
      ppreciclado: 1,
    },
    {
      id: 6,
      produto: "Tampa FlipTop",
      garrasmetalicas: 7,
      suporteaco: 2,
      master: 1,
      peadvirgem: 1,
      pevirgem: 2,
      ppvirgem: 3,
      ppreciclado: 1,
    },
  ];

  return (
    <div className="w-full bg-white rounded-md shadow p-4 overflow-auto">
      <h1 className="text-xl text-[#5B85D5] font-bold">
        Cadastro de Composição de produtos
      </h1>
      <div className="rounded-lg overflow-y-auto mt-2 h-[470px] overflow-x-auto">
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Produto</th>
              <th className="px-4 py-2 text-center">
                PP Virgem
                <br />
                <span className="text-xs text-gray-400">(kg)</span>
              </th>
              <th className="px-4 py-2 text-center">
                PE Virgem
                <br />
                <span className="text-xs text-gray-400">(kg)</span>
              </th>
              <th className="px-4 py-2 text-center">
                PEAD Virgem
                <br />
                <span className="text-xs text-gray-400">(kg)</span>
              </th>
              <th className="px-4 py-2 text-center">
                Master
                <br />
                <span className="text-xs text-gray-400">(kg)</span>
              </th>
              <th className="px-4 py-2 text-center">
                PP Reciclado
                <br />
                <span className="text-xs text-gray-400">(kg)</span>
              </th>
              <th className="px-4 py-2 text-center">
                Garras metálicas
                <br />
                <span className="text-xs text-gray-400">(mg)</span>
              </th>
              <th className="px-4 py-2 text-center">
                Suporte de aço
                <br />
                <span className="text-xs text-gray-400">(mg)</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((item) => (
              <tr key={item.id} className="border">
                <td className="px-4 py-2">
                  <select
                    disabled
                    className="w-full border rounded p-1 disabled:border disabled:border-gray-200 disabled:text-gray-500"
                    defaultValue={item.produto}
                  >
                    <option defaultChecked>{item.produto}</option>
                  </select>
                </td>
                <td className="px-4 py-2 text-center">
                  <input
                    className="w-16 h-14 border rounded text-center"
                    type="number"
                    defaultValue={item.ppvirgem}
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <input
                    className="w-16 h-14 border rounded text-center"
                    type="number"
                    defaultValue={item.pevirgem}
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <input
                    className="w-16 h-14 border rounded text-center"
                    type="number"
                    defaultValue={item.peadvirgem}
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <input
                    className="w-16 h-14 border rounded text-center"
                    type="number"
                    defaultValue={item.master}
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <input
                    className="w-16 h-14 border rounded text-center"
                    type="number"
                    defaultValue={item.ppreciclado}
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <input
                    className="w-16 h-14 border rounded text-center"
                    type="number"
                    defaultValue={item.garrasmetalicas}
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <input
                    className="w-16 h-14 border rounded text-center"
                    type="number"
                    defaultValue={item.suporteaco}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-end mt-4">
        <button
          onClick={() => {}}
          className="cursor-pointer text-sm md:text-base inline-flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Cadastrar
        </button>
      </div>
    </div>
  );
}

export default ComposicaoTable;
