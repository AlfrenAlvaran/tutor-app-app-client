import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/TopBar";
import { getCurrentUser } from "@/libs/api/getCurrentUser";
import { redirect } from "next/navigation";
import React from "react";
export const dynamic = "force-dynamic";
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  if(user.role !== 'admin') {
    redirect('/unauthorized')
  }



  return (
    <div className="min-h-screen bg-navy-950">
      <Sidebar />
      <div className="pl-18 transition-[padding] duration-300 lg:pl-64">
        {/* TopBar  */}
        {/* <Topbar /> */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
