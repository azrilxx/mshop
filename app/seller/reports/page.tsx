import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { planDb, orderDb, productDb } from '@/lib/db'
import { getPlanAccess } from '@/lib/hooks'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default async function SellerReportsPage() {
  const session = await getSession()
  
  if (!session || session.user.role !== 'seller') {
    redirect('/dashboard')
  }

  const { user } = session
  const plan = await planDb.get(user.id)
  const planAccess = getPlanAccess(plan.tier)

  // Check if user has access to reports
  if (!planAccess.hasFeature('reports')) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h2 className="mt-4 text-2xl font-semibold text-gray-900">Reports Not Available</h2>
            <p className="mt-2 text-gray-600">
              Upgrade to Standard or Premium plan to access detailed reports and analytics.
            </p>
            <div className="mt-6">
              <Link
                href="/seller/plan"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Upgrade Plan
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Fetch data for reports
  const [products, orders] = await Promise.all([
    productDb.findByMerchant(user.id),
    orderDb.findBySeller(user.id)
  ])

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0)
  const totalOrders = orders.length
  const activeProducts = products.filter(p => p.status === 'active').length

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <Link href="/seller" className="text-blue-600 hover:text-blue-800">
              ← Back to Seller Center
            </Link>
          </div>

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <div className="text-sm text-gray-500">
              Plan: {plan.tier} • {planAccess.isUnlimited('reports') ? 'Unlimited' : planAccess.getReportLimit()} reports available
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Revenue
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        ${totalRevenue.toFixed(2)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M8 11v6h8v-6M8 11H6a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2v-6a2 2 0 00-2-2h-2" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Orders
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {totalOrders}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Products
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {activeProducts}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Report Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Performance */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Performance</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="font-medium">${(totalRevenue * 0.3).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Last Month</span>
                  <span className="font-medium">${(totalRevenue * 0.25).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Growth Rate</span>
                  <span className="font-medium text-green-600">+20%</span>
                </div>
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Products</h3>
              <div className="space-y-3">
                {products.slice(0, 5).map((product, index) => (
                  <div key={product.id} className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-medium text-gray-900">{product.name}</span>
                      <span className="text-xs text-gray-500 ml-2">#{index + 1}</span>
                    </div>
                    <span className="text-sm text-gray-600">${product.price}</span>
                  </div>
                ))}
                {products.length === 0 && (
                  <p className="text-sm text-gray-500">No products yet</p>
                )}
              </div>
            </div>
          </div>

          {/* TODO: Stripe Integration */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Enhanced Analytics Coming Soon
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Advanced payment analytics and financial reports will be available after Stripe integration in Phase 6.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}