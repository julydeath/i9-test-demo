//@ts-nocheck

export const APPS_CONFIG = {
  i9: {
    clientId: "1b0ffce6-e790-4282-bdba-b4ac3c3e2b40",
    objectId: "79873973-77d0-4056-8fd9-3f704625df52", // Enterprise App Object ID for i9
    port: 3000,
    name: "i9 Application",
  },
  tax: {
    clientId: "YOUR-TAX-CLIENT-ID",
    objectId: "YOUR-TAX-ENTERPRISE-APP-OBJECT-ID", // Enterprise App Object ID for Tax
    port: 3001,
    name: "Tax Application",
  },
};

// Define roles with hierarchy
export const ROLES = {
  admin: {
    id: "ADMIN-ROLE-ID", // Create this role in BOTH apps
    name: "Admin",
    level: 3,
    canInvite: true,
    canInviteRoles: ["admin", "company_admin", "employee"],
    canAccessAllApps: true,
  },
  company_admin: {
    id: "COMPANY-ADMIN-ROLE-ID", // From your app roles
    name: "Company Admin",
    level: 2,
    canInvite: true,
    canInviteRoles: ["employee"],
    canAccessAllApps: false,
  },
  employee: {
    id: "EMPLOYEE-ROLE-ID", // From your app roles
    name: "Employee",
    level: 1,
    canInvite: false,
    canInviteRoles: [],
    canAccessAllApps: false,
  },
};

// Get current app based on port
export function getCurrentApp(): "i9" | "tax" {
  if (typeof window !== "undefined") {
    const port = window.location.port;
    return port === "3001" ? "tax" : "i9";
  }
  return "i9"; // default
}

// Check if user can access invite page
export function canUserInvite(userRole: string): boolean {
  return ROLES[userRole]?.canInvite || false;
}

// Get roles that user can assign
export function getAllowedRolesToAssign(userRole: string): string[] {
  return ROLES[userRole]?.canInviteRoles || [];
}
