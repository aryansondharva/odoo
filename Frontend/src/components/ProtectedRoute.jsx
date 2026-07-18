"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../store/auth'

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    } else if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, user, allowedRoles, router])

  if (!isAuthenticated || (allowedRoles.length > 0 && !allowedRoles.includes(user?.role))) {
    return <div className="p-6">Redirecting...</div>
  }

  return children
}
