import type { ReactNode } from "react";

interface RadioProps {
  children: ReactNode;
}

function Radio({ children }: RadioProps) {
  return (
    <div className="w-full flex gap-2">
      {children}
    </div>
  )
}

export default Radio