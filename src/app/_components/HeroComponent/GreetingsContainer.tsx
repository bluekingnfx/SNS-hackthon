'use client'
import SNStore from "./SNStore"
import useAuth from "@/context/AuthContext"

const GreetingsContainer = () => {
    const { setIsLoggedIn, user} = useAuth()

    if (user === undefined) {
        return <h1 className="text-4xl sm:text-5xl font-bold text-white">Welcome to {<SNStore/>}. Please log in.</h1>
    }
    return <h1 className="text-4xl sm:text-5xl font-bold text-white">Welcome to {<SNStore/>} Greetings {user?.name}.</h1>
}


export default GreetingsContainer