import React, { ReactNode } from "react";
import { SidebarProvider, useSidebar } from "@/src/components/ui/sidebar";
import AppSidebar from "@/src/components/Sidebar";
import { useIsMobile } from "../hooks/use-mobile";

type LayoutProps = {
  children: ReactNode;
};

const DashboardLayout: React.FC<LayoutProps> = ({ children }) => {
  const { state } = useSidebar();
  const isMobile = useIsMobile();

  const menuWidth = state === "collapsed" ? "72px" : "260px";
  const menuSpace = state === "collapsed" || isMobile ? "80px" : "260px";

  return (
    <div className="flex relative w-full">
      <div
        className="rounded-lg absolute"
        style={{
          width: menuWidth,
        }}
      >
        <AppSidebar />
      </div>
      <main
        className={`p-4 pl-0 flex-1 transition-all ease-linear`}
        style={{
          marginLeft: menuSpace,
          maxWidth: `calc(100vw - ${menuSpace})`,
        }}
      >
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
