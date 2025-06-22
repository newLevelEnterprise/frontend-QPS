import Button from "../Button";

interface FooterProps {
  onClick: () => Promise<void> | void;
  isLoading?: boolean;
  disable?: boolean;
}

function Footer({ onClick, isLoading = false, disable }: FooterProps) {
  return (
    <div className="w-full flex justify-end mt-4">
      <Button disable={!disable ? false : disable} isLoading={isLoading} onClick={onClick} title="OK" type="button" className="text-xs"/>
    </div>
  )
}

export default Footer