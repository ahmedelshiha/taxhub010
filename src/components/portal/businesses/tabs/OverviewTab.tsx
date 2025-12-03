"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/date-utils";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OverviewTabProps {
    entity: any;
}

export function OverviewTab({ entity }: OverviewTabProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info Column */}
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Company Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Legal Name</label>
                                <p className="text-base">{entity.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Legal Form</label>
                                <p className="text-base">{entity.legalForm || "N/A"}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Registration Number</label>
                                <p className="text-base">{entity.registrationNumber || "Pending"}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Tax ID (TRN)</label>
                                <p className="text-base">{entity.taxId || "Pending"}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Incorporation Date</label>
                                <p className="text-base">{entity.incorporationDate ? formatDate(entity.incorporationDate) : "N/A"}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Fiscal Year End</label>
                                <p className="text-base">{entity.fiscalYearEnd || "December 31"}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Email</label>
                                <p className="text-base">{entity.email || "N/A"}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                                <p className="text-base">{entity.phone || "N/A"}</p>
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-muted-foreground">Address</label>
                                <p className="text-base whitespace-pre-wrap">{entity.address || "N/A"}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Compliance Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                <span className="font-medium">Trade License</span>
                            </div>
                            <span className="text-sm text-green-600">Valid</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-900">
                            <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-yellow-600" />
                                <span className="font-medium">VAT Filing</span>
                            </div>
                            <span className="text-sm text-yellow-600">Due in 15 days</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="h-5 w-5 text-gray-500" />
                                <span className="font-medium">ESR Notification</span>
                            </div>
                            <span className="text-sm text-gray-500">Not Required</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button variant="outline" className="w-full justify-start">
                            Upload Document
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                            Request Service
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                            Update Info
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
