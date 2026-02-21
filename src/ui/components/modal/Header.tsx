import { IoClose } from "react-icons/io5";

interface HeaderProps {
  title: string;
  onClose: () => void;
}

function Header({ title, onClose }: HeaderProps) {
  return (
    <div className="w-full flex items-center min-h-[40px] md:min-h-[56px] justify-between gap-4">
      <button onClick={onClose} className="cursor-pointer order-2 ml-4">
        <IoClose size={22} />
      </button>
      <p className="text-[#5B85D5] font-bold text-lg md:text-xl truncate max-w-[70vw] order-1">
        {title}
      </p>
    </div>
  );
}

export default Header;
