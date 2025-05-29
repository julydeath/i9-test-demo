"use client";

import EmployeeMessages from "@/components/EmployeeMessages";
import EmployeeRiskDistribution from "@/components/EmployeeRisk";
import Sidebar from "@/components/Sidebar";
import TaxCreditsOverview from "@/components/TaxCreditOverview";
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
    <div className="flex flex-col md:flex-row max-auto">
      <div className="flex-1 p-4 space-y-6">
        <TaxCreditsOverview />
        <EmployeeRiskDistribution />
      </div>
      <div className="p-4">
        <EmployeeMessages />
      </div>
    </div>
  );
};

export default Page;
