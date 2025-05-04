"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"

type User = {
    id: string
    name: string
    [key: string]: any
}

type AuthCtxType = {
    isLoading: boolean
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
    isLoggedIn: boolean
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>
    user: User | null
    setUser: React.Dispatch<React.SetStateAction<User | null>>
    checkAuthStatus: () => Promise<void>
    logout: () => Promise<void>
}

const AuthCtx = createContext<AuthCtxType | null>(null)

export const AuthCtxProvider = ({ children }: { children: ReactNode }) => {
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
    const [user, setUser] = useState<User | null>(null)
    const pathname = usePathname()
    const router = useRouter()

    const checkAuthStatus = async () => {
        
        try {
            
            setIsLoading(true)
            
            console.log('🔄 Fetching auth status from /api')
            const response = await fetch('/api/users', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                cache: 'no-store', 
            })

            const contentType = response.headers.get("content-type")
            
            if (!contentType || !contentType.includes("application/json")) {
    
                setIsLoggedIn(false)
                setUser(null)
                return
            }

            const data = await response.json()
            
            setIsLoggedIn(data.isLoggedIn)
            setUser(data.user)
            
            if (data.isLoggedIn && pathname === '/authFunction') {
                router.push('/')
            }
        } catch (error) {
            
            setIsLoggedIn(false)
            setUser(null)
        } finally {
            setIsLoading(false)
        }
    }

    const logout = async () => {
        try {

            setIsLoading(true)
            
            const response = await fetch('/api', {
                method: 'POST',
                credentials: 'include',
            })
            
            setUser(null)
            setIsLoggedIn(false)
        } catch (error) {
            setUser(null)
            setIsLoggedIn(false)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        checkAuthStatus()
    }, [])

    useEffect(() => {

        if (!isLoading) {
            checkAuthStatus()
        } else {
        }
    }, [pathname])

    
    return (
        <AuthCtx.Provider
            value={{
                isLoading,
                setIsLoading,
                isLoggedIn,
                setIsLoggedIn,
                user,
                setUser,
                checkAuthStatus,
                logout
            }}
        >
            {children}
        </AuthCtx.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthCtx)
    if (!context) {
        throw new Error("useAuth must be used within an AuthCtxProvider")
    }
    return context
}

export default useAuth