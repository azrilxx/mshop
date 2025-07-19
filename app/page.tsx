import { redirect } from 'next/navigation'
import LandingPage from './(public)/landing/page'

export default async function Home() {
  // Serve the landing page as the homepage
  return <LandingPage />
}