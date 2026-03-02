import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { setToken } from "../../../hooks/setToken";
import { useAuth } from "../../../hooks/useAuth";
import { signinSchema, type SignInBody } from "../../../schemas/auth";
import { apiClient } from "../../../utils/apiClient";
import Button from "../Button";
import FormErrorMessage from "./FormErrorMessage";

export default function LoginForm() {
  const { setEnterpriseId, setUserIdFn } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SignInBody>({
    resolver: zodResolver(signinSchema),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    try {
      const payloadData: Record<string, string> = {
        username: data.email,
        password: data.password,
      };

      const params = new URLSearchParams();
      Object.keys(payloadData).forEach((key) => {
        params.append(key, payloadData[key]);
      });
      const { data: res } = await apiClient.post<{
        access_token: string;
        refresh_token: string;
        user: { id: number; email: string; enterprise_id: number };
      }>("/auth/login", params.toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      setToken({
        access_token: res.access_token,
        refresh_token: res.refresh_token,
      });
      setEnterpriseId(res.user.enterprise_id);
      setUserIdFn(res.user.id);
      return navigate("/cadastro/cliente");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao fazer login, verifique suas credenciais.");
    }
  };

  return (
    <div className="flex-1 mt-6 lg:mt-0">
      <div className="h-full flex justify-center items-center">
        <div className="w-full px-10 lg:p-0 lg:w-1/2">
          <h1 className="text-2xl lg:text-3xl text-[#47506F] mb-4">
            Acesse sua conta
          </h1>
          <form
            className="flex flex-col gap-8"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <div className="w-full flex flex-col gap-3">
              <label htmlFor="email" className="text-[#212A4F] font-semibold">
                Email
              </label>
              <input
                id="email"
                placeholder="email@example.com"
                type="email"
                className="w-full outline-none border-b border-[#A4AABC]"
                {...register("email")}
                autoComplete="email"
              />
              {errors.email && (
                <ErrorMessage
                  errors={errors}
                  name="email"
                  render={({ message }) => (
                    <FormErrorMessage message={message} />
                  )}
                />
              )}
            </div>
            <div className="w-full flex flex-col gap-3">
              <label
                htmlFor="password"
                className="text-[#212A4F] font-semibold"
              >
                Senha
              </label>
              <input
                id="password"
                placeholder="*********"
                type="password"
                className="w-full outline-none border-b border-[#A4AABC]"
                {...register("password")}
                autoComplete="current-password"
              />
              {errors.password && (
                <ErrorMessage
                  errors={errors}
                  name="password"
                  render={({ message }) => (
                    <FormErrorMessage message={message} />
                  )}
                />
              )}
              <span className="self-end flex gap-1 text-xs">
                Esqueceu sua senha ?{" "}
                <Link to="/forgot-password" className="text-blue-300 underline">
                  Clique aqui
                </Link>
              </span>
            </div>
            <div className="w-full flex flex-col-reverse lg:flex-row justify-between items-center gap-2 lg:gap-7">
              <Link
                to="/signup"
                className="w-full lg:flex-1 bg-white text-[#255DC8] font-bold py-3 px-4 rounded-full border border-gray-300 text-center hover:bg-gray-50 transition-colors"
              >
                Criar um conta
              </Link>
              <Button
                title="Entrar"
                isLoading={isSubmitting}
                className="w-full flex items-center justify-center lg:flex-1"
                type="submit"
                disable={isSubmitting || !isValid}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
