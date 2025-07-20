
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import CreateServiceForm from '@/components/CreateServiceForm'

export default async function CreateServicePage() {
  const session = await getSession()

  if (!session || session.user.role !== 'seller') {
    redirect('/login')
  }

  return (
    <div>
      <Navbar user={session?.user || null} />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">List a Service</h1>
          <p className="text-gray-600 mt-2">
            Share your expertise and connect with potential clients in the oil and gas industry.
          </p>
        </div>

        <CreateServiceForm />
      </div>
    </div>
  )
}
