"use client";

import { Card, CardContent } from "@/components/ui/card";
import { FileText, Download, Eye, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/date-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DocumentsTabProps {
  entity: any;
}

export function DocumentsTab({ entity }: DocumentsTabProps) {
  // Mock documents for now since we don't have a direct relation in the entity fetch yet
  // In a real app, we'd fetch these or include them in the entity query
  const documents = [
    {
      id: "1",
      name: "Trade License.pdf",
      type: "License",
      size: "2.4 MB",
      uploadedAt: new Date(),
      uploadedBy: "System",
    },
    {
      id: "2",
      name: "Memorandum of Association.pdf",
      type: "Legal",
      size: "5.1 MB",
      uploadedAt: new Date(Date.now() - 86400000 * 5),
      uploadedBy: "Admin",
    },
    {
      id: "3",
      name: "VAT Registration Certificate.pdf",
      type: "Tax",
      size: "1.2 MB",
      uploadedAt: new Date(Date.now() - 86400000 * 10),
      uploadedBy: "Admin",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Corporate Documents</h3>
        <Button>Upload Document</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {documents.map((doc) => (
              <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{doc.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{doc.type}</span>
                      <span>•</span>
                      <span>{doc.size}</span>
                      <span>•</span>
                      <span>{formatDate(doc.uploadedAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Rename</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
