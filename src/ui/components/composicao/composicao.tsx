import { useState } from "react";
import type { IComposicao } from "../../../types/Composicao";

function ComposicaoTable() {
  const [composicao, setComposicao] = useState<IComposicao>({
    id: 0,
    produto: "",
    garrasmetalicas: 0,
    suporteaco: 0,
    master: 0,
    peadvirgem: 0,
    pevirgem: 0,
    ppvirgem: 0,
    ppreciclado: 0,
  });
  console.log(composicao);
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
            {/* Exemplo de linhas, pode ser substituído por map futuramente */}
            <tr>
              <td className="px-4 py-2">
                <select className="w-full border rounded p-1">
                  <option>Pote Turim Verde</option>
                  <option>Pote Turim Azul</option>
                  <option>Tampa Turim</option>
                  <option>Frasco Barcelona</option>
                  <option>Frasco Roll-on</option>
                  <option>Tampa FlipTop</option>
                </select>
              </td>
              <td className="px-4 py-2 text-center">
                <input
                  className="w-16 h-14 border rounded text-center"
                  type="number"
                />
              </td>
              <td className="px-4 py-2 text-center">
                <input
                  className="w-16 h-14 border rounded text-center"
                  type="number"
                />
              </td>
              <td className="px-4 py-2 text-center">
                <input
                  className="w-16 h-14 border rounded text-center"
                  type="number"
                />
              </td>
              <td className="px-4 py-2 text-center">
                <input
                  className="w-16 h-14 border rounded text-center"
                  type="number"
                />
              </td>
              <td className="px-4 py-2 text-center">
                <input
                  className="w-16 h-14 border rounded text-center"
                  type="number"
                />
              </td>
              <td className="px-4 py-2 text-center">
                <input
                  className="w-16 h-14 border rounded text-center"
                  type="number"
                />
              </td>
              <td className="px-4 py-2 text-center">
                <input
                  className="w-16 h-14 border rounded text-center"
                  type="number"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-end mt-4">
        <button
          onClick={() => {
            setComposicao({
              id: 0,
              produto: "",
              garrasmetalicas: 0,
              suporteaco: 0,
              master: 0,
              peadvirgem: 0,
              pevirgem: 0,
              ppvirgem: 0,
              ppreciclado: 0,
            });
          }}
          className="cursor-pointer text-sm md:text-base inline-flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Prosseguir
        </button>
      </div>
    </div>
  );
}

export default ComposicaoTable;
