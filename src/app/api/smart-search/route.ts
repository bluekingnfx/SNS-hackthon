// app/api/smart-search/route.ts
import { NextRequest } from 'next/server';
import db from '@/db';
import { booksTable, StationaryTable, UniformsTable } from '@/db/schema';
import { eq, like, or } from 'drizzle-orm';

// Type for the normalized item result
interface NormalizedItem {
  id: number;
  type: 'book' | 'stationary' | 'uniforms';
  title: string;
  description: string;
  price: number;
  isFeatured: boolean;
  isSold: boolean;
  count: number;
  relevanceScore: number;
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const searchType = body.type;
    
    if (searchType !== 'text' && searchType !== 'image') {
      return new Response(JSON.stringify({ error: 'Invalid search type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    let searchTerms = [];
    
    if (searchType === 'text') {
      // Text-based search logic
      const query = body.query;
      if (!query || typeof query !== 'string') {
        return new Response(JSON.stringify({ error: 'Invalid query parameter' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      // Use the query directly as search terms
      searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
      
      // Fallback for short queries
      if (searchTerms.length === 0 && query.length > 0) {
        searchTerms = [query.toLowerCase()];
      }
    } else {
      // Image-based search logic using AI
      const imageData = body.imageData;
      if (!imageData) {
        return new Response(JSON.stringify({ error: 'Missing image data' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      // Get image caption from Llama 4 Maverick using OpenRouter
      const imageDescription = await getImageDescription(imageData);
      
      // Extract keywords from the description
      searchTerms = extractKeywords(imageDescription);
    }
    
    // If no search terms are found after processing
    if (!searchTerms.length) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Perform search across all tables
    const results = await searchItems(searchTerms);
    
    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Search API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Function to get image description from Llama 4 Maverick
async function getImageDescription(base64Image: string): Promise<string> {
  try {
    // OpenRouter API request
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer":"http://localhost:3000",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "meta-llama/llama-4-maverick:free",
        "messages": [
          {
            "role": "system",
            "content": "You are an image description assistant that helps with e-commerce search. Describe the image in detail, focusing on attributes like color, type of item, style, features, condition, size, material, and any text visible. Your description should be helpful for finding similar items in a school store that sells books, stationery and uniforms."
          },
          {
            "role": "user",
            "content": [
              {
                "type": "text",
                "text": "Describe this image in detail for searching in our school store inventory. Include all relevant attributes someone might search for."
              },
              {
                "type": "image_url",
                "image_url": {
                  "url": `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ]
      })
    });

    const result = await response.json();
    return result.choices[0]?.message?.content || "";
  } catch (error) {
    console.error('Error getting image description:', error);
    return "";
  }
}

// Function to extract keywords from image description
function extractKeywords(description: string): string[] {
  // Remove common stop words and keep meaningful terms
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'is', 'in', 'on', 'at', 'of', 'for', 'with', 
    'this', 'that', 'there', 'here', 'it', 'are', 'be', 'to', 'from', 'by'
  ]);
  
  const words = description.toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/) // Split by whitespace
    .filter(word => word.length > 2 && !stopWords.has(word)); // Filter out short words and stop words
  
  // Get unique keywords
  return [...new Set(words)];
}

// Function to search items across all tables
async function searchItems(searchTerms: string[]): Promise<NormalizedItem[]> {
  // Perform searches in parallel
  const [booksResults, stationaryResults, uniformsResults] = await Promise.all([
    searchBooks(searchTerms),
    searchStationary(searchTerms),
    searchUniforms(searchTerms),
  ]);
  
  // Combine all results
  const combinedResults = [
    ...booksResults, 
    ...stationaryResults, 
    ...uniformsResults
  ];
  
  // Sort by relevance score (descending) and filter out sold items
  return combinedResults
    .filter(item => !item.isSold)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}

// Function to search books
async function searchBooks(searchTerms: string[]): Promise<NormalizedItem[]> {
  const conditions = searchTerms.map(term => 
    or(
      like(booksTable.title, `%${term}%`),
      like(booksTable.description, `%${term}%`)
    )
  );
  
  const books = await db
    .select({
      id: booksTable.id,
      title: booksTable.title,
      description: booksTable.description,
      price: booksTable.price,
      isFeatured: booksTable.isFeatured,
      isSold: booksTable.isSold,
      count: booksTable.count,
    })
    .from(booksTable)
    .where(or(...conditions));
  
  return books.map(book => {
    // Calculate relevance score based on how many search terms match
    const titleLower = book.title.toLowerCase();
    const descriptionLower = book.description.toLowerCase();
    let relevanceScore = 0;
    
    searchTerms.forEach(term => {
      if (titleLower.includes(term)) relevanceScore += 2; // Title matches are weighted higher
      if (descriptionLower.includes(term)) relevanceScore += 1;
    });
    
    // Boost featured items
    if (book.isFeatured) relevanceScore *= 1.2;
    
    return {
      ...book,
      type: 'book' as const,
      isFeatured: Boolean(book.isFeatured),
      isSold: Boolean(book.isSold),
      relevanceScore,
    };
  });
}

// Function to search stationary
async function searchStationary(searchTerms: string[]): Promise<NormalizedItem[]> {
  const conditions = searchTerms.map(term => 
    or(
      like(StationaryTable.title, `%${term}%`),
      like(StationaryTable.description, `%${term}%`)
    )
  );
  
  const stationaryItems = await db
    .select({
      id: StationaryTable.id,
      title: StationaryTable.title,
      description: StationaryTable.description,
      price: StationaryTable.price,
      isFeatured: StationaryTable.isFeatured,
      isSold: StationaryTable.isSold,
      count: StationaryTable.count,
    })
    .from(StationaryTable)
    .where(or(...conditions));
  
  return stationaryItems.map(item => {
    const titleLower = item.title.toLowerCase();
    const descriptionLower = item.description.toLowerCase();
    let relevanceScore = 0;
    
    searchTerms.forEach(term => {
      if (titleLower.includes(term)) relevanceScore += 2;
      if (descriptionLower.includes(term)) relevanceScore += 1;
    });
    
    if (item.isFeatured) relevanceScore *= 1.2;
    
    return {
      ...item,
      type: 'stationary' as const,
      isFeatured: Boolean(item.isFeatured),
      isSold: Boolean(item.isSold),
      relevanceScore,
    };
  });
}

// Function to search uniforms
async function searchUniforms(searchTerms: string[]): Promise<NormalizedItem[]> {
  const conditions = searchTerms.map(term => 
    or(
      like(UniformsTable.title, `%${term}%`),
      like(UniformsTable.condition, `%${term}%`),
    )
  );
  
  const uniforms = await db
    .select({
      id: UniformsTable.id,
      title: UniformsTable.title,
      price: UniformsTable.price,
      isFeatured: UniformsTable.isFeatured,
      isSold: UniformsTable.isSold,
      count: UniformsTable.count,
      condition: UniformsTable.condition,
    })
    .from(UniformsTable)
    .where(or(...conditions));
  
  return uniforms.map(uniform => {
    const titleLower = uniform.title.toLowerCase();
    const conditionLower = (uniform.condition || '').toLowerCase();
    let relevanceScore = 0;
    
    searchTerms.forEach(term => {
      if (titleLower.includes(term)) relevanceScore += 2;
      if (conditionLower.includes(term)) relevanceScore += 1;
    });
    
    if (uniform.isFeatured) relevanceScore *= 1.2;
    
    return {
      ...uniform,
      type: 'uniforms' as const,
      description: uniform.title, // Use title as description for uniforms
      isFeatured: Boolean(uniform.isFeatured),
      isSold: Boolean(uniform.isSold),
      relevanceScore,
    };
  });
}