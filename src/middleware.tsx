import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// Modify the PUBLIC_ROUTES to NOT include /api
// We want the middleware to process API requests to set auth headers
const PUBLIC_ROUTES = ['/', '/authFunction']

export async function middleware(request: NextRequest) {
    // Detailed debug logging
    console.log('🚀 MIDDLEWARE EXECUTION START ---------------')
    console.log('🔍 Request path:', request.nextUrl.pathname)
    console.log('🔍 Request method:', request.method)
    console.log('🍪 Cookies present:', [...request.cookies.getAll()].map(c => `${c.name}=${c.value.substring(0, 5)}...`))
    
    const { pathname } = request.nextUrl
    
    // Check for public routes
    const isPublic = PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`))
    console.log('🔍 Is public route?', isPublic)
    
    if (isPublic) {
        console.log('✅ Path is public, proceeding without auth check')
        console.log('🏁 MIDDLEWARE EXECUTION END ---------------')
        return NextResponse.next()
    }
    
    // Look for access token
    const accessToken = request.cookies.get('accessToken')?.value
    console.log('🔑 Access token exists?', !!accessToken)
    
    if (!accessToken) {
        console.log('❌ No access token found')
        
        const requestHeaders = new Headers(request.headers)
        requestHeaders.set('x-auth-status', 'not-authenticated')
        requestHeaders.set('x-auth-debug-info', 'No access token cookie found')
        
        if (pathname.startsWith('/api')) {
            console.log('🔄 API route - continuing with auth headers')
            console.log('🏁 MIDDLEWARE EXECUTION END ---------------')
            return NextResponse.next({
                request: {
                    headers: requestHeaders,
                },
            })
        }
        
        console.log('🔀 Redirecting to auth function due to missing token')
        const url = request.nextUrl.clone()
        url.pathname = '/authFunction'
        console.log('🏁 MIDDLEWARE EXECUTION END ---------------')
        return NextResponse.redirect(url)
    }

    try {
        // Verify JWT token
        console.log('🔐 Verifying JWT token')
        const secretKey = process.env.JWT_SECRET
        
        if (!secretKey) {
            console.log('❌ JWT_SECRET is not defined in environment variables')
            throw new Error('JWT_SECRET is not defined')
        }
        
        console.log('🔍 Starting token verification...')
        const { payload } = await jwtVerify(
            accessToken,
            new TextEncoder().encode(secretKey)
        )
        
        console.log('✅ Token verified successfully')
        console.log('👤 Token payload:', JSON.stringify(payload))
        
        if (!payload) {
            console.log('❌ Token payload is missing')
            throw new Error('Token payload is missing')
        }
        
        // Check expiration
        const currentTime = Math.floor(Date.now() / 1000)
        console.log('⏰ Current timestamp:', currentTime)
        console.log('⏰ Token expiration:', payload.exp)
        
        if (payload.exp && payload.exp < currentTime) {
            console.log('⏰ Token expired!')
            console.log('⏰ Token expired at:', new Date(payload.exp * 1000).toISOString())
            console.log('⏰ Current time:', new Date(currentTime * 1000).toISOString())
            throw new Error('Token has expired')
        }
        
        console.log('✅ Token is valid and not expired')
        const requestHeaders = new Headers(request.headers)
        requestHeaders.set('x-auth-status', 'authenticated')
        requestHeaders.set('x-auth-user-id', payload.id?.toString() || '')
        requestHeaders.set('x-auth-user-name', payload.name?.toString() || '')
        
        console.log('🏁 MIDDLEWARE EXECUTION END ---------------')
        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        })
    } catch (error) {
        console.error('❌ Token verification failed:', error)
        
        // Get detailed error information
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        const errorStack = error instanceof Error ? error.stack : ''
        console.log('❌ Error details:', errorMessage)
        console.log('❌ Error stack:', errorStack)
        
        if (pathname.startsWith('/api')) {
            console.log('🔄 API route - continuing with error headers')
            const requestHeaders = new Headers(request.headers)
            requestHeaders.set('x-auth-status', 'not-authenticated')
            requestHeaders.set('x-auth-error', errorMessage)
            
            // Add any error code from jose library
            if (error instanceof Error && 'code' in error) {
                // @ts-ignore - code property exists in jose errors
                requestHeaders.set('x-auth-error-code', error.code || 'UNKNOWN')
            }
            
            console.log('🏁 MIDDLEWARE EXECUTION END ---------------')
            return NextResponse.next({
                request: {
                    headers: requestHeaders,
                },
            })
        }
        
        console.log('🔀 Redirecting to auth function and clearing cookies due to token validation error')
        const response = NextResponse.redirect(new URL('/authFunction', request.url))
        
        // Clear all auth cookies
        response.cookies.delete('accessToken')
        response.cookies.delete('userId')
        response.cookies.delete('userName')
        
        console.log('🍪 Cookies cleared from response')
        console.log('🏁 MIDDLEWARE EXECUTION END ---------------')
        return response
    }
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|public).*)',
    ],
}