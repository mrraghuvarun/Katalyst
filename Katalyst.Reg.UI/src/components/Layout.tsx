import React, { ReactNode } from "react";
import { SidebarProvider } from "@/src/components/ui/sidebar";
import DashboardLayout from "./DashboardLayout";
import Header from "./Header";

type LayoutProps = {
  children: ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Header />
      <SidebarProvider>
        <DashboardLayout>{children}</DashboardLayout>
      </SidebarProvider>
    </>
  );
};

export default Layout;
