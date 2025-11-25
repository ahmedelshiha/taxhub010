"use client"

import { useState } from 'react'
import { Search, HelpCircle, MessageCircle, Book, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

const faqCategories = [
    {
        id: 'getting-started',
        title: 'Getting Started',
        icon: Book,
        articles: [
            { title: 'How do I create a new task?', slug: 'create-task' },
            { title: 'How do I schedule a booking?', slug: 'schedule-booking' },
            { title: 'How do I upload documents?', slug: 'upload-documents' },
            { title: 'How do I send a message?', slug: 'send-message' },
        ],
    },
    {
        id: 'approvals',
        title: 'Approvals',
        icon: HelpCircle,
        articles: [
            { title: 'How do approval workflows work?', slug: 'approval-workflow' },
            { title: 'How do I approve or reject a request?', slug: 'approve-reject' },
            { title: 'Can I delegate approvals?', slug: 'delegate-approvals' },
        ],
    },
    {
        id: 'notifications',
        title: 'Notifications',
        icon: MessageCircle,
        articles: [
            { title: 'How do I manage notifications?', slug: 'manage-notifications' },
            { title: 'How do I mark notifications as read?', slug: 'mark-read' },
            { title: 'Can I customize notification preferences?', slug: 'notification-preferences' },
        ],
    },
]

export default function HelpPage() {
    const [searchQuery, setSearchQuery] = useState('')

    const filteredCategories = searchQuery
        ? faqCategories.map((category) => ({
            ...category,
            articles: category.articles.filter((article) =>
                article.title.toLowerCase().includes(searchQuery.toLowerCase())
            ),
        })).filter((category) => category.articles.length > 0)
        : faqCategories

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            How can we help?
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Search our help center or browse categories below
                        </p>

                        {/* Search */}
                        <div className="max-w-2xl mx-auto relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                                placeholder="Search for help..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-12 text-base"
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* FAQ Categories */}
                <div className="space-y-8">
                    {filteredCategories.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <p className="text-gray-600 dark:text-gray-400">
                                    No articles found for &quot;{searchQuery}&quot;
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredCategories.map((category) => {
                            const Icon = category.icon
                            return (
                                <Card key={category.id}>
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-2">
                                                <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <CardTitle>{category.title}</CardTitle>
                                                <CardDescription>
                                                    {category.articles.length} articles
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {category.articles.map((article) => (
                                                <Link
                                                    key={article.slug}
                                                    href={`/portal/help/${category.id}/${article.slug}`}
                                                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                                                >
                                                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                                        {article.title}
                                                    </span>
                                                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                                                </Link>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })
                    )}
                </div>

                {/* Contact Support */}
                <Card className="mt-12">
                    <CardContent className="py-8 text-center">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Still need help?
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Our support team is here to assist you
                        </p>
                        <Button>Contact Support</Button>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
