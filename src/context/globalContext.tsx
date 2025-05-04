
"use client"

import { SelectUser } from "@/db/schema"
import {createContext, useContext, useState} from "react"

type GlobalDataCtxType = {
    cartItemsCount: number
    cartItemsCountHandler: React.Dispatch<React.SetStateAction<number>>, 
    userProfile?: SelectUser
}


const GlobalDataContext = createContext<GlobalDataCtxType | null>(null)


export const GlobalDataProvider = ({children}: {children: React.ReactNode}) => {

    const [cartItemsCount, setCartItemsCount] = useState<number>(0)
    return <GlobalDataContext value={{
        cartItemsCount,
        cartItemsCountHandler: setCartItemsCount,
    }}>
        {children}
    </GlobalDataContext>
}



const useGlobalData = () => {
    const context = useContext(GlobalDataContext)
    if (!context) {
        throw new Error("useGlobalData must be used within a GlobalDataProvider")
    }
    return context
}

export default useGlobalData