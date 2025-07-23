import { useState } from "react";
import { IoIosMenu } from "react-icons/io";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { twMerge } from "tailwind-merge";
import Sidebar from "../components/sidebar";

function PageLayout() {
  const [mobileSidebar, setMobileSidebar] = useState<boolean>(false);

  const handleMobileSidebar = () => setMobileSidebar((prev) => !prev);

  return (
    <div className="h-full flex flex-col md:flex-row font-[family-name:var(--font-red-hat)] overflow-y-auto lg:overflow-hidden">
      <ToastContainer limit={1} pauseOnHover={false} pauseOnFocusLoss={false} position="top-center" />
      <Sidebar
          mobileSidebar={mobileSidebar}
          onMobileSidebar={handleMobileSidebar}
        />
      <div className="flex-1 bg-[#D4D4D4] relative overflow-y-auto lg:overflow-hidden">
        <button
          onClick={handleMobileSidebar}
          className={twMerge("md:hidden bg-gray-50 p-2 rounded-md hover:bg-gray-100 transition-colors absolute top-2 left-2 z-10", mobileSidebar && 'hidden')}
        >
          <IoIosMenu size={22} />
        </button>

        <div className="mt-12 md:mt-0 p-2 md:p-4 h-full overflow-y-auto lg:overflow-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default PageLayout;
