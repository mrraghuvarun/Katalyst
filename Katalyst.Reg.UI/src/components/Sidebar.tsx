import React from "react";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/src/components/ui/sidebar";
import {
  BookIcon,
  CalendarSearch,
  LayoutDashboard,
  ListChecks,
  Notebook,
  Tag,
} from "lucide-react";

const items = [
  { title: "Dashboard", url: "/summary", icon: LayoutDashboard },
  { title: "Trade Report", url: "/trade", icon: ListChecks },
  { title: "Back Reporting", url: "/backreporting", icon: CalendarSearch },
  { title: "TRN Report", url: "/models", icon: Notebook },
  { title: "ARM Response", url: "/predictions", icon: Tag },
  { title: "NCA Response", url: "/nca-response", icon: BookIcon },
];

const AppSidebar: React.FC = () => {
  const { state } = useSidebar();
  const location = useLocation();

  return (
    <Sidebar className="p-4 rounded-lg border-0 bg-white shadow-lg" collapsible="icon" variant="floating">
      <SidebarContent>
        {state === "expanded" && (
          <SidebarHeader className="px-7 pt-6 flex flex-row justify-between items-center">
            <h6 className="text-gray-600">Menu</h6>
            <SidebarTrigger className="bg-blue-100 hover:bg-blue-200 rounded text-blue-600 hover:text-blue-600" />
          </SidebarHeader>
        )}

        {state === "collapsed" && (
          <SidebarHeader className="pt-6 flex justify-center items-center">
            <SidebarTrigger className="bg-blue-100 hover:bg-blue-200 rounded text-blue-600 hover:text-blue-600" />
          </SidebarHeader>
        )}

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={`flex items-center px-4 py-2 transition-all ${
                      location.pathname === item.url
                        ? "bg-[#EAF3FF] text-blue-600 font-semibold border-l-4 border-blue-600 rounded-none"
                        : "hover:bg-gray-100 text-gray-600 rounded-lg"
                    }`}
                  >
                    <a href={item.url} className="flex items-center gap-3">
                      <item.icon
                        className={`w-5 h-5 ${
                          location.pathname === item.url
                            ? "text-blue-600"
                            : "text-gray-400"
                        }`}
                      />
                      {state === "expanded" && <span>{item.title}</span>}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
};

export default AppSidebar;
