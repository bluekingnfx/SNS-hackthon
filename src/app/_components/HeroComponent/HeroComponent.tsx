"use client"
import Image from "next/image"
import GreetingsContainer from "./GreetingsContainer"
import Link from "next/link"
import { SetStateAction, useState } from "react"

const HeroComponent = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchChange = (e: { target: { value: SetStateAction<string> } }) => {
        setSearchQuery(e.target.value);
    };

    return (
        <div className="flex w-screen h-96 relative justify-center items-center">
            <Image 
                src="/HeroImg.jpeg"
                alt="Things are scattered in hero image"
                fill={true}
                className="object-cover object-center absolute"
                priority={true}
            />
            <div className="flex flex-col justify-center items-center w-full h-full bg-black/50 z-49">
                <GreetingsContainer />
                <p className="text-lg sm:text-xl font-semibold text-white mt-2">Campus accessories store.</p>
                
                {/* Search component integrated into hero */}
                <div className="mt-8 w-full max-w-lg px-4">
                    <div className="flex items-center">
                        <div className="relative flex-grow">
                            <input
                                type="text"
                                placeholder="Search for books, stationery, uniforms..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="w-full py-3 pl-4 pr-12 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary shadow-lg"
                            />
                            <Link href={`/search?q=${encodeURIComponent(searchQuery)}`} className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </Link>
                        </div>
                        <Link 
                            href="/search" 
                            className="bg-primary text-white px-4 py-3 rounded-r-md hover:bg-primary-dark transition-colors duration-200 shadow-lg"
                        >
                            Advanced
                        </Link>
                    </div>
                    <div className="flex justify-center mt-2">
                        <Link href="/search" className="text-white/80 text-sm hover:text-white hover:underline transition-colors">
                            Try our AI-powered image search →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HeroComponent