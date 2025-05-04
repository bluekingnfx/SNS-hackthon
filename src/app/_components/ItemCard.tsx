"use client";

import React from 'react';
import Link from 'next/link';
import DirectImageDisplay from './DirectImageDisplay';

interface Item {
    id: string;
    title: string;
    description: string;
    price: number;
    count: number;
    isFeatured?: boolean;
    isSold?: boolean;
    fileDataExists?: boolean;
    condition?: string;
    size?: string;
}

interface ItemCardProps {
item: Item;
type: 'book' | 'uniforms' | string;
}

export default function ItemCard({ item, type }: ItemCardProps) {
return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
    <div className="relative h-48">
        <DirectImageDisplay 
        imageUrl={`/api/image/${item.id}?type=${type}`}
        alt={item.title}
        className="w-full h-full object-cover"
        />
        
        {item.isFeatured && (
        <span className="absolute top-2 right-2 bg-yellow-400 text-xs font-semibold px-2 py-1 rounded-full">
            Featured
        </span>
        )}
        
        {item.isSold && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold text-xl">SOLD</span>
        </div>
        )}
    </div>

    <div className="p-4">
        <h3 className="text-primary font-semibold text-lg mb-1 truncate">{item.title}</h3>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.description}</p>
        
        <div className="flex justify-between items-center">
        <span className="text-primary font-bold">₹{item.price}</span>
        <span className="text-gray-500 text-sm">{item.count} available</span>
        </div>

        {type === 'book' && item.fileDataExists && (
        <div className="mt-2 text-xs text-gray-500">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">PDF Included</span>
        </div>
        )}
        
        {type === 'uniforms' && (
        <div className="mt-2 text-xs text-gray-500">
            <span className={`px-2 py-1 rounded-full ${
            item.condition === 'new' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-orange-100 text-orange-800'
            }`}>
            {item.condition?.toUpperCase() || 'NEW'}
            </span>
            {item.size && (
            <span className="ml-2 bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                Size: {item.size}
            </span>
            )}
        </div>
        )}

        <Link 
        href={`/items/${type}/${item.id}`}
        className="block w-full mt-3 text-center bg-primary text-white py-2 rounded-md hover:bg-primary-dark transition-colors"
        >
        View Details
        </Link>
    </div>
    </div>
);
}