import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { resetPasswordSchema, type ResetPasswordBody } from "../../../schemas/auth";
import { apiClient } from "../../../utils/apiClient";
import Button from "../Button";
import FormErrorMessage from "./FormErrorMessage";

interface ResetPaswordFormProps {
  token: string;

}

export default function ResetPaswordForm({token}: ResetPaswordFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ResetPasswordBody>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    try {
      await apiClient.post('/password-reset/request', {new_password: data.password, token });
      toast.success('Reset de senha solicitado. Verifique seu email.');
    } catch (error) {
      console.error(error);
      toast.error("Erro requisitar o RESET da sua senha.");
    }
  };

  return (
    <div className="flex-1 mt-6 lg:mt-0">
      <div className="h-full flex justify-center items-center">
        <div className="w-full px-10 lg:p-0 lg:w-1/2">
          <h1 className="text-2xl lg:text-3xl text-[#47506F] mb-4">
            Crie uma nova senha
          </h1>
          <form
            className="flex flex-col gap-8"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <div className="w-full flex flex-col gap-3">
              <label htmlFor="password" className="text-[#212A4F] font-semibold">
                Nova Senha
              </label>
              <input
                id="password"
                placeholder="********"
                type="password"
                className="w-full outline-none border-b border-[#A4AABC]"
                {...register("password")}
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
            </div>
            <div className="w-full flex flex-col-reverse lg:flex-row justify-between items-center gap-2 lg:gap-7">
              <Button
                title="Resetar senha"
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
