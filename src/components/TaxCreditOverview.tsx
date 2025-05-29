"use client";

import { Info } from "lucide-react";

const TaxCreditsOverview = () => {
  // Static data - will be replaced with API data later
  const taxData = {
    earned: 53400,
    revenueAtRisk: 200400,
    totalPotential: 253800,
    creditsPercentage: 27,
  };

  const formatCurrency = (amount: any) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Tax Credits Overview
        </h2>
        <Info size={16} className="text-gray-400" />
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Earned */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Earned</span>
            <Info size={12} className="text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {formatCurrency(taxData.earned)}
          </div>
        </div>

        {/* Revenue at Risk */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Revenue at Risk</span>
            <Info size={12} className="text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {formatCurrency(taxData.revenueAtRisk)}
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            <span className="font-medium">{taxData.creditsPercentage}%</span>{" "}
            Credits Captured
          </span>
          <span className="text-gray-600">
            Total potential Credits:{" "}
            <span className="font-medium">
              {formatCurrency(taxData.totalPotential)}
            </span>
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          {/* Green section (earned) */}
          <div
            className="absolute left-0 top-0 h-full bg-green-500 transition-all duration-500"
            style={{
              width: `${(taxData.earned / taxData.totalPotential) * 100}%`,
            }}
          ></div>
          {/* Red section (revenue at risk) */}
          <div
            className="absolute top-0 h-full bg-red-500 transition-all duration-500"
            style={{
              left: `${(taxData.earned / taxData.totalPotential) * 100}%`,
              width: `${
                (taxData.revenueAtRisk / taxData.totalPotential) * 100
              }%`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default TaxCreditsOverview;
