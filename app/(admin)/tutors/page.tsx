import TutorsAdminPage from "@/components/admin/TutorPage";
import LoadingScreen from "@/components/shared/Loading";
import React, { Suspense } from "react";

const page = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <TutorsAdminPage />
    </Suspense>
  );
};

export default page;
