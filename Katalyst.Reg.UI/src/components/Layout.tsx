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
        <div className="max-w-[400px] px-6 rounded-lg">
          <AppSidebar />
        </div>
        <main className="flex-1">{children}</main>
      </div>
    </SidebarProvider>
    // <div className={`layout-container ${collapsed ? "collapsed" : ""}`}>
    //   <Sidebar collapsed={collapsed} toggleSidebar={toggleSidebar} />
    //   <div className="layout-content">{children}</div>
    // </div>
  );
};

export default Layout;
