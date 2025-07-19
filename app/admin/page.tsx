import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { userDb } from '@/lib/db'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default async function AdminPage() {
  const session = await getSession()
  
  if (!session || session.user.role !== 'admin') {
    redirect('/dashboard')
  }

  const { user } = session
  const users = await userDb.getAll()

  return (
    <div>
      <Navbar user={user} />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Panel</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-900">Total Users</h3>
                <p className="text-3xl font-bold text-blue-600">{users.length}</p>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-900">Verified Sellers</h3>
                <p className="text-3xl font-bold text-green-600">
                  {users.filter(u => u.role === 'seller' && u.is_verified).length}
                </p>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-900">Pending Verifications</h3>
                <p className="text-3xl font-bold text-yellow-600">
                  {users.filter(u => u.role === 'seller' && !u.is_verified).length}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  User Management
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Manage user accounts and verification status
                </p>
              </div>
              
              <Link
                href="/admin/users"
                className="block px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border-b"
              >
                View All Users →
              </Link>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Merchant Verification
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Review and verify merchant applications
                </p>
              </div>
              
              <Link
                href="/admin/merchants"
                className="block px-4 py-2 bg-orange-50 text-orange-700 hover:bg-orange-100 border-b"
              >
                Manage Merchants →
              </Link>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Platform Insights
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  View detailed analytics and metrics
                </p>
              </div>
              
              <Link
                href="/admin/insights"
                className="block px-4 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 border-b"
              >
                View Insights Dashboard →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}