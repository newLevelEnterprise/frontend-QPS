import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  editarFeriadoSchema,
  type IEditarFeriadoBody,
} from "../../../schemas/feriado";

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
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = useForm<IEditarFeriadoBody>({
    resolver: zodResolver(editarFeriadoSchema),
    defaultValues: initialData,
    mode: "onChange",
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
        <label className="block text-sm font-medium text-gray-700">Tipo</label>
        <input
          type="text"
          {...register("level")}
          className="w-full border rounded px-2 py-1 mt-1"
        />
        {errors.level && (
          <span className="text-xs text-red-500">{errors.level.message}</span>
        )}
      </div>
      <div className="flex gap-2 justify-end mt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !isValid || !isDirty}
          className="px-3 py-1 rounded disabled:bg-blue-400 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
        >
          Salvar
        </button>
      </div>
    </form>
  );
}

export default EditarFeriadoForm;
