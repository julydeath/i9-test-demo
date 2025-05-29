import React from "react";
import {
  MessageSquare,
  AlertCircle,
  Clock,
  ArrowRight,
  User,
} from "lucide-react";

const EmployeeMessages = ({ data = null, isLoading = true, error = null }) => {
  // Default static data - will be replaced with API data later
  const defaultMessages = [
    {
      id: 1,
      type: "no_id",
      title: "No ID available",
      message:
        "Hi need I do not have a valid ID it is coming in the mail in a...",
      timestamp: "5hr ago",
      priority: "high",
      employee: "John Smith",
    },
    {
      id: 2,
      type: "missing_info",
      title: "Missing Info",
      message: "Hi need I do not know what my SSN is can I do another...",
      timestamp: "1 Day ago",
      priority: "medium",
      employee: "Sarah Johnson",
    },
    {
      id: 3,
      type: "error_arrival",
      title: "Error on arrival",
      message: "Hi need I do not know what my SSN is can I do another...",
      timestamp: "1 Day ago",
      priority: "medium",
      employee: "Mike Davis",
    },
    {
      id: 4,
      type: "no_ssn",
      title: "No SSN",
      message: "Hi need I do not know what my SSN is can I do another...",
      timestamp: "1 Day ago",
      priority: "low",
      employee: "Lisa Wilson",
    },
  ];

  // Use provided data or fallback to default
  const messages = data || defaultMessages;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case "no_id":
        return <User size={16} className="text-red-500" />;
      case "missing_info":
        return <AlertCircle size={16} className="text-yellow-500" />;
      case "error_arrival":
        return <AlertCircle size={16} className="text-orange-500" />;
      case "no_ssn":
        return <User size={16} className="text-blue-500" />;
      default:
        return <MessageSquare size={16} className="text-gray-500" />;
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 min-h-[510px] min-w-[300px] md:min-w-[500px]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Employee Messages
          </h2>
          <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Messages List - Exact same structure and dimensions as normal state */}
        <div className="space-y-1">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {/* Priority Indicator - same size */}
              <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse flex-shrink-0"></div>

              {/* Message Content - same structure */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {/* Icon skeleton - same size as real icons */}
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                  {/* Title skeleton - realistic width */}
                  <div
                    className="h-4 bg-gray-200 rounded animate-pulse"
                    style={{ width: "120px" }}
                  ></div>
                </div>
                {/* Message text skeleton - same height and line-clamp behavior */}
                <div className="space-y-1">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-full"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                </div>
              </div>

              {/* Timestamp & Arrow - same dimensions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-1 text-xs">
                  {/* Clock icon skeleton */}
                  <div className="w-3 h-3 bg-gray-200 rounded animate-pulse"></div>
                  {/* Timestamp text skeleton */}
                  <div className="h-3 w-12 bg-gray-200 rounded animate-pulse"></div>
                </div>
                {/* Arrow skeleton */}
                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Messages Link - exact same dimensions */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-3.5 h-3.5 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 min-h-[510px] min-w-[500px]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Employee Messages
          </h2>
        </div>

        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle size={48} className="text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Unable to Load Messages
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {error || "There was an error loading employee messages."}
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
  if (!messages || messages.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 min-h-[510px] min-w-[500px]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Employee Messages
          </h2>
          <span className="text-sm text-gray-500">Sort By: Recent</span>
        </div>

        <div className="flex flex-col items-center justify-center py-8 text-center">
          <MessageSquare size={48} className="text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Messages
          </h3>
          <p className="text-sm text-gray-600">
            No employee messages are currently available.
          </p>
        </div>
      </div>
    );
  }

  // Normal Data State
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 min-h-[510px] min-w-[300px] md:min-w-[500px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Employee Messages
        </h2>
        <span className="text-sm text-gray-500">Sort By: Recent</span>
      </div>

      {/* Messages List */}
      <div className="space-y-1">
        {messages.map((message) => (
          <div
            key={message.id}
            className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group"
          >
            {/* Priority Indicator */}
            <div
              className={`w-2 h-2 rounded-full ${getPriorityColor(
                message.priority
              )} flex-shrink-0`}
            ></div>

            {/* Message Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {getMessageIcon(message.type)}
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {message.title}
                </h3>
              </div>
              <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                {message.message}
              </p>
            </div>

            {/* Timestamp & Arrow */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock size={12} />
                <span>{message.timestamp}</span>
              </div>
              <ArrowRight
                size={16}
                className="text-gray-400 group-hover:text-gray-600 transition-colors"
              />
            </div>
          </div>
        ))}
      </div>

      {/* View All Messages Link */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
          View All Messages
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default EmployeeMessages;
