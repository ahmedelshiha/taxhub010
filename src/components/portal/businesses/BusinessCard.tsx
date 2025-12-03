"use client";

import { Building2, Calendar, FileText, MapPin, MoreVertical } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

interface BusinessCardProps {
    business: {
        id: string;
        name: string;
        country: string;
        legalForm?: string | null;
        status: string;
        createdAt: string | Date;
        userRole?: string;
        licensesCount?: number;
        registrationsCount?: number;
    };
}

const statusConfig = {
    ACTIVE: {
        label: "Active",
        className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    },
    PENDING_APPROVAL: {
        label: "Pending Approval",
        className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    },
    REJECTED: {
        label: "Rejected",
        className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    },
    REQUIRES_CHANGES: {
        label: "Requires Changes",
        className: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    },
    SUSPENDED: {
        label: "Suspended",
        className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    },
    ARCHIVED: {
        label: "Archived",
        className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    },
} as const;

const countryFlags: Record<string, string> = {
    AE: "🇦🇪",
    US: "🇺🇸",
    GB: "🇬🇧",
    SA: "🇸🇦",
    EG: "🇪🇬",
};

export function BusinessCard({ business }: BusinessCardProps) {
    const statusInfo = statusConfig[business.status as keyof typeof statusConfig] || {
        label: business.status,
        className: "bg-gray-100 text-gray-700",
    };

    const countryFlag = countryFlags[business.country] || "🌍";

    const handleViewDetails = () => {
        window.location.href = `/portal/businesses/${business.id}`;
    };

    return (
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1" onClick={handleViewDetails}>
                        <div className="flex items-center gap-2 mb-1">
                            <Building2 className="h-5 w-5 text-blue-600" />
                            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-blue-600 transition-colors">
                                {business.name}
                            </h3>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="text-xl">{countryFlag}</span>
                            <span>{business.country}</span>
                            {business.legalForm && (
                                <>
                                    <span>•</span>
                                    <span>{business.legalForm}</span>
                                </>
                            )}
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleViewDetails}>
                                View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                                Archive
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>

            <CardContent className="space-y-3" onClick={handleViewDetails}>
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                    <Badge className={cn("font-medium", statusInfo.className)}>
                        {statusInfo.label}
                    </Badge>
                    {business.userRole && (
                        <span className="text-xs text-muted-foreground px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                            {business.userRole}
                        </span>
                    )}
                </div>

                {/* Metadata */}
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Created {formatDate(business.createdAt)}</span>
                    </div>

                    {(business.licensesCount || business.registrationsCount) ? (
                        <div className="flex items-center gap-4 text-muted-foreground">
                            {business.licensesCount !== undefined && (
                                <div className="flex items-center gap-1">
                                    <FileText className="h-4 w-4" />
                                    <span>{business.licensesCount} license{business.licensesCount !== 1 ? 's' : ''}</span>
                                </div>
                            )}
                            {business.registrationsCount !== undefined && (
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    <span>{business.registrationsCount} registration{business.registrationsCount !== 1 ? 's' : ''}</span>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>

                {/* View Details Link */}
                <div className="pt-2 border-t">
                    <Button
                        variant="ghost"
                        className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails();
                        }}
                    >
                        View Details →
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
