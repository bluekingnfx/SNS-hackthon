

export default function Loading() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">

                <div className="p-6 border-b border-gray-200">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-64"></div>
                    </div>
                </div>
                <div className="p-6 flex flex-col items-center border-b border-gray-200">
                    <div className="animate-pulse">
                        <div className="h-32 w-32 bg-gray-200 rounded-full mb-4"></div>
                    </div>
                </div>

                <div className="p-6 space-y-6">

                    <div className="animate-pulse border-b border-gray-200 pb-4">
                        <div className="flex justify-between mb-2">
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                            <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-full max-w-xs"></div>
                    </div>
                    

                    <div className="animate-pulse border-b border-gray-200 pb-4">
                        <div className="flex justify-between mb-2">
                            <div className="h-4 bg-gray-200 rounded w-12"></div>
                            <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </div>
                    
                    <div className="animate-pulse border-b border-gray-200 pb-4">
                        <div className="flex justify-between mb-2">
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                            <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-full"></div>
                    </div>
                    
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded w-12"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}