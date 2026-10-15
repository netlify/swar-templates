import { createFileRoute } from '@tanstack/react-router'
import { allJobs, allEducations } from 'content-collections'
import Resume from '@/components/Resume'
import { profile } from '@/lib/profile'

export const Route = createFileRoute('/')({
  component: () => (
    <Resume profile={profile} jobs={allJobs} education={allEducations} />
  ),
})
