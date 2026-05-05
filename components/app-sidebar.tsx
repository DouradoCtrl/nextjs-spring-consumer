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
import { FrameIcon, PieChartIcon, MapIcon } from "lucide-react";

// This is sample data.
const data = {
  navMain: [
    {
      title: "Geral",
      url: "#",
      icon: <FrameIcon />,
    },
    {
      title: "Google Ads",
      url: "#",
      // icon: <PieChartIcon />
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
      icon: <PieChartIcon />,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarHeaderLogo />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
