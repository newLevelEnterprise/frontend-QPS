import { IoIosAlert } from "react-icons/io";

interface FormErrorMessageProps {
  message: string;
}

function FormErrorMessage({ message }: FormErrorMessageProps) {
  return (
    <span className="flex gap-1 self-end text-[#B90D0D] text-xs">
      <IoIosAlert size={18} />
      {message}
    </span>
  );
}

export default FormErrorMessage;
