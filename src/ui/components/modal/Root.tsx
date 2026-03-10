interface RootProps {
  children: React.ReactNode;
  isVisible: boolean;
  full?: boolean;
}

function Root({ children, isVisible, full }: RootProps) {
  if (!isVisible) {
    return null;
  }

  let styles =
    "flex justify-center items-center bg-black/70 fixed w-full h-full z-20 top-0 left-0 md:left-56  px-10 overflow-auto";
  if (full) {
    styles =
      "flex justify-center items-center bg-black/70 fixed w-full h-full z-20 top-0 left-0 px-10  overflow-auto";
  }

  return <div className={styles}>{children}</div>;
}

export default Root;
