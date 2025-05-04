import { IoBag, IoHome } from "react-icons/io5";
import Link from "next/link";
import CartLink from "./CartLink";
import ProfileDropDown from "./ProfileDropDown";

const NavBar = () => {
    return <>
    <div className="h-24"></div>
    <nav className="flex w-full h-24 shadow-lg justify-around items-center bg-white fixed top-0 z-50 box-margin">
        <div className="flex items-center flex-none justify-center w-2/5 h-full text-primary text-2xl font-bold sm:text-3xl">
            <IoBag className="text-3xl sm:text-4xl" />
            <span className="relative top-1">SNStore</span>
        </div>
        <ul className="flex items-center w-2/5 h-full text-primary text-xl font-semibold sm:text-lg gap-2.5 justify-center">
            <CartLink />
            <ProfileDropDown />
            <Link href={'/'}>
                <li className="flex w-10 h-full items-center justify-center text-2xl sm:text-3xl cursor-pointer">
                    <IoHome />
                </li>
            </Link>
        </ul>
    </nav>
    </>
}

export default NavBar;