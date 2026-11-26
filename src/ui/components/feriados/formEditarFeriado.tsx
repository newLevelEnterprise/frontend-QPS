import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  NIVEIS_FERIADO,
  editarFeriadoSchema,
  type IEditarFeriadoBody,
} from "../../../schemas/feriado";
import { apiClient } from "../../../utils/apiClient";

interface EditarFeriadoFormProps {
  initialData: IEditarFeriadoBody;
  onSubmit: (data: IEditarFeriadoBody) => void;
  onCancel: () => void;
  variant?: "stack" | "inline";
  submitLabel?: string;
  showDelete?: boolean;
}

function EditarFeriadoForm({
  initialData,
  onSubmit,
  onCancel,
  variant = "stack",
  submitLabel,
  showDelete = true,
}: EditarFeriadoFormProps) {
  const inline = variant === "inline";
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
  const inputClass = inline
    ? "w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm"
    : "mt-1 w-full rounded border px-2 py-1";

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/holidays/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "all", "feriados"] });
      onCancel();
    },
  });

  const nameField = (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">Nome</label>
      <input
        type="text"
        maxLength={120}
        placeholder={inline ? "Nome do feriado" : undefined}
        {...register("name")}
        className={inputClass}
      />
      {errors.name && (
        <span className="text-xs text-red-500">{errors.name.message}</span>
      )}
    </div>
  );
  const dateField = (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {inline ? "Data" : "Dia"}
      </label>
      <input
        type={inline ? "date" : "text"}
        {...register("date")}
        className={inputClass}
      />
      {errors.date && (
        <span className="text-xs text-red-500">{errors.date.message}</span>
      )}
    </div>
  );
  const levelField = (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {inline ? "Nível / tipo" : "Tipo"}
      </label>
      <select {...register("level")} className={inputClass}>
        <option value="">Selecione</option>
        {NIVEIS_FERIADO.map((nivel) => (
          <option key={nivel} value={nivel}>
            {nivel}
          </option>
        ))}
      </select>
      {errors.level && (
        <span className="text-xs text-red-500">{errors.level.message}</span>
      )}
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={inline ? "" : "flex min-w-[260px] flex-col gap-4 p-2"}
    >
      <div
        className={
          inline
            ? "grid grid-cols-1 gap-3 md:grid-cols-[2fr_1fr_1fr]"
            : "flex flex-col gap-4"
        }
      >
        {inline ? (
          <>
            {nameField}
            {dateField}
            {levelField}
          </>
        ) : (
          <>
            {dateField}
            {nameField}
            {levelField}
          </>
        )}
      </div>
      {inline ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={isSubmitting || !isValid || !isDirty || isPending}
            className="cursor-pointer rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {submitLabel || "Salvar alterações"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-blue-600"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <div className="mt-2 flex justify-between gap-2">
          {showDelete ? (
            <button
              disabled={isPending}
              type="button"
              onClick={() => mutateAsync(initialData.id)}
              className="cursor-pointer rounded bg-red-200 px-3 py-1 text-red-700 hover:bg-red-300"
            >
              {isPending ? "Excluindo..." : "Excluir"}
            </button>
          ) : (
            <span />
          )}
          <div>
            <button
              disabled={isPending}
              type="button"
              onClick={onCancel}
              className="cursor-pointer rounded bg-gray-200 px-3 py-1 text-gray-700 hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isValid || !isDirty || isPending}
              className="cursor-pointer rounded bg-blue-600 px-3 py-1 font-semibold text-white hover:bg-blue-700 disabled:bg-blue-400"
            >
              {submitLabel || "Salvar"}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}

export default EditarFeriadoForm;
