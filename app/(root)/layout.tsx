import Header from "@/components/Header";
import MobileNavigation from "@/components/MobileNavigation";
import SideBar from "@/components/SideBar";
import { getCurrentUser } from "@/lib/actions/user.action";
import { redirect } from "next/navigation";
import React from "react";
import { Toaster } from "@/components/ui/sonner"


export default async function layout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUser();
  console.log(currentUser);
  if (!currentUser) redirect("/sign-in");

  return (
    <main className="flex h-screen">
      <SideBar {...currentUser} />
      <section className="flex h-full flex-1 flex-col">
        <MobileNavigation {...currentUser} /> 
        <Header userId={currentUser.$id} accountId={currentUser.accountId}/>
        <div className="main-content">
          {children}
        </div>
      </section>
      <Toaster />
    </main>
  )
}
