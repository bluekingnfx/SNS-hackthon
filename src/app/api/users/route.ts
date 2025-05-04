// File: app/api/route.ts
import { NextResponse } from 'next/server'
import { headers, cookies } from 'next/headers'

export async function GET() {
  console.log('🚀 API ROUTE: GET request received')
  try {
    const headersList = await headers()
    const cookieStore = await cookies()
    
    const authStatus = headersList.get('x-auth-status')
    const authError = headersList.get('x-auth-error')
    const authErrorCode = headersList.get('x-auth-error-code')
    const userId = cookieStore.get('userId')?.value
    const userName = cookieStore.get('userName')?.value
    
    
    const isAuthenticated = authStatus === 'authenticated'
    
    if (!isAuthenticated && authError) {
      // Return specific error information if available
      return NextResponse.json({
        isLoggedIn: false,
        user: null,
        error: authError,
        errorCode: authErrorCode || 'UNKNOWN'
      }, { status: 401 })
    }
    
    const responseBody = {
      isLoggedIn: isAuthenticated,
      user: isAuthenticated ? {
        id: userId,
        name: userName,
      } : null
    }
    return NextResponse.json(responseBody)
  } catch (error) {
    console.error('❌ Error in API route:', error)
    return NextResponse.json({
      isLoggedIn: false,
      user: null,
      error: 'Failed to check authentication status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Add logout functionality to the same file
export async function POST() {
  try {
    console.log('🍪 Clearing all authentication cookies')
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })
    
    // Clear all authentication cookies
    response.cookies.delete('accessToken')
    response.cookies.delete('userId')
    response.cookies.delete('userName')

    return response
  } catch (error) {
    console.error('❌ Logout error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to logout',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}