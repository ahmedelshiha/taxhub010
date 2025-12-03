"use client";

import { BusinessCard } from "./BusinessCard";

interface Business {
    id: string;
    name: string;
    country: string;
    legalForm?: string | null;
    status: string;
    createdAt: string | Date;
    userRole?: string;
    licensesCount?: number;
    registrationsCount?: number;
}

interface BusinessListProps {
    businesses: Business[];
    onUpdate?: () => void;
}

export function BusinessList({ businesses, onUpdate }: BusinessListProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
            ))}
        </div>
    );
}
