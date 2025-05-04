"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type ItemType = 'book' | 'stationary' | 'uniforms';

interface FormErrors {
title?: string;
description?: string;
price?: string;
thumbnail?: string;
count?: string;
size?: string;
fileData?: string;
general?: string;
}

interface ItemFormProps {
userId: number;
}

export default function ItemForm({ userId }: ItemFormProps) {
console.log('[DEBUG] ItemForm initialized with userId:', userId); 

const router = useRouter();
const [itemType, setItemType] = useState<ItemType>('book');
const [isSubmitting, setIsSubmitting] = useState(false);
const [errors, setErrors] = useState<FormErrors>({});
const [count, setCount] = useState(1);

console.log('[DEBUG] Initial state:', { itemType, isSubmitting, errors, count }); 

const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
    console.log('[DEBUG] handleTypeChange called with value:', e.target.value); 
    setItemType(e.target.value as ItemType);
    } catch (error) {
    console.error('[DEBUG] Error changing item type:', error);
    }
};

const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
    console.log('[DEBUG] handleCountChange called with value:', e.target.value); 
    const newCount = parseInt(e.target.value);
    if (!isNaN(newCount)) {
        setCount(newCount);
    } else {
        console.warn('[DEBUG] Invalid count value:', e.target.value); 
    }
    } catch (error) {
    console.error('[DEBUG] Error changing count:', error);
    }
};

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log('[DEBUG] Form submission started'); 
    
    try {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    
    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    
    console.log('[DEBUG] Form data keys:', Array.from(formData.keys())); 
    
    const validationErrors: FormErrors = {};
    
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const price = formData.get('price') as string;
    const thumbnail = formData.get('thumbnail') as File;
    
    console.log('[DEBUG] Validating common fields:', { 
        title, 
        description, 
        price, 
        thumbnailName: thumbnail?.name,
        thumbnailSize: thumbnail?.size,
        thumbnailType: thumbnail?.type
    }); 
    
    if (!title) validationErrors.title = 'Title is required';
    if (!description) validationErrors.description = 'Description is required';
    if (!price || parseInt(price) <= 0) validationErrors.price = 'Price must be a positive number';
    
    console.log('[DEBUG] Thumbnail validation:', { 
        exists: !!thumbnail, 
        size: thumbnail?.size, 
        isFile: thumbnail instanceof File 
    });
    if (!thumbnail || thumbnail.size === 0) validationErrors.thumbnail = 'Thumbnail is required';
    
    console.log('[DEBUG] Count validation:', { count }); 
    if (count <= 0) validationErrors.count = 'Count must be at least 1';
    
    console.log('[DEBUG] Item type validation for:', itemType); 
    if (itemType === 'book') {
        const fileData = formData.get('fileData') as File;
        console.log('[DEBUG] Book fileData:', { 
        exists: !!fileData, 
        size: fileData?.size, 
        type: fileData?.type 
        }); 
        
        if (!fileData || fileData.size === 0) {
        validationErrors.fileData = 'PDF file is required';
        }
    } else if (itemType === 'uniforms') {
        const size = formData.get('size') as string;
        console.log('[DEBUG] Uniform size:', size); // Debug size
        
        if (!size) {
        validationErrors.size = 'Size is required';
        }
    }
    
    console.log('[DEBUG] Validation errors:', validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
        console.warn('[DEBUG] Form validation failed'); 
        setErrors(validationErrors);
        setIsSubmitting(false);
        return;
    }
    
    console.log('[DEBUG] Form validation passed, preparing submission'); 
    
    formData.append('userId', userId.toString());
    formData.append('count', count.toString());
    formData.append('typeOfItem', itemType);
    
    console.log('[DEBUG] Final form data keys:', Array.from(formData.keys())); 
    
    console.log('[DEBUG] Sending request to /api/items'); 
    const response = await fetch('/api/items', {
        method: 'POST',
        body: formData,
    });
    
    console.log('[DEBUG] API response status:', response.status); 
    
    const result = await response.json();
    console.log('[DEBUG] API response data:', result); 
    
    if (result.success) {
        console.log('[DEBUG] Form submission successful, redirecting to home'); 
        router.push('/');
        router.refresh();
    } else {
        console.error('[DEBUG] Form submission failed with server errors:', result.errors); // Debug server errors
        setErrors(result.errors || { general: 'Failed to create item' });
    }
    } catch (error) {
    console.error('[DEBUG] Error submitting form:', error); // Debug submission error
    
    if (error instanceof Error) {
        console.error('[DEBUG] Error name:', error.name);
        console.error('[DEBUG] Error message:', error.message);
        console.error('[DEBUG] Error stack:', error.stack);
    }
    
    setErrors({ general: error instanceof Error ? error.message : 'An unexpected error occurred' });
    } finally {
    console.log('[DEBUG] Form submission process completed'); 
    setIsSubmitting(false);
    }
};

console.log('[DEBUG] Rendering form with itemType:', itemType);
console.log('[DEBUG] Current errors:', errors);

