"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import SetupWizard from "@/components/portal/business-setup/SetupWizard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import FeaturesHub from "@/components/portal/FeaturesHub";
import {
  Search,
  Clock,
  Plus,
  ChevronRight,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { WidgetGrid } from "@/components/portal/dashboard/WidgetGrid";
import { TasksSummaryWidget } from "@/components/portal/dashboard/widgets/TasksSummaryWidget";
import { BookingsCalendarWidget } from "@/components/portal/dashboard/widgets/BookingsCalendarWidget";
import { OutstandingInvoicesWidget } from "@/components/portal/dashboard/widgets/OutstandingInvoicesWidget";
import { ComplianceTrackerWidget } from "@/components/portal/dashboard/widgets/ComplianceTrackerWidget";
import { ActivityFeedWidget } from "@/components/portal/dashboard/widgets/ActivityFeedWidget";
import { NotificationsWidget } from "@/components/portal/dashboard/widgets/NotificationsWidget";
import { FinancialOverviewWidget } from "@/components/portal/dashboard/widgets/FinancialOverviewWidget";
import MiniCalendarWidget from "@/components/portal/dashboard/widgets/MiniCalendarWidget";
import { GlobalSearchModal } from "@/components/portal/GlobalSearchModal";
import { TaskQuickCreateModal } from "@/components/portal/modals/TaskQuickCreateModal";
import { BookingCreateModal } from "@/components/portal/modals/BookingCreateModal";
import { UploadModal } from "@/components/portal/bills/BillUpload/UploadModal";
import { NotificationBell } from "@/components/portal/NotificationBell";

interface Entity {
  id: string;
  name: string;
  country: string;
  status: string;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const data = await res.json();

  // Handle error responses gracefully
  if (!res.ok || data.error) {
    throw new Error(data.error || `Failed to fetch ${url}`);
  }

  return data;
};

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSetupModalOpen, setSetupModalOpen] = useState(false);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);

  // Modal States
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [createBookingOpen, setCreateBookingOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  // Fetch user's entities
  const { data: entitiesResponse, isLoading: entitiesLoading } = useSWR<{
    success: boolean;
    data: Entity[];
  }>("/api/entities", fetcher, {
    revalidateOnFocus: false,
  });

  const entities = entitiesResponse?.data || [];
  const primaryEntity = entities[0];

  // Fetch dashboard data
  const { data: dashboardResponse, isLoading: dashboardLoading, error: dashboardError } = useSWR<{
    tasks: any[];
    bookings: any[];
    invoices: any[];
    totalOutstanding: number;
    compliance: any[];
    activity: any[];
  }>("/api/portal/dashboard", fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true,
    shouldRetryOnError: true,
    errorRetryCount: 3,
    errorRetryInterval: 5000,
  });

  // Ensure all properties are arrays, even on error
  const dashboardData = {
    tasks: Array.isArray(dashboardResponse?.tasks) ? dashboardResponse.tasks : [],
    bookings: Array.isArray(dashboardResponse?.bookings) ? dashboardResponse.bookings : [],
    invoices: Array.isArray(dashboardResponse?.invoices) ? dashboardResponse.invoices : [],
    totalOutstanding: typeof dashboardResponse?.totalOutstanding === 'number' ? dashboardResponse.totalOutstanding : 0,
    compliance: Array.isArray(dashboardResponse?.compliance) ? dashboardResponse.compliance : [],
    activity: Array.isArray(dashboardResponse?.activity) ? dashboardResponse.activity : [],
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    // Open global search modal
    setGlobalSearchOpen(true);
  };

  // Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setGlobalSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const countryFlags: Record<string, string> = {
    AE: "🇦🇪",
    SA: "🇸🇦",
    EG: "🇪🇬",
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SetupWizard
        open={isSetupModalOpen}
        onOpenChange={setSetupModalOpen}
      />

      {/* Modals */}
      <GlobalSearchModal
        open={globalSearchOpen}
        onOpenChange={setGlobalSearchOpen}
      />
      <TaskQuickCreateModal
        open={createTaskOpen}
        onClose={() => setCreateTaskOpen(false)}
        onSuccess={() => toast.success("Task created")}
      />
      <BookingCreateModal
        open={createBookingOpen}
        onClose={() => setCreateBookingOpen(false)}
        onSuccess={() => toast.success("Booking requested")}
      />
      <UploadModal
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        mode="file"
        onUploadComplete={() => toast.success("Files uploaded")}
      />

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Greeting & Time */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {getGreeting()}, {session?.user?.name?.split(" ")[0] || "there"}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {/* Right: Search & Actions */}
            <div className="flex items-center gap-2">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search (Cmd+K)"
                  className="pl-10 pr-4 py-2 text-sm w-48"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <NotificationBell />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchOpen(!searchOpen)}
                className="sm:hidden"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search */}
      {searchOpen && (
        <div className="sm:hidden bg-white dark:bg-gray-800 border-b p-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Search entities, filings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <Button type="submit" size="sm">
              Search
            </Button>
          </form>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Quick Actions Toolbar */}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => setCreateTaskOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
          <Button size="sm" variant="outline" onClick={() => setCreateBookingOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Booking
          </Button>
          <Button size="sm" variant="outline" onClick={() => setUploadOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Upload File
          </Button>
        </div>

        {/* No Entities State */}
        {!entitiesLoading && entities.length === 0 && (
          <Alert className="bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-800">
            <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-900 dark:text-blue-200">
              <div className="font-semibold mb-2">Get started with your first entity</div>
              <p className="text-sm mb-3">
                Create a business account or add an existing one to manage tax obligations.
              </p>
              <Button
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => setSetupModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Business Account
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Verification Status Widget */}
        {primaryEntity && primaryEntity.status === "PENDING" && (
          <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
            <CardContent className="pt-6 flex items-start gap-4">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-1">
                  Verifying Your Business Setup
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-3">
                  {"We're verifying your business details. This usually takes 5-10 minutes."}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/portal/setup-status/${primaryEntity.id}`)}
                  className="text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700 hover:bg-yellow-100 dark:hover:bg-yellow-900/40"
                >
                  View Status
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features Hub */}
        <FeaturesHub entityId={primaryEntity?.id} />

        {/* Widget Grid */}
        <WidgetGrid>
          {/* Column 1 */}
          <div className="space-y-6">
            <TasksSummaryWidget
              tasks={dashboardData.tasks}
              loading={dashboardLoading}
              error={dashboardError ? "Failed to load tasks" : undefined}
            />
            <ActivityFeedWidget
              activities={dashboardData.activity}
              loading={dashboardLoading}
              error={dashboardError ? "Failed to load activity" : undefined}
            />
          </div>

          {/* Column 2 */}
          <div className="space-y-6">
            <BookingsCalendarWidget
              bookings={dashboardData.bookings}
              loading={dashboardLoading}
              error={dashboardError ? "Failed to load bookings" : undefined}
            />
            <ComplianceTrackerWidget
              items={dashboardData.compliance}
              loading={dashboardLoading}
              error={dashboardError ? "Failed to load compliance" : undefined}
            />
            <FinancialOverviewWidget />
          </div>

          {/* Column 3 */}
          <div className="space-y-6">
            <NotificationsWidget />
            <MiniCalendarWidget />
            <OutstandingInvoicesWidget
              invoices={dashboardData.invoices}
              totalOutstanding={dashboardData.totalOutstanding}
              loading={dashboardLoading}
              error={dashboardError ? "Failed to load invoices" : undefined}
            />

            {/* Entity Selector Widget */}
            {entities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Your Entities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {entities.map((entity) => (
                      <button
                        key={entity.id}
                        onClick={() => router.push(`/portal/entities/${entity.id}`)}
                        className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-sm text-gray-900 dark:text-white flex items-center gap-2">
                            <span>{countryFlags[entity.country] || "🌍"}</span>
                            {entity.name}
                          </div>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded ${entity.status === "ACTIVE"
                              ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                              : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                              }`}
                          >
                            {entity.status}
                          </span>
                        </div>
                      </button>
                    ))}
                    <Link href="/portal/entities/new" className="block">
                      <button className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center justify-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Entity
                      </button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </WidgetGrid>
      </main>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
