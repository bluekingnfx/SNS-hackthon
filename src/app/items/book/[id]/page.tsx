import Link from 'next/link';
import db from '@/db';
import { booksTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import DirectImageDisplay from '@/app/_components/DirectImageDisplay';

export default async function BookDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const bookId = parseInt(params.id);
  
  if (isNaN(bookId)) {
    notFound();
  }
  
  const book = await db
    .select({
      id: booksTable.id,
      title: booksTable.title,
      description: booksTable.description,
      price: booksTable.price,
      isFeatured: booksTable.isFeatured,
      isSold: booksTable.isSold,
      count: booksTable.count,
      userId: booksTable.userId,
      createdAt: booksTable.createdAt,
    })
    .from(booksTable)
    .where(eq(booksTable.id, bookId))
    .get();
  
  if (!book) {
    notFound();
  }
  
  const pdfCheck = await db
    .select({
      hasFile: booksTable.fileData,
    })
    .from(booksTable)
    .where(eq(booksTable.id, bookId))
    .get();
  
  const hasPdf = !!pdfCheck?.hasFile;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/" className="text-primary hover:underline mb-6 inline-block">
        ← Back to Home
      </Link>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2 relative h-80 md:h-auto">
            <DirectImageDisplay
              imageUrl={`/api/image/${book.id}?type=book`}
              alt={book.title}
              className="w-full h-full object-contain"
            />
            
            {book.isFeatured && (
              <div className="absolute top-4 left-4">
                <span className="bg-yellow-400 text-yellow-900 text-xs font-bold uppercase px-3 py-1 rounded-full">
                  Featured
                </span>
              </div>
            )}
          </div>
          
          <div className="p-8 md:w-1/2">
            <div className="flex flex-col h-full">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
                
                <div className="flex items-center mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mr-2 ${
                    book.isSold ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {book.isSold ? 'Sold Out' : 'In Stock'}
                  </span>
                  
                  {!book.isSold && (
                    <span className="text-gray-600 text-sm">
                      {book.count} available
                    </span>
                  )}
                </div>
                
                <div className="text-2xl font-bold text-primary mb-6">
                  ₹{book.price.toFixed(2)}
                </div>
                
                <div className="prose prose-sm max-w-none mb-8">
                  <h3 className="text-lg font-semibold mb-2">About this book</h3>
                  <p className="text-gray-700">{book.description}</p>
                </div>
                
                {hasPdf && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-2">Digital Content</h3>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-blue-800">This book includes a PDF file</span>
                      </div>
                      
                      {!book.isSold && (
                        <div className="mt-2">
                          <a 
                            href={`/api/download/${book.id}?type=book`}
                            className="text-primary hover:text-primary-dark hover:underline text-sm flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download PDF Preview
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-auto">
                {book.isSold ? (
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
                
                <p className="text-xs text-gray-500 mt-4 text-center">
                  Listed on {new Date(book.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}