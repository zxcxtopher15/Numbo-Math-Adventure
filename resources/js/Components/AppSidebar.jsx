'use client';

import * as React from 'react';
import { Settings2, LayoutDashboard, Dices, HelpCircle } from 'lucide-react';
import { Plus } from 'lucide-react';
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
    SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { usePage, Link } from '@inertiajs/react';
import { SvgAsset } from './SvgAsset';

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
            ...(userType === 'Teacher' || userType === 'Student'
                ? [
                      {
                          title: 'Math Journey ',
                          url: userType === 'Teacher' ? '/math-journey' : '/math-journey-join',
                          icon: Dices,
                          isActive:
                              window.location.pathname === '/math-journey' ||
                              window.location.pathname === '/math-journey-join',
                      },
                  ]
                : []),
            {
                title: 'Modules',
                url: 'modules',
                icon: Settings2,
                isActive: window.location.pathname === '/modules',
            },
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
                    <SidebarMenu className="flex flex-col gap-2 justify-between items-between">
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
            <SidebarFooter>
                {userType === 'Parent' && (
                    <>
                        <SidebarGroupLabel className="mb-3">
                            <div className="flex items-center justify-center bg-yellow-100 text-yellow-700 py-9 px-3 mb-5 h-10 w-full font-semibold text-sm text-end  relative rounded-2xl">
                                <img
                                    src="/images/assets/avatar/student.svg"
                                    className="bottom-0 left-0 w-12 absolute"
                                />
                                Need to manage <br /> another student?
                            </div>
                        </SidebarGroupLabel>

                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={false} tooltip={'Add Student'}>
                                    <Link href="/add-student">
                                        <Plus />
                                        <span>Add Student</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </>
                )}
                {/* <div className="flex items-center justify-center bg-red-200 rounded-3xl min-h-[8rem]"> 
                   <SvgAsset value="/images/assets/avatar/student.svg" movement='sm' className="bottom-0 left-0 w-20" />
                   <h1>Manage Student??</h1>
                   <button></button>
                </div> */}
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
