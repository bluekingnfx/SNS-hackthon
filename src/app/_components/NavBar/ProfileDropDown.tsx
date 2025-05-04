
import { FaUserCircle } from "react-icons/fa";
import { Menu, MenuButton } from '@szhsin/react-menu';
import ProfileMenuItems from "./ProfileMenuItems";


const ProfileDropDown = () => {
    return <>
        <li className="flex w-10 h-full items-center justify-center text-2xl sm:text-3xl cursor-pointer">
            <Menu menuButton={<MenuButton className="text-2xl sm:text-3xl cursor-pointer"><FaUserCircle /></MenuButton>} transition>
                <ProfileMenuItems />
            </Menu>
        </li>
    </>
}

export default ProfileDropDown;