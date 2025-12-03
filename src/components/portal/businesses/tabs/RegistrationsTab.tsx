"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building, Globe } from "lucide-react";
import { formatDate } from "@/lib/date-utils";
import { Button } from "@/components/ui/button";

interface RegistrationsTabProps {
    entity: any;
}

export function RegistrationsTab({ entity }: RegistrationsTabProps) {
    const registrations = entity.registrations || [];

    if (registrations.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No registrations found</h3>
                    <p className="text-muted-foreground max-w-md mb-6">
                        There are no tax or government registrations recorded for this business yet.
                    </p>
                    <Button>Add Registration</Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Government Registrations</h3>
                <Button>Add Registration</Button>
            </div>

            <div className="grid gap-4">
                {registrations.map((reg: any) => (
                    <Card key={reg.id}>
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                        <Building className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold text-lg">{reg.type}</h4>
                                            <Badge variant="outline">{reg.country}</Badge>
                                        </div>
                                        <p className="text-muted-foreground mb-2">Reg No: {reg.registrationNumber}</p>
                                        <div className="flex gap-4 text-sm">
                                            <div>
                                                <span className="text-muted-foreground block">Registered On</span>
                                                <span className="font-medium">{formatDate(reg.registrationDate)}</span>
                                            </div>
                                            {reg.expiryDate && (
                                                <div>
                                                    <span className="text-muted-foreground block">Expires On</span>
                                                    <span className="font-medium">{formatDate(reg.expiryDate)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                                    Active
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
