import AssignmentsPage from "@/components/admin/SettingsPage";
import LoadingScreen from "@/components/shared/Loading";
import React, { Suspense } from "react";

const SettingsPage = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <AssignmentsPage />
    </Suspense>
  );
};

export default SettingsPage;
