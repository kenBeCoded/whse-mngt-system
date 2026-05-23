import {
  ChevronRight,
  ChevronUp,
  LogOut,
  Search as SearchIcon,
  User2,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { SearchForm } from "@/components/search-form";
import { VersionSwitcher } from "@/components/version-switcher";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { navigationData } from "@/config/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import React from "react";

interface NavItem {
  title: string;
  url: string;
}

interface NavSection {
  title: string;
  url: string;
  items: NavItem[];
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;
  const [searchQuery, setSearchQuery] = React.useState("");

  const isActive = (url: string): boolean => {
    return pathname === url || pathname.startsWith(url + "/");
  };

  const filterItems = (items: NavItem[], query: string): NavItem[] => {
    const lowerQuery = query.toLowerCase();
    return items.filter((item) =>
      item.title.toLowerCase().includes(lowerQuery),
    );
  };

  const filterSections = (
    sections: NavSection[],
    query: string,
  ): NavSection[] => {
    const lowerQuery = query.toLowerCase();
    return sections.filter(
      (section) =>
        section.title.toLowerCase().includes(lowerQuery) ||
        filterItems(section.items, query).length > 0,
    );
  };

  const filteredNavMain = filterSections(navigationData.navMain, searchQuery);
  const hasSearchResults = searchQuery.trim() !== "";

  return (
    <Sidebar {...props} className="border-r">
      <SidebarHeader className="border-b px-4 py-3">
        <VersionSwitcher
          versions={navigationData.versions}
          defaultVersion={navigationData.versions[0]}
        />
        <SearchForm
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </SidebarHeader>
      <SidebarContent className="gap-0 overflow-y-auto">
        {hasSearchResults ? (
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2">
              <SearchIcon className="size-4" />
              Search Results (
              {filteredNavMain.reduce(
                (acc, section) =>
                  acc + filterItems(section.items, searchQuery).length,
                0,
              )}
              )
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredNavMain.flatMap((section) =>
                  filterItems(section.items, searchQuery).map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive(item.url)}>
                        <Link to={item.url}>{item.title}</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )),
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <SidebarMenu>
            {navigationData.navMain.map((item) => {
              const isSectionActive = item.items.some(
                (subItem) =>
                  pathname === subItem.url ||
                  pathname.startsWith(subItem.url + "/"),
              );

              return (
                <Collapsible
                  key={item.title}
                  defaultOpen={isSectionActive}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="w-full justify-between text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground">
                        {item.title}
                        <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuButton
                              asChild
                              isActive={isActive(subItem.url)}
                            >
                              <Link to={subItem.url}>{subItem.title}</Link>
                            </SidebarMenuButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            })}
          </SidebarMenu>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-12 hover:bg-sidebar-accent">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {user?.user_profile_image_url ? (
                      <img
                        src={user.user_profile_image_url}
                        alt={user.username}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                        <User2 className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="flex flex-col items-start min-w-0 flex-1">
                      <span className="text-sm font-medium truncate w-full">
                        {user?.username || "Guest"}
                      </span>
                      <span className="text-xs text-muted-foreground truncate w-full">
                        {user?.email || "<e-mail>"}
                      </span>
                    </div>
                  </div>
                  <ChevronUp className="ml-auto flex-shrink-0" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="center"
                className="w-[var(--radix-dropdown-menu-trigger-width)] bg-popover border rounded-md shadow-md p-1"
              >
                <DropdownMenuItem className="cursor-pointer hover:bg-accent rounded-sm px-2 py-1.5">
                  <Link to="#" className="flex items-center w-full">
                    <User2 className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-accent rounded-sm px-2 py-1.5"
                  onClick={logout}
                >
                  <LogOut />
                  <span className="flex items-center w-full">Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
