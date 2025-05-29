"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { loginRequest } from "@/lib/authConfig";
import { InteractionStatus } from "@azure/msal-browser";

interface UserDetails {
  email: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  companyName: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  businessPhone?: string;
  mobilePhone: string;
  role: "admin" | "company_admin" | "employee";
  // targetApp: "i9" | "tax";
}

const InvitePage = () => {
  const router = useRouter();
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Determine which app this is based on port
  const currentApp =
    typeof window !== "undefined" && window.location.port === "3001"
      ? "tax"
      : "i9";

  const [formData, setFormData] = useState<UserDetails>({
    email: "",
    firstName: "",
    lastName: "",
    jobTitle: "",
    companyName: "",
    streetAddress: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    businessPhone: "",
    mobilePhone: "",
    role: "employee", // Default to manager for new invites
    // targetApp: currentApp as "i9" | "tax",
  });

  useEffect(() => {
    // Wait for MSAL to finish loading
    if (inProgress === InteractionStatus.None) {
      if (!isAuthenticated) {
        // Not authenticated, redirect to login
        router.push("/");
      } else if (accounts && accounts.length > 0) {
        // Authenticated and accounts loaded, check access
        checkUserAccess();
      }
    }
  }, [inProgress, isAuthenticated, accounts]);

  const checkUserAccess = async () => {
    try {
      // Get token
      const tokenResponse = await instance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      });

      // Get current user info from Graph API
      const graphResponse = await fetch("https://graph.microsoft.com/v1.0/me", {
        headers: {
          Authorization: `Bearer ${tokenResponse.accessToken}`,
        },
      });

      if (!graphResponse.ok) {
        throw new Error("Failed to fetch user data from Graph API");
      }

      const graphData = await graphResponse.json();

      // Check user's role and permissions using your API
      const userResponse = await fetch(
        `/api/inviteUser?email=${graphData.mail}`
      );

      if (!userResponse.ok) {
        throw new Error("Failed to fetch user role data");
      }

      const userData = await userResponse.json();

      if (!userData.success || !userData.user) {
        router.push("/unauthorized");
        return;
      }

      const user = userData.user;

      // Check if user has permission to access invite page
      if (user.role === "employee") {
        router.push("/unauthorized");
        return;
      }

      setCurrentUser(user);

      // Set company name for company_admin
      if (user.role === "company_admin") {
        setFormData((prev) => ({ ...prev, companyName: user.companyName }));
      }
    } catch (error: any) {
      console.error("Access check failed:", error);
      // If token acquisition fails, try to login
      if (error.message?.includes("token")) {
        instance.loginRedirect(loginRequest);
      } else {
        router.push("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const tokenResponse = await instance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      });

      const response = await fetch("/api/inviteUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenResponse.accessToken}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: data.message || "User invited successfully!",
        });

        // Reset form but keep company name for company_admin
        const companyName =
          currentUser?.role === "sales" ? formData.companyName : "";
        setFormData({
          email: "",
          firstName: "",
          lastName: "",
          jobTitle: "",
          companyName: companyName,
          streetAddress: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
          businessPhone: "",
          mobilePhone: "",
          role: "employee", // Default to manager for new invites
          // targetApp: currentApp as "i9" | "tax",
        });
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to invite user",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "An error occurred while inviting the user",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Determine allowed roles based on current user's role
  const getAllowedRoles = () => {
    if (currentUser?.role === "admin") {
      return ["admin", "company_admin", "employee"];
    } else if (currentUser?.role === "company_admin") {
      return ["employee"];
    }
    return [];
  };

  // Show loading while MSAL is initializing
  if (inProgress !== InteractionStatus.None || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render form if user not loaded
  if (!currentUser) {
    return null;
  }

  const allowedRoles = getAllowedRoles();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Invite New User</h1>
        <p className="text-gray-600 mt-2">
          Logged in as: {currentUser.displayName || currentUser.email} (
          {currentUser.role})
        </p>
      </div>

      {message.text && (
        <div
          className={`p-4 mb-4 rounded ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-lg shadow"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              First Name *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Last Name *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Role *</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Role</option>
              {allowedRoles.map((role) => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() +
                    role.slice(1).replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          {/* <div>
            <label className="block text-sm font-medium mb-1">
              Application Access *
            </label>
            <select
              name="targetApp"
              value={formData.targetApp}
              onChange={handleChange}
              required
              disabled={currentUser.role !== "admin"}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="i9">i9 Application</option>
              <option value="tax">Tax Application</option>
            </select>
          </div> */}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Job Title *</label>
          <input
            type="text"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Company Name *
          </label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            required
            // disabled={currentUser.role === "company_admin"}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Street Address *
          </label>
          <input
            type="text"
            name="streetAddress"
            value={formData.streetAddress}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">City *</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">State *</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">ZIP Code *</label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Country *</label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Mobile Phone *
            </label>
            <input
              type="tel"
              name="mobilePhone"
              value={formData.mobilePhone}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Business Phone
            </label>
            <input
              type="tel"
              name="businessPhone"
              value={formData.businessPhone}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            submitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {submitting ? "Sending Invitation..." : "Send Invitation"}
        </button>
      </form>
    </div>
  );
};

export default InvitePage;
