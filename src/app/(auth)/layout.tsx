import Sidebar from "@/components/Sidebar";
import { Providers } from "../Provider";

const AuthLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen">
      <Providers>
        <Sidebar />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </Providers>
    </div>
  );
};

export default AuthLayout;
