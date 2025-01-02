import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Import useNavigate
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import raghuAvatar from "../assets/raghu2.png"; // Import the image
import { Button } from "./ui/button";

const Header: React.FC = () => {
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [showNotificationCard, setShowNotificationCard] = useState(false);
  const navigate = useNavigate(); // Initialize the navigate function
  const location = useLocation(); // Initialize the location object
  const toggleProfileCard = () => {
    setShowProfileCard((prev) => !prev);
    setShowNotificationCard(false);
  };

  const getTitle = () => {
    switch (location.pathname) {
      case "/data-ingestion":
        return "Data Ingestion";
      default:
        return "MIFID";
    }
  };

  const toggleNotificationCard = () => {
    setShowNotificationCard((prev) => !prev);
    setShowProfileCard(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  return (
    <div className="fixed top-0 left-0 w-full h-16 flex justify-between items-center px-5 bg-white border-b border-gray-300 z-50">
      <div className="flex items-center bg-blue-600 rounded-lg p-2">
        <span className="font-dm-serif text-white text-2xl tracking-wide">
          {getTitle()}
        </span>
      </div>
      <div className="flex items-center space-x-4">
        <div
          className="text-gray-600 text-xl cursor-pointer"
          onClick={toggleNotificationCard}
        >
          🔔
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold">Raghu Varun</div>
          <div className="text-xs text-gray-500">Admin</div>
        </div>
        <div
          className="w-10 h-10 rounded-full overflow-hidden cursor-pointer"
          onClick={toggleProfileCard}
        >
          <img
            src={raghuAvatar}
            alt="User Avatar"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      {showProfileCard && (
        <div className="absolute top-20 right-5 bg-white shadow-lg rounded-lg z-50 w-64">
          <Card>
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
              <CardDescription>User Information</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Name: Raghu Varun</p>
              <p>Role: Admin</p>
              <p>Email: raghuvarun@gmail.com</p>
            </CardContent>
            <CardFooter>
              <Button onClick={handleLogout} className="w-full">
                Logout
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
      {showNotificationCard && (
        <div className="absolute top-20 right-5 bg-white shadow-lg rounded-lg z-50 w-64">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Recent Activity</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside">
                <li>Your profile was updated successfully.</li>
                <li>System maintenance scheduled for 9 PM.</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => setShowNotificationCard(false)}
                className="w-full"
              >
                Close
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Header;
