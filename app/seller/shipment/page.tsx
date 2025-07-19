import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { orderDb } from '@/lib/db'
import Navbar from '@/components/Navbar'
import ShipmentManager from '@/components/ShipmentManager'

export default async function SellerShipmentPage() {
  const session = await getSession()
  
  if (!session || session.user.role !== 'seller') {
    redirect('/dashboard')
  }

  const { user } = session
  const orders = await orderDb.findBySeller(user.id)

  return (
    <div>
      <Navbar user={user} />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Shipment Management</h1>
          
          <ShipmentManager orders={orders} />
        </div>
      </div>
    </div>
  )
}