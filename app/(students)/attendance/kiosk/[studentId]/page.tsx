import AttendanceKioskPage from '@/components/admin/KioskPage'
import LoadingScreen from '@/components/shared/Loading'
import React, { Suspense } from 'react'

const page = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
        <AttendanceKioskPage />
    </Suspense>
  )
}

export default page
