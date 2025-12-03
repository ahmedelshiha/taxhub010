"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { formatDate } from "@/lib/date-utils";
import { Button } from "@/components/ui/button";

interface LicensesTabProps {
    entity: any;
}

export function LicensesTab({ entity }: LicensesTabProps) {
    const licenses = entity.licenses || [];

    if (licenses.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No licenses found</h3>
                    <p className="text-muted-foreground max-w-md mb-6">
                        There are no trade licenses recorded for this business yet.
                    </p>
                    <Button>Add Trade License</Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Trade Licenses</h3>
                <Button>Add License</Button>
            </div>

            <div className="grid gap-4">
                {licenses.map((license: any) => (
                    <Card key={license.id}>
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-lg mb-1">{license.licenseNumber}</h4>
                                        <p className="text-muted-foreground mb-2">{license.issuingAuthority}</p>
                                        <div className="flex gap-4 text-sm">
                                            <div>
                                                <span className="text-muted-foreground block">Issue Date</span>
                                                <span className="font-medium">{formatDate(license.issueDate)}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground block">Expiry Date</span>
                                                <span className="font-medium">{formatDate(license.expiryDate)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <LicenseStatusBadge expiryDate={license.expiryDate} status={license.status} />
                            </div>

                            <div className="mt-4 pt-4 border-t flex gap-2">
                                <Button variant="outline" size="sm">View Document</Button>
                                <Button variant="outline" size="sm">Renew</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function LicenseStatusBadge({ expiryDate, status }: { expiryDate: string, status: string }) {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (status === 'EXPIRED' || daysUntilExpiry < 0) {
        return (
            <Badge variant="destructive" className="flex gap-1">
                <XCircle className="h-3 w-3" /> Expired
            </Badge>
        );
    }

    if (daysUntilExpiry <= 30) {
        return (
            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 flex gap-1">
                <AlertTriangle className="h-3 w-3" /> Expiring Soon
            </Badge>
        );
    }

    return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 flex gap-1">
            <CheckCircle2 className="h-3 w-3" /> Active
        </Badge>
    );
}
