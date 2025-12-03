"use client";

import { Building2, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyBusinessStateProps {
  hasFilters: boolean;
}

export function EmptyBusinessState({ hasFilters }: EmptyBusinessStateProps) {
  if (hasFilters) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No businesses found</h3>
          <p className="text-muted-foreground max-w-md">
            Try adjusting your search or filters to find what you&apos;re looking for.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full mb-4">
          <Building2 className="h-12 w-12 text-blue-600 dark:text-blue-300" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No businesses yet</h3>
        <p className="text-muted-foreground max-w-md mb-6">
          Get started by adding your first business. We&apos;ll guide you through the
          registration process step by step.
        </p>
        <Button
          size="lg"
          className="gap-2"
          onClick={() => (window.location.href = "/portal/setup")}
        >
          <Plus className="h-4 w-4" />
          Add Your First Business
        </Button>

        <div className="mt-8 text-sm text-muted-foreground">
          <p className="font-medium mb-2">What you&apos;ll need:</p>
          <ul className="text-left space-y-1 max-w-sm">
            <li>• Business registration documents</li>
            <li>• Trade license details</li>
            <li>• Tax registration information</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
