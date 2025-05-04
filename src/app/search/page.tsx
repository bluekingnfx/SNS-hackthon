
import Link from 'next/link';
import SmartSearch from '../_components/SmartSearch';

export default function SearchPage() {
    return (
    <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
        <Link href="/" className="text-primary hover:underline">
            ← Back to Home
        </Link>
        </div>
        
        <h1 className="text-3xl font-bold mb-8 text-center text-primary">Smart Item Search</h1>
        <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
        Search using text keywords or upload an image to find similar items in our inventory.
        Our AI-powered search will analyze your query and show you the most relevant results.
        </p>
        
        <SmartSearch />
    </div>
    );
}