// app/dashboard/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) redirect('/login')

  switch (session.user.role) {
    case 'ADMIN':
      redirect('/dashboard/admin')
    case 'PORTERO':
      redirect('/dashboard/portero')
    case 'COPROPIETARIO':
      redirect('/dashboard/copropietario')
    default:
      redirect('/login')
  }
}