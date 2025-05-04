"use client";

import { useState, useEffect } from 'react';
import ItemCard from './ItemCard';

interface Item {
    id: string;
    name: string;
    title: string;
    description: string;
    price: number;
    count: number;
}

interface ItemListingProps {
    books: Item[];
    stationary: Item[];
    uniforms: Item[];
}

export default function ItemListing({ books, stationary, uniforms }: ItemListingProps) {
const [selectedCategory, setSelectedCategory] = useState('book');
const [items, setItems] = useState<Item[]>([]);

useEffect(() => {
    switch (selectedCategory) {
    case 'book':
        setItems(books);
        break;
    case 'stationary':
        setItems(stationary);
        break;
    case 'uniforms':
        setItems(uniforms);
        break;
    default:
        setItems([]);
    }
}, [selectedCategory, books, stationary, uniforms]);

const handleCategoryChange = (e: { target: { value: any; }; }) => {
    const newCategory = e.target.value;
    setSelectedCategory(newCategory);
};

return (
    <div className="container mx-auto px-4">
    {}
    <div className="mb-8">
        <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-2">
        Select Category
        </label>
        <select
        id="category-select"
        value={selectedCategory}
        onChange={handleCategoryChange}
        className="block w-full max-w-md px-4 py-2 text-primary border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
        >
        <option value="book">Books</option>
        <option value="stationary">Stationary</option>
        <option value="uniforms">Uniforms</option>
        </select>
    </div>

    {}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.length > 0 ? (
        items.map((item) => (
            <ItemCard 
            key={`${selectedCategory}-${item.id}`}
            item={item}
            type={selectedCategory}
            />
        ))
        ) : (
        <div className="col-span-full text-center py-12 text-gray-500">
            <p>No items found in this category.</p>
        </div>
        )}
    </div>
    </div>
);
}