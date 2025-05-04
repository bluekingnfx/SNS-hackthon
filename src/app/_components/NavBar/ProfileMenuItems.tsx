"use client"

import useAuth from "@/context/AuthContext"
import { MenuItem } from "@szhsin/react-menu"
import type {ClickEvent} from "@szhsin/react-menu"
import Link from "next/link"
import React from "react"

const ProfileMenuItems = () => {
    const {isLoggedIn, setIsLoggedIn, logout} = useAuth()
    
    const handleLogout = async (e: ClickEvent) => {
        try {
            if (e.stopPropagation) {
                e.stopPropagation = true
            }
            await logout()
            setIsLoggedIn(false)
        } catch (error) {
            console.error("Logout failed:", error)
        }
    }
    
    return <>
        {
            isLoggedIn ? <>
                {
                    [{
                        name: "Profile",
                        link: "/profile"
                    },
                    {
                        name: "Sell Items",
                        link: "/sellItems"
                    },
                    {
                        name: "Logout",
                        link: "/logout", 
                        onClickFunc: handleLogout
                    },{
                        name: 'Top up',
                        link: '/topup'
                    }].map((item) => 
                        item.name !== "Logout" ? (
                            <Link href={item.link} key={item.name}>
                                <MenuItem className="text-lg font-semibold text-primary hover:bg-primary hover:text-gray-700">
                                    {item.name}
                                </MenuItem>
                            </Link>
                        ) : (
                            <MenuItem 
                                key={item.name}
                                className="text-lg font-semibold text-primary hover:bg-primary hover:text-gray-700" 
                                onClick={item.onClickFunc}
                            >
                                {item.name}
                            </MenuItem>
                        )
                    )
                }
            </> : <>
                {
                    [{
                        name: "Login/SignUp",
                        link: '/authFunction'
                    }].map(item => (
                        <Link href={item.link} key={item.name}>
                            <MenuItem className="text-lg font-semibold text-primary hover:bg-primary hover:text-gray-700">
                                {item.name}
                            </MenuItem>
                        </Link>
                    ))
                }
            </>
        }
    </>
}

export default ProfileMenuItems