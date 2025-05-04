"use client";

import { useState, useEffect } from 'react';

interface DirectImageDisplayProps {
    imageUrl: string;
    alt?: string;
    className?: string;
}

export default function DirectImageDisplay({ imageUrl, alt, className }: DirectImageDisplayProps) {
const [imageData, setImageData] = useState<string | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
    const fetchImage = async () => {
    try {
        setLoading(true);
        const response = await fetch(imageUrl);
        
        if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }
        
        const imageArrayBuffer = await response.arrayBuffer();
        
        const base64String = arrayBufferToBase64(imageArrayBuffer);
        
        setImageData(`data:image/jpeg;base64,${base64String}`);
        setError(null);
    } catch (err) {
        console.error('Error loading image:', err);
        setError('Failed to load image');
    } finally {
        setLoading(false);
    }
    };

    if (imageUrl) {
    fetchImage();
    }
}, [imageUrl]);

function arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    
    for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
    }
    
    return window.btoa(binary);
}

if (loading) {
    return (
    <div className={`bg-gray-200 animate-pulse ${className || 'h-48 w-full'}`}>
        <div className="flex items-center justify-center h-full">
        <span className="text-gray-500">Loading...</span>
        </div>
    </div>
    );
}

if (error) {
    return (
    <div className={`bg-red-100 ${className || 'h-48 w-full'}`}>
        <div className="flex items-center justify-center h-full">
        <span className="text-red-500">Error loading image</span>
        </div>
    </div>
    );
}

return (
    <img 
    src={imageData ?? ''} 
    alt={alt || 'Image'} 
    className={className || 'h-48 w-full object-cover'} 
    />
);
}