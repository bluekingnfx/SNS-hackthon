import { SignJWT, jwtVerify } from 'jose'

export async function signJWT(payload: any, expiresIn: string = '7d') {
    const secret = process.env.JWT_SECRET
    
    if (!secret) {
        throw new Error('JWT_SECRET is not defined')
    }

    let secondsToAdd = 0;
    if (typeof expiresIn === 'string') {
        const match = expiresIn.match(/^(\d+)([smhdw])$/)
        if (match) {
            const value = parseInt(match[1])
            const unit = match[2]

            switch (unit) {
                case 's': secondsToAdd = value; break; // seconds
                case 'm': secondsToAdd = value * 60; break; // minutes
                case 'h': secondsToAdd = value * 60 * 60; break; // hours
                case 'd': secondsToAdd = value * 60 * 60 * 24; break; // days
                case 'w': secondsToAdd = value * 60 * 60 * 24 * 7; break; // weeks
            }
        }
    }
    
    // Calculate absolute expiration time
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    const expirationTime = now + secondsToAdd;
    
    // Create the JWT
    const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(expirationTime) // Now using absolute timestamp
        .sign(new TextEncoder().encode(secret))
    
    return token
}

export async function verifyJWT(token: string) {
    const secret = process.env.JWT_SECRET
    
    if (!secret) {
        throw new Error('JWT_SECRET is not defined')
    }
    
    try {
        const { payload } = await jwtVerify(
            token,
            new TextEncoder().encode(secret)
        )
        
        return { 
            valid: true, 
            payload 
        }
    } catch (error) {
        return { 
            valid: false, 
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

export async function convertToJoseToken(payload: any, expiresIn: string = '7d') {
    return await signJWT(payload, expiresIn)
}