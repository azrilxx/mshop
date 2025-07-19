'use client'

import { useState } from 'react'
import { Order } from '@/lib/db'

interface ShipmentManagerProps {
  orders: Order[]
}

export default function ShipmentManager({ orders: initialOrders }: ShipmentManagerProps) {
  const [orders, setOrders] = useState(initialOrders)
  const [updating, setUpdating] = useState<string | null>(null)
  const [error, setError] = useState('')

  const updateShipmentStatus = async (orderId: string, shipmentStatus: string) => {
    setUpdating(orderId)
    setError('')

    try {
      const response = await fetch('/api/shipment', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, shipmentStatus }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update shipment status')
      }

      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, shipmentStatus }
          : order
      ))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUpdating(null)
    }
  }

  const getOrderStatus = (order: Order) => {
    if (order.shipmentStatus) {
      return order.shipmentStatus
    }
    return order.status
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const shipmentStatuses = [
    { value: 'Order Processed', label: 'Order Processed' },
    { value: 'Packed', label: 'Packed' },
    { value: 'Shipped', label: 'Shipped' },
    { value: 'Out for Delivery', label: 'Out for Delivery' },
    { value: 'Delivered', label: 'Delivered' },
    { value: 'Delayed', label: 'Delayed' },
    { value: 'Returned', label: 'Returned' }
  ]

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-700">{error}</div>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No orders found.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {orders.map((order) => (
              <li key={order.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">
                        Order #{order.id.slice(-8)}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(getOrderStatus(order))}`}>
                        {getOrderStatus(order)}
                      </span>
                    </div>
                    
                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        <p>Total: ${order.totalPrice.toFixed(2)}</p>
                        <p>Placed: {new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <select
                          value={order.shipmentStatus || ''}
                          onChange={(e) => updateShipmentStatus(order.id, e.target.value)}
                          disabled={updating === order.id}
                          className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Update Status</option>
                          {shipmentStatuses.map(status => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                        
                        {updating === order.id && (
                          <div className="text-sm text-gray-500">Updating...</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}