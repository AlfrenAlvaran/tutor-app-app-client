// import StudentProgramsPage from "@/components/admin/StudentProgramsPage";
import LoadingScreen from "@/components/shared/Loading";
import StudentProgramsPage from "@/components/students/StudentProgramsPage";
import React, { Suspense } from "react";

const page = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <StudentProgramsPage />
    </Suspense>
  );
};

export default page;
