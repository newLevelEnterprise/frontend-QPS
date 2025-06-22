import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signupSchema, type SignUpBody } from "../../../schemas/auth";
import Button from "../Button";
import Radio from "../Radio";
import FormErrorMessage from "./FormErrorMessage";

export default function SignUpForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid},
  } = useForm<SignUpBody>({
    resolver: zodResolver(signupSchema),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    console.log("Form data submitted:", data);
  };

  return (
    <div className="flex-1 mt-6 lg:mt-0">
      <div className="h-full flex justify-center items-center">
        <div className="w-full px-10 lg:p-0 lg:w-1/2">
          <h1 className="text-2xl lg:text-3xl text-[#47506F] mb-4">
            Criar uma conta
          </h1>
          <form className="flex flex-col gap-8 mb-2" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className='w-full flex flex-col gap-3'>
              <label htmlFor="name" className="text-[#212A4F] font-semibold">Nome</label>
              <input id="name" type="text" className="w-full outline-none border-b border-[#A4AABC]" {...register("name")} />
              {errors.name && <ErrorMessage 
                name="name"
                errors={errors}
                render={({ message }) => <FormErrorMessage message={message!} />}
              />}
            </div>
            <div className='w-full flex flex-col gap-3'>
              <label htmlFor="password" className="text-[#212A4F] font-semibold">Senha</label>
              <input id="password" type="password" className="w-full outline-none border-b border-[#A4AABC]" {...register("password")} />
              {errors.password &&  <ErrorMessage 
                name="password"
                errors={errors}
                render={({ message }) => <FormErrorMessage message={message!} />}
              />}
            </div>
            <div className='w-full flex flex-col gap-3'>
              <label htmlFor="email" className="text-[#212A4F] font-semibold">Email</label>
              <input id="email" type="email" className="w-full outline-none border-b border-[#A4AABC]" {...register("email")} />
              {errors.email &&  <ErrorMessage 
                name="email"
                errors={errors}
                render={({ message }) => <FormErrorMessage message={message!} />}
              />}
            </div>
            <div className='w-full flex flex-col gap-3'>
              <label htmlFor="token" className="text-[#212A4F] font-semibold">Token</label>
              <input id="token" type="text" className="w-full outline-none border-b border-[#A4AABC]" {...register("token")} />
              {errors.token &&  <ErrorMessage 
                name="token"
                errors={errors}
                render={({ message }) => <FormErrorMessage message={message!} />}
              />}
            </div>
            <div className='w-full flex flex-col gap-3'>
              <label htmlFor="cargo" className="text-[#212A4F] font-semibold">Cargo exercido</label>
              <input id="cargo" type="text" className="w-full outline-none border-b border-[#A4AABC]" {...register("cargo")} />
              {errors.cargo &&  <ErrorMessage 
                name="cargo"
                errors={errors}
                render={({ message }) => <FormErrorMessage message={message!} />}
              />}
            </div>
            <Radio>
              <input type="checkbox" id="termos-condicoes" className="mr-2" {...register("termos")} />
              <p className="text-sm lg:text-base">Li e aceitos os <a href="#" className="text-blue-400 underline">Termos e Condições</a></p>
            </Radio>
            <Radio>
              <input type="checkbox" id="politica-privacidade" className="mr-2" {...register("politica")} />
              <p className="text-sm lg:text-base">Concordo com a <a href="#" className="text-blue-400 underline">Política de Privacidade</a></p>
            </Radio>
            <Button title="Avançar" isLoading={isSubmitting} className="self-end w-1/2" type="submit" disable={isSubmitting || !isValid} />
          </form>
        </div>
      </div>
    </div>
  );
}
