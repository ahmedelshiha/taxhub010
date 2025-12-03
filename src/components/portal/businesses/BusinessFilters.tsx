"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";

type BusinessStatus = "all" | "ACTIVE" | "PENDING_APPROVAL" | "REJECTED" | "REQUIRES_CHANGES";

interface BusinessFiltersProps {
    status: BusinessStatus;
    onStatusChange: (status: BusinessStatus) => void;
}

export function BusinessFilters({ status, onStatusChange }: BusinessFiltersProps) {
    return (
        <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
            <Select value={status} onValueChange={(value) => onStatusChange(value as BusinessStatus)}>
                <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                    <SelectItem value="REQUIRES_CHANGES">Requires Changes</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
