import { NextRequest, NextResponse } from "next/server";
import { Client } from "@microsoft/microsoft-graph-client";
import { getToken } from "@/lib/auth";

// GET /api/user-apps?userId=xxx&email=xxx
// This is a simplified, more reliable version
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const email = searchParams.get("email");

  if (!userId && !email) {
    return NextResponse.json(
      { error: "Please provide either userId or email parameter" },
      { status: 400 }
    );
  }

  try {
    const accessToken = await getToken();
    const client = Client.init({
      authProvider: (done) => done(null, accessToken),
    });

    let finalUserId = userId;

    // Get user ID from email if needed
    if (!userId && email) {
      try {
        // Try direct lookup first (works if email is UPN)
        const user = await client
          .api(`/users/${email}`)
          .select("id,displayName,mail")
          .get();
        finalUserId = user.id;
      } catch {
        // Fallback to search
        const users = await client
          .api("/users")
          .filter(`mail eq '${email}'`)
          .select("id,displayName,mail")
          .get();

        if (!users.value || users.value.length === 0) {
          return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
          );
        }

        finalUserId = users.value[0].id;
      }
    }

    // Get user info
    const userInfo = await client
      .api(`/users/${finalUserId}`)
      .select("id,displayName,mail,givenName,surname")
      .get();

    // Get App Role Assignments (main applications)
    const appRoleAssignments = await client
      .api(`/users/${finalUserId}/appRoleAssignments`)
      .get();

    const applications = [];

    if (appRoleAssignments.value && appRoleAssignments.value.length > 0) {
      // Process each assignment
      for (const assignment of appRoleAssignments.value) {
        try {
          // Get service principal details
          const servicePrincipal = await client
            .api(`/servicePrincipals/${assignment.resourceId}`)
            .select(
              "id,displayName,appId,appDisplayName,homepage,publisherName,servicePrincipalType,appRoles"
            )
            .get();

          // Find the specific role
          let roleName = "Default Access";
          let roleDescription = "Basic application access";

          if (
            servicePrincipal.appRoles &&
            assignment.appRoleId !== "00000000-0000-0000-0000-000000000000"
          ) {
            const role = servicePrincipal.appRoles.find(
              (r: any) => r.id === assignment.appRoleId
            );
            if (role) {
              roleName = role.displayName || role.value || "Custom Role";
              roleDescription = role.description || "Custom application role";
            }
          }

          applications.push({
            assignmentId: assignment.id,
            assignedDate: assignment.createdDateTime,
            role: {
              id: assignment.appRoleId,
              name: roleName,
              description: roleDescription,
            },
            application: {
              id: servicePrincipal.id,
              objectId: assignment.resourceId,
              displayName:
                servicePrincipal.displayName || servicePrincipal.appDisplayName,
              appId: servicePrincipal.appId,
              homepage: servicePrincipal.homepage,
              publisherName: servicePrincipal.publisherName,
              type: servicePrincipal.servicePrincipalType,
            },
          });
        } catch (spError: any) {
          console.error(
            `Error fetching service principal ${assignment.resourceId}:`,
            spError.message
          );

          // Include basic info even if we can't get full details
          applications.push({
            assignmentId: assignment.id,
            assignedDate: assignment.createdDateTime,
            role: {
              id: assignment.appRoleId,
              name: "Unknown Role",
            },
            application: {
              objectId: assignment.resourceId,
              displayName:
                assignment.resourceDisplayName || "Unknown Application",
            },
          });
        }
      }
    }

    // Optional: Get OAuth2 Permission Grants (consented apps)
    let consentedApps = [];
    try {
      const oauth2Grants = await client
        .api(`/users/${finalUserId}/oauth2PermissionGrants`)
        .get();

      if (oauth2Grants.value) {
        const uniqueResourceIds = [
          ...new Set(oauth2Grants.value.map((g: any) => g.resourceId)),
        ];

        for (const resourceId of uniqueResourceIds) {
          try {
            const servicePrincipal = await client
              .api(`/servicePrincipals/${resourceId}`)
              .select("id,displayName,appId,appDisplayName,homepage")
              .get();

            const grants = oauth2Grants.value.filter(
              (g: any) => g.resourceId === resourceId
            );
            const allScopes = [
              ...new Set(grants.flatMap((g: any) => g.scope?.split(" ") || [])),
            ].filter(Boolean);

            consentedApps.push({
              application: {
                id: servicePrincipal.id,
                displayName:
                  servicePrincipal.displayName ||
                  servicePrincipal.appDisplayName,
                appId: servicePrincipal.appId,
                homepage: servicePrincipal.homepage,
              },
              permissions: allScopes,
              consentType: grants[0]?.consentType || "Unknown",
            });
          } catch (error: any) {
            console.error(
              `Error fetching consented app ${resourceId}:`,
              error.message
            );
          }
        }
      }
    } catch (oauthError: any) {
      console.log("Could not fetch OAuth2 grants:", oauthError.message);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userInfo.id,
        displayName: userInfo.displayName,
        email: userInfo.mail,
        firstName: userInfo.givenName,
        lastName: userInfo.surname,
      },
      applications: {
        assigned: applications,
        consented: consentedApps,
      },
      summary: {
        totalAssignedApplications: applications.length,
        totalConsentedApplications: consentedApps.length,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error fetching user applications:", error);
    return NextResponse.json(
      {
        error: error.message || "Unknown error",
        code: error.code,
        details: error.body?.error?.message,
      },
      { status: error.statusCode || 500 }
    );
  }
}

// Helper function to get just app names (lightweight)
export async function getUserAppNames(userId: string) {
  try {
    const accessToken = await getToken();
    const client = Client.init({
      authProvider: (done) => done(null, accessToken),
    });

    const appRoleAssignments = await client
      .api(`/users/${userId}/appRoleAssignments`)
      .select("resourceDisplayName,resourceId")
      .get();

    const appNames = [];

    if (appRoleAssignments.value) {
      for (const assignment of appRoleAssignments.value) {
        if (assignment.resourceDisplayName) {
          appNames.push(assignment.resourceDisplayName);
        }
      }
    }

    return [...new Set(appNames)]; // Remove duplicates
  } catch (error) {
    console.error("Error fetching app names:", error);
    return [];
  }
}
