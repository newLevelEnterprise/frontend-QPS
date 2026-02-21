import type React from "react";
import { useEffect, useState } from "react";
import { BiPlus, BiUserCircle } from "react-icons/bi";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { IoChevronDown, IoClose } from "react-icons/io5";
import { LuSpline } from "react-icons/lu";
import {
  MdCalendarMonth,
  MdGradient,
  MdMenuBook,
  MdMessage,
  MdOutlineHistory,
  MdOutlinePrecisionManufacturing,
  MdOutlineTimeline,
  MdOutlineViewComfyAlt,
  MdSupervisedUserCircle,
} from "react-icons/md";
import { RiFileList3Line } from "react-icons/ri";
import { Link, useLocation } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import LogoSidebar from "../../assets/sidebar-logo.png";
import { useAuth } from "../../hooks/useAuth";
import { apiClient } from "../../utils/apiClient";
import LogoutButton from "./LogoutButton";

interface MenuItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  url: string;
  items?: SubMenuItem[];
}

interface SubMenuItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  url: string;
}

const menuItems: MenuItem[] = [
  {
    title: "Cadastros",
    icon: (props) => (
      <div className="border border-gray-900 flex justify-center items-center rounded-full p-1">
        <BiPlus className={props.className} />
      </div>
    ),
    url: "",
    items: [
      {
        title: "Clientes",
        icon: MdSupervisedUserCircle,
        url: "/cadastro/cliente",
      },
      {
        title: "Produto",
        icon: RiFileList3Line,
        url: "/cadastro/produto",
      },
      {
        title: "Máquinas",
        icon: MdOutlinePrecisionManufacturing,
        url: "/cadastro/maquinas",
      },
    ],
  },
  {
    title: "Linhas de Produção",
    icon: (props) => (
      <div className="border border-gray-900 flex justify-center items-center rounded-full p-1">
        <LuSpline className={props.className} />
      </div>
    ),
    url: "/linhas-producao",
  },
  {
    title: "Insumos",
    icon: (props) => (
      <div className="border border-gray-900 flex justify-center items-center rounded-full p-1">
        <MdOutlineViewComfyAlt className={props.className} />
      </div>
    ),
    url: "/insumos",
  },
  {
    title: "Composição",
    icon: (props) => (
      <div className="border border-gray-900 flex justify-center items-center rounded-full p-1">
        <MdGradient className={props.className} />
      </div>
    ),
    url: "/composicao",
  },
  {
    title: "Turnos Regulares",
    icon: (props) => (
      <div className="border border-gray-900 flex justify-center items-center rounded-full p-1">
        <MdOutlineHistory className={props.className} />
      </div>
    ),
    url: "/turnos-regulares",
  },
  {
    title: "Feriados",
    icon: (props) => (
      <div className="border border-gray-900 flex justify-center items-center rounded-full p-1">
        <MdCalendarMonth className={props.className} />
      </div>
    ),
    url: "/feriados",
  },
  {
    title: "Resultados",
    icon: (props) => (
      <div className="border border-gray-900 flex justify-center items-center rounded-full p-1">
        <IoMdCheckmarkCircleOutline className={props.className} />
      </div>
    ),
    url: "/resultados",
  },
  {
    title: "Sequenciamento",
    icon: (props) => (
      <div className="border border-gray-900 flex justify-center items-center rounded-full p-1">
        <MdOutlineTimeline className={props.className} />
      </div>
    ),
    url: "/sequenciamento",
  },
  {
    title: "Histórico",
    icon: (props) => (
      <div className="border border-gray-900 flex justify-center items-center rounded-full p-1">
        <MdMenuBook className={props.className} />
      </div>
    ),
    url: "/historico",
  },
];

const isActive = (url: string, pathName: string) => url === pathName;

interface SidebarProps {
  onMobileSidebar: () => void;
  mobileSidebar: boolean;
}

