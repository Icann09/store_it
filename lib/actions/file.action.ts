"use server"

import { createAdminClient } from "..";
import { InputFile } from "node-appwrite/file"
import { appwriteConfig } from "../appwrite/config";
import { ID, Models, Query } from "node-appwrite";
import { constructFileUrl, getFileType, parseStringify } from "../utils";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./user.action";

const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
}

export const uploadFile = async ({ file, ownerId, accountId, path }: UploadFileProps) => {
  const { storage, database } = await createAdminClient();
  try {
    const inputFile = InputFile.fromBuffer(file, file.name);
    const bucketFile = await storage.createFile(
      appwriteConfig.bucketId,
      ID.unique(),
      inputFile,
    );
    const fileDocument = {
      type: getFileType(bucketFile.name).type,
      name: bucketFile.name,
      url: constructFileUrl(bucketFile.$id),
      extension: getFileType(bucketFile.name).extension,
      size: bucketFile.sizeOriginal,
      owner: ownerId,
      accountId,
      users: [],
      bucketFileId: bucketFile.$id,
    };
    const newFile = await database
      .createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.filesCollectionId,
        ID.unique(),
        fileDocument,
      )
      .catch(async(error: unknown) => {
        await storage.deleteFile(appwriteConfig.bucketId, bucketFile.$id);
        handleError(error, "Failed to create file document")
      });
    revalidatePath(path);
    return  parseStringify(newFile); 
  } catch (error) {
    handleError(error, "Failed to upload file");
  }
}

const createQueries = (currenUser: Models.Document, types: string[], searchText: string, sort: string, limit?: number) => {
  const queries = [
    Query.or([
      Query.equal("owner", [currenUser.$id]),
      Query.contains("users", [currenUser.email]),
  ]),
  ]; 
  if (types.length > 0) queries.push(Query.equal("type", types));
  if (searchText) queries.push(Query.contains("name", searchText));
  if (limit) queries.push(Query.limit(limit));

  const [sortBy, orderBy] = sort.split("-");
  queries.push(
    orderBy === "asc" ? Query.orderAsc(sortBy) : Query.orderDesc(sortBy)
  );
  return queries;
}

export const getFiles = async ({ types = [], searchText = "", sort = "$createdAt-desc", limit }: GetFilesProps) => {
  const { database } = await createAdminClient();
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User not found");
    const quries = createQueries(currentUser, types, searchText, sort, limit);
    const files = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      quries,
    );
    return parseStringify(files);
  } catch (error) {
    handleError(error, "Failed to get files")
  }
}

export const renameFile = async ({ fileId, name, extension, path }: RenameFileProps) => {
  const { database } = await createAdminClient();
  try {
    const newName = `${name}.${extension}`;
    const updateFile = await database.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      {name: newName},
    );
    revalidatePath(path);
    return parseStringify(updateFile);
  } catch (error) {
    handleError(error, "Failed to rename file");
  }
}

export const updateFileUsers = async ({ fileId, emails, path }: UpdateFileUsersProps) => {
  const { database } = await createAdminClient();
  try {
    const updateFile = await database.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      {users: emails},
    );
    revalidatePath(path);
    return parseStringify(updateFile);
  } catch (error) {
    handleError(error, "Failed to rename file");
  }
}

export const deleteFile = async ({
  fileId,
  bucketFileId,
  path,
}: DeleteFileProps) => {
  const { database, storage } = await createAdminClient();
  try {
    // 1. Delete file from storage bucket
    await storage.deleteFile(appwriteConfig.bucketId, bucketFileId);
    // 2. Delete metadata document from database
    await database.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId
    );
    // 3. Revalidate UI path
    revalidatePath(path);


    return parseStringify({ status: "success to delete"});
  } catch (error) {
    handleError(error, "Failed to delete file");
    return false;
  }
};