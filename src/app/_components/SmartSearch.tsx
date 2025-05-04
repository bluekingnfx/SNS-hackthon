

"use client";

import { useState, useRef, SetStateAction } from 'react';
import DirectImageDisplay from './DirectImageDisplay';

export default function SmartSearch() {
const [searchQuery, setSearchQuery] = useState('');
const [imageFile, setImageFile] = useState<File | null>(null);
const [imagePreview, setImagePreview] = useState('');
const [isSearching, setIsSearching] = useState(false);
interface SearchResult {
id: string;
type: string;
title: string;
description: string;
price: number;
}

const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
const [searchType, setSearchType] = useState('text'); 
const fileInputRef = useRef<HTMLInputElement>(null);

const handleSearchChange = (e: { target: { value: SetStateAction<string>; }; }) => {
setSearchQuery(e.target.value);
};

const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
const files = e.target.files;
if (!files || files.length === 0) return;
const file = files[0];

setImageFile(file);

const reader = new FileReader();
reader.onloadend = () => {
    if (typeof reader.result === 'string') {
    setImagePreview(reader.result);
    }
};
if (file) {
    reader.readAsDataURL(file);
}

setSearchType('image');
};

const switchToTextSearch = () => {
setSearchType('text');
setImageFile(null);
setImagePreview('');
};

const triggerFileInput = () => {
if (fileInputRef.current) {
    fileInputRef.current.click();
}
};

const handleSubmit = async (e: { preventDefault: () => void; }) => {
e.preventDefault();
setIsSearching(true);

try {
    let searchData;
    
    if (searchType === 'text') {
    searchData = {
        type: 'text',
        query: searchQuery
    };
    } else {
    const base64Image = await fileToBase64(imageFile);
    
    searchData = {
        type: 'image',
        imageData: base64Image
    };
    }
    
    const response = await fetch('/api/smart-search', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(searchData),
    });
    
    if (!response.ok) {
    throw new Error(`Search failed: ${response.status}`);
    }
    
    const results = await response.json();
    setSearchResults(results);
} catch (error) {
    console.error('Search error:', error);
    setSearchResults([]);
} finally {
    setIsSearching(false);
}
};

const fileToBase64 = (file: Blob | null) => {
return new Promise((resolve, reject) => {
    const reader = new FileReader();
    if(file) {
    reader.readAsDataURL(file);
    }
    reader.onload = () => {
    const base64 = typeof reader.result === 'string' ? reader.result.split(',')[1] : '';
    resolve(base64);
    };
    reader.onerror = error => reject(error);
});
};

return (
<div className="max-w-4xl mx-auto">
    <div className="bg-white p-6 rounded-lg shadow-md">
    <h2 className="text-2xl font-bold text-primary mb-6">Smart Item Search</h2>
    
    {}
    <div className="flex border-b mb-6">
        <button
        className={`py-2 px-4 font-medium ${searchType === 'text' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
        onClick={switchToTextSearch}
        >
        Text Search
        </button>
        <button
        className={`py-2 px-4 font-medium ${searchType === 'image' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
        onClick={triggerFileInput}
        >
        Image Search
        </button>
    </div>
    
    <form onSubmit={handleSubmit} className="mb-8">
        {}
        {searchType === 'text' && (
        <div className="mb-4">
            <label htmlFor="text-search" className="block text-sm font-medium text-gray-700 mb-1">
            Search for items
            </label>
            <input
            type="text"
            id="text-search"
            placeholder="Enter keywords like 'red notebook' or 'science textbook'..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required={searchType === 'text'}
            />
        </div>
        )}
        
        {}
        <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleImageChange}
        />
        
        {}
        {searchType === 'image' && (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
            Image to search with
            </label>
            
            {imagePreview ? (
            <div className="relative w-full h-64 mb-2 border rounded-lg overflow-hidden">
                <img
                src={imagePreview}
                alt="Search preview"
                className="w-full h-full object-contain"
                />
                <button
                type="button"
                onClick={triggerFileInput}
                className="absolute bottom-2 right-2 bg-white text-primary p-2 rounded-full shadow hover:bg-gray-100"
                >
                Change
                </button>
            </div>
            ) : (
            <div 
                onClick={triggerFileInput} 
                className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary"
            >
                <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-1 text-sm text-gray-600">Click to upload an image</p>
                <p className="mt-1 text-xs text-gray-500">JPG, PNG, GIF up to 5MB</p>
                </div>
            </div>
            )}
        </div>
        )}
        
        {}
        <button
        type="submit"
        disabled={isSearching || (searchType === 'text' && !searchQuery) || (searchType === 'image' && !imageFile)}
        className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
        {isSearching ? 'Searching...' : 'Search Items'}
        </button>
    </form>
    
    {}
    <div>
        <h3 className="text-lg font-semibold mb-4">
        {isSearching 
            ? 'Searching...' 
            : searchResults.length > 0 
            ? `Found ${searchResults.length} items` 
            : searchResults.length === 0 && (searchQuery || imageFile) 
                ? 'No items found' 
                : 'Enter search or upload an image'}
        </h3>
        
        {isSearching && (
        <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {searchResults.map((item) => (
            <div key={`${item.type}-${item.id}`} className="bg-white rounded-lg shadow-sm overflow-hidden border hover:shadow-md transition-shadow">
            <div className="h-40 relative">
                <DirectImageDisplay 
                imageUrl={`/api/image/${item.id}?type=${item.type}`}
                alt={item.title}
                className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-primary bg-opacity-90 text-white text-xs font-bold uppercase px-2 py-1 rounded">
                {item.type}
                </div>
            </div>
            <div className="p-4">
                <h4 className="font-medium text-gray-900 mb-1 truncate">{item.title}</h4>
                <p className="text-sm text-gray-500 mb-2 line-clamp-2">{item.description}</p>
                <div className="flex justify-between items-center">
                <span className="text-primary font-semibold">₹{item.price}</span>
                <a 
                    href={`/items/${item.type}/${item.id}`} 
                    className="text-sm text-primary hover:underline"
                >
                    View Details →
                </a>
                </div>
            </div>
            </div>
        ))}
        </div>
    </div>
    </div>
</div>
);
}