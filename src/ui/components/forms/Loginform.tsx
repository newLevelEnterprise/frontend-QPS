import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { setToken } from "../../../hooks/setToken";
import { signinSchema, type SignInBody } from "../../../schemas/auth";
import { apiClient } from "../../../utils/apiClient";
import Button from "../Button";
import FormErrorMessage from "./FormErrorMessage";

export default function LoginForm() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInBody>({
    resolver: zodResolver(signinSchema),
    mode: "onChange",
  });

  const onSubmit = async (data_form: SignInBody) => {
    try {
      const params = new URLSearchParams();
      params.append("username", data_form.email);
      params.append("password", data_form.password);

      const { data } = await apiClient.post<{
        access_token: string;
        refresh_token: string;
        user: { id: number; email: string; enterprise_id: number };
      }>("/auth/login", params.toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      if (!data?.access_token) {
        toast.error("Erro ao fazer login, verifique suas credenciais.");
        return;
      }

      setToken({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });
      localStorage.setItem("enterprise_id", String(data.user.enterprise_id));
      localStorage.setItem("user_id", String(data.user.id));

      toast.success("Login realizado com sucesso!");
      navigate("/cadastro/cliente");
    } catch (error: unknown) {
      console.error(error);
      const detail =
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "detail" in error.response.data
          ? String((error.response.data as { detail: unknown }).detail)
          : "Erro ao fazer login, verifique suas credenciais.";
      toast.error(detail);
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
          >
            <div className="w-full flex flex-col gap-3">
              <label htmlFor="email" className="text-[#212A4F] font-semibold">
                Email
              </label>
              <input
                id="email"
                placeholder="teste@teste.com"
                type="text"
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
                disable={isSubmitting}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
