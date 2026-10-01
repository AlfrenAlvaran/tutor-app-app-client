import TutorSidebar from "@/components/tutor/TutorSidebar";
import Tutortopbar from "@/components/tutor/Tutortopbar";
import { getCurrentUser } from "@/libs/api/getCurrentUser";
import { AuthProvider } from "@/context/AuthContext";
import { redirect } from "next/navigation";
import React from "react";

export default async function TutorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  // console.log("Current user from /auth/me: ", JSON.stringify(user));
  if (!user) {
    redirect("/sign-in");
  }

  if (user.role !== "tutor") {
    redirect("/unauthorized");
  }

  return (
    <AuthProvider user={user}>
      <div className="min-h-screen bg-navy-950">
        <TutorSidebar userName={user.name} />

        <div className="pl-18 transition-[padding] duration-300 lg:pl-64">
          <Tutortopbar />

          <main className="p-6">{children}</main>
        </div>
      </div>
    </AuthProvider>
  );
}
