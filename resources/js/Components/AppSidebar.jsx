'use client';

import * as React from 'react';
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  LayoutDashboard,
  ListChecks,
  BookType,
} from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavProjects } from '@/components/nav-projects';
import { NavUser } from '@/Components/NavUser';
import ApplicationLogo from '@/Components/ApplicationLogo';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

// This is sample data.
const data = {
  user: {
    name: 'Popoy',
    email: 'popoy@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },

  navMain: [
    {
      title: 'Dashboard',
      url: '#',
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: 'Assessments ',
      url: '#',
      icon: BookType,
    },
    {
      title: 'Assignments',
      url: '#',
      icon: BookOpen,
    },
    {
      title: 'Reports',
      url: '#',
      icon: Settings2,
    },
  ],
};

export function AppSidebar(props) {
  return (
    <Sidebar
      className="bg-gradient-to-r from-teal-400 to-yellow-200 1"
      variant="sidebar | floating | inset"
      collapsible="icon"
      {...props}
    >
      <SidebarHeader>
        <a className="flex items-center justify-center" href="#">
          <ApplicationLogo className="size-4" />
        </a>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
