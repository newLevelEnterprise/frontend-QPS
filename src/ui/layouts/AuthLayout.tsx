import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import QuantLogoLg from "../../assets/quant-partners-logo-lg.png";
import QuantLogoMobile from "../../assets/quant-partners-logo-mobile.png";

function AuthLayout() {
  return (
    <div className="h-full flex flex-col lg:flex-row font-[family-name:var(--font-red-hat)]">
      <ToastContainer />
      <div className="hidden flex-col lg:flex justify-center items-center w-1/2 rounded-tr-[70px] rounded-br-[70px] bg-linear-to-b from-[#1C1D31] to-[#335C9F]">
        <img
          src={QuantLogoLg}
          alt="Logo Quant Partners Grande"
          width={600}
          height={400}
        />
        <p className="text-center text-white">
          <span className="block">Sistema de Inteligência Artificial</span>
          Planejamento de Sequenciamento da Produção – QPS-1
        </p>
      </div>
      <div className="flex flex-col lg:hidden justify-center items-center w-full rounded-br-[70px] rounded-bl-[70px] bg-linear-to-b from-[#1C1D31] to-[#335C9F]">
        <img
          src={QuantLogoMobile}
          alt="Logo Quant Partners Grande"
          width={250}
          height={100}
        />

        <p className="text-xs text-center text-white">
          <span className="block">Sistema de Inteligência Artificial</span>
          Planejamento de Sequenciamento da Produção – QPS-1
        </p>
      </div>
      <Outlet />
    </div>
  );
}

export default AuthLayout;
