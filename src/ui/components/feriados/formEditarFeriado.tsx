import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  editarFeriadoSchema,
  type IEditarFeriadoBody,
} from "../../../schemas/feriado";
import { apiClient } from "../../../utils/apiClient";

interface EditarFeriadoFormProps {
  initialData: IEditarFeriadoBody;
  onSubmit: (data: IEditarFeriadoBody) => void;
  onCancel: () => void;
}

function EditarFeriadoForm({
  initialData,
  onSubmit,
  onCancel,
}: EditarFeriadoFormProps) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = useForm<IEditarFeriadoBody>({
    resolver: zodResolver(editarFeriadoSchema),
    defaultValues: initialData,
    mode: "onChange",
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/holidays/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "all", "feriados"] });
      onCancel();
    },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 p-2 min-w-[260px]"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700">Dia</label>
        <input
          type="text"
          {...register("date")}
          className="w-full border rounded px-2 py-1 mt-1"
        />
        {errors.date && (
          <span className="text-xs text-red-500">{errors.date.message}</span>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Nome</label>
        <input
          type="text"
          {...register("name")}
          className="w-full border rounded px-2 py-1 mt-1"
        />
        {errors.name && (
          <span className="text-xs text-red-500">{errors.name.message}</span>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Cidade
        </label>
        <input
          type="text"
          {...register("city")}
          className="w-full border rounded px-2 py-1 mt-1"
        />
        {errors.city && (
          <span className="text-xs text-red-500">{errors.city.message}</span>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Estado
        </label>
        <input
          type="text"
          {...register("state")}
          className="w-full border rounded px-2 py-1 mt-1"
        />
        {errors.state && (
          <span className="text-xs text-red-500">{errors.state.message}</span>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Tipo</label>
        <select
          {...register("level")}
          className="w-full border rounded px-2 py-1 mt-1"
        >
          <option value="Nacional">Nacional</option>
          <option value="Municipal">Municipal</option>
          <option value="Estadual">Estadual</option>
        </select>
        {errors.level && (
          <span className="text-xs text-red-500">{errors.level.message}</span>
        )}
      </div>
      <div className="flex gap-2 justify-between mt-2">
        <button
          disabled={isPending}
          type="button"
          onClick={() => mutateAsync(initialData.id)}
          className="cursor-pointer px-3 py-1 rounded bg-red-200 hover:bg-red-300 text-red-700"
        >
          {isPending ? "Excluindo..." : "Excluir"}
        </button>
        <div>
          <button
            disabled={isPending}
            type="button"
            onClick={onCancel}
            className="cursor-pointer px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !isValid || !isDirty || isPending}
            className="cursor-pointer px-3 py-1 rounded disabled:bg-blue-400 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            Salvar
          </button>
        </div>
      </div>
    </form>
  );
}

export default EditarFeriadoForm;
