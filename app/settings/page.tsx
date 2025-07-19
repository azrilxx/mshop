'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface UserPreferences {
  notifyOrder: boolean
  notifyStatus: boolean
  notifyMarketing: boolean
  whatsappNumber: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [preferences, setPreferences] = useState<UserPreferences>({
    notifyOrder: true,
    notifyStatus: true,
    notifyMarketing: false,
    whatsappNumber: ''
  })

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/user/preferences')
      if (response.ok) {
        const data = await response.json()
        setPreferences(data)
      }
    } catch (error) {
      console.error('Error fetching preferences:', error)
    }
  }

  const updatePreferences = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferences)
      })

      if (response.ok) {
        alert('Preferences updated successfully!')
      } else {
        alert('Failed to update preferences')
      }
    } catch (error) {
      console.error('Error updating preferences:', error)
      alert('Failed to update preferences')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-6">Contact Information</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp Number
              </label>
              <input
                type="tel"
                id="whatsapp"
                value={preferences.whatsappNumber}
                onChange={(e) => setPreferences({
                  ...preferences,
                  whatsappNumber: e.target.value
                })}
                placeholder="+1234567890"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Include country code (e.g., +1 for US, +44 for UK). This will allow buyers to contact you via WhatsApp.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Order Notifications</h3>
                <p className="text-sm text-gray-600">Get notified when orders are placed</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.notifyOrder}
                onChange={(e) => setPreferences({
                  ...preferences,
                  notifyOrder: e.target.checked
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Status Updates</h3>
                <p className="text-sm text-gray-600">Get notified about order status changes</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.notifyStatus}
                onChange={(e) => setPreferences({
                  ...preferences,
                  notifyStatus: e.target.checked
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Marketing Emails</h3>
                <p className="text-sm text-gray-600">Receive promotional and marketing emails</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.notifyMarketing}
                onChange={(e) => setPreferences({
                  ...preferences,
                  notifyMarketing: e.target.checked
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>

          <button
            onClick={updatePreferences}
            disabled={loading}
            className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  )
}