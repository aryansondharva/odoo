"use client"
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Users, Activity, Shield, Zap } from 'lucide-react'
import apiClient from '../../../lib/api'
import { useAuthStore } from '../../../store/auth'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await apiClient.get('/dashboard/stats')
      setStats(response.data?.data || response.data)
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back!</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      description: 'Active accounts on the platform',
      trend: '+12%',
    },
    {
      title: 'System Status',
      value: 'Online',
      icon: Activity,
      description: 'All services running normally',
      trend: '100% Uptime',
    },
    {
      title: 'Security',
      value: 'Enabled',
      icon: Shield,
      description: 'SSL & JWT authentication',
      trend: 'Secure',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.firstName}! Here is your workspace snapshot.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.trend} - {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Welcome to OdooHack2026</CardTitle>
          <CardDescription>
            This dashboard is ready to build upon. Start adding your custom widgets, tables, or charts here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4 rounded-lg border p-4 border-slate-200 dark:border-slate-800">
            <Zap className="mt-1 h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold">Quick Start Guide</h3>
              <p className="text-sm text-muted-foreground">
                You can easily add new routes in <code>Frontend/src/app/</code> to capture your project's problem statement.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
