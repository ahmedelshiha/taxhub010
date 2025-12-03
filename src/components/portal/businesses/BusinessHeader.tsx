"use client";

import { Building2, MapPin, Calendar, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

interface BusinessHeaderProps {
    entity: any; // Using any for now, should be typed properly
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

export function BusinessHeader({ entity }: BusinessHeaderProps) {
    const statusInfo = statusConfig[entity.status as keyof typeof statusConfig] || {
        label: entity.status,
        className: "bg-gray-100 text-gray-700",
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex items-start gap-4">
                    <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-300" />
                    </div>

                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold">{entity.name}</h1>
                            <Badge className={cn("font-medium", statusInfo.className)}>
                                {statusInfo.label}
                            </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Globe className="h-4 w-4" />
                                <span>{entity.country}</span>
                            </div>
                            {entity.legalForm && (
                                <div className="flex items-center gap-1">
                                    <span className="w-1 h-1 bg-gray-400 rounded-full" />
                                    <span>{entity.legalForm}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>Registered {formatDate(entity.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline">Edit Details</Button>
                    <Button>New Request</Button>
                </div>
            </div>
        </div>
    );
}
