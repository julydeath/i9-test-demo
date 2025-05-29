import { ConfidentialClientApplication } from "@azure/msal-node";

const msalConfig = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_CLIENT_ID!,
    authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_TENANT_ID}`,
    clientSecret: process.env.NEXT_PUBLIC_CLINET_SECRET,
  },
};

const SCOPES = ["https://graph.microsoft.com/.default"];

const cca = new ConfidentialClientApplication(msalConfig);

export async function getToken(): Promise<string> {
  const result = await cca.acquireTokenByClientCredential({ scopes: SCOPES });
  if (!result?.accessToken) throw new Error("Failed to get access token");
  return result.accessToken;
}
