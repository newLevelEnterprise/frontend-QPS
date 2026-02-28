import { BrowserRouter, Route, Routes } from "react-router-dom";
import AuthLayout from "../ui/layouts/AuthLayout";
import PageLayout from "../ui/layouts/PageLayout";
import CadastroPage from "../ui/pages/cadastro";
import ClientesPages from "../ui/pages/clientes";
import Composicao from "../ui/pages/composicao";
import FeriadosPage from "../ui/pages/feriados";
import ForgotPasswordPage from "../ui/pages/ForgotPassword";
import HistoryPage from "../ui/pages/historyPage";
import ItensCompraPage from "../ui/pages/itensCompra";
import LinhaProducaoPage from "../ui/pages/linha-producao";
import LoginPage from "../ui/pages/LoginPage";
import MaquinaPages from "../ui/pages/maquina";
import MaquinasPages from "../ui/pages/maquinas";
import InsumosPage from "../ui/pages/materiaPrima";
import MoldesPage from "../ui/pages/moldes";
import ProdutosPage from "../ui/pages/produto";
import ResetPasswordPage from "../ui/pages/ResetPassword";
import Sequenciamento from "../ui/pages/Sequenciamento";
import SignUpPage from "../ui/pages/SignUpPage";
import TurnosRegularesPage from "../ui/pages/turnosregulares";
import AuthGuard from "./AuthGuard";

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthGuard />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/resetar" element={<ResetPasswordPage />} />
          </Route>
        </Route>

        <Route element={<AuthGuard isPrivate />}>
          <Route element={<PageLayout />}>
            <Route path="/sequenciamento" element={<Sequenciamento />} />

            <Route path="/resultados" element={<CadastroPage />} />
            <Route path="/cadastro/cliente" element={<ClientesPages />} />
            <Route path="/cadastro/maquinas" element={<MaquinasPages />} />
            <Route path="/cadastro/produto" element={<ProdutosPage />} />
            <Route path="/cadastro/moldes" element={<MoldesPage />} />
            <Route
              path="/cadastro/linhas-producao"
              element={<LinhaProducaoPage />}
            />
            <Route path="/historico" element={<HistoryPage />} />

            <Route
              path="/linhas-producao/:maquinaId"
              element={<MaquinaPages />}
            />
            <Route path="/insumos/materia-prima" element={<InsumosPage />} />
            <Route path="/insumos/itens-compra" element={<ItensCompraPage />} />
            <Route path="/composicao" element={<Composicao />} />
            <Route path="/turnos-regulares" element={<TurnosRegularesPage />} />
            <Route path="/feriados" element={<FeriadosPage />} />

            <Route
              path="/*"
              element={<div className="">Nada encontrado</div>}
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
