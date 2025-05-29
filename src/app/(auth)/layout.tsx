import { Providers } from "../Provider";

const AuthLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <Providers>{children}</Providers>
    </div>
  );
};

export default AuthLayout;
