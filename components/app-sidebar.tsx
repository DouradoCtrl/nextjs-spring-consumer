"use client";

import * as React from "react";

import Link from "next/link";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { SidebarHeaderLogo } from "@/components/SidebarHeaderLogo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  PieChartIcon,
  MapIcon,
  UsersRound,
  LayoutDashboard,
  ChartColumnBig,
} from "lucide-react";

const data = {
  dashboards: {
    label: "Dashboards",
    items: [
      {
        title: "Geral",
        url: "/",
        icon: <LayoutDashboard />,
      },
      {
        title: "Google Ads",
        url: "/google-ads",
        icon: <PieChartIcon />,
      },
      {
        title: "Google Analytics",
        url: "/google-analytics",
        icon: <MapIcon />,
      },
      {
        title: "Meta Ads",
        url: "/meta-ads",
        icon: <ChartColumnBig />,
      },
    ],
  },
  management: {
    label: "Administração",
    items: [
      {
        title: "Gerenciamento de Usuários",
        url: "/users-management",
        icon: <UsersRound />,
      },
    ],
  },
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarHeaderLogo />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.dashboards.items} label={data.management.label} />
        <Separator />
        <NavMain items={data.management.items} label={data.management.label} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
