import Image from "next/image";
import { Button } from "./ui/button";
import FileUploader from "./FileUploader";
import Search from "./Search";


export default function Header() {
  return (
    <header className="header">
      <Search />
      <div className="header-wrapper">
        <FileUploader />
        <form action="">
          <Button>
            <Image src="/assets/icons/logout.svg" alt="sign-out-button" width={24} height={24} className="w-6"/>
          </Button>
        </form>
      </div>
    </header>
  )
}
