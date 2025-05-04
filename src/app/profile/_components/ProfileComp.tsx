"use client";

import { useState } from 'react';


const ProfileComponent = ({
    user
}: {
    user: {
        id: number, 
        name: string,
        age: number,
        email: string,
        profilePhoto: Buffer | string | null,
    }
}) => {
    const [editedUser, setEditedUser] = useState({...user});
    
    const [editMode, setEditMode] = useState({
        name: false,
        age: false,
        email: false,
        profilePhoto: false
    });
    
    const [isSaving, setIsSaving] = useState(false);
    
    const [feedback, setFeedback] = useState({
        message: '',
        type: '' 
    });
    
    const hasChanges = JSON.stringify(user) !== JSON.stringify(editedUser);
    
    const toggleEditMode = (field: keyof typeof editMode) => {
        setEditMode(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
        
        if (editMode[field]) {
            setEditedUser(prev => ({
                ...prev,
                [field]: user[field]
            }));
        }
    };
    
    const handleChange = (field: string, value: string | number) => {
        setEditedUser(prev => ({
            ...prev,
            [field]: value
        }));
    };
    
    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
            if (files && files[0]) {
                const file = files[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = reader.result
                        ? btoa(String.fromCharCode(...new Uint8Array(reader.result as ArrayBuffer)))
                        : null;

                    setEditedUser(prev => ({
                        ...prev,
                        profilePhoto: base64String
                    }));
                };
                reader.readAsArrayBuffer(file);
        }
        };
    }      
    
    const saveChanges = async () => {
        setIsSaving(true);
        setFeedback({ message: '', type: '' });
        
        try {
            const changedFields: Partial<typeof user> = {};
            if (editedUser.name !== user.name) changedFields.name = editedUser.name;
            if (editedUser.age !== user.age) changedFields.age = editedUser.age;
            if (editedUser.email !== user.email) changedFields.email = editedUser.email;
            if (editedUser.profilePhoto !== user.profilePhoto) changedFields.profilePhoto = editedUser.profilePhoto;
            
            const response = await fetch(`/api/profile?userId=${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(changedFields) 
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update profile');
            }
            
            const updatedUser = await response.json();
            
            
            setFeedback({
                message: 'Profile updated successfully!',
                type: 'success'
            });

            setEditedUser(updatedUser);
            
            setEditMode({
                name: false,
                age: false,
                email: false,
                profilePhoto: false
            });
            
        } catch (error) {
            console.error('Error updating profile:', error);
            setFeedback({
                message: error instanceof Error ? error.message : 'Failed to update profile',
                type: 'error'
            });
        } finally {
            setIsSaving(false);
        }
    };
    return (
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto mt-10 ">
            
            {feedback.message && (
                <div className={`mb-4 p-3 rounded ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {feedback.message}
                </div>
            )}
            
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-primary">My Profile</h2>
                {hasChanges && (
                    <button 
                        onClick={saveChanges}
                        disabled={isSaving}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 disabled:opacity-50 transition"
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                )}
            </div>

            <div className="flex flex-col items-center mb-6">
                <div className="relative mb-2">
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {editedUser.profilePhoto ? (
                            <img 
                                src={`data:image/jpeg;base64,${Buffer.from(editedUser.profilePhoto).toString('base64')}`}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-4xl text-gray-400">{editedUser.name.charAt(0)}</span>
                        )}
                    </div>
                    <button 
                        type="button"
                        aria-label="Edit Profile Photo"
                        onClick={() => toggleEditMode('profilePhoto')}
                        className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-md hover:bg-opacity-90"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                </div>
                
                {editMode.profilePhoto && (
                    <div className="mb-4">
                        <input 
                            type="file"
                            accept="image/*"
                            aria-label='Upload Profile Photo'
                            onChange={handlePhotoUpload}
                            className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-opacity-90"
                        />
                        <button
                            onClick={() => toggleEditMode('profilePhoto')}
                            className="mt-2 text-red-500 hover:text-red-700 text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>

            <div className="space-y-4">

                <div className="border-b border-gray-200 pb-3">
                    <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-medium text-gray-500">Name</label>
                        <button 
                            aria-label='Edit Name'

                            onClick={() => toggleEditMode('name')}
                            className="text-primary hover:text-opacity-80"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </button>
                    </div>
                    
                    {editMode.name ? (
                        <div>
                            <input
                                aria-label='Edit Name'
                                type="text"
                                value={editedUser.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <div className="flex justify-end mt-2">
                                <button
                                    onClick={() => toggleEditMode('name')}
                                    className="text-red-500 hover:text-red-700 text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-lg font-medium text-gray-800">{editedUser.name}</p>
                    )}
                </div>
                
                <div className="border-b border-gray-200 pb-3">
                    <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-medium text-gray-500">Age</label>
                        <button 
                            aria-label='Edit Age'
                            onClick={() => toggleEditMode('age')}
                            className="text-primary hover:text-opacity-80"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </button>
                    </div>
                    
                    {editMode.age ? (
                        <div>
                            <input
                                aria-label='Edit Age'
                                type="number"
                                value={editedUser.age}
                                onChange={(e) => handleChange('age', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <div className="flex justify-end mt-2">
                                <button
                                    onClick={() => toggleEditMode('age')}
                                    className="text-red-500 hover:text-red-700 text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-lg font-medium text-gray-800">{editedUser.age}</p>
                    )}
                </div>
                
                {}
                <div className="border-b border-gray-200 pb-3">
                    <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-medium text-gray-500">Email</label>
                        <button 
                            aria-label='Edit Email'
                            onClick={() => toggleEditMode('email')}
                            className="text-primary hover:text-opacity-80"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </button>
                    </div>
                    
                    {editMode.email ? (
                        <div>
                            <input
                                aria-label='Edit Email'
                                type="email"
                                value={editedUser.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <div className="flex justify-end mt-2">
                                <button
                                    onClick={() => toggleEditMode('email')}
                                    className="text-red-500 hover:text-red-700 text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-lg font-medium text-gray-800">{editedUser.email}</p>
                    )}
                </div>
                
                {}
                <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Account ID</label>
                    <p className="text-lg font-medium text-gray-800">{editedUser.id}</p>
                </div>
            </div>
        </div>
    );
};

export default ProfileComponent;