import { cn } from "../../../utils/cn";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

function Container({children, className}: ContainerProps) {
  return (
    <div className={cn("w-[95%] md:w-1/3 bg-white p-2 md:p-6 rounded-lg", className)}>
      {children}
    </div>
  )
}

export default Container