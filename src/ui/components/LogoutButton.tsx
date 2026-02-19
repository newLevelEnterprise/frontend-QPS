import { BiLogOutCircle } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { setToken } from "../../hooks/setToken";
import { apiClient } from "../../utils/apiClient";

export default function LogoutButton() {
  const navigate = useNavigate();

  const logout = async () => {
    apiClient.post("/logout").catch((error) => {
      console.error("Logout API call failed:", error);
    });
    localStorage.removeItem("user_id");
    localStorage.removeItem("enterprise_id");
    setToken({ access_token: "", refresh_token: "" });
    return navigate("/login");
  };

  return (
    <button
      onClick={() => logout()}
      className="cursor-pointer w-full flex items-center gap-3 px-3 py-2 font-medium rounded-md transition-colors duration-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
    >
      <BiLogOutCircle className="w-6 h-6" />
      <span>Sair</span>
    </button>
  );
}
