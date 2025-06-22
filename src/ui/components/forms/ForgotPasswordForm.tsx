import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { forgotPasswordSchema, type ForgotPasswordBody } from "../../../schemas/auth";
import Button from "../Button";
import FormErrorMessage from "./FormErrorMessage";

export default function ForgotPasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ForgotPasswordBody>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    try {
      console.log(data);
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
            Reset a sua senha
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
            <div className="w-full flex flex-col-reverse lg:flex-row justify-between items-center gap-2 lg:gap-7">
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
