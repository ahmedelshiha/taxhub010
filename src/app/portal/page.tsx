"use client";

import { useState, lazy, Suspense, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search } from "lucide-react";
import { PageLayout, ActionHeader } from "@/components/ui-oracle";
import { useModal } from "@/components/providers/ModalProvider";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";

// Lazy-loaded tab components
const OverviewTab = lazy(() => import("@/components/portal/dashboard/tabs/OverviewTab"));
const TasksTab = lazy(() => import("@/components/portal/dashboard/tabs/TasksTab"));
const ComplianceTab = lazy(() => import("@/components/portal/dashboard/tabs/ComplianceTab"));
const FinancialTab = lazy(() => import("@/components/portal/dashboard/tabs/FinancialTab"));
const ActivityTab = lazy(() => import("@/components/portal/dashboard/tabs/ActivityTab"));

// Loading skeleton for tabs
function TabLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-12 w-16 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

export default function PortalDashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { openModal } = useModal();
  const [activeTab, setActiveTab] = useState("overview");

  // Memoize the modal opener to prevent re-creating on every render
  const handleOpenGlobalSearch = useCallback(() => {
    openModal('global-search');
  }, [openModal]);

  // Global search keyboard shortcut (Cmd+K / Ctrl+K)
  useKeyboardShortcut({
    id: 'dashboard-global-search',
    combo: 'Meta+k',
    description: 'Open global search',
    action: handleOpenGlobalSearch
  })

  // Helper function for time-based greeting
  function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }

  // Get current date string
  const dateString = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <PageLayout maxWidth="7xl" className="px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
      {/* Action Header with Quick Actions */}
      <div className="animate-slide-in-top">
        <ActionHeader
          title={`${getGreeting()}, ${session?.user?.name?.split(" ")[0] || "there"}`}
          description={dateString}
          secondaryActions={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openModal("global-search")}
                className="hidden sm:flex"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
                <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </Button>
            </>
          }
          primaryAction={
            <Button
              size="sm"
              onClick={() => router.push("/portal/business-setup")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Business
            </Button>
          }
        />
      </div>

      {/* Tab Navigation */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6 animate-slide-in-left"
        style={{ animationDelay: '150ms' }}
      >
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Tab Content with Lazy Loading */}
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabsContent value="overview" className="mt-6">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="tasks" className="mt-6">
            <TasksTab />
          </TabsContent>

          <TabsContent value="compliance" className="mt-6">
            <ComplianceTab />
          </TabsContent>

          <TabsContent value="financial" className="mt-6">
            <FinancialTab />
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <ActivityTab />
          </TabsContent>
        </Suspense>
      </Tabs>

      {/* Keyboard Shortcuts Hint */}
      <div className="mt-8 text-center text-xs text-gray-400 animate-fade-in" style={{ animationDelay: '300ms' }}>
        <span className="inline-flex items-center gap-4">
          <span>⌨️ Shortcuts:</span>
          <span>
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 mx-1">
              ⌘K
            </kbd>
            Global Search
          </span>
        </span>
      </div>
    </PageLayout>
  );
}
