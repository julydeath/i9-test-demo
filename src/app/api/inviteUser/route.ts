import { NextRequest, NextResponse } from "next/server";
import { Client } from "@microsoft/microsoft-graph-client";
import { getToken } from "@/lib/auth";

// Update with your actual Enterprise Application Object ID
const APP_OBJECT_ID = process.env.OBJECT_ID;

// Your role IDs
const ROLE_IDS = {
  admin: process.env.ADMIN_ROLE_ID,
  employee: process.env.EMPLOYEE_ROLE_ID,
  company_admin: process.env.COMPANY_ADMIN_ROLE_ID,
};

interface UserDetails {
  email: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  companyName: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  businessPhone?: string;
  mobilePhone: string;
  role: "admin" | "employee" | "company_admin";
  //   targetApp: "i9" | "tax";
}

export async function POST(req: NextRequest) {
  try {
    const userDetails: UserDetails = await req.json();

    // Validate required fields
    const requiredFields = [
      "email",
      "firstName",
      "lastName",
      "jobTitle",
      "companyName",
      "streetAddress",
      "city",
      "state",
      "postalCode",
      "country",
      "mobilePhone",
      "role",
    ];

    for (const field of requiredFields) {
      if (!userDetails[field as keyof UserDetails]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate role
    if (!ROLE_IDS[userDetails.role]) {
      return NextResponse.json(
        { error: "Invalid role. Must be 'manager' or 'sales'" },
        { status: 400 }
      );
    }

    const accessToken = await getToken();
    const client = Client.init({
      authProvider: (done) => done(null, accessToken),
    });

    // Step 1: Check if user already exists
    let userId: string | null = null;
    let isExistingUser = false;

    try {
      const existingUsers = await client
        .api("/users")
        .filter(
          `mail eq '${userDetails.email}' or otherMails/any(x:x eq '${userDetails.email}')`
        )
        .select("id,displayName,mail")
        .get();

      if (existingUsers.value && existingUsers.value.length > 0) {
        userId = existingUsers.value[0].id;
        isExistingUser = true;
        console.log("User already exists with ID:", userId);
      }
    } catch (searchError) {
      console.log("User not found, will create invitation");
    }

    // Step 2: If new user, create invitation
    if (!userId) {
      const inviteResponse = await client.api("/invitations").post({
        invitedUserEmailAddress: userDetails.email,
        invitedUserDisplayName: `${userDetails.firstName} ${userDetails.lastName}`,
        inviteRedirectUrl:
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        sendInvitationMessage: true,
        invitedUserMessageInfo: {
          customizedMessageBody: `Hello ${userDetails.firstName},\n\nYou've been invited to join ${userDetails.companyName} as a ${userDetails.role}. Click the link below to accept the invitation and access your account.`,
        },
      });

      userId = inviteResponse.invitedUser?.id;

      if (!userId) {
        throw new Error("Failed to get user ID from invitation");
      }

      // Wait for user to be provisioned
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    // Step 3: Update user profile with all details
    try {
      const updateData = {
        givenName: userDetails.firstName,
        surname: userDetails.lastName,
        displayName: `${userDetails.firstName} ${userDetails.lastName}`,
        jobTitle: userDetails.jobTitle,
        companyName: userDetails.companyName,
        streetAddress: userDetails.streetAddress,
        city: userDetails.city,
        state: userDetails.state,
        postalCode: userDetails.postalCode,
        country: userDetails.country,
        mobilePhone: userDetails.mobilePhone,
        // businessPhones is an array in Graph API
        businessPhones: userDetails.businessPhone
          ? [userDetails.businessPhone]
          : [],
        // Store role in an extension attribute or department field
        department: userDetails.role, // Using department to store role for easy retrieval
        // targetApp: "i9",
      };

      await client.api(`/users/${userId}`).patch(updateData);
      console.log("User profile updated successfully");
    } catch (updateError: any) {
      console.error("Profile update error:", updateError);
      // Continue even if profile update fails - we can update later
    }

    // Step 4: Assign role
    let roleAssigned = false;
    try {
      // Check if role is already assigned
      const existingAssignments = await client
        .api(`/users/${userId}/appRoleAssignments`)
        .get();

      const hasRole = existingAssignments.value.some(
        (assignment: any) =>
          assignment.resourceId === APP_OBJECT_ID &&
          assignment.appRoleId === ROLE_IDS[userDetails.role]
      );

      if (!hasRole) {
        const roleData = await client
          .api(`/users/${userId}/appRoleAssignments`)
          .post({
            principalId: userId,
            resourceId: APP_OBJECT_ID,
            appRoleId: ROLE_IDS[userDetails.role],
          });
        roleAssigned = true;
        console.log("Role assigned successfully", roleData);
      } else {
        roleAssigned = true;
        console.log("User already has this role");
      }
    } catch (roleError: any) {
      console.error("Role assignment error:", roleError);
    }

    // Step 5: Get the complete user profile to return
    let userProfile = null;
    try {
      userProfile = await client
        .api(`/users/${userId}`)
        .select(
          "id,displayName,givenName,surname,mail,jobTitle,companyName,streetAddress,city,state,postalCode,country,mobilePhone,businessPhones,department"
        )
        .get();
    } catch (profileError) {
      console.error("Error fetching user profile:", profileError);
    }

    return NextResponse.json({
      success: true,
      userId: userId,
      isExistingUser: isExistingUser,
      message: isExistingUser
        ? `User updated successfully with ${userDetails.role} role`
        : `User invited successfully with ${userDetails.role} role`,
      roleAssigned: roleAssigned,
      userProfile: userProfile,
    });
  } catch (error: any) {
    console.error("Full error:", JSON.stringify(error, null, 2));

    return NextResponse.json(
      {
        error: error.message || "Unknown error",
        details: error.body?.error?.message,
        statusCode: error.statusCode,
      },
      { status: error.statusCode || 500 }
    );
  }
}

// GET endpoint to retrieve user details
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const userId = searchParams.get("userId");

  if (!email && !userId) {
    return NextResponse.json(
      { error: "Please provide either email or userId parameter" },
      { status: 400 }
    );
  }

  try {
    const accessToken = await getToken();
    const client = Client.init({
      authProvider: (done) => done(null, accessToken),
    });

    let user;

    if (userId) {
      // Get user by ID
      user = await client
        .api(`/users/${userId}`)
        .select(
          "id,displayName,givenName,surname,mail,jobTitle,companyName,streetAddress,city,state,postalCode,country,mobilePhone,businessPhones,department"
        )
        .get();
    } else {
      // Search by email
      const users = await client
        .api("/users")
        .filter(`mail eq '${email}' or otherMails/any(x:x eq '${email}')`)
        .select(
          "id,displayName,givenName,surname,mail,jobTitle,companyName,streetAddress,city,state,postalCode,country,mobilePhone,businessPhones,department"
        )
        .get();

      if (users.value && users.value.length > 0) {
        user = users.value[0];
      } else {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    }

    // Get user's role assignments
    const roleAssignments = await client
      .api(`/users/${user.id}/appRoleAssignments`)
      .get();

    // Find the role for your app
    let userRole = null;
    const appRole = roleAssignments.value.find(
      (assignment: any) => assignment.resourceId === APP_OBJECT_ID
    );

    if (appRole) {
      // Map role ID back to role name
      userRole =
        Object.entries(ROLE_IDS).find(
          ([_, id]) => id === appRole.appRoleId
        )?.[0] || null;
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.mail,
        firstName: user.givenName,
        lastName: user.surname,
        displayName: user.displayName,
        jobTitle: user.jobTitle,
        companyName: user.companyName,
        streetAddress: user.streetAddress,
        city: user.city,
        state: user.state,
        postalCode: user.postalCode,
        country: user.country,
        mobilePhone: user.mobilePhone,
        businessPhone: user.businessPhones?.[0] || null,
        role: userRole || user.department,
        // targetApp: user, // fallback to department if role not found
      },
    });
  } catch (error: any) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      {
        error: error.message || "Unknown error",
        details: error.body?.error?.message,
      },
      { status: error.statusCode || 500 }
    );
  }
}
