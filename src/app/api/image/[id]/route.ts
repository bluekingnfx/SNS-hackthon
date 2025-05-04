import { NextRequest } from 'next/server';
import db from '@/db';
import { booksTable, StationaryTable, UniformsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
    ) {
    try {
        const id = parseInt(params.id);
        const type = request.nextUrl.searchParams.get('type');
        
        if (!id || !type) {
        return new Response('Missing id or type parameter', { status: 400 });
        }

        let imageData;

        switch (type) {
        case 'book':
            const book = await db.select({ 
            thumbnail: booksTable.thumbnail 
            })
            .from(booksTable)
            .where(eq(booksTable.id, id))
            .get();
            
            imageData = book?.thumbnail;
            break;
            
        case 'stationary':
            const stationary = await db.select({ 
            thumbnail: StationaryTable.thumbnail 
            })
            .from(StationaryTable)
            .where(eq(StationaryTable.id, id))
            .get();
            
            imageData = stationary?.thumbnail;
            break;
            
        case 'uniforms':
            const uniform = await db.select({ 
            thumbnail: UniformsTable.thumbnail 
            })
            .from(UniformsTable)
            .where(eq(UniformsTable.id, id))
            .get();
            
            imageData = uniform?.thumbnail;
            break;
            
        default:
            return new Response('Invalid item type', { status: 400 });
        }

        if (!imageData) {
        return new Response('Image not found', { status: 404 });
        }

        return new Response(imageData, {
        headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=86400',
        },
        });
    } catch (error) {
        console.error('Error fetching image:', error);
        return new Response('Internal server error', { status: 500 });
    }
}