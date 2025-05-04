import { NextResponse } from 'next/server'
import db from "@/db"
import { usersTable } from '@/db/schema'
import { eq } from 'drizzle-orm/sqlite-core/expressions'
import { cookies } from 'next/headers'


export async function GET(request: Request) {
    console.log('🚀 PROFILE API: GET request received')
    try {

        const url = new URL(request.url)

        const userId = url.searchParams.get('userId')
        console.log('🔍 User ID from search params:', userId)
        
        
        const res = await db.query.usersTable.findFirst({
            where: (usersTable, {eq}) => eq(usersTable.id, Number(userId))
        })

        if (!res) {
            console.log('❌ User not found for ID:', userId)
            return NextResponse.json({
                error: "User not found"
            }, { status: 404 })
        }

        const { password, ...user } = res
        console.log('✅ User found:', user.id)
        
        return NextResponse.json(user)
    } catch (error) {
        console.error('❌ Error in profile API:', error)
        return NextResponse.json({
            error: 'Failed to fetch profile',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}


export async function PUT(request: Request) {
    try {

        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');
        
        if (!userId) {
            return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 });
        }
        
        const updateData = await request.json();

        const result = await db
        .update(usersTable)
        .set(updateData)
        .where(eq(usersTable.id, parseInt(userId)))
        .returning({
            id: usersTable.id,
            name: usersTable.name,
            age: usersTable.age,
            email: usersTable.email,
            profilePhoto: usersTable.profilePhoto
        });

        (await cookies()).set("userName", updateData.name)
        
        if (!result || result.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        
        return NextResponse.json(result[0]);
        
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({
        error: 'Failed to update profile',
        details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}