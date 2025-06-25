import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  criarPedidoSchema,
  type ICriarPedidoBody,
} from "../../../schemas/pedido";
import type { ICliente } from "../../../types/Cliente";
import type { IPedido } from "../../../types/Pedido";
import type { IProduto } from "../../../types/Produto";
import { apiClient } from "../../../utils/apiClient";
import Button from "../Button";
import FormErrorMessage from "../forms/FormErrorMessage";

interface FormNovoPedidoProps {
  setTodosPedidos: Dispatch<SetStateAction<IPedido[]>>;
  setNovoPedido: Dispatch<SetStateAction<boolean>>;
}

function FormNovoPedido({
  setNovoPedido,
}: FormNovoPedidoProps) {
  const [clients, setClients] = useState<ICliente[]>([]);
  const [products, setProducts] = useState<IProduto[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ICriarPedidoBody>({
    resolver: zodResolver(criarPedidoSchema),
  });

   
  const onSubmit = async (data: ICriarPedidoBody) => {
    try {
      await apiClient.post<IPedido>("/jobs/", {
        promised_date: data.promised_date,
        demand: parseInt(data.demand),
        product_value: parseInt(data.product_value),
        processed: true,
        
        fk_id_client: data.fk_id_client,
        fk_id_product: data.fk_id_product,
      });

      toast.success("Pedido criado com sucesso!");
      setNovoPedido(false);
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      toast.error("Erro ao criar pedido. Tente novamente.");
    }
  };

  useEffect(() => {
    async function getClientAndProducts() {
      try {
        const [clientsRes, productsRes] = await Promise.all([
          apiClient.get<ICliente[]>("/clients/"),
          apiClient.get<IProduto[]>("/products/"),
        ]);

        setClients(clientsRes.data);
        setProducts(productsRes.data);
      } catch (error) {
        console.log("Erro ao buscar os clientes", error);
        setProducts([]);
        setClients([]);
      }
    }

    getClientAndProducts();
  }, [setNovoPedido]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full flex flex-col gap-10 my-6 overflow-y-auto"
    >
      <div className="w-full flex flex-col gap-3">
        <label
          htmlFor="clientes"
          className="text-[#212A4F] font-semibold truncate text-ellipsis"
        >
          Cliente
        </label>
        <div className="flex gap-1">
          <select
            disabled={clients?.length === 0}
            id="clientes"
            className="w-full p-1 border border-gray-300 rounded-md"
            {...register('fk_id_client')}
          >
            <option defaultChecked value="">-</option>
            {
              clients?.map((client) =>  <option value={client.id} key={client.id}>{client.name}</option>)
            }
          </select>
        </div>
      </div>

      <div className="w-full flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="w-full flex flex-col gap-3">
          <label
            htmlFor="data-prometida"
            className="text-[#212A4F] font-semibold truncate text-ellipsis"
          >
            Data prometida
          </label>
          <div className="flex gap-1">
            <input
              id="data-prometida"
              placeholder="Data prometida"
              type="date"
              className="w-full outline-none border-b border-[#A4AABC]"
              {...register("promised_date")}
            />
          </div>
          {errors.promised_date && (
            <ErrorMessage
              errors={errors}
              name="promised_date"
              render={({ message }) => <FormErrorMessage message={message} />}
            />
          )}
        </div>

        <div className="w-full flex flex-col gap-3">
          <label
            htmlFor="horario-prometido"
            className="text-[#212A4F] font-semibold truncate text-ellipsis"
          >
            Horário Prometido
          </label>
          <div className="flex gap-1">
            <input
              id="horario-prometido"
              type="datetime-local"
              className="w-full outline-none border-b border-[#A4AABC]"
              {...register("promised_hour")}
            />
          </div>
          {errors.promised_hour && (
            <ErrorMessage
              errors={errors}
              name="promised_hour"
              render={({ message }) => <FormErrorMessage message={message} />}
            />
          )}
        </div>
      </div>

      <div className="w-full flex justify-between items-center gap-6">
        <div className="w-full flex flex-col gap-3">
          <label
            htmlFor="Prazo"
            className="text-[#212A4F] font-semibold truncate text-ellipsis"
          >
            Prazo
          </label>
          <div className="flex gap-1">
            <input
              id="Prazo"
              type="text"
              className="w-full outline-none border-b border-[#A4AABC]"
              {...register("deadline_days")}
            />
          </div>
          {errors.deadline_days && (
            <ErrorMessage
              errors={errors}
              name="deadline_days"
              render={({ message }) => <FormErrorMessage message={message} />}
            />
          )}
        </div>

        <div className="w-full flex flex-col gap-3">
          <label
            htmlFor="Produto"
            className="text-[#212A4F] font-semibold truncate text-ellipsis"
          >
            Nome do produto
          </label>
          <select
            disabled={products.length === 0}
            id="Produto"
            className="w-full p-1 border border-gray-300 rounded-md"
             {...register('fk_id_product')}
          >
            <option defaultChecked value="">-</option>
             {
              products?.map((product) =>  <option key={product.id} value={product.id}>{product.name}</option>)
            }
          </select>
        </div>
      </div>

      <div className="w-full flex justify-between items-center gap-6">
        <div className="w-full flex flex-col gap-3">
          <label
            htmlFor="ciclo"
            className="text-[#212A4F] font-semibold truncate text-ellipsis"
          >
            Ciclo
          </label>
          <div className="flex gap-1">
            <input
              id="ciclo"
              type="number"
              className="w-full outline-none border-b border-[#A4AABC]"
              {...register("cycle")}
            />
          </div>
          {errors.cycle && (
            <ErrorMessage
              errors={errors}
              name="cycle"
              render={({ message }) => <FormErrorMessage message={message} />}
            />
          )}
        </div>

        <div className="w-full flex flex-col gap-3">
          <label
            htmlFor="Demanda"
            className="text-[#212A4F] font-semibold truncate text-ellipsis"
          >
            Demanda
          </label>
          <div className="flex gap-1">
            <input
              id="Demanda"
              type="number"
              className="w-full outline-none border-b border-[#A4AABC]"
              {...register("demand")}
            />
          </div>
          {errors.demand && (
            <ErrorMessage
              errors={errors}
              name="demand"
              render={({ message }) => <FormErrorMessage message={message} />}
            />
          )}
        </div>

        <div className="w-full flex flex-col gap-3">
          <label
            htmlFor="Valor"
            className="text-[#212A4F] font-semibold truncate text-ellipsis"
          >
            Valor
          </label>
          <div className="flex gap-1">
            <input
              id="Valor"
              type="number"
              className="w-full outline-none border-b border-[#A4AABC]"
              {...register("product_value")}
            />
          </div>
          {errors.product_value && (
            <ErrorMessage
              errors={errors}
              name="product_value"
              render={({ message }) => <FormErrorMessage message={message} />}
            />
          )}
        </div>
      </div>

      <div className="w-full flex justify-end">
        <Button
          title="Ok"
          disable={isSubmitting || !isValid}
          isLoading={isSubmitting}
          type="submit"
        />
      </div>
    </form>
  );
}

export default FormNovoPedido;
