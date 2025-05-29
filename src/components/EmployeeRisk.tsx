"use client";

import React from "react";
import { Info, AlertCircle, Users } from "lucide-react";

const EmployeeRiskDistribution = ({
  data = null,
  isLoading = true,
  error = null,
}) => {
  // Default static data - will be replaced with API data later
  const defaultRiskData = [
    {
      id: "low",
      label: "Low",
      count: 70,
      color: "bg-green-500",
      textColor: "text-green-700",
    },
    {
      id: "medium",
      label: "Medium",
      count: 52,
      color: "bg-yellow-500",
      textColor: "text-yellow-700",
    },
    {
      id: "high",
      label: "High",
      count: 18,
      color: "bg-red-500",
      textColor: "text-red-700",
    },
  ];

  // Use provided data or fallback to default
  const riskData = data || defaultRiskData;

  // Calculate total for percentage calculations
  const totalEmployees = riskData.reduce((sum, item) => sum + item.count, 0);

  // Calculate max count for bar width scaling
  const maxCount = Math.max(...riskData.map((item) => item.count));

  // Loading State
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 pb-14">
        <div className="flex items-center gap-2 mb-6 pb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Employee Risk Distribution
          </h2>
          <Info size={16} className="text-gray-400" />
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center gap-4">
              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-8 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex-1 h-6 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 pb-14">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Employee Risk Distribution
          </h2>
          <Info size={16} className="text-gray-400" />
        </div>

        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle size={48} className="text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Unable to Load Data
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {error || "There was an error loading the risk distribution data."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty Data State
  if (!riskData || riskData.length === 0 || totalEmployees === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Employee Risk Distribution
          </h2>
          <Info size={16} className="text-gray-400" />
        </div>

        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Users size={48} className="text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Employee Data
          </h3>
          <p className="text-sm text-gray-600">
            No employee risk distribution data is currently available.
          </p>
        </div>
      </div>
    );
  }

  // Normal Data State
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <h2 className="text-lg font-semibold text-gray-900">
          Employee Risk Distribution
        </h2>
        <Info size={16} className="text-gray-400" />
      </div>

      {/* Risk Distribution Bars */}
      <div className="space-y-4">
        {riskData.map((risk) => {
          const percentage = maxCount > 0 ? (risk.count / maxCount) * 100 : 0;

          return (
            <div key={risk.id} className="flex items-center gap-4">
              {/* Risk Level Indicator */}
              <div className="flex items-center gap-2 w-20">
                <div className={`w-3 h-3 rounded-full ${risk.color}`}></div>
                <span className="text-sm font-medium text-gray-700">
                  {risk.label}
                </span>
              </div>

              {/* Count */}
              <div className="w-8 text-right">
                <span className="text-sm font-semibold text-gray-900">
                  {risk.count}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="flex-1 relative">
                <div className="w-full h-6 bg-gray-100 rounded-md overflow-hidden">
                  <div
                    className={`h-full ${risk.color} transition-all duration-700 ease-out rounded-md`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Total Employees:{" "}
            <span className="font-semibold text-gray-900">
              {totalEmployees}
            </span>
          </span>
          <div className="flex items-center gap-4">
            <span>
              High Risk:{" "}
              <span className="font-semibold text-red-600">
                {totalEmployees > 0
                  ? Math.round(
                      ((riskData.find((r) => r.id === "high")?.count ?? 0) /
                        totalEmployees) *
                        100
                    )
                  : 0}
                %
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeRiskDistribution;
