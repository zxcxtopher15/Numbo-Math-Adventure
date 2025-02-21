import Dropdown from '@/Components/Dropdown';
import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/Components/AppSidebar';

export default function AuthenticatedLayout({ header, children }) {
  const user = usePage().props.auth.user;
  const { auth } = usePage().props;
  const userType = auth?.user?.user_type;
  const [showingNavigationDropdown, setShowingNavigationDropdown] =
    useState(false);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center  gap-2 px-4">
            <SidebarTrigger className="-ml-1" />

            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
              <div className="p-6 font-medium text-gray-900">
                {userType === 'Teacher' && <p>Welcome, Teacher!</p>}
                {userType === 'Student' && <p>Welcome, Student!</p>}
                {userType === 'Parent' && <p>Welcome, Parent!</p>}
                {!['Teacher', 'Student', 'Parent'].includes(userType) && (
                  <p>You're logged in!</p>
                )}
              </div>
            </div>
          </div>

          <div className="hidden sm:ms-6 sm:flex sm:items-center">
            <div className="relative ms-3">
              <Dropdown>
                <Dropdown.Trigger>
                  <span className="inline-flex rounded-md">
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                    >
                      {user.name}

                      <svg
                        className="-me-0.5 ms-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </span>
                </Dropdown.Trigger>

                <Dropdown.Content>
                  <Dropdown.Link href={route('profile.edit')}>
                    Profile
                  </Dropdown.Link>
                  <Dropdown.Link
                    href={route('logout')}
                    method="post"
                    as="button"
                  >
                    Log Out
                  </Dropdown.Link>
                </Dropdown.Content>
              </Dropdown>
            </div>
          </div>
          {/* mobile */}
          <div className="sm:hidden">
            <div className="relative ms-3">
              <Dropdown>
                <Dropdown.Trigger>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-full border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                  >
                    <img
                      src={`https://ui-avatars.com/api/?name=${user.name}&font-family=Fredoka&bold=true&color=F68C8C&background=F1EFEF`}
                      className="mr-2 h-6 w-6 rounded-full"
                      alt={user.name}
                    />
                  </button>
                </Dropdown.Trigger>

                <Dropdown.Content>
                  <Dropdown.Link href={route('profile.edit')}>
                    Profile
                  </Dropdown.Link>
                  <Dropdown.Link
                    href={route('logout')}
                    method="post"
                    as="button"
                  >
                    Log Out
                  </Dropdown.Link>
                </Dropdown.Content>
              </Dropdown>
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
          </div> */}
          <main>{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
