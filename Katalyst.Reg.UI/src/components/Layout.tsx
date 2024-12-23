import React, { useState, ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/src/components/ui/sidebar";
import AppSidebar from "@/src/components/Sidebar";

type LayoutProps = {
  children: ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <SidebarProvider>
      <div className="flex">
        <div className="w-[260px] rounded-lg">
          <AppSidebar />
        </div>
        <main className="p-4 pl-0 flex-1 max-w-[calc(100vw-260px)]">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
