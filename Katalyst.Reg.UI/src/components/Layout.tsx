import React, { useState, ReactNode } from "react";
import Sidebar from "./Sidebar.tsx";
import "./Layout.css";

type LayoutProps = {
  collapsed: boolean;
  children: ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className={`layout-container ${collapsed ? "collapsed" : ""}`}>
      <Sidebar collapsed={collapsed} toggleSidebar={toggleSidebar} />
      <div className="layout-content">{children}</div>
    </div>
  );
};

export default Layout;
