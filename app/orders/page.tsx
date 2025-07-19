import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { orderDb, productDb } from '@/lib/db'
import Navbar from '@/components/Navbar'

export default async function OrdersPage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }

  const { user } = session
  const orders = await orderDb.findByBuyer(user.id)

  // Get product details for each order
  const ordersWithProducts = await Promise.all(
    orders.map(async (order) => {
      const products = await Promise.all(
        order.productIds.map(async (productId) => {
          return await productDb.findById(productId)
        })
      )
      return {
        ...order,
        products: products.filter(Boolean)
      }
    })
  )

  return (
    <div>
      <Navbar user={user} />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">My Orders</h1>
          
          {ordersWithProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No orders yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {ordersWithProducts.map((order) => (
                <div key={order.id} className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          Order #{order.id.slice(-8)}
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                          Placed on {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        {order.shipmentStatus && (
                          <p className="mt-1 text-sm text-blue-600 font-medium">
                            Shipment: {order.shipmentStatus}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-lg font-semibold text-gray-900">
                          ${order.totalPrice.toFixed(2)}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Items</h4>
                    <div className="space-y-2">
                      {order.products.map((product, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{product?.name}</p>
                            <p className="text-sm text-gray-500">${product?.price.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}