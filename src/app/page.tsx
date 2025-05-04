// app/page.tsx
import HeroComponent from './_components/HeroComponent/HeroComponent';
import ItemListing from './_components/ItemLisiting'; // Import the ItemListing component
import db from '@/db';
import { booksTable, StationaryTable, UniformsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export default async function Home() {
  try {
    // Fetch items from all categories
    const booksData = await db.select({
      id: booksTable.id,
      title: booksTable.title,
      description: booksTable.description,
      price: booksTable.price,
      userId: booksTable.userId,
      createdAt: booksTable.createdAt,
      isSold: booksTable.isSold,
      isFeatured: booksTable.isFeatured,
      count: booksTable.count,
      // Don't select binary fields: thumbnail, fileData
    }).from(booksTable).where(eq(booksTable.isSold, false));
    
    const stationaryData = await db.select({
      id: StationaryTable.id,
      title: StationaryTable.title,
      description: StationaryTable.description,
      price: StationaryTable.price,
      userId: StationaryTable.userId,
      createdAt: StationaryTable.createdAt,
      isSold: StationaryTable.isSold,
      isFeatured: StationaryTable.isFeatured,
      count: StationaryTable.count,
      // Don't select binary fields: thumbnail, additionalImgs
    }).from(StationaryTable).where(eq(StationaryTable.isSold, false));
    
    const uniformsData = await db.select({
        
      id: UniformsTable.id,
      title: UniformsTable.title, // Static description for uniforms
      price: UniformsTable.price,
      userId: UniformsTable.userId,
      createdAt: UniformsTable.createdAt,
      isSold: UniformsTable.isSold,
      isFeatured: UniformsTable.isFeatured,
      count: UniformsTable.count,
      condition: UniformsTable.condition,
      // Don't select binary fields: thumbnail, additionalImgs
    }).from(UniformsTable).where(eq(UniformsTable.isSold, false));
    
    // Log the item counts for debugging
    console.log(`[SERVER] Fetched ${booksData.length} books, ${stationaryData.length} stationary items, and ${uniformsData.length} uniforms`);
    
    // Check if fileData exists for books
    const booksWithFileData = await Promise.all(booksData.map(async (book) => {
      const hasFile = await db.select({
        hasFile: booksTable.fileData,
      }).from(booksTable).where(eq(booksTable.id, book.id)).get();
      
      return {
        ...book,
        isSold:  book.isSold === true,
        isFeatured: book.isFeatured === true,
        thumbnailId: book.id,
        fileDataExists: !!hasFile?.hasFile
      };
    }));
    
    // Check if additionalImgs exists for stationary
    const stationaryWithImgCount = await Promise.all(stationaryData.map(async (item) => {
      const additionalImgsCheck = await db.select({
        additionalImgs: StationaryTable.additionalImgs,
      }).from(StationaryTable).where(eq(StationaryTable.id, item.id)).get();
      
      const hasAdditionalImages = Array.isArray(additionalImgsCheck?.additionalImgs) && 
                                 additionalImgsCheck?.additionalImgs.length > 0;
      const additionalImgsCount = Array.isArray(additionalImgsCheck?.additionalImgs) ? 
                                 additionalImgsCheck?.additionalImgs.length : 0;
      
      return {
        ...item,
        isSold:  item.isSold === true,
        isFeatured: item.isFeatured === true,
        thumbnailId: item.id,
        hasAdditionalImages,
        additionalImgsCount
      };
    }));
    
    // Check if additionalImgs exists for uniforms
    const uniformsWithImgCount = await Promise.all(uniformsData.map(async (item) => {
      const additionalImgsCheck = await db.select({
        additionalImgs: UniformsTable.additionalImgs,
      }).from(UniformsTable).where(eq(UniformsTable.id, item.id)).get();
      
      const hasAdditionalImages = Array.isArray(additionalImgsCheck?.additionalImgs) && 
                                 additionalImgsCheck?.additionalImgs.length > 0;
      const additionalImgsCount = Array.isArray(additionalImgsCheck?.additionalImgs) ? 
                                 additionalImgsCheck?.additionalImgs.length : 0;
      
      return {
        ...item,
        isSold:item.isSold === true,
        isFeatured: item.isFeatured === true,
        condition: item.condition || 'new',
        thumbnailId: item.id,
        description: item.title, // Provide a default description
        hasAdditionalImages,
        additionalImgsCount,
        size: 'M', // Provide a default size or derive it dynamically
      };
    }));
    
    return (
      <>
        <HeroComponent />
        
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8 text-primary">Browse Items</h2>
            <ItemListing 
              books={booksWithFileData} 
              stationary={stationaryWithImgCount} 
              uniforms={uniformsWithImgCount} 
            />
          </div>
        </section>
      </>
    );
  } catch (error) {
    console.error('[SERVER] Error in Home page:', error);
    return (
      <>
        <HeroComponent />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> Unable to load items. Please try again later.</span>
          </div>
        </div>
      </>
    );
  }
}
