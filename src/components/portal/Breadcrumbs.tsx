/**
 * Breadcrumbs Component
 * Displays navigation breadcrumb trail for portal pages
 * Follows WCAG 2.1 AA accessibility guidelines
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBreadcrumbs } from "@/components/portal/providers/BreadcrumbProvider";

interface BreadcrumbItem {
    label: string;
    href: string;
}

interface BreadcrumbsProps {
    /**
     * Override automatic breadcrumbs with custom items
     */
    items?: BreadcrumbItem[];
    /**
     * Additional CSS classes
     */
    className?: string;
}

/**
 * Generate breadcrumbs from pathname
 * Example: /portal/kyc/details → [Portal, KYC, Details]
 */
function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
    // Remove trailing slash and split
    const segments = pathname.replace(/\/$/, "").split("/").filter(Boolean);

    const breadcrumbs: BreadcrumbItem[] = [];
    let currentPath = "";

    segments.forEach((segment, index) => {
        currentPath += `/${segment}`;

        // Format label: convert kebab-case to Title Case
        const label = segment
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

        breadcrumbs.push({
            label,
            href: currentPath,
        });
    });

    return breadcrumbs;
}

/**
 * Map route paths to human-readable labels
 */
const ROUTE_LABELS: Record<string, string> = {
    portal: "Dashboard",
    kyc: "KYC Center",
    documents: "Documents",
    invoicing: "Invoicing",
    bills: "Bills",
    approvals: "Approvals",
    messages: "Messages",
    tasks: "Tasks",
    bookings: "Appointments",
    "service-requests": "Service Requests",
    reports: "Reports",
    calendar: "Calendar",
    analytics: "Analytics",
    help: "Help Center",
    settings: "Settings",
    compliance: "Compliance",
    expenses: "Expenses",
    activity: "Activity",
    entities: "Entities",
    new: "New",
    edit: "Edit",
};

export function Breadcrumbs({ items: propItems, className }: BreadcrumbsProps) {
    const pathname = usePathname();
    const { items: contextItems, dynamicLabels } = useBreadcrumbs();

    // Priority: Prop items > Context items > Generated from pathname
    const rawBreadcrumbs = propItems || contextItems || generateBreadcrumbs(pathname);
    const breadcrumbs = Array.isArray(rawBreadcrumbs) ? rawBreadcrumbs : [];

    // Map breadcrumbs to use friendly labels
    const labeledBreadcrumbs = breadcrumbs.map((crumb) => {
        const segments = crumb.href.split("/").filter(Boolean);
        const lastSegment = segments[segments.length - 1];

        // Check for dynamic label override (e.g. ID -> Name)
        const dynamicLabel = dynamicLabels[lastSegment];

        return {
            ...crumb,
            label: dynamicLabel || ROUTE_LABELS[lastSegment] || crumb.label,
        };
    });

    // Don't show breadcrumbs on home/dashboard page
    if (labeledBreadcrumbs.length <= 1) {
        return null;
    }

    return (
        <nav
            aria-label="Breadcrumb"
            className={cn("flex items-center space-x-2 text-sm", className)}
        >
            {/* Home link */}
            <Link
                href="/portal"
                className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                aria-label="Go to dashboard"
            >
                <Home className="h-4 w-4" />
                <span className="sr-only">Dashboard</span>
            </Link>

            {/* Breadcrumb items */}
            {labeledBreadcrumbs.map((crumb, index) => {
                const isLast = index === labeledBreadcrumbs.length - 1;
                const isCurrent = crumb.href === pathname;

                return (
                    <div key={crumb.href} className="flex items-center gap-2">
                        {/* Separator */}
                        <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-600" aria-hidden="true" />

                        {/* Breadcrumb link */}
                        {isLast || isCurrent ? (
                            <span
                                className="font-medium text-gray-900 dark:text-gray-100"
                                aria-current="page"
                            >
                                {crumb.label}
                            </span>
                        ) : (
                            <Link
                                href={crumb.href}
                                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                            >
                                {crumb.label}
                            </Link>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}

/**
 * Specialized breadcrumb variants
 */

/**
 * Entity-specific breadcrumbs (for /portal/entities/[id]/...)
 */
interface EntityBreadcrumbsProps {
    entityId: string;
    entityName: string;
    currentPage?: string;
}

export function EntityBreadcrumbs({
    entityId,
    entityName,
    currentPage,
}: EntityBreadcrumbsProps) {
    const items: BreadcrumbItem[] = [
        { label: "Dashboard", href: "/portal" },
        { label: "Entities", href: "/portal/entities" },
        { label: entityName, href: `/portal/entities/${entityId}` },
    ];

    if (currentPage) {
        items.push({
            label: currentPage,
            href: `#`, // Current page, no navigation
        });
    }

    return <Breadcrumbs items={items} />;
}

/**
 * Compliance-specific breadcrumbs (for /portal/compliance/[id])
 */
interface ComplianceBreadcrumbsProps {
    complianceId?: string;
    complianceTitle?: string;
}

export function ComplianceBreadcrumbs({
    complianceId,
    complianceTitle,
}: ComplianceBreadcrumbsProps) {
    const items: BreadcrumbItem[] = [
        { label: "Dashboard", href: "/portal" },
        { label: "Compliance", href: "/portal/compliance" },
    ];

    if (complianceId && complianceTitle) {
        items.push({
            label: complianceTitle,
            href: `/portal/compliance/${complianceId}`,
        });
    }

    return <Breadcrumbs items={items} />;
}
