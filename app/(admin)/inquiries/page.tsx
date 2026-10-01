import InquiriesPage from "@/components/admin/Inquiries";
import LoadingScreen from "@/components/shared/Loading";
import React, { Suspense } from "react";

const page = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <InquiriesPage />
    </Suspense>
  );
};

export default page;
