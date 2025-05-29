"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  CheckCircle,
  UserCheck,
  Users,
  Calculator,
  HelpCircle,
  Bell,
  User,
  Settings,
  Headphones,
  Menu,
  X,
} from "lucide-react";

import { LucideIcon } from "lucide-react";

type NavItemType = {
  id: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
};

type NavItemProps = {
  item: NavItemType;
  onClick: (id: string) => void;
};

const Sidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation items data - can be moved to API later
  const workflowItems: NavItemType[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      active: true,
    },
    {
      id: "i9-verification",
      label: "I9 Verification",
      icon: CheckCircle,
      active: false,
    },
    { id: "e-verify", label: "E-Verify", icon: UserCheck, active: false },
    {
      id: "retention-program",
      label: "Retention Program",
      icon: Users,
      active: false,
    },
    {
      id: "tax-navigator",
      label: "Tax Navigator",
      icon: Calculator,
      active: false,
    },
  ];

  const adminItems: NavItemType[] = [
    {
      id: "employee-help",
      label: "Employee Help Request",
      icon: HelpCircle,
      active: false,
    },
    { id: "notification", label: "Notification", icon: Bell, active: false },
  ];

  const systemItems: NavItemType[] = [
    { id: "account", label: "Account", icon: User, active: false },
    { id: "setting", label: "Setting", icon: Settings, active: false },
    {
      id: "canary-support",
      label: "Canary Support",
      icon: Headphones,
      active: false,
    },
  ];

  const NavItem: React.FC<NavItemProps> = ({
    item,
    onClick,
  }: {
    item: NavItemType;
    onClick: any;
  }) => {
    const Icon = item.icon;
    return (
      <button
        onClick={() => onClick(item.id)}
        className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
          item.active
            ? "bg-yellow-100 text-gray-900 font-medium"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }`}
      >
        <Icon size={20} />
        <span className="text-sm">{item.label}</span>
      </button>
    );
  };

  const handleNavigation = (itemId: string) => {
    console.log("Navigate to:", itemId);
    // Close mobile menu when navigating
    setIsMobileMenuOpen(false);
    // Will implement navigation logic here
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-semibold text-lg text-gray-900">canary</span>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-1 hover:bg-gray-100 rounded"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6">
        {/* Workflow Section */}
        <div className="px-4 mb-6">
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
            Workflow
          </h3>
          <div className="space-y-1">
            {workflowItems.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                onClick={() => handleNavigation(item.id)}
              />
            ))}
          </div>
        </div>

        {/* Admin Section */}
        <div className="px-4 mb-6">
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
            Admin
          </h3>
          <div className="space-y-1">
            {adminItems.map((item) => (
              <NavItem key={item.id} item={item} onClick={handleNavigation} />
            ))}
          </div>
        </div>

        {/* System Section */}
        <div className="px-4">
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
            System
          </h3>
          <div className="space-y-1">
            {systemItems.map((item) => (
              <NavItem key={item.id} item={item} onClick={handleNavigation} />
            ))}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button - Only show when menu is closed */}
      {!isMobileMenuOpen && (
        <button
          onClick={toggleMobileMenu}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-gray-200 rounded-lg shadow-md"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 bg-white border-r border-gray-200 h-screen flex-col">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 z-40 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <SidebarContent />
        </div>
      </div>
    </>
  );
};

export default Sidebar;
