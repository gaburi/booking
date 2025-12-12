'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Coupon {
    id: string;
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    isActive: boolean;
    maxUses: number | null;
    usedCount: number;
    validUntil: string | null;
}

export default function CouponsPage() {
    const router = useRouter();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // New Coupon Form State
    const [isCreating, setIsCreating] = useState(false);
    const [newCoupon, setNewCoupon] = useState({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: '',
        maxUses: '',
        validUntil: ''
    });

    useEffect(() => {
        loadCoupons();
    }, []);

    const loadCoupons = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                router.push('/admin');
                return;
            }

            const res = await fetch('/api/admin/coupons', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                setCoupons(await res.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('/api/admin/coupons', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...newCoupon,
                    discountValue: parseInt(newCoupon.discountValue),
                    maxUses: newCoupon.maxUses ? parseInt(newCoupon.maxUses) : null,
                    validUntil: newCoupon.validUntil ? new Date(newCoupon.validUntil).toISOString() : null
                })
            });

            if (res.ok) {
                setIsCreating(false);
                setNewCoupon({ code: '', discountType: 'PERCENTAGE', discountValue: '', maxUses: '', validUntil: '' });
                loadCoupons();
            } else {
                alert('Failed to create coupon');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const token = localStorage.getItem('authToken');
            await fetch(`/api/admin/coupons?id=${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ isActive: !currentStatus })
            });
            loadCoupons();
        } catch (err) {
            console.error(err);
        }
    };

    const deleteCoupon = async (id: string) => {
        if (!confirm('Delete this coupon?')) return;
        try {
            const token = localStorage.getItem('authToken');
            await fetch(`/api/admin/coupons?id=${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            loadCoupons();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/dashboard" className="text-gray-500 hover:text-gray-900">&larr; Back</Link>
                        <h1 className="text-2xl font-bold text-gray-900">Manage Coupons</h1>
                    </div>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                    >
                        + New Coupon
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {isCreating && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
                        <h2 className="text-lg font-semibold mb-4">Create New Coupon</h2>
                        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Code</label>
                                <input
                                    required
                                    value={newCoupon.code}
                                    onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                                    className="w-full border border-gray-300 rounded p-2"
                                    placeholder="SUMMER2025"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Type</label>
                                <select
                                    value={newCoupon.discountType}
                                    onChange={e => setNewCoupon({ ...newCoupon, discountType: e.target.value as any })}
                                    className="w-full border border-gray-300 rounded p-2"
                                >
                                    <option value="PERCENTAGE">Percentage (%)</option>
                                    <option value="FIXED">Fixed Amount (Cents)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Value {newCoupon.discountType === 'PERCENTAGE' ? '(%)' : '(Cents)'}</label>
                                <input
                                    required
                                    type="number"
                                    value={newCoupon.discountValue}
                                    onChange={e => setNewCoupon({ ...newCoupon, discountValue: e.target.value })}
                                    className="w-full border border-gray-300 rounded p-2"
                                    placeholder={newCoupon.discountType === 'PERCENTAGE' ? "10" : "500 (= €5.00)"}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Max Uses (Optional)</label>
                                <input
                                    type="number"
                                    value={newCoupon.maxUses}
                                    onChange={e => setNewCoupon({ ...newCoupon, maxUses: e.target.value })}
                                    className="w-full border border-gray-300 rounded p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Valid Until (Optional)</label>
                                <input
                                    type="date"
                                    value={newCoupon.validUntil}
                                    onChange={e => setNewCoupon({ ...newCoupon, validUntil: e.target.value })}
                                    className="w-full border border-gray-300 rounded p-2"
                                />
                            </div>
                            <div className="md:col-span-2 flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 border rounded text-gray-600">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Create Coupon</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {coupons.map(coupon => (
                                <tr key={coupon.id}>
                                    <td className="px-6 py-4 font-mono font-medium">{coupon.code}</td>
                                    <td className="px-6 py-4">
                                        {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `€${(coupon.discountValue / 100).toFixed(2)}`}
                                    </td>
                                    <td className="px-6 py-4">
                                        {coupon.usedCount} {coupon.maxUses ? `/ ${coupon.maxUses}` : ''}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs rounded-full ${coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {coupon.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 flex gap-2">
                                        <button
                                            onClick={() => toggleStatus(coupon.id, coupon.isActive)}
                                            className="text-xs text-blue-600 hover:underline"
                                        >
                                            {coupon.isActive ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button
                                            onClick={() => deleteCoupon(coupon.id)}
                                            className="text-xs text-red-600 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
