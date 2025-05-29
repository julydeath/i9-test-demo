"use client";

import { loginRequest } from "@/lib/authConfig";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { InteractionStatus } from "@azure/msal-browser";

const Page = () => {
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();
  const { instance, accounts, inProgress } = useMsal();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Wait for MSAL to finish loading
    if (inProgress === InteractionStatus.None) {
      if (!isAuthenticated) {
        // Not authenticated, redirect to login
        router.push("/login");
      } else if (accounts && accounts.length > 0) {
        // Authenticated and accounts loaded, check access
        checkUserAccess();
      }
    }
  }, [inProgress, isAuthenticated, accounts, router]);

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
      setCurrentUser(user);
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

  const handleLogout = (logoutType: any) => {
    if (logoutType === "popup") {
      instance.logoutPopup({
        postLogoutRedirectUri: "/",
        mainWindowRedirectUri: "/",
      });
    } else if (logoutType === "redirect") {
      instance.logoutRedirect({
        postLogoutRedirectUri: "/",
      });
    }
  };

  // Show loading while MSAL is initializing or checking authentication
  if (
    inProgress !== InteractionStatus.None ||
    (inProgress === InteractionStatus.None && !isAuthenticated)
  ) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        <p>Please wait while we verify your authentication...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Profile Page</h1>
      {loading && <p>Loading user data...</p>}
      {!loading && currentUser && (
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify(currentUser, null, 2)}
        </pre>
      )}

      <div className="mt-6 flex gap-6">
        <button
          className="bg-white text-red-500 border-red-500 border rounded-2xl px-4 py-2 cursor-pointer"
          onClick={() => handleLogout("popup")}
        >
          logout
        </button>
        <button
          className="bg-white text-red-500 border-red-500 border rounded-2xl px-4 py-2 cursor-pointer"
          onClick={() => handleLogout("redirect")}
        >
          logout
        </button>
      </div>
    </div>
  );
};

export default Page;
