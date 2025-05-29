"use client";

import { InteractionStatus } from "@azure/msal-browser";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Page = () => {
  const { instance, inProgress } = useMsal();
  const router = useRouter();

  const isAuthenticated = useIsAuthenticated();

  console.log("isAuthenticated", isAuthenticated);

  useEffect(() => {
    // Only redirect when MSAL is ready and user is authenticated
    if (inProgress === InteractionStatus.None && !isAuthenticated) {
      router.push("/");
    }
  }, [inProgress, isAuthenticated, router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Auth Page</h1>
      <p>This is the auth page. You can reach us at </p>
    </div>
  );
};

export default Page;
