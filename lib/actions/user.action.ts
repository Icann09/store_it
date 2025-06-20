"use server"
import { ID, Query } from "node-appwrite";
import { createAdminClient } from ".."
import { appwriteConfig } from "../appwrite/config";
import { parseStringify } from "../utils";

// ** Create account flow **
// 1. User enter full name and email
// 2. Check if the user already exist using the email 
// 3. Send OTP to user's email
// 4. This will send a secret key or creating a session
// 5. Create a new user document if the user is new user
// 6. Return the users's accountId that will be used
// 7. verify OTP and authenticate to login

const getUserByEmail = async (email: string) => {
  const { database } = await createAdminClient();
  const result = await database.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.usersCollectionId,
    [Query.equal("email", [email])]
  );
  return result.total > 0 ? result.documents[0] : null;
}

const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
}

const sendEmailOTP = async ({ email }: { email: string }) => {
  const { account } = await createAdminClient();
  try {
    const session = await account.createEmailToken(ID.unique(), email);
    return session.userId;
  } catch (error) {
    handleError(error, "Failed to send email OTP")
  }
}

export const createAccount = async ({ fullName, email }: { fullName: string, email: string }) => {
  const existingUser = await getUserByEmail(email);
  const accountId = await sendEmailOTP({ email });
  if (!accountId) throw new Error("Failed to send an OTP");
  if (!existingUser) {
    const { database } = await createAdminClient();
    await database.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      ID.unique(),
      {
        fullName,
        email,
        avatar: "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png",
        accountId,
      }
    );
  }
  return parseStringify({ accountId });
}