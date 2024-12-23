import React from "react";
import { useLocation } from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowRight,
  FaTachometerAlt,
  FaTable,
  FaLayerGroup,
  FaUndo,
  FaArrowAltCircleRight,
  FaSignOutAlt,
  FaFileUpload,
} from "react-icons/fa";
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
} from "@/src/components/ui/sidebar";
import "./Sidebar.css";
import {
  BookIcon,
  CalendarSearch,
  LayoutDashboard,
  ListChecks,
  Notebook,
  SkipBack,
  Tag,
} from "lucide-react";

type SidebarProps = {
  collapsed: boolean;
  toggleSidebar: () => void;
};

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Trade Report", url: "/upload", icon: ListChecks },
  { title: "Back Report", url: "/data", icon: CalendarSearch },
  { title: "TRN Report", url: "/models", icon: Notebook },
  { title: "ARM Response", url: "/predictions", icon: Tag },
  { title: "NCA Response", url: "/undo", icon: BookIcon },
];

const AppSidebar: React.FC = () => {
  return (
    <Sidebar
      className="p-4 rounded-lg border-0"
      collapsible="icon"
      variant="floating"
    >
      <SidebarContent>
        <SidebarHeader className="px-7 pt-6 flex flex-row justify-between items-center">
          <h6 className="text-gray-600">Menu</h6>
          <SidebarTrigger className="bg-blue-100 hover:bg-blue-200 rounded text-blue-600 hover:text-blue-600" />
        </SidebarHeader>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="hover:bg-blue-200 rounded"
                  >
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
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
    // <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
    //   <div className="sidebar-header">
    //     <h1 className="sidebar-title">{collapsed ? "M" : "MIFID"}</h1>
    //     <button className="toggle-sidebar" onClick={toggleSidebar}>
    //       {collapsed ? <FaArrowRight /> : <FaArrowLeft />}
    //     </button>
    //   </div>
    //   <ul className="nav-links">
    //     <li>
    //       <a
    //         href="/summary"
    //         className={`nav-item ${
    //           ["/summary", "/report", "/data"].includes(location.pathname)
    //             ? "active"
    //             : ""
    //         }`}
    //       >
    //         <FaTachometerAlt className="icon" />
    //         <span className="nav-text">{!collapsed && "Summary Report"}</span>
    //       </a>
    //     </li>
    //     <li>
    //       <a
    //         href="/trade"
    //         className={`nav-item ${location.pathname === "/trade" ? "active" : ""}`}
    //       >
    //         <FaTable className="icon" />
    //         <span className="nav-text">{!collapsed && "Trade Report"}</span>
    //       </a>
    //     </li>
    //     <li>
    //       <a
    //         href="/backreporting"
    //         className={`nav-item ${location.pathname === "/backreporting" ? "active" : ""}`}
    //       >
    //         <FaFileUpload className="icon" />
    //         <span className="nav-text">{!collapsed && "Back Reporting"}</span>
    //       </a>
    //     </li>
    //     <li>
    //       <a href="#trn" className="nav-item">
    //         <FaLayerGroup className="icon" />
    //         <span className="nav-text">{!collapsed && "TRN Report"}</span>
    //       </a>
    //     </li>
    //     <li>
    //       <a href="#arm" className="nav-item">
    //         <FaUndo className="icon" />
    //         <span className="nav-text">{!collapsed && "ARM Response"}</span>
    //       </a>
    //     </li>
    //     <li>
    //       <a href="/nca-response" className="nav-item">
    //         <FaArrowAltCircleRight className="icon" />
    //         <span className="nav-text">{!collapsed && "NCA Response"}</span>
    //       </a>
    //     </li>
    //     <li>
    //       <a href="/" className="nav-item logout">
    //         <FaSignOutAlt className="icon" />
    //         <span className="nav-text">{!collapsed && "Logout"}</span>
    //       </a>
    //     </li>
    //   </ul>
    // </div>
  );
};

export default AppSidebar;
