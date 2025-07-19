import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import CreateProductForm from '@/components/CreateProductForm'

export default async function CreateProductPage() {
  const user = await getUser()

  if (!user || user.role !== 'seller') {
    redirect('/login')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create New Product</h1>
        <CreateProductForm />
      </div>
    </div>
  )
}