"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import PortalDashboardLayout from "@/components/portal/layout/PortalDashboardLayout";
import { ModalProvider } from "@/components/providers/ModalProvider";
import { ModalRegistry } from "@/components/portal/modals/ModalRegistry";
import { PortalErrorBoundary } from "@/components/portal/PortalErrorBoundary";
import { BreadcrumbProvider } from "@/components/portal/providers/BreadcrumbProvider";
import { KeyboardProvider } from "@/components/providers/KeyboardProvider";

interface PortalProvidersProps {
    children: ReactNode;
}

export function PortalProviders({ children }: PortalProvidersProps) {
    return (
        <ThemeProvider defaultTheme="light" enableSystem>
            <QueryProvider>
                <PortalErrorBoundary>
                    <KeyboardProvider>
                        <ModalProvider>
                            <BreadcrumbProvider>
                                <PortalDashboardLayout>
                                    {children}
                                </PortalDashboardLayout>
                                <ModalRegistry />
                            </BreadcrumbProvider>
                        </ModalProvider>
                    </KeyboardProvider>
                </PortalErrorBoundary>
            </QueryProvider>
        </ThemeProvider>
    );
}
