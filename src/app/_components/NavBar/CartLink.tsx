'use client'

import useAuth from "@/context/AuthContext"
import useGlobalData from "@/context/globalContext"
import Link from "next/link"
import { FaShoppingCart } from "react-icons/fa"


const CartLink = () => {
    const {cartItemsCount} = useGlobalData()
    const {isLoggedIn} = useAuth()
    if(isLoggedIn === false){
        return null
    }
    return <Link href='/cart'>
        <li className={`flex w-10 h-full items-center justify-center text-2xl sm:text-3xl cursor-pointer relative`}>
            <FaShoppingCart />
            {
                cartItemsCount > 0 && <span className="absolute -top-1 right-0 w-4 h-4 bg-red-600 rounded-full text-white text-sm font-semibold flex justify-center items-center">{cartItemsCount}</span>
            }
        </li>
    </Link>
}

export default CartLink