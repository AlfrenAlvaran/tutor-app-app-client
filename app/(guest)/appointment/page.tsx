import Enroll from '@/components/guest/Enroll'
import EnrollHero from '@/components/guest/EnrollHero'
import EnrollTrust from '@/components/guest/EnrollTrust'
import FAQSection from '@/components/guest/FAQSection'
import { ENROLLMENT_FAQS } from '@/constant/guest'
import React from 'react'

const page = () => {
  return (
    <div>
      <main>
        <EnrollHero />
        <EnrollTrust />
        <Enroll id='enroll' />
        <FAQSection
        id='feq'
        eyebrow='Questions'
        title='Before you hit submit'
        faqs={ENROLLMENT_FAQS}
        />
      </main>
    </div>
  )
}

export default page
