"use client";

import { useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetcher } from "@/lib/api-client";
import { BusinessHeader } from "./BusinessHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewTab } from "./tabs/OverviewTab";
import { LicensesTab } from "./tabs/LicensesTab";
import { RegistrationsTab } from "./tabs/RegistrationsTab";
import { DocumentsTab } from "./tabs/DocumentsTab";

interface BusinessDetailsClientPageProps {
    entityId: string;
}

export default function BusinessDetailsClientPage({ entityId }: BusinessDetailsClientPageProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("overview");

    const { data, error, isLoading, mutate } = useSWR(
        `/api/entities/${entityId}`,
        fetcher
    );

    const entity = data?.data;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error || !entity) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Business</h2>
                <p className="text-muted-foreground mb-6">
                    {error?.message || "Could not find the requested business."}
                </p>
                <Button onClick={() => router.push("/portal/businesses")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Businesses
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            {/* Back Button */}
            <Button
                variant="ghost"
                className="mb-6 pl-0 hover:pl-2 transition-all"
                onClick={() => router.push("/portal/businesses")}
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Businesses
            </Button>

            {/* Header Section */}
            <BusinessHeader entity={entity} />

            {/* Tabs Section */}
            <div className="mt-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                        <TabsTrigger
                            value="overview"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-6 py-3"
                        >
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value="licenses"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-6 py-3"
                        >
                            Licenses
                        </TabsTrigger>
                        <TabsTrigger
                            value="registrations"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-6 py-3"
                        >
                            Registrations
                        </TabsTrigger>
                        <TabsTrigger
                            value="documents"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-6 py-3"
                        >
                            Documents
                        </TabsTrigger>
                    </TabsList>

                    <div className="mt-6">
                        <TabsContent value="overview">
                            <OverviewTab entity={entity} />
                        </TabsContent>
                        <TabsContent value="licenses">
                            <LicensesTab entity={entity} />
                        </TabsContent>
                        <TabsContent value="registrations">
                            <RegistrationsTab entity={entity} />
                        </TabsContent>
                        <TabsContent value="documents">
                            <DocumentsTab entity={entity} />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}
