
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { reportDb, productDb, type Report, type Product } from '@/lib/db'

interface ReportWithProduct extends Report {
  product?: Product
}

export default function ReportsPage() {
  const [session, setSession] = useState<any>(null)
  const [reports, setReports] = useState<ReportWithProduct[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const userSession = await getSession()
      if (!userSession || userSession.role !== 'admin') {
        router.push('/login')
        return
      }
      setSession(userSession)
      await loadReports()
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/login')
    }
  }

  const loadReports = async () => {
    try {
      const allReports = await reportDb.getAll()
      const reportsWithProducts = await Promise.all(
        allReports.map(async (report) => {
          const product = await productDb.getById(report.productId)
          return { ...report, product }
        })
      )
      setReports(reportsWithProducts)
    } catch (error) {
      console.error('Failed to load reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkReviewed = async (productId: string, reportId: string) => {
    try {
      await fetch('/api/admin/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, reportId, action: 'reviewed' })
      })
      await loadReports()
    } catch (error) {
      console.error('Failed to mark report as reviewed:', error)
    }
  }

  const handleSuspendListing = async (productId: string, reportId: string) => {
    if (!confirm('Are you sure you want to suspend this listing?')) return
    
    try {
      await fetch('/api/admin/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, reportId, action: 'suspend' })
      })
      await loadReports()
    } catch (error) {
      console.error('Failed to suspend listing:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Abuse Reports</h1>
          <p className="text-gray-600 mt-2">Review and manage reported listings</p>
        </div>

        {reports.filter(r => r.status === 'pending').length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Reports</h3>
            <p className="text-gray-500">All reports have been reviewed.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {reports.filter(r => r.status === 'pending').map((report) => (
              <div key={`${report.productId}-${report.id}`} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {report.category}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {report.product?.name || 'Product Not Found'}
                    </h3>
                    
                    <p className="text-gray-700 mb-3">{report.description}</p>
                    
                    {report.contact && (
                      <p className="text-sm text-gray-600">
                        Reporter contact: {report.contact}
                      </p>
                    )}
                    
                    {report.product && (
                      <div className="mt-4 p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-600">
                          Product: {report.product.name} - ${report.product.price}
                        </p>
                        <p className="text-sm text-gray-600">
                          Seller: {report.product.sellerId}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-6">
                    <button
                      onClick={() => handleMarkReviewed(report.productId, report.id)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      Mark Reviewed
                    </button>
                    <button
                      onClick={() => handleSuspendListing(report.productId, report.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
                    >
                      Suspend Listing
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
