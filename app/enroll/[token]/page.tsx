import EnrollmentCompletionPage from '@/components/admin/EnrollmentCompletionPage'
import LoadingScreen from '@/components/shared/Loading'
import React, { Suspense } from 'react'

const page = () => {
  return (
    <Suspense fallback={<LoadingScreen />} >
        <EnrollmentCompletionPage />
    </Suspense>
  )
}

export default page
