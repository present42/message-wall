'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface User {
    id: number
    username: string
    email: string
    createdAt: string
    updatedAt?: string
}

export default function AdminUsersPage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [newUser, setNewUser] = useState({ username: '', email: '', password: '' })
    const [creating, setCreating] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [editFormData, setEditFormData] = useState({ username: '', email: '', password: '' })
    const [updating, setUpdating] = useState(false)
    const [deleting, setDeleting] = useState<number | null>(null)

    // Authentication check
    useEffect(() => {
        if (status === 'loading') return
        if (!session) {
            router.push('/admin/login')
        }
    }, [session, status, router])

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/admin/login' })
    }

    // Fetch users
    const fetchUsers = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/users')
            if (response.ok) {
                const data = await response.json()
                setUsers(data)
            } else {
                setError('Failed to fetch users')
            }
        } catch (err) {
            setError('Error fetching users')
            console.error('Error:', err)
        } finally {
            setLoading(false)
        }
    }

    // Create new user
    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        setCreating(true)
        setError(null)

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUser)
            })

            if (response.ok) {
                const createdUser = await response.json()
                setUsers([...users, createdUser])
                setNewUser({ username: '', email: '', password: '' })
                setShowCreateForm(false)
                alert('User created successfully!')
            } else {
                const errorData = await response.json()
                setError(errorData.error || 'Failed to create user')
            }
        } catch (err) {
            setError('Error creating user')
            console.error('Error:', err)
        } finally {
            setCreating(false)
        }
    }

    // Edit user
    const handleEditUser = (user: User) => {
        setEditingUser(user)
        setEditFormData({
            username: user.username,
            email: user.email,
            password: '' // Leave empty for password
        })
    }

    // Update user
    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingUser) return

        setUpdating(true)
        setError(null)

        try {
            const response = await fetch(`/api/users/${editingUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editFormData)
            })

            if (response.ok) {
                const updatedUser = await response.json()
                setUsers(users.map(u => u.id === editingUser.id ? updatedUser : u))
                setEditingUser(null)
                setEditFormData({ username: '', email: '', password: '' })
                alert('User updated successfully!')
            } else {
                const errorData = await response.json()
                setError(errorData.error || 'Failed to update user')
            }
        } catch (err) {
            setError('Error updating user')
            console.error('Error:', err)
        } finally {
            setUpdating(false)
        }
    }

    // Delete user
    const handleDeleteUser = async (user: User) => {
        if (!confirm(`Are you sure you want to delete user "${user.username}"? This action cannot be undone.`)) {
            return
        }

        setDeleting(user.id)
        setError(null)

        try {
            const response = await fetch(`/api/users/${user.id}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                setUsers(users.filter(u => u.id !== user.id))
                alert('User deleted successfully!')
            } else {
                const errorData = await response.json()
                setError(errorData.error || 'Failed to delete user')
            }
        } catch (err) {
            setError('Error deleting user')
            console.error('Error:', err)
        } finally {
            setDeleting(null)
        }
    }

    useEffect(() => {
        if (session) {
            fetchUsers()
        }
    }, [session])

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        )
    }

    if (!session) {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-100 admin-interface">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link
                                href="/admin"
                                className="text-gray-600 hover:text-gray-900 mr-4"
                            >
                                ← Back to Admin
                            </Link>
                            <h1 className="text-xl font-semibold">User Management</h1>
                            <div className="ml-4 text-sm text-gray-600">
                                Welcome, {session.user?.name}
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">

                    {/* Actions */}
                    <div className="mb-6">
                        <button
                            onClick={() => setShowCreateForm(!showCreateForm)}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                        >
                            {showCreateForm ? 'Cancel' : 'Create New User'}
                        </button>
                    </div>

                    {/* Create User Form */}
                    {showCreateForm && (
                        <div className="bg-white rounded-lg shadow p-6 mb-6">
                            <h2 className="text-lg font-semibold mb-4">Create New Admin User</h2>
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
                                    {error}
                                </div>
                            )}
                            <form onSubmit={handleCreateUser} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Username</label>
                                    <input
                                        type="text"
                                        value={newUser.username}
                                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Password</label>
                                    <input
                                        type="password"
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        disabled={creating}
                                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                                    >
                                        {creating ? 'Creating...' : 'Create User'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateForm(false)}
                                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Edit User Modal */}
                    {editingUser && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                                <h2 className="text-lg font-semibold mb-4">Edit User</h2>
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
                                        {error}
                                    </div>
                                )}
                                <form onSubmit={handleUpdateUser} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Username</label>
                                        <input
                                            type="text"
                                            value={editFormData.username}
                                            onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email</label>
                                        <input
                                            type="email"
                                            value={editFormData.email}
                                            onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            New Password (leave empty to keep current)
                                        </label>
                                        <input
                                            type="password"
                                            value={editFormData.password}
                                            onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Enter new password (optional)"
                                        />
                                    </div>
                                    <div className="flex gap-2 pt-4">
                                        <button
                                            type="submit"
                                            disabled={updating}
                                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                                        >
                                            {updating ? 'Updating...' : 'Update User'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingUser(null)
                                                setEditFormData({ username: '', email: '', password: '' })
                                                setError(null)
                                            }}
                                            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Users List */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold">Admin Users</h2>
                        </div>

                        {loading ? (
                            <div className="p-6 text-center">Loading users...</div>
                        ) : error ? (
                            <div className="p-6 text-center text-red-600">Error: {error}</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ID
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Username
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Created At
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {users.map((user) => (
                                            <tr key={user.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {user.id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {user.username}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {user.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(user.createdAt).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleEditUser(user)}
                                                            className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(user)}
                                                            disabled={deleting === user.id}
                                                            className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 disabled:opacity-50 transition-colors"
                                                        >
                                                            {deleting === user.id ? 'Deleting...' : 'Delete'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
