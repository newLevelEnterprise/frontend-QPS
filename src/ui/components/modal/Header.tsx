import { IoClose } from "react-icons/io5";

interface HeaderProps {
  title: string;
  onClose: () => void;
}

function Header({title, onClose}: HeaderProps) {
  return (
    <div className='w-full flex justify-between items-center'>
      <p className="text-[#5B85D5] font-bold text-lg md:text-xl">{title}</p>
      <button onClick={onClose} className="cursor-pointer">
        <IoClose size={22}/>
      </button>
    </div>
  )
}

export default Header