"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

const BREADCRUMB_LABELS: Record<string, string> = {
    // Rotas de Dashboard
    "google-ads": "Google Ads",
    "google-analytics": "Google Analytics",
    "meta-ads": "Meta Ads",
    "users-management": "Gerenciamento de Usuários",

    profile: "Perfil",
};

interface HeaderProps {
    children?: ReactNode;
}

export function Header({ children }: HeaderProps) {
    const pathname = usePathname();

    const segments = pathname
        .split("/")
        .filter(
            (segment) =>
                segment && segment !== "(dashboard)" && segment !== "(admin)",
        );

    const breadcrumbs: Array<{
        label: string;
        href: string;
        isLast: boolean;
    }> = [
        { label: "Dashboard", href: "/", isLast: segments.length === 0 },
        ...segments.map((segment, idx) => ({
            label:
                BREADCRUMB_LABELS[segment] ||
                segment.charAt(0).toUpperCase() + segment.slice(1),
            href: "/" + segments.slice(0, idx + 1).join("/"),
            isLast: idx === segments.length - 1,
        })),
    ];

    return (
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mx-2 data-[orientation=vertical]:h-4"
                />
                <Breadcrumb className="hidden sm:flex">
                    <BreadcrumbList>
                        {breadcrumbs.map((crumb, idx) => (
                            <BreadcrumbItem key={idx}>
                                {crumb.isLast ? (
                                    <BreadcrumbPage className="text-sm font-medium">
                                        {crumb.label}
                                    </BreadcrumbPage>
                                ) : (
                                    <>
                                        <BreadcrumbLink href={crumb.href} className="text-sm">
                                            {crumb.label}
                                        </BreadcrumbLink>
                                        <BreadcrumbSeparator />
                                    </>
                                )}
                            </BreadcrumbItem>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            {children && (
                <div className="flex flex-1 items-center justify-center px-2">
                    {children}
                </div>
            )}
        </header>
    );
}
