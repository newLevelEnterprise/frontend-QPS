import { Link, useSearchParams } from "react-router-dom";
import ResetPaswordForm from "../components/forms/ResetPasswordForm";

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  if (!token) {
    return (
      <div className="w-1/2 h-full flex flex-col gap-2 justify-center items-center">
        <p className="text-xl md:text-3xl">Link Inválido</p>
        <Link to={"/forgot-password"} className="mt-4 bg-gray-100 rounded-md px-4 py-2 hover:bg-gray-200 transition-all duration-150">
          Solicitar um novo reset
        </Link>
      </div>
    );
  }

  return (
    <div className="w-1/2 h-full flex justify-center items-center">
      <ResetPaswordForm token={token}/>
    </div>
  );
}

export default ResetPasswordPage;
