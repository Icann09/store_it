"use client"

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { actionsDropdownItems } from "@/constants";
import { constructDownloadUrl } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Models } from "node-appwrite";
import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { deleteFile, renameFile, updateFileUsers } from "@/lib/actions/file.action";
import { usePathname } from "next/navigation";
import { FileDetails, ShareInput } from "./ActionsModalContent";




export default function ActionDropdown({ file }: { file: Models.Document}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [action, setAction] = useState<ActionType | null >(null);
  const [name, setName] = useState(file.name);
  const [isLoading, setIsLoading] = useState(false);
  const path = usePathname();
  const [emails, setEmails] = useState<string[]>([]);

  const closeAllModals = () => {
    setIsModalOpen(false);
    setIsDropdownOpen(false);
    setAction(null);
    setName(file.name);
  }

  const handleAction = async () => {
    if (!action) return;
    setIsLoading(true);
    let success = false;
    const actions = {
      rename: () =>  renameFile({ fileId: file.$id, name, extension: file.extension, path }),
      share: () => updateFileUsers({ fileId: file.$id, emails, path}),
      delete: () => deleteFile({fileId: file.$id, bucketFileId: file.bucketFileId, path}),
    };
    success = await actions[action.value as keyof typeof actions](); 
    if (success) closeAllModals();
    setIsLoading(false);
  }
  const handleRemoveUser = async (email: string) => {
    const updateEmails = emails.filter((e) => e !== email);
    const success = await updateFileUsers({fileId: file.$id, emails: updateEmails, path});
    if (success) setEmails(updateEmails);
    closeAllModals();
  }

  const renderDialogContent = () => {
    if (!action) return null;
    const { value, label } = action;
    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
          {value === "rename" && <Input type="text" value={name} onChange={(e) => setName(e.target.value)}/>}
          {value === "details" && <FileDetails file={file}/>}
          {value === "share" && <ShareInput file={file} onInputChange={setEmails} onRemove={handleRemoveUser}/>}
          {value === "delete" && (
            <p className="delete-confirmation">
              Are you sure to delete {``} 
              <span className="delete-file-name">{file.name}</span>
            </p>
          )}
        </DialogHeader>
        {["rename", "delete", "share"].includes(value) && (
          <DialogFooter className="flex flex-col gap-3 md:flex-row">
            <Button onClick={closeAllModals} className="modal-cancel-button">Cancel</Button> 
            <Button onClick={handleAction} className="modal-submit-button">
              <p className="capitalize">{value}</p>
              {isLoading && (
                <Image src="/assets/icons/loader.svg" alt="loader" className="animate-spin" width={24} height={24}/>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    );
  }
  return (
    <div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100">
            <Image
              src="/assets/icons/dots.svg"
              alt="dots"
              className="w-5 h-5 object-contain"
              width={34}
              height={34}
            />
          </button>
        </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel className="max-w-[200px] truncate">{file.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {actionsDropdownItems.map((actionItem) => (
              <DropdownMenuItem 
                key={actionItem.value} 
                className="shad-dropdown-item"
                onClick={() => {
                  setAction(actionItem);
                  if (["rename", "share", "delete", "details"].includes(actionItem.value)) {
                    setIsModalOpen(true);
                  } 
                }}
              >
                {actionItem.value === "download" ? (
                  <Link href={constructDownloadUrl(file.bucketFileId)} download={file.name} className="flex items-center gap-2">
                    <Image src={actionItem.icon} alt={actionItem.label} width={30} height={30}/>
                    {actionItem.label}
                  </Link>
                ) : (
                  <div className="flex items-center gap-2">
                    <Image src={actionItem.icon} alt={actionItem.label} width={30} height={30}/>
                    {actionItem.label}
                  </div>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {renderDialogContent() }
      </Dialog>
    </div>
  )
}
