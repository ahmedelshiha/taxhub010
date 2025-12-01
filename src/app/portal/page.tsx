"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Bell } from "lucide-react";
import { usePortalActiveTab, usePortalLayoutActions } from "@/stores/portal/layout.store";
import SetupWizard from "@/components/portal/business-setup/core/SetupOrchestrator";
import EntitySwitcher from "@/components/portal/layout/EntitySwitcher";
import { useModal } from "@/components/providers/ModalProvider";
import { toast } from "sonner";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";

/**
 * Portal Dashboard Page
 * Tab-based dashboard following Oracle Fusion/SAP architecture
 * Features lazy-loaded tabs, entity switching, global search
 * 
 * Architecture:
 * - 5 tabs: Overview, Tasks, Compliance, Financial, Activity
 * - Lazy loading with React.lazy() and Suspense
 * - Tab state persisted via Zustand
 * - Integrated with business setup wizard
 */

// Lazy-loaded tab components for code splitting
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

  // Tab state from Zustand store
  const activeTab = usePortalActiveTab();
  const { setActiveTab } = usePortalLayoutActions();
  const { openModal } = useModal();

  // Modal states
  const [setupWizardOpen, setSetupWizardOpen] = useState(false);

  // Global search keyboard shortcut (Cmd+K / Ctrl+K)
  useKeyboardShortcut({
    id: 'dashboard-global-search',
    combo: 'Meta+k',
    description: 'Open global search',
    action: () => openModal('global-search')
  })

  // Handle business setup wizard completion
  const handleSetupComplete = (entityId: string) => {
    setSetupWizardOpen(false);
    toast.success("Business setup completed successfully!");
    router.refresh();
  };


  return (
    <>
      {/* Modals */}
      <SetupWizard
        open={setupWizardOpen}
        onOpenChange={setSetupWizardOpen}
        onComplete={handleSetupComplete}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="animate-slide-in-top">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {getGreeting()}, {session?.user?.name?.split(" ")[0] || "there"}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 animate-slide-in-left" style={{ animationDelay: '100ms' }}>
              <EntitySwitcher />
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
              <Button
                size="sm"
                onClick={() => setSetupWizardOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Business
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Tab  Content with Lazy Loading */}
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
      </div>
    </>
  );
}

// Helper function for time-based greeting
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
