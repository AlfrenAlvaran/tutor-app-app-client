import AssignTutorPage from '@/components/admin/Assigntutorpage'
import LoadingScreen from '@/components/shared/Loading'
import React, { Suspense } from 'react'

const page = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
        <AssignTutorPage />
    </Suspense>
  )
}

export default page
