
import Link from 'next/link';
import db from '@/db';
import { StationaryTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import DirectImageDisplay from '@/app/_components/DirectImageDisplay';

export default async function StationaryDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // Get stationary item ID from params
  const itemId = parseInt(params.id);
  
  if (isNaN(itemId)) {
    notFound();
  }
  
  // Fetch stationary item data
  const item = await db
    .select({
      id: StationaryTable.id,
      title: StationaryTable.title,
      description: StationaryTable.description,
      price: StationaryTable.price,
      isFeatured: StationaryTable.isFeatured,
      isSold: StationaryTable.isSold,
      count: StationaryTable.count,
      userId: StationaryTable.userId,
      createdAt: StationaryTable.createdAt,
    })
    .from(StationaryTable)
    .where(eq(StationaryTable.id, itemId))
    .get();
  
  // Check if item exists
  if (!item) {
    notFound();
  }
  
  // Check if additional images exist
  const imagesCheck = await db
    .select({
      additionalImgs: StationaryTable.additionalImgs,
    })
    .from(StationaryTable)
    .where(eq(StationaryTable.id, itemId))
    .get();
  
  const hasAdditionalImages = Array.isArray(imagesCheck?.additionalImgs) && 
                            imagesCheck?.additionalImgs.length > 0;
  const additionalImgsCount = Array.isArray(imagesCheck?.additionalImgs) ? 
                            imagesCheck?.additionalImgs.length : 0;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/" className="text-primary hover:underline mb-6 inline-block">
        ← Back to Home
      </Link>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2">
            <div className="relative h-80 md:h-96">
              <DirectImageDisplay
                imageUrl={`/api/image/${item.id}?type=stationary`}
                alt={item.title}
                className="w-full h-full object-contain"
              />
              
              {item.isFeatured && (
                <div className="absolute top-4 left-4">
                  <span className="bg-yellow-400 text-yellow-900 text-xs font-bold uppercase px-3 py-1 rounded-full">
                    Featured
                  </span>
                </div>
              )}
            </div>
            
            {/* Additional Images */}
            {hasAdditionalImages && (
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Additional Images</h3>
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: additionalImgsCount }).map((_, index) => (
                    <div key={index} className="aspect-square rounded overflow-hidden border">
                      <DirectImageDisplay
                        imageUrl={`/api/image/${item.id}/additional/${index}?type=stationary`}
                        alt={`${item.title} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="p-8 md:w-1/2">
            <div className="flex flex-col h-full">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.title}</h1>
                
                <div className="flex items-center mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mr-2 ${
                    item.isSold ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {item.isSold ? 'Sold Out' : 'In Stock'}
                  </span>
                  
                  {!item.isSold && (
                    <span className="text-gray-600 text-sm">
                      {item.count} available
                    </span>
                  )}
                </div>
                
                <div className="text-2xl font-bold text-primary mb-6">
                  ₹{item.price.toFixed(2)}
                </div>
                
                <div className="prose prose-sm max-w-none mb-8">
                  <h3 className="text-lg font-semibold mb-2">Product Details</h3>
                  <p className="text-gray-700">{item.description}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-8">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Product Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Category</span>
                      <p className="font-medium">Stationary</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Item ID</span>
                      <p className="font-medium">{item.id}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Listed On</span>
                      <p className="font-medium">{new Date(item.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Condition</span>
                      <p className="font-medium">New</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-auto">
                {item.isSold ? (
                  <button 
                    disabled
                    className="w-full bg-gray-300 text-gray-500 py-3 px-4 rounded-md cursor-not-allowed"
                  >
                    Sold Out
                  </button>
                ) : (
                  <div className="space-y-4">
                    <button className="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-primary-dark transition-colors">
                      Add to Cart
                    </button>
                    <button className="w-full bg-white text-primary border border-primary py-3 px-4 rounded-md hover:bg-gray-50 transition-colors">
                      Contact Seller
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}