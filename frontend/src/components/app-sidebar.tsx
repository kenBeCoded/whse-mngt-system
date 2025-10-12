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
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data with updated URLs (adjust to your routes)
const data = {
  versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
  navMain: [
    {
      title: "Option",
      url: "/admin",
      items: [
        { title: "dashboard", url: "/admin/dashboard" },
        { title: "Demo", url: "/admin/users" },
      ],
    },
    // {
    //   title: "Getting Started",
    //   url: "/getting-started",
    //   items: [
    //     {
    //       title: "Installation",
    //       url: "/getting-started/installation",
    //     },
    //     {
    //       title: "Project Structure",
    //       url: "/getting-started/project-structure",
    //     },
    //   ],
    // },
    // {
    //   title: "Building Your Application",
    //   url: "/building-your-application",
    //   items: [
    //     {
    //       title: "Routing",
    //       url: "/building-your-application/routing",
    //     },
    //     {
    //       title: "Data Fetching",
    //       url: "/building-your-application/data-fetching",
    //     },
    //     {
    //       title: "Rendering",
    //       url: "/building-your-application/rendering",
    //     },
    //     {
    //       title: "Caching",
    //       url: "/building-your-application/caching",
    //     },
    //     {
    //       title: "Styling",
    //       url: "/building-your-application/styling",
    //     },
    //     {
    //       title: "Optimizing",
    //       url: "/building-your-application/optimizing",
    //     },
    //     {
    //       title: "Configuring",
    //       url: "/building-your-application/configuring",
    //     },
    //     {
    //       title: "Testing",
    //       url: "/building-your-application/testing",
    //     },
    //     {
    //       title: "Authentication",
    //       url: "/building-your-application/authentication",
    //     },
    //     {
    //       title: "Deploying",
    //       url: "/building-your-application/deploying",
    //     },
    //     {
    //       title: "Upgrading",
    //       url: "/building-your-application/upgrading",
    //     },
    //     {
    //       title: "Examples",
    //       url: "/building-your-application/examples",
    //     },
    //   ],
    // },
    // {
    //   title: "API Reference",
    //   url: "/api-reference",
    //   items: [
    //     {
    //       title: "Components",
    //       url: "/api-reference/components",
    //     },
    //     {
    //       title: "File Conventions",
    //       url: "/api-reference/file-conventions",
    //     },
    //     {
    //       title: "Functions",
    //       url: "/api-reference/functions",
    //     },
    //     {
    //       title: "next.config.js Options",
    //       url: "/api-reference/next-config-options",
    //     },
    //     {
    //       title: "CLI",
    //       url: "/api-reference/cli",
    //     },
    //     {
    //       title: "Edge Runtime",
    //       url: "/api-reference/edge-runtime",
    //     },
    //   ],
    // },
    // {
    //   title: "Architecture",
    //   url: "/architecture",
    //   items: [
    //     {
    //       title: "Accessibility",
    //       url: "/architecture/accessibility",
    //     },
    //     {
    //       title: "Fast Refresh",
    //       url: "/architecture/fast-refresh",
    //     },
    //     {
    //       title: "Next.js Compiler",
    //       url: "/architecture/nextjs-compiler",
    //     },
    //     {
    //       title: "Supported Browsers",
    //       url: "/architecture/supported-browsers",
    //     },
    //     {
    //       title: "Turbopack",
    //       url: "/architecture/turbopack",
    //     },
    //   ],
    // },
    // {
    //   title: "Community",
    //   url: "/community",
    //   items: [
    //     {
    //       title: "Contribution Guide",
    //       url: "/community/contribution-guide",
    //     },
    //   ],
    // },
  ],
};

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

  const filteredNavMain = filterSections(data.navMain, searchQuery);
  const hasSearchResults = searchQuery.trim() !== "";

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <VersionSwitcher
          versions={data.versions}
          defaultVersion={data.versions[0]}
        />
        <SearchForm
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSubmit={handleSearchSubmit}
        />
      </SidebarHeader>
      <SidebarContent className="gap-0">
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
          // Normal collapsible navigation
          data.navMain.map((item) => (
            <Collapsible
              key={item.title}
              defaultOpen={isActive(item.url)} // Auto-open active section
              className="group/collapsible"
            >
              <SidebarGroup>
                <SidebarGroupLabel
                  asChild
                  className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm"
                >
                  <CollapsibleTrigger>
                    {item.title}{" "}
                    <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {item.items.map((subItem) => (
                        <SidebarMenuItem key={subItem.title}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive(subItem.url)}
                          >
                            <Link to={subItem.url}>{subItem.title}</Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          ))
        )}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
