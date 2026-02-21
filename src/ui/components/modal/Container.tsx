import { cn } from "../../../utils/cn";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={cn(
        "w-fit max-w-[95vw] bg-white p-2 md:p-6 rounded-lg overflow-auto",
        className,
      )}
    >
      {children}
    </div>
  );
}

export default Container;
