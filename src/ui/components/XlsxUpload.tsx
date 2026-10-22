import axios from "axios";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { BiUpload } from "react-icons/bi";
import { BsFiletypeXlsx } from "react-icons/bs";
import { toast } from "react-toastify";
import { apiClient } from "../../utils/apiClient";
import { cn } from "../../utils/cn";
import Button from "./Button";

interface XlsxUploadProps {
  endpoint: string;
  onRevalidate?: () => void;
  mainDivClassName?: string;
  uploaderContainerClassName?: string;
  onClose?: () => void;
  hint?: string;
}

function XlsxUpload({
  endpoint,
  onRevalidate,
  mainDivClassName,
  uploaderContainerClassName,
  onClose,
  hint,
}: XlsxUploadProps) {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
    multiple: false,
  });

  const onUpload = async () => {
    const { data } = await apiClient.postForm(`/upload/${endpoint}`, {
      file: acceptedFiles[0],
    });
    const erros = Array.isArray(data?.erros)
      ? data.erros.filter((item: unknown) => typeof item === "string" && item.trim())
      : [];
    if (onRevalidate && (erros.length === 0 || Number(data?.jobs_criados) > 0)) {
      onRevalidate();
    }
    if (erros.length > 0) {
      const extra = erros.length > 1 ? ` (+${erros.length - 1} linha(s))` : "";
      const message = `${erros[0]}${extra}`;
      toast.error(message.length > 280 ? `${message.slice(0, 277)}...` : message);
    } else {
      toast.success("Arquivo enviado com sucesso!");
    }
    if (onClose && erros.length === 0) {
      onClose();
    }
  };

  const handleUpload = async () => {
    try {
      setIsUploading(true);
      await onUpload();
    } catch (error) {
      console.log(error);
      const detail = axios.isAxiosError(error) ? error.response?.data?.detail : null;
      const message = typeof detail === "string" && detail.trim() ? detail : "";
      toast.error(
        message
          ? message.length > 280
            ? `${message.slice(0, 277)}...`
            : message
          : "Erro ao enviar o arquivo. Tente novamente.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className={cn(
        "col-span-2 p-6 rounded-md shadow h-[250px] lg:h-[200px] bg-white",
        mainDivClassName,
      )}
    >
      <span className="flex gap-2 items-center text-[#255DC8]">
        <BsFiletypeXlsx />
        <p className="text-base font-bold text-[#255DC8]">Cadastrar XLSX</p>
      </span>

      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 mt-4">
        <div
          {...getRootProps({ className: "dropzone" })}
          className={cn(
            "w-full lg:w-1/2 flex items-center justify-center border-2 border-dashed border-gray-400 h-[81px]",
            uploaderContainerClassName,
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-wrap gap-2 justify-center items-center">
            <p className="hidden lg:block">
              Arraste e solte seu arquivo XLSX para cá ou{" "}
            </p>
            <span className="text-base px-2 py-1 lg:px-4 lg:py-1 border-2 rounded-full border-[#10A4DA] text-[#10A4DA] font-bold cursor-pointer">
              Escolha o arquivo <BiUpload className="inline" size={22} />
            </span>
          </div>
        </div>
        <Button
          isLoading={isUploading}
          disable={isUploading || !acceptedFiles[0]}
          onClick={handleUpload}
          title="Continuar"
          type="button"
          className="self-start md:self-auto h-fit text-xs md:text-base"
        />
      </div>
      {hint ? (
        <p className="mt-3 max-w-3xl whitespace-normal text-xs leading-5 text-gray-600 md:text-sm">
          {hint}
        </p>
      ) : null}
      <p className="mt-4 text-xs md:text-sm text-[#929191]">
        Apenas arquivos XLSX são aceitos
      </p>
    </div>
  );
}

export default XlsxUpload;
