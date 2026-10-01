import TutorAttendancePage from "@/components/attendance/TutorPage";
import LoadingScreen from "@/components/shared/Loading";
import { getCurrentUser } from "@/libs/api/getCurrentUser";
import { redirect } from "next/navigation";
import React, { Suspense } from "react";

async function TutorAttendanceLoader() {
  const user  = await getCurrentUser()
  const tutorId = user?.id


  if(!tutorId) {
    redirect('/sign-in')
  }

  return <TutorAttendancePage tutorId={tutorId} tutorName={user.name} />

}


export default  function page() {
 



  return (
    <Suspense fallback={<LoadingScreen />}>
      <TutorAttendanceLoader />
    </Suspense>
  );
}
