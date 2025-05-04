"use server"

import db from "@/db";
import { usersTable } from "@/db/schema";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers"
import { redirect } from "next/navigation";
import { signJWT } from "@/utils/auth"; 

const formAction = async (formData: FormData) => {
    let navigate = false
    try{
        if(!formData.has("email") || !formData.has("password")){
            throw new Error("Email and password are required")
        }
        const checkUserExists = await db.query.usersTable.findFirst({
            where: (usersTable, {eq}) => eq(usersTable.email, formData.get('email') as string)
        })

        if (formData.get('name')){
            if (checkUserExists){
                throw new Error("User already exists")
            }
            const name = formData.get('name') as string
            const email = formData.get('email') as string
            const password = formData.get('password') as string
            const confirmPassword = formData.get('confirmPassword') as string
            if (password !== confirmPassword){
                throw new Error("Passwords do not match")
            }
            const age = formData.get('age') as number | null
            const profilePhotoFile = formData.get('profilePhoto') as File | null;
            let profilePhotoBlob = null;
            if (profilePhotoFile && profilePhotoFile.size > 0) {
                const arrayBuffer = await profilePhotoFile.arrayBuffer();
                profilePhotoBlob = Buffer.from(arrayBuffer);
            }
            const pepperedPassword = process.env.PEPPER + password
            const hashedPassword = await bcrypt.hash(pepperedPassword, 12);

            const user = {
                name,
                email,
                password: hashedPassword,
                age: age ? Number(age) : null,
                profilePhoto: profilePhotoBlob,
            }
            
            const res = await db.insert(usersTable).values(user).returning().get()
            

            const jwtToken = await signJWT({
                name: res.name,
                id: res.id,
            }, "7d")

            const cookieStore = await cookies()
            cookieStore.set("userId", res.id.toString())
            cookieStore.set("userName", res.name)
            cookieStore.set("accessToken", jwtToken, {
                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                httpOnly: true,
                sameSite: "lax"
            })

        } else {
            const email = formData.get('email') as string
            const obtainTheUser = await db.query.usersTable.findFirst({
                where: (usersTable, {eq}) => eq(usersTable.email, email)
            })
            if(!obtainTheUser){
                throw new Error("User does not exist")
            }
            const password = formData.get('password') as string
            
            const pepperedPassword = process.env.PEPPER + password
            const checkPassword = await bcrypt.compare(pepperedPassword, obtainTheUser.password)
            if(!checkPassword){
                throw new Error("Invalid password")
            }

            const jwtToken = await signJWT({
                name: obtainTheUser.name,
                id: obtainTheUser.id,
            }, "7d") 
            
            const cookieStore = await cookies()
            cookieStore.set("userId", obtainTheUser.id.toString())
            cookieStore.set("userName", obtainTheUser.name)
            cookieStore.set("accessToken", jwtToken, {
                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                httpOnly: true,
                sameSite: "lax",
                
            })
        }
        navigate = true
    } catch(e) {
        return {
            con: false,
            error: (e as Error).message,
        }
    }

    if(navigate){
        redirect("/")
    }
};

export default formAction