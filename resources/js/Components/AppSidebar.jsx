'use client';

import * as React from 'react';
import { Settings2, LayoutDashboard, Dices, HelpCircle } from 'lucide-react';

import ApplicationLogo from '@/Components/ApplicationLogo';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarMenu,
} from '@/components/ui/sidebar';
import { usePage, Link } from '@inertiajs/react';

export function AppSidebar(props) {
    const { auth } = usePage().props;
    const userType = auth?.user?.user_type;
    const data = {
        navMain: [
            {
                title: 'Dashboard',
                url: '/dashboard',
                icon: LayoutDashboard,
                isActive: window.location.pathname === '/dashboard',
            },
            {
                title: 'Math Journey ',
                url: userType === 'Teacher' ? '/math-journey' : '/math-journey-join',
                icon: Dices,
                isActive: window.location.pathname === '/math-journey' || window.location.pathname === '/math-journey-join',
            },
            {
                title: 'Modules',
                url: 'modules',
                icon: Settings2,
                isActive: window.location.pathname === '/modules',
            }
        ],
    };

    if (userType === 'Teacher') {
        data.navMain.push({
            title: 'Questions',
            url: '/questions',
            icon: HelpCircle,
            isActive: window.location.pathname === '/questions',
        });
    }

    return (
        <Sidebar
            className="bg-gradient-to-r from-teal-400 to-yellow-200"
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
                <SidebarGroup>
                    <SidebarMenu>
                        {data.navMain.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild isActive={item.isActive} tooltip={item.title}>
                                    <Link href={item.url} className="flex items-center gap-2">
                                        {item.icon && <item.icon />}
                                        {item.title}
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter></SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
