"use client";
import { TbLoader2 } from "react-icons/tb";
import { twMerge } from "tailwind-merge";

interface ButtonProps {
  className?: string;
  title: string;
  type?: "button" | "submit" | "reset";
  disable?: boolean;
  onClick?: () => void;
  isLoading?: boolean;
}

function Button({
  className,
  title,
  type,
  disable,
  onClick = () => {},
  isLoading = false,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disable ? disable : false}
      type={type ? type : "button"}
      className={twMerge(
        "cursor-pointer px-6 w-fit py-2 border-2 rounded-full border-[#255DC8] bg-[#255DC8] text-white font-semibold disabled:bg-[#C7C9CF] disabled:text-[#A4AABC] disabled:border-none disabled:cursor-default",
        className
      )}
    >
      {isLoading ? <TbLoader2 size={20} className="animate-spin" /> : title}
    </button>
  );
}

export default Button;
