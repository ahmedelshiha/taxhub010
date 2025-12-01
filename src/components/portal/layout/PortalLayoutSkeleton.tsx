import { Skeleton } from "@/components/ui/skeleton"

export function PortalLayoutSkeleton() {
    return (
        <div className="h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden">
            {/* Sidebar Skeleton */}
            <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex-shrink-0 hidden md:flex flex-col">
                <div className="h-16 border-b border-gray-200 dark:border-gray-700 flex items-center px-6">
                    <Skeleton className="h-8 w-32" />
                </div>
                <div className="flex-1 p-4 space-y-6">
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-20 ml-2" />
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-10 w-full rounded-lg" />
                        ))}
                    </div>
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-20 ml-2" />
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-10 w-full rounded-lg" />
                        ))}
                    </div>
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header Skeleton */}
                <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
                    <Skeleton className="h-10 w-64 rounded-lg" />
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-9 w-32 rounded-md hidden sm:block" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                </div>

                {/* Content Area Skeleton */}
                <div className="flex-1 p-6 overflow-hidden">
                    <div className="max-w-7xl mx-auto space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-48" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <div className="flex gap-3">
                                <Skeleton className="h-9 w-24 rounded-md" />
                                <Skeleton className="h-9 w-32 rounded-md" />
                            </div>
                        </div>

                        {/* Tabs Skeleton */}
                        <div className="border-b border-gray-200 dark:border-gray-700">
                            <div className="flex gap-6">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Skeleton key={i} className="h-10 w-24 rounded-t-lg" />
                                ))}
                            </div>
                        </div>

                        {/* Dashboard Grid Skeleton */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} className="h-32 rounded-xl" />
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Skeleton className="h-96 lg:col-span-2 rounded-xl" />
                            <Skeleton className="h-96 rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
