import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { BiUpload } from "react-icons/bi";
import { BsFiletypeXlsx } from "react-icons/bs";
import { toast } from "react-toastify";
import { apiClient } from "../../utils/apiClient";
import Button from "./Button";

function XlsxUpload({ endpoint }: { endpoint: string }) {
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
    await apiClient.postForm(`/upload/${endpoint}`, {
      file: acceptedFiles[0],
    });
  };

  const handleUpload = async () => {
    try {
      setIsUploading(true);
      await onUpload();
      toast.success("Arquivo enviado com sucesso!");
    } catch (error) {
      console.log(error);
      toast.error("Erro ao enviar o arquivo. Tente novamente.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="col-span-2 p-6 rounded-md shadow h-[250px] md:h-[200px] bg-white">
      <span className="flex gap-2 items-center text-[#255DC8]">
        <BsFiletypeXlsx />
        <p className="text-base font-bold text-[#255DC8]">Cadastrar XLSX</p>
      </span>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mt-4">
        <div
          {...getRootProps({ className: "dropzone" })}
          className="w-full md:w-1/2 flex items-center justify-center border-2 border-dashed border-gray-400 h-[81px]"
        >
          <input {...getInputProps()} />
          <div className="flex gap-2 items-center">
            <p className="hidden md:block">
              Arraste e solte seu arquivo XLSX para cá ou{" "}
            </p>
            <span className="px-2 py-1 md:px-4 md:py-1 text-base border-2 rounded-full border-[#10A4DA] text-[#10A4DA] font-bold cursor-pointer">
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
      <p className="mt-4 text-xs md:text-sm text-[#929191]">
        Apenas arquivos XLSX são aceitos
      </p>
    </div>
  );
}

export default XlsxUpload;
