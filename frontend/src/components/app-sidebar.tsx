import * as React from "react";
import { ChevronRight, Search as SearchIcon } from "lucide-react";
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

// This is sample data with updated URLs (adjust to your routes)

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
  const location = useLocation();
  const pathname = location.pathname;
  const [searchQuery, setSearchQuery] = React.useState("");

  const isActive = (url: string): boolean => {
    return pathname === url || pathname.startsWith(url + "/");
  };

  const filterItems = (items: NavItem[], query: string): NavItem[] => {
    const lowerQuery = query.toLowerCase();
    return items.filter((item) =>
      item.title.toLowerCase().includes(lowerQuery)
    );
  };

  const filterSections = (
    sections: NavSection[],
    query: string
  ): NavSection[] => {
    const lowerQuery = query.toLowerCase();
    return sections.filter(
      (section) =>
        section.title.toLowerCase().includes(lowerQuery) ||
        filterItems(section.items, query).length > 0
    );
  };

  const handleSearchSubmit = (query: string) => {
    // Optional: Navigate to a search results page or perform global search
    console.log("Searching for:", query);
    // e.g., navigate(`/search?q=${query}`)
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
          onSubmit={handleSearchSubmit}
        />
      </SidebarHeader>
      <SidebarContent className="gap-0 overflow-y-auto">
        {hasSearchResults ? (
          // Show filtered search results
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2">
              <SearchIcon className="size-4" />
              Search Results (
              {filteredNavMain.reduce(
                (acc, section) =>
                  acc + filterItems(section.items, searchQuery).length,
                0
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
                  ))
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          // Normal collapsible navigation - UPDATED FORMAT
          <SidebarMenu>
            {navigationData.navMain.map((item) => (
              <Collapsible
                key={item.title}
                defaultOpen={isActive(item.url)} // Auto-open active section
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
            ))}
          </SidebarMenu>
        )}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
