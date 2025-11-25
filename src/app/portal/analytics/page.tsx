"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts'
import { TrendingUp, Users, MousePointer, Clock } from 'lucide-react'

// Mock data - replace with real analytics data
const modalUsageData = [
    { name: 'Task Create', opens: 245, submits: 198 },
    { name: 'Booking', opens: 189, submits: 156 },
    { name: 'Message', opens: 134, submits: 112 },
    { name: 'Approval', opens: 98, submits: 87 },
    { name: 'Upload', opens: 76, submits: 64 },
]

const userEngagementData = [
    { date: '11/18', activeUsers: 45, newUsers: 8 },
    { date: '11/19', activeUsers: 52, newUsers: 12 },
    { date: '11/20', activeUsers: 48, newUsers: 6 },
    { date: '11/21', activeUsers: 61, newUsers: 15 },
    { date: '11/22', activeUsers: 58, newUsers: 9 },
    { date: '11/23', activeUsers: 64, newUsers: 11 },
    { date: '11/24', activeUsers: 70, newUsers: 14 },
]

const completionRates = [
    { name: 'Tasks', value: 81 },
    { name: 'Bookings', value: 83 },
    { name: 'Uploads', value: 84 },
    { name: 'Messages', value: 84 },
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export default function AnalyticsDashboard() {
    const [stats, setStats] = useState({
        totalModalOpens: 742,
        totalSubmissions: 617,
        avgCompletionRate: 83,
        avgTimeToComplete: '2m 34s',
    })

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Analytics Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Track user engagement and modal performance
                    </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Modal Opens</CardTitle>
                            <MousePointer className="h-4 w-4 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalModalOpens}</div>
                            <p className="text-xs text-gray-500 mt-1">
                                <TrendingUp className="inline h-3 w-3 text-green-500" /> +12% from last week
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Submissions</CardTitle>
                            <Users className="h-4 w-4 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
                            <p className="text-xs text-gray-500 mt-1">
                                <TrendingUp className="inline h-3 w-3 text-green-500" /> +8% from last week
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                            <BarChart className="h-4 w-4 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.avgCompletionRate}%</div>
                            <p className="text-xs text-gray-500 mt-1">Average across all modals</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Avg Time</CardTitle>
                            <Clock className="h-4 w-4 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.avgTimeToComplete}</div>
                            <p className="text-xs text-gray-500 mt-1">Time to complete</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <Tabs defaultValue="usage" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="usage">Modal Usage</TabsTrigger>
                        <TabsTrigger value="engagement">User Engagement</TabsTrigger>
                        <TabsTrigger value="completion">Completion Rates</TabsTrigger>
                    </TabsList>

                    <TabsContent value="usage" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Modal Opens vs Submissions</CardTitle>
                                <CardDescription>Track conversion rates by modal type</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={350}>
                                    <BarChart data={modalUsageData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="opens" fill="#8884d8" name="Opens" />
                                        <Bar dataKey="submits" fill="#82ca9d" name="Submissions" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="engagement" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>User Engagement Trend</CardTitle>
                                <CardDescription>Active and new users over the past week</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={350}>
                                    <LineChart data={userEngagementData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="activeUsers" stroke="#8884d8" name="Active Users" />
                                        <Line type="monotone" dataKey="newUsers" stroke="#82ca9d" name="New Users" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="completion" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Completion Rates by Feature</CardTitle>
                                <CardDescription>Percentage of started flows that complete</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={350}>
                                    <PieChart>
                                        <Pie
                                            data={completionRates}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, value }: { name?: string; value: number }) => `${name || 'Unknown'}: ${value}%`}
                                            outerRadius={120}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {completionRates.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
