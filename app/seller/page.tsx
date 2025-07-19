import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { productDb, planDb } from '@/lib/db'
import { getPlanAccess } from '@/lib/hooks'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default async function SellerPage() {
  const session = await getSession()
  
  if (!session || session.user.role !== 'seller') {
    redirect('/dashboard')
  }

  const { user } = session
  const products = await productDb.findByMerchant(user.id)
  const plan = await planDb.get(user.id)
  const planAccess = getPlanAccess(plan.tier)

  return (
    <div>
      <Navbar user={user} />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Seller Center</h1>
            {planAccess.canCreateProducts(products.length) ? (
              <Link
                href="/seller/products/create"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Add New Product
              </Link>
            ) : (
              <button
                disabled
                className="bg-gray-400 text-white px-4 py-2 rounded-md cursor-not-allowed"
                title={`Product limit reached (${planAccess.getProductLimit()})`}
              >
                Product Limit Reached
              </button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Link
              href="/seller/plan"
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">Manage Plan</h3>
                  <p className="text-xs text-gray-500">Upgrade or change plan</p>
                </div>
              </div>
            </Link>

{planAccess.hasFeature('ads') ? (
              <Link
                href="/seller/ads"
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="flex items-center">
                  <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">Advertisements</h3>
                    <p className="text-xs text-gray-500">
                      {planAccess.isUnlimited('ads') 
                        ? `Unlimited ads (${plan.adSlotsUsed} active)`
                        : `${planAccess.getRemainingAds(plan.adSlotsUsed)} slots remaining`
                      }
                    </p>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="bg-gray-100 p-4 rounded-lg shadow opacity-60 cursor-not-allowed">
                <div className="flex items-center">
                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-400">Advertisements</h3>
                    <p className="text-xs text-gray-400">Upgrade to Standard plan</p>
                  </div>
                </div>
              </div>
            )}

            <Link
              href="/seller/verify"
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">Verification</h3>
                  <p className="text-xs text-gray-500">Submit business docs</p>
                </div>
              </div>
            </Link>

{planAccess.hasFeature('shipment') ? (
              <Link
                href="/seller/shipment"
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="flex items-center">
                  <svg className="h-8 w-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">Mass Shipments</h3>
                    <p className="text-xs text-gray-500">Bulk shipment management</p>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="bg-gray-100 p-4 rounded-lg shadow opacity-60 cursor-not-allowed">
                <div className="flex items-center">
                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-400">Mass Shipments</h3>
                    <p className="text-xs text-gray-400">Upgrade to Standard plan</p>
                  </div>
                </div>
              </div>
            )}

            {/* Reports Section */}
            {planAccess.hasFeature('reports') ? (
              <Link
                href="/seller/reports"
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="flex items-center">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">Reports</h3>
                    <p className="text-xs text-gray-500">
                      {planAccess.isUnlimited('reports') 
                        ? 'Unlimited reports'
                        : `${planAccess.getReportLimit()} reports available`
                      }
                    </p>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="bg-gray-100 p-4 rounded-lg shadow opacity-60 cursor-not-allowed">
                <div className="flex items-center">
                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-400">Reports</h3>
                    <p className="text-xs text-gray-400">Upgrade to Standard plan</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Plan Status */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-blue-800">
                  Current Plan: {plan.tier}
                </h3>
                <p className="text-sm text-blue-700">
                  Products: {products.length}/{planAccess.isUnlimited('products') ? '∞' : planAccess.getProductLimit()} | 
                  Ad Slots: {plan.adSlotsUsed}/{planAccess.isUnlimited('ads') ? '∞' : planAccess.getAdLimit()} | 
                  Reports: {planAccess.isUnlimited('reports') ? '∞' : planAccess.getReportLimit()}
                </p>
              </div>
              <Link
                href="/seller/plan"
                className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
              >
                Manage Plan
              </Link>
            </div>
          </div>

          {!user.is_verified && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Account Verification Required
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Your seller account is pending verification. <Link href="/seller/verify" className="underline">Submit verification documents</Link> to get verified.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Your Products ({products.length})
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Manage your product listings and inventory
              </p>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No products yet. Add your first product!</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {products.map((product) => (
                  <li key={product.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.category}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="text-sm text-gray-900 mr-4">
                          ${product.price.toFixed(2)}
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.status}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}