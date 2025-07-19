'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks'

interface NotificationPreferences {
  notifyOrder: boolean
  notifyStatus: boolean
  notifyMarketing: boolean
  twoFactorEnabled: boolean
}

export default function NotificationSettings() {
  const { user, refreshUser } = useAuth()
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    notifyOrder: true,
    notifyStatus: true,
    notifyMarketing: false,
    twoFactorEnabled: false
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (user) {
      setPreferences({
        notifyOrder: user.notifyOrder ?? true,
        notifyStatus: user.notifyStatus ?? true,
        notifyMarketing: user.notifyMarketing ?? false,
        twoFactorEnabled: user.twoFactorEnabled ?? false
      })
    }
  }, [user])

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferences)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update preferences')
      }

      setMessage('Notification preferences updated successfully')
      await refreshUser()
    } catch (error: any) {
      setMessage(error.message || 'Failed to update preferences')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p>Please log in to manage notification settings.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
      <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-medium text-gray-900">Order Notifications</h3>
            <p className="text-sm text-gray-600">
              Receive notifications when orders are placed or updated
            </p>
          </div>
          <button
            onClick={() => handleToggle('notifyOrder')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.notifyOrder ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.notifyOrder ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-medium text-gray-900">Status Updates</h3>
            <p className="text-sm text-gray-600">
              Get notified when your order status changes
            </p>
          </div>
          <button
            onClick={() => handleToggle('notifyStatus')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.notifyStatus ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.notifyStatus ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-medium text-gray-900">Marketing Emails</h3>
            <p className="text-sm text-gray-600">
              Receive promotional emails and special offers
            </p>
            {user.role === 'buyer' && (
              <p className="text-xs text-amber-600 mt-1">
                Available with Standard and Premium plans
              </p>
            )}
          </div>
          <button
            onClick={() => handleToggle('notifyMarketing')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.notifyMarketing ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.notifyMarketing ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
            <p className="text-sm text-gray-600">
              Require email verification for login
            </p>
            {user.role === 'admin' && (
              <p className="text-xs text-red-600 mt-1">
                Required for admin accounts
              </p>
            )}
          </div>
          <button
            onClick={() => handleToggle('twoFactorEnabled')}
            disabled={user.role === 'admin'}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.twoFactorEnabled || user.role === 'admin' 
                ? 'bg-blue-600' 
                : 'bg-gray-200'
            } ${user.role === 'admin' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.twoFactorEnabled || user.role === 'admin' 
                  ? 'translate-x-6' 
                  : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save Preferences'}
        </button>
        
        {message && (
          <p className={`text-sm ${
            message.includes('successfully') ? 'text-green-600' : 'text-red-600'
          }`}>
            {message}
          </p>
        )}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Plan-Based Features</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>Transactional emails:</span>
            <span className="text-green-600">✓ All plans</span>
          </div>
          <div className="flex justify-between">
            <span>Abandoned cart reminders:</span>
            <span className="text-blue-600">Standard & Premium</span>
          </div>
          <div className="flex justify-between">
            <span>Marketing emails:</span>
            <span className="text-blue-600">Standard & Premium</span>
          </div>
        </div>
      </div>
    </div>
  )
}