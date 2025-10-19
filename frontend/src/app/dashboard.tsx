import { AppSidebar } from "@/components/app-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import React from "react";
import { Outlet, useLocation } from "react-router-dom";

// Navigation data structure (should match the one in app-sidebar.tsx)
const navData = {
  navMain: [
    {
      title: "Option",
      url: "s",
      items: [
        { title: "dashboard", url: "dashboard" },
        { title: "Demo", url: "users" },
      ],
    },
  ],
};

export default function Page() {
  const location = useLocation();
  const pathname = location.pathname;

  const getBreadcrumbs = () => {
    // Handle root/home
    if (pathname === "/" || pathname === "") {
      return [{ title: "Home", isCurrent: true }];
    }

    // Search through nav structure to find matching path
    for (const section of navData.navMain) {
      // Check if we're on a section page
      if (pathname === section.url || pathname === `/${section.url}`) {
        return [{ title: section.title, isCurrent: true }];
      }

      // Check items within the section
      for (const item of section.items) {
        const itemPath = item.url.startsWith("/") ? item.url : `/${item.url}`;
        const currentPath = pathname.startsWith("/")
          ? pathname
          : `/${pathname}`;

        if (
          currentPath === itemPath ||
          currentPath.startsWith(`${itemPath}/`)
        ) {
          return [
            { title: section.title, href: section.url, isCurrent: false },
            { title: item.title, isCurrent: true },
          ];
        }
      }
    }

    // Fallback: try to parse pathname segments
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) {
      return [{ title: "Home", isCurrent: true }];
    }

    // Capitalize and format segments as breadcrumbs
    return segments.map((segment, index) => ({
      title:
        segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
      href: "/" + segments.slice(0, index + 1).join("/"),
      isCurrent: index === segments.length - 1,
    }));
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((item, index) => (
                <React.Fragment key={`${item.title}-${index}`}>
                  {index > 0 && (
                    <BreadcrumbSeparator className="hidden md:block" />
                  )}
                  <BreadcrumbItem className="hidden md:block">
                    {item.isCurrent ? (
                      <BreadcrumbPage>{item.title}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={item.href || "#"}>
                        {item.title}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
          <ModeToggle />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