return (
    <div className="w-full">
    
    <form onSubmit={handleSubmit} className="space-y-6">
        {}
        <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">Item Type</label>
        <div className="flex gap-4">
            {[
            { value: 'book', label: 'Book' },
            { value: 'stationary', label: 'Stationary' },
            { value: 'uniforms', label: 'Uniforms' }
            ].map((type) => (
            <label key={type.value} className="flex items-center cursor-pointer">
                <input
                type="radio"
                name="itemTypeRadio"
                value={type.value}
                checked={itemType === type.value}
                onChange={handleTypeChange}
                className="form-radio h-5 w-5 text-blue-600"
                />
                <span className="ml-2">{type.label}</span>
            </label>
            ))}
        </div>
        </div>
        
        {}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <label className="block text-gray-700 font-medium mb-2">
            Title <span className="text-red-500">*</span>
            </label>
            <input
            type="text"
            name="title"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
            onChange={() => console.log('[DEBUG] Title field changed')} 
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>
        
        <div>
            <label className="block text-gray-700 font-medium mb-2">
            Price <span className="text-red-500">*</span>
            </label>
            <input
            type="number"
            name="price"
            min="1"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
            onChange={() => console.log('[DEBUG] Price field changed')} 
            />
            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
        </div>
        </div>
        
        <div>
        <label className="block text-gray-700 font-medium mb-2">
            Description <span className="text-red-500">*</span>
        </label>
        <textarea
            name="description"
            rows={4}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
            onChange={() => console.log('[DEBUG] Description field changed')} 
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <label className="block text-gray-700 font-medium mb-2">
            Count <span className="text-red-500">*</span>
            </label>
            <input
            type="number"
            name="count"
            min="1"
            value={count}
            onChange={handleCountChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.count ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.count && <p className="text-red-500 text-sm mt-1">{errors.count}</p>}
        </div>
        
        <div>
            <label className="flex items-center cursor-pointer mt-8">
            <input
                type="checkbox"
                name="isFeatured"
                className="form-checkbox h-5 w-5 text-blue-600"
                onChange={(e) => console.log('[DEBUG] Featured checkbox changed:', e.target.checked)} 
            />
            <span className="ml-2">Feature this item</span>
            </label>
        </div>
        </div>
        
        <div>
        <label className="block text-gray-700 font-medium mb-2">
            Thumbnail <span className="text-red-500">*</span>
        </label>
        <input
            type="file"
            name="thumbnail"
            accept="image/*"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.thumbnail ? 'border-red-500' : 'border-gray-300'}`}
            onChange={(e) => {
            const file = e.target.files?.[0];
            console.log('[DEBUG] Thumbnail file selected:', {
                name: file?.name,
                type: file?.type,
                size: file?.size
            });
            }} 
        />
        {errors.thumbnail && <p className="text-red-500 text-sm mt-1">{errors.thumbnail}</p>}
        </div>
        
        {}
        {itemType === 'book' && (
        <div className="space-y-4">
            <div>
            <label className="block text-gray-700 font-medium mb-2">
                PDF File <span className="text-red-500">*</span>
            </label>
            <input
                type="file"
                name="fileData"
                accept=".pdf"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.fileData ? 'border-red-500' : 'border-gray-300'}`}
                onChange={(e) => {
                const file = e.target.files?.[0];
                console.log('[DEBUG] PDF file selected:', {
                    name: file?.name,
                    type: file?.type,
                    size: file?.size
                });
                }} // Debug PDF selection
            />
            {errors.fileData && <p className="text-red-500 text-sm mt-1">{errors.fileData}</p>}
            </div>
        </div>
        )}
        
        {/* Stationary-specific field */}
        {itemType === 'stationary' && (
        <div className="space-y-4">
            <div>
            <label className="block text-gray-700 font-medium mb-2">
                Additional Images (Optional)
            </label>
            <input
                type="file"
                name="additionalImgs"
                accept="image/*"
                multiple
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => {
                const files = e.target.files;
                console.log('[DEBUG] Additional images selected:', {
                    count: files?.length,
                    names: Array.from(files || []).map(f => f.name)
                });
                }} // Debug additional images
            />
            </div>
        </div>
        )}
        
        {/* Uniform-specific field */}
        {itemType === 'uniforms' && (
        <div className="space-y-4">
            <div>
            <label className="block text-gray-700 font-medium mb-2">
                Size <span className="text-red-500">*</span>
            </label>
            <input
                type="text"
                name="size"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.size ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="e.g. S, M, L, XL"
                onChange={(e) => console.log('[DEBUG] Size field changed:', e.target.value)} // Debug size change
            />
            {errors.size && <p className="text-red-500 text-sm mt-1">{errors.size}</p>}
            </div>
        </div>
        )}
        
        {/* General Error Display */}
        {errors.general && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{errors.general}</span>
        </div>
        )}
        
        <div>
        <button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
            onClick={() => console.log('[DEBUG] Submit button clicked')} // Debug submit click
        >
            {isSubmitting ? 'Creating...' : 'Sell Item'}
        </button>
        </div>
    </form>
    </div>
);
}