export default function Sidebar({
  mobileSidebar,
  onMobileSidebar,
}: SidebarProps) {
  const { enterprise_id } = useAuth();

  const [enterpriseName, setEnterpriseName] = useState<string>("");
  const [expandedItems, setExpandedItems] = useState<string[]>(["Cadastro"]);
  const pathName = useLocation().pathname;

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title],
    );
  };

  useEffect(() => {
    const machines = [
      {
        title: "Linhas 1",
        icon: LuSpline,
        url: "/linhas-producao/linhas-1",
      },
      {
        title: "Linhas 2",
        icon: LuSpline,
        url: "/linhas-producao/linhas-2",
      },
    ];
    menuItems[1].items = machines;
    apiClient
      .get(`/enterprises/${enterprise_id}/`)
      .then((res) => setEnterpriseName(res.data.name))
      .catch((err) => {
        console.log(err);
        setEnterpriseName("");
      });
  }, []);

  return (
    <div
      className={twMerge(
        "fixed md:relative bg-black/70 md:z-0 md:bg-transparent z-10 md:w-fit w-full transition-all duration-200",
        !mobileSidebar && "w-0 hidden md:flex",
      )}
    >
      <div className="w-3/4 md:w-56 h-screen bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="flex h-14 w-14 relative">
                <img
                  src={LogoSidebar}
                  alt="Sidebar Image"
                  className="object-cover rounded-md"
                />
              </div>
              <button
                onClick={onMobileSidebar}
                className="md:hidden bg-gray-200 p-1 rounded-md hover:bg-gray-100 transition-all duration-150"
              >
                <IoClose size={22} />
              </button>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-[#212A4F] truncate text-ellipsis">
                {/* {data?.empresa} */}
                {enterpriseName}
              </span>
              <span className="text-sm text-[#878C9B] truncate text-ellipsis">
                Conta ID: {enterprise_id}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.title}>
                {item.items ? (
                  <div>
                    <div
                      className={`w-full flex items-center justify-between px-3 py-2 font-bold rounded-md hover:bg-gray-100 transition-colors duration-200 ${
                        isActive(item.url, pathName)
                          ? "text-blue-700"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="size-5" />
                        <span>{item.title}</span>
                      </div>
                      <IoChevronDown
                        onClick={() => toggleExpanded(item.title)}
                        className={`size-4 transition-transform duration-200 ${
                          expandedItems.includes(item.title) ? "rotate-180" : ""
                        }`}
                      />
                    </div>

                    <div
                      className={`
                      overflow-hidden transition-all duration-200 ease-in-out
                      ${
                        expandedItems.includes(item.title)
                          ? "max-h-96 opacity-100"
                          : "max-h-0 opacity-0"
                      }
                    `}
                    >
                      <ul className="ml-6 mt-1 space-y-1 border-l border-gray-200 pl-4">
                        {item.items.map((subItem) => (
                          <li key={subItem.title}>
                            <Link
                              to={subItem.url}
                              className={`
                    flex items-center gap-3 px-3 py-2 font-medium rounded-md transition-colors duration-200
                    ${
                      isActive(subItem.url, pathName)
                        ? "text-blue-700"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }
                  `}
                            >
                              <subItem.icon className="size-5" />
                              <span>{subItem.title}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : item.title === "divider" ? (
                  <div className="w-full my-10 mx-auto h-[1px] bg-[#D4D4D4]" />
                ) : (
                  <Link
                    to={item.url}
                    className={`
                    flex items-center gap-3 px-3 py-2 font-medium rounded-md transition-colors duration-200
                    ${
                      isActive(item.url, pathName)
                        ? "text-blue-700"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }
                  `}
                  >
                    <item.icon
                      className={`size-5 ${
                        isActive(item.url, pathName) ? "text-blue-700" : ""
                      }`}
                    />
                    <span>{item.title}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <footer className="border-t border-gray-200 p-4 flex flex-col gap-2 mt-auto">
          <Link
            to="/perfil"
            className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-gray-100 transition-colors text-gray-700"
          >
            <BiUserCircle className="size-6" />
            <span>Seu Perfil</span>
          </Link>
          <Link
            to="/atendimento"
            className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-gray-100 transition-colors text-gray-700"
          >
            <MdMessage className="size-6" />
            <span>Atendimento</span>
          </Link>
          <LogoutButton />
        </footer>
      </div>
    </div>
  );
}
