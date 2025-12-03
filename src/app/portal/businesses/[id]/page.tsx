/**
 * Business Details Page - Server Component
 * Entry point for viewing a specific business entity
 */

import { Suspense } from "react";
import BusinessDetailsClientPage from "@/components/portal/businesses/BusinessDetailsClientPage";
import { Loader2 } from "lucide-react";

export const metadata = {
    title: "Business Details | NextAccounting",
    description: "View and manage business details, licenses, and registrations",
};

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function BusinessDetailsPage({ params }: PageProps) {
    const { id } = await params;

    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            }
        >
            <BusinessDetailsClientPage entityId={id} />
        </Suspense>
    );
}
