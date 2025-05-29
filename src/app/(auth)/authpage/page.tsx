"use client";

import Sidebar from "@/components/Sidebar";
import { InteractionStatus } from "@azure/msal-browser";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Page = () => {
  const { instance, inProgress } = useMsal();
  const router = useRouter();

  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    // Only redirect when MSAL is ready and user is authenticated
    if (inProgress === InteractionStatus.None && !isAuthenticated) {
      router.push("/");
    }
  }, [inProgress, isAuthenticated, router]);

  return (
    <div className="">
      <Sidebar />
    </div>
  );
};

export default Page;
