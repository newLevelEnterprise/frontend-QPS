interface ContainerProps {
  children: React.ReactNode;
}

function Container({children }: ContainerProps) {
  return (
    <div className="w-[95%] md:w-1/3 bg-white p-2 md:p-6 rounded-lg">
      {children}
    </div>
  )
}

export default Container