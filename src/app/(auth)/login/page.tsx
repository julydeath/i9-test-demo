"use client";

import React, { useEffect } from "react";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { loginRequest } from "@/lib/authConfig";
import { useRouter } from "next/navigation";
import { InteractionStatus } from "@azure/msal-browser";

const Page = () => {
  const { instance, inProgress } = useMsal();
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();

  console.log("isAuthenticated", isAuthenticated);

  useEffect(() => {
    // Only redirect when MSAL is ready and user is authenticated
    if (inProgress === InteractionStatus.None && isAuthenticated) {
      router.push("/profile");
    }
  }, [inProgress, isAuthenticated, router]);

  const handleLogin = (loginType: any) => {
    if (loginType === "popup") {
      instance.loginPopup(loginRequest).catch((e) => {
        console.log(e);
      });
    } else if (loginType === "redirect") {
      instance.loginRedirect(loginRequest).catch((e) => {
        console.log(e);
      });
    }
  };

  // If authenticated and MSAL is ready, show loading while redirecting
  if (inProgress === InteractionStatus.None && isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p>You are already logged in. Redirecting to profile...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto my-auto items-center flex flex-col justify-center h-screen">
      <h1 className="text-2xl font-bold mb-6">Login</h1>
      <div className="flex gap-6">
        <button
          className="bg-black text-white px-4 py-2 rounded-2xl cursor-pointer"
          onClick={() => handleLogin("popup")}
        >
          Login in using Popup
        </button>
        <button
          className="bg-black text-white px-4 py-2 rounded-2xl cursor-pointer"
          onClick={() => handleLogin("redirect")}
        >
          Login in using Redirect
        </button>
      </div>
    </div>
  );
};

export default Page;
