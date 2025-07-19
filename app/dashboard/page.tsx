import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import Navbar from '@/components/Navbar'

export default async function DashboardPage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }

  const { user } = session

  return (
    <div>
      <Navbar user={user} />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Welcome, {user.email}!
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user.role === 'buyer' && (
              <>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <h3 className="text-lg font-medium text-gray-900">Browse Products</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Discover products from verified sellers
                    </p>
                    <div className="mt-3">
                      <a href="/products" className="text-blue-600 hover:text-blue-800">
                        View Products →
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <h3 className="text-lg font-medium text-gray-900">My Orders</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Track your order history
                    </p>
                    <div className="mt-3">
                      <a href="/orders" className="text-blue-600 hover:text-blue-800">
                        View Orders →
                      </a>
                    </div>
                  </div>
                </div>
              </>
            )}

            {user.role === 'seller' && (
              <>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <h3 className="text-lg font-medium text-gray-900">Seller Center</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Manage your products and inventory
                    </p>
                    <div className="mt-3">
                      <a href="/seller" className="text-blue-600 hover:text-blue-800">
                        Go to Seller Center →
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <h3 className="text-lg font-medium text-gray-900">Verification Status</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {user.is_verified ? 'Verified Seller' : 'Pending Verification'}
                    </p>
                    <div className="mt-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.is_verified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.is_verified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {user.role === 'admin' && (
              <>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <h3 className="text-lg font-medium text-gray-900">Admin Panel</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Manage users and system settings
                    </p>
                    <div className="mt-3">
                      <a href="/admin" className="text-blue-600 hover:text-blue-800">
                        Go to Admin Panel →
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <h3 className="text-lg font-medium text-gray-900">User Management</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      View and manage all users
                    </p>
                    <div className="mt-3">
                      <a href="/admin/users" className="text-blue-600 hover:text-blue-800">
                        Manage Users →
                      </a>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}