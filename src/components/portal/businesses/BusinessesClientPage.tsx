"use client";

import { useState } from "react";
import useSWR from "swr";
import { Building2, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BusinessList } from "./BusinessList";
import { BusinessFilters } from "./BusinessFilters";
import { EmptyBusinessState } from "./EmptyBusinessState";
import { fetcher } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";

type BusinessStatus = "all" | "ACTIVE" | "PENDING_APPROVAL" | "REJECTED" | "REQUIRES_CHANGES";

export default function BusinessesClientPage() {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<BusinessStatus>("all");

    // Build API URL with query params
    const apiUrl = `/api/portal/businesses?${new URLSearchParams({
        ...(search && { search }),
        ...(status !== "all" && { status }),
    })}`;

    const { data, error, isLoading, mutate } = useSWR(apiUrl, fetcher);

    const businesses = data?.businesses || [];
    const total = data?.total || 0;

    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Building2 className="h-8 w-8 text-blue-600" />
                        My Businesses
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your registered business entities
                    </p>
                </div>
                <Button
                    size="lg"
                    className="gap-2"
                    onClick={() => (window.location.href = "/portal/setup")}
                >
                    <Plus className="h-4 w-4" />
                    Add Business
                </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search businesses..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <BusinessFilters status={status} onStatusChange={setStatus} />
            </div>

            {/* Results Count */}
            {!isLoading && (
                <div className="mb-4 text-sm text-muted-foreground">
                    {total === 0
                        ? "No businesses found"
                        : `Showing ${businesses.length} ${businesses.length === 1 ? "business" : "businesses"
                        }`}
                </div>
            )}

            {/* Content */}
            {isLoading ? (
                <LoadingSkeleton />
            ) : error ? (
                <ErrorState error={error} />
            ) : businesses.length === 0 ? (
                <EmptyBusinessState hasFilters={search !== "" || status !== "all"} />
            ) : (
                <BusinessList businesses={businesses} onUpdate={mutate} />
            )}
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="border rounded-lg p-6 space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <div className="flex gap-2">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-20" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function ErrorState({ error }: { error: any }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-red-500 text-lg font-semibold mb-2">
                Failed to load businesses
            </div>
            <p className="text-muted-foreground">
                {error?.message || "An unexpected error occurred"}
            </p>
            <Button
                variant="outline"
                className="mt-4"
                onClick={() => window.location.reload()}
            >
                Try Again
            </Button>
        </div>
    );
}
