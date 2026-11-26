import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  NIVEIS_FERIADO,
  criarFeriadoSchema,
  type ICriarFeriadoBody,
} from "../../../schemas/feriado";

interface FormCadastrarFeriadoProps {
  onSubmit: (data: ICriarFeriadoBody) => void;
  onCancel: () => void;
  variant?: "stack" | "inline";
  submitLabel?: string;
}

function FormCadastrarFeriado({
  onSubmit,
  onCancel,
  variant = "stack",
  submitLabel,
}: FormCadastrarFeriadoProps) {
  const inline = variant === "inline";
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ICriarFeriadoBody>({
    resolver: zodResolver(criarFeriadoSchema),
    mode: "onChange",
    defaultValues: { name: "", date: "", level: "" },
  });
  const inputClass = inline
    ? "w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm"
    : "mt-1 w-full rounded border px-2 py-1";

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
      <input type="date" {...register("date")} className={inputClass} />
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
      <div
        className={
          inline ? "mt-3 flex flex-wrap gap-2" : "mt-2 flex justify-end gap-2"
        }
      >
        {inline ? (
          <>
            <button
              type="submit"
              disabled={isSubmitting || !isValid}
              className="cursor-pointer rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {submitLabel || "Salvar feriado"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-blue-600"
            >
              Cancelar
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onCancel}
              className="rounded bg-gray-200 px-3 py-1 text-gray-700 hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isValid}
              className="rounded bg-blue-600 px-3 py-1 font-semibold text-white hover:bg-blue-700 disabled:bg-blue-400"
            >
              {submitLabel || "Salvar"}
            </button>
          </>
        )}
      </div>
    </form>
  );
}

export default FormCadastrarFeriado;
