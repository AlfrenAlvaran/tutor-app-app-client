import StudentsAdminPage from "@/components/admin/Studentsadminpage";
import LoadingScreen from "@/components/shared/Loading";
import React, { Suspense } from "react";

export default function page() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <StudentsAdminPage />
    </Suspense>
  );
}
