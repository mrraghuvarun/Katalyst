import React from "react";
import { Link } from "react-router-dom";
import NineDotsMenu from "./NineDotsMenu.tsx";
import { Button } from "@/src/components/ui/button";
import { NavigationMenu, NavigationMenuItem } from "@/src/components/ui/navigation-menu";

const Topbar: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-300 shadow-md fixed top-0 w-full z-50">
      <div className="container mx-auto flex items-center justify-between p-4">
        <NineDotsMenu />
        <div className="flex left-5 items-start bg-blue-600 rounded-lg p-2">
        <span className="font-dm-serif text-white text-2xl tracking-wide">
          Katalyst
        </span>
      </div>

        {/* Center Section: Navigation Menu */}
        <NavigationMenu className="hidden md:flex space-x-6">
          <NavigationMenuItem>
            <Link to="/" className="text-gray-700 hover:text-blue-600">
              Home
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link to="/about" className="text-gray-700 hover:text-blue-600">
              About
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link to="/services" className="text-gray-700 hover:text-blue-600">
              Services
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link to="/contact" className="text-gray-700 hover:text-blue-600">
              Contact
            </Link>
          </NavigationMenuItem>
        </NavigationMenu>

        {/* Right Section: Login Button */}
        <div className="flex items-center space-x-4">
          <Button asChild>
            <Link to="/login">Login</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
