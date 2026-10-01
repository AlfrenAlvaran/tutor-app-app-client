import OtpVerify from "@/components/auth/OtpVerify";
import LoadingScreen from "@/components/shared/Loading";
import React, { Suspense } from "react";

const page = () => {
  return (
    <Suspense fallback={<LoadingScreen messages={["Authentication"]} />}>
      <OtpVerify />
    </Suspense>
  );
};

export default page;
