

interface RootProps {
  children: React.ReactNode;
  isVisible: boolean;
}

function Root({ children, isVisible }: RootProps) {

  if(!isVisible) {
    return null;
  }

  return (
    <div className="flex justify-center items-center bg-black/70 fixed w-full h-full z-10 top-0 left-0 md:left-56">
      {children}
    </div>
  )
}

export default Root