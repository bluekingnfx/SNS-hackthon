
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Form from 'next/form'
import formAction from "./_actions/formAction";

export default function AuthPage() {
    const [isLoginTab, setIsLoginTab] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const ValidateForm = async (formData: FormData) => {
        try{
            setLoading(true);
            const email = formData.get("email") as string;
            const password = formData.get("password") as string;
            if(!email || !password){
                throw new Error("Please fill all the required fields")
            }
            if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                setError("Please enter a valid email address")
                throw new Error("Invalid email format")
            }

            if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
                throw new Error("Password must have at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character");
            }

            if(!isLoginTab){
                const name = formData.get("name") as string;
                const age = formData.get("age") as string;
                const confirmPassword = formData.get("confirmPassword") as string;
                const profilePhoto = formData.get("profilePhoto") as File | null;
                if(!name || !confirmPassword){
                    throw new Error("Please fill all the required fields")
                }
                if(confirmPassword !== password){
                    throw new Error("Password and confirm password do not match")
                }
                if(profilePhoto && profilePhoto.size > 10 * 1024 * 1024){
                    throw new Error("Profile photo size should be less than 10MB")
                }

                if(age && (isNaN(Number(age)) || Number(age) < 12)){
                    throw new Error("Please enter a valid age")
                }

                if(!/^[a-zA-Z ]+$/.test(name)){
                    throw new Error("Please enter a valid name")
                }
            }

            const res = await formAction(formData);
            console.log("Response:", res);
            if(res !== undefined && res.con === false && res.error !== null){
                throw new Error("Something went wrong, please try again later")
            }
            setLoading(false);
            setError(null);
        }catch(error){
            setError((error as Error).message);
            setLoading(false);
            console.error("Error:", error);
        }
    }

    return (
        <div className={`pt-5 w-screen flex items-center justify-center bg-gray-50 ${isLoginTab == true ? "pt-10" : ""}`}>
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold text-primary">
                        {isLoginTab ? "Sign in to your account" : "Create new account"}
                    </h2>
                </div>
    
                <div className="flex justify-center mt-2 text-sm">
                    <button
                        type="button"
                        onClick={() => setIsLoginTab(true)}
                        className={`px-4 py-2 rounded-l-md ${
                        isLoginTab
                            ? "bg-primary text-white font-medium"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        Sign In
                    </button>

                    <div className="relative flex items-center">
                        <div className="h-6 border-l border-gray-300 mx-2"></div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsLoginTab(false)}
                        className={`px-4 py-2 rounded-r-md ${
                        !isLoginTab
                            ? "bg-primary text-white font-medium"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        Sign Up
                    </button>
                </div>
            
                {error && (
                <div className="bg-red-50 text-red-500 p-4 rounded-md text-center">
                    {error}
                </div>
                )}
            
                <Form className="mt-8 space-y-6" action={ValidateForm}>
                    <input type="hidden" name="remember" defaultValue="true" />
                    <div className="rounded-md space-y-4">
                        {!isLoginTab && (
                            <>
                                <div>
                                <label htmlFor="name" className="sr-only">
                                    Full Name
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10"
                                    placeholder="Full Name *"
                                />
                                </div>
                                <div>
                                <label htmlFor="age" className="sr-only">
                                    Age
                                </label>
                                <input
                                    id="age"
                                    name="age"
                                    type="number"
                                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10"
                                    placeholder="Age"
                                    min="12"
                                    max="100"
                                />
                                </div>
                                <div>
                                <label htmlFor="profilePhoto" className="sr-only">
                                    Profile Photo
                                </label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        id="profilePhoto"
                                        name="profilePhoto"
                                        type="file"
                                        accept="image/*"
                                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10"
                                    />
                                </div>
                                </div>
                            </>
                        )}
                    
                        <div>
                        <label htmlFor="email" className="sr-only">
                            Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10"
                            placeholder="Email address *"
                        />
                        </div>
                        <div>
                        <label htmlFor="password" className="sr-only">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete={isLoginTab ? "current-password" : "new-password"}
                            required
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10"
                            placeholder="Password *"
                        />
                    </div>
                    {!isLoginTab && (
                        <div>
                            <label htmlFor="confirmPassword" className="sr-only">
                                Confirm Password
                            </label>
                            <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10"
                            placeholder="Confirm Password *"
                            />
                        </div>
                        )}
                    </div>

                    {isLoginTab && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <Link href="/forgot-password" className="text-primary hover:text-primary-dark">
                                    Forgot your password?
                                </Link>
                            </div>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                </span>
                            ) : (
                                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                {isLoginTab ? (
                                    <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6z" />
                                    </svg>
                                )}
                                </span>
                            )}
                            {isLoginTab ? "Sign in" : "Sign up"}
                        </button>
                    </div>
                </Form>

                <div className="mt-6 relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
                </div>

                <div className="text-center text-sm text-gray-600 mt-4">
                    {isLoginTab ? (
                        <p>
                        Don't have an account?{" "}
                        <button
                            type="button"
                            onClick={() => setIsLoginTab(false)}
                            className="font-medium text-primary hover:text-primary-dark"
                        >
                            Sign up
                        </button>
                        </p>
                    ) : (
                        <p>
                        Already have an account?{" "}
                        <button
                            type="button"
                            onClick={() => setIsLoginTab(true)}
                            className="font-medium text-primary hover:text-primary-dark"
                        >
                            Sign in
                        </button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}