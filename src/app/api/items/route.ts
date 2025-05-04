// app/api/items/route.ts
import { NextRequest, NextResponse } from 'next/server';
import insertItem from '@/db/InsertFunctions/insertItemIntoDb';
import { InsertBook, InsertStationary, InsertUniforms } from '@/db/schema';

export async function POST(request: NextRequest) {
  try {
    // Get form data
    const formData = await request.formData();
    const typeOfItem = formData.get('typeOfItem') as 'book' | 'stationary' | 'uniforms';
    
    // Common fields for all item types
    const commonFields = {
      title: formData.get('title') as string,
      userId: parseInt(formData.get('userId') as string),
      price: parseInt(formData.get('price') as string),
      isFeatured: formData.get('isFeatured') === 'on',
      count: parseInt(formData.get('count') as string),
      // Default fields as per schema
      isSold: false,
      createdAt: new Date().toISOString(),
      condition: 'new' as 'new' | 'used',
      description: formData.get('description') as string || '', // Provide empty string if description is missing
    };
    
    // Handle thumbnail upload
    const thumbnail = formData.get('thumbnail') as File;
    let thumbnailData: Buffer | undefined;
    
    if (thumbnail && thumbnail.size > 0) {
      const thumbnailBuffer = await thumbnail.arrayBuffer();
      thumbnailData = Buffer.from(thumbnailBuffer);
    } else {
      return NextResponse.json(
        { success: false, errors: { thumbnail: 'Thumbnail is required' } },
        { status: 400 }
      );
    }
    
    // Prepare item object based on type
    let item;
    
    if (typeOfItem === 'book') {
      const fileData = formData.get('fileData') as File;
      
      if (!fileData || fileData.size === 0) {
        return NextResponse.json(
          { success: false, errors: { fileData: 'PDF file is required' } },
          { status: 400 }
        );
      }
      
      const fileBuffer = await fileData.arrayBuffer();
      
      item = {
        ...commonFields,
        thumbnail: thumbnailData,
        fileData: Buffer.from(fileBuffer),
      } as InsertBook;
    } 
    else if (typeOfItem === 'stationary') {
      // Handle additional images for stationary
      const additionalImgs = formData.getAll('additionalImgs') as File[];
      const imgBuffers: Buffer[] = [];
      
      if (additionalImgs.length > 0) {
        for (const img of additionalImgs) {
          if (img.size > 0) {
            const imgBuffer = await img.arrayBuffer();
            imgBuffers.push(Buffer.from(imgBuffer));
          }
        }
      }
      
      item = {
        ...commonFields,
        thumbnail: thumbnailData,
        additionalImgs: imgBuffers.length > 0 ? imgBuffers : [],
      } as InsertStationary;
    } 
    else if (typeOfItem === 'uniforms') {
      // For uniforms, handle the size field
      const size = formData.get('size') as string;
      
      if (!size) {
        return NextResponse.json(
          { success: false, errors: { size: 'Size is required for uniforms' } },
          { status: 400 }
        );
      }
      
      item = {
        ...commonFields,
        thumbnail: thumbnailData,
        size,
        gender: 'unisex', // Default value
        category: 'junior', // Default value
      } as InsertUniforms;
    }

    // Validate common fields
    if (!commonFields.title) {
      return NextResponse.json(
        { success: false, errors: { title: 'Title is required' } },
        { status: 400 }
      );
    }
    
    if (isNaN(commonFields.price) || commonFields.price <= 0) {
      return NextResponse.json(
        { success: false, errors: { price: 'Price must be a positive number' } },
        { status: 400 }
      );
    }
    
    if (isNaN(commonFields.count) || commonFields.count <= 0) {
      return NextResponse.json(
        { success: false, errors: { count: 'Count must be at least 1' } },
        { status: 400 }
      );
    }

    // Insert into database
    const result = await insertItem(typeOfItem, item as InsertBook | InsertStationary | InsertUniforms);

    if (!result) {
      return NextResponse.json(
        { success: false, errors: { general: 'Failed to insert item into database' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json(
      { 
        success: false, 
        errors: { 
          general: error instanceof Error ? error.message : 'An error occurred while creating the item' 
        } 
      }, 
      { status: 500 }
    );
  }
}