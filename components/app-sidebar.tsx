"use client";

import * as React from "react";

import Image from "next/image";
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
  FrameIcon,
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
        url: "#",
        icon: <LayoutDashboard />,
      },
      {
        title: "Google Ads",
        url: "#",
        icon: <PieChartIcon />,
      },
      {
        title: "Google Analytics",
        url: "#",
        icon: <MapIcon />,
      },
      {
        title: "Meta Ads",
        url: "#",
        icon: <ChartColumnBig />,
      },
    ],
  },
  management: {
    label: "Administração",
    items: [
      {
        title: "Gerenciamento de Usuários",
        url: "#",
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
