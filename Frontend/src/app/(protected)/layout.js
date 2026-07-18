"use client"
import ProtectedRoute from "../../components/ProtectedRoute"
import Layout from "../../components/Layout"
import { useAuthStore } from "../../store/auth"
import { useEffect } from "react"

export default function ProtectedLayout({ children }) {
  const { fetchUser, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) {
      fetchUser()
    }
  }, [isAuthenticated])

  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  )
}
