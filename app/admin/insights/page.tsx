import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { userDb, orderDb, productDb, planDb, adDb, ratingDb } from '@/lib/db'
import Navbar from '@/components/Navbar'
import InsightsDashboard from '@/components/InsightsDashboard'

export default async function AdminInsightsPage() {
  const session = await getSession()
  
  if (!session || session.user.role !== 'admin') {
    redirect('/dashboard')
  }

  const { user } = session

  // Gather all the data for insights
  const [users, orders, products, activeAds] = await Promise.all([
    userDb.getAll(),
    orderDb.getAll(),
    productDb.getAll(),
    adDb.getActiveAds()
  ])

  // Calculate sales by plan tier
  const salesByPlan = { Free: 0, Standard: 0, Premium: 0 }
  
  for (const order of orders) {
    // Find the products in this order to get the seller
    const orderProducts = await Promise.all(
      order.productIds.map(id => productDb.findById(id))
    )
    
    for (const product of orderProducts) {
      if (product) {
        const sellerPlan = await planDb.get(product.merchantId)
        salesByPlan[sellerPlan.tier] += product.price
      }
    }
  }

  // Get verified sellers count
  const verifiedSellers = users.filter(u => u.role === 'seller' && u.is_verified).length

  // Get top-rated products
  const topRatedProducts = []
  for (const product of products.slice(0, 10)) {
    const rating = await ratingDb.getAverageRating(product.id)
    if (rating.count > 0) {
      topRatedProducts.push({
        ...product,
        averageRating: rating.average,
        reviewCount: rating.count
      })
    }
  }
  
  // Sort by rating and take top 5
  topRatedProducts.sort((a, b) => b.averageRating - a.averageRating)
  const topProducts = topRatedProducts.slice(0, 5)

  const insights = {
    totalUsers: users.length,
    totalOrders: orders.length,
    totalProducts: products.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.totalPrice, 0),
    salesByPlan,
    verifiedSellers,
    topRatedProducts: topProducts,
    activeAdsCount: activeAds.length,
    usersByRole: {
      buyers: users.filter(u => u.role === 'buyer').length,
      sellers: users.filter(u => u.role === 'seller').length,
      admins: users.filter(u => u.role === 'admin').length
    }
  }

  return (
    <div>
      <Navbar user={user} />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Insights</h1>
          
          <InsightsDashboard insights={insights} />
        </div>
      </div>
    </div>
  )
}