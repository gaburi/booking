'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Template {
    id: string;
    name: string;
    subject: string;
    htmlContent: string;
}

const DEFAULT_TEMPLATES = [
    { name: 'BOOKING_CONFIRMATION', subject: 'Reserva Confirmada: {{type}}', htmlContent: '<h1>Olá {{firstName}},</h1><p>Sua reserva foi confirmada...</p>' },
    { name: 'BOOKING_CANCELLATION', subject: 'Reserva Cancelada: {{date}}', htmlContent: '<h1>Olá {{firstName}},</h1><p>Sua reserva foi cancelada...</p>' },
    // { name: 'BOOKING_REMINDER', ... }
];

export default function EmailTemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [formData, setFormData] = useState({ subject: '', htmlContent: '' });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');
    const [previewMode, setPreviewMode] = useState(false);

    // Test Email State
    const [showTestModal, setShowTestModal] = useState(false);
    const [testEmail, setTestEmail] = useState('contact@gabrielvoliveira.com');
    const [testLang, setTestLang] = useState('pt');
    const [testTemplate, setTestTemplate] = useState('CURRENT');
    const [sendingTest, setSendingTest] = useState(false);

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            const res = await fetch('/api/admin/templates');
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setTemplates(data);
                } else {
                    setTemplates([]);
                }
            } else {
                console.error('Failed to fetch templates');
                setTemplates([]);
            }
        } catch (e) {
            console.error(e);
            setTemplates([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (name: string) => {
        const existing = templates.find(t => t.name === name);
        if (existing) {
            setSelectedTemplate(existing);
            setFormData({ subject: existing.subject, htmlContent: existing.htmlContent });
        } else {
            // Pre-fill default if not in DB yet
            const def = DEFAULT_TEMPLATES.find(t => t.name === name);
            setSelectedTemplate({ id: 'new', name, subject: def?.subject || '', htmlContent: def?.htmlContent || '' });
            setFormData({ subject: def?.subject || '', htmlContent: def?.htmlContent || '' });
        }
        setMsg('');
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTemplate) return;
        setSaving(true);
        try {
            await fetch('/api/admin/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: selectedTemplate.name,
                    ...formData
                })
            });
            setMsg('Saved successfully!');
            loadTemplates();
        } catch (e) {
            setMsg('Error saving.');
        } finally {
            setSaving(false);
        }
    };

    const handleSendTest = async (e: React.FormEvent) => {
        e.preventDefault();
        setSendingTest(true);
        try {
            const res = await fetch('/api/admin/templates/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: testEmail,
                    templateName: testTemplate === 'ALL' ? 'ALL' : (selectedTemplate?.name || ''),
                    language: testLang
                })
            });
            const data = await res.json();
            if (res.ok) {
                if (data.isMock) {
                    setMsg(`Generated in Mock Mode. Opening preview...`);
                    if (data.previewHtml) {
                        const win = window.open('', '_blank');
                        if (win) {
                            win.document.write(data.previewHtml);
                            win.document.close();
                        }
                    }
                } else {
                    setMsg(`Test sent successfully! (${data.sent || 1} emails)`);
                }
                setShowTestModal(false);
            } else {
                setMsg('Error sending test: ' + (data.error || 'Unknown'));
            }
        } catch (e) {
            setMsg('Error sending test.');
        } finally {
            setSendingTest(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link href="/admin/dashboard" className="text-gray-500 hover:text-gray-900">&larr; Back</Link>
                    <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Sidebar list */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700">Templates</h2>
                    <div className="space-y-2">
                        {templates.map(t => (
                            <button
                                key={t.name}
                                onClick={() => handleSelect(t.name)}
                                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${selectedTemplate?.name === t.name
                                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                    : 'hover:bg-gray-50 text-gray-700'
                                    }`}
                            >
                                {t.name}
                                <div className="text-xs font-normal text-gray-500 mt-1">
                                    {t.id.startsWith('default-') ? ' Default (Code)' : ' Customized (DB)'}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Editor */}
                <div className="md:col-span-2">
                    {selectedTemplate ? (
                        <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">{selectedTemplate.name}</h2>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowTestModal(true)}
                                        className="text-indigo-600 hover:text-indigo-800 font-medium text-sm border border-indigo-200 rounded px-3 py-1.5"
                                    >
                                        Send Test
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPreviewMode(!previewMode)}
                                        className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                                    >
                                        {previewMode ? 'Back to Editor' : 'Preview Result'}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : 'Save Template'}
                                    </button>
                                </div>
                            </div>

                            {msg && <div className={`mb-4 p-3 rounded ${msg.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{msg}</div>}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
                                    <input
                                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500"
                                        value={formData.subject}
                                        onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                        disabled={previewMode}
                                    />
                                    {!previewMode && <p className="text-xs text-gray-500 mt-1">Supported variables: <code>{'{{firstName}}, {{date}}, {{time}}, {{type}}'}</code></p>}
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="block text-sm font-medium text-gray-700">HTML Content</label>
                                        {previewMode && <span className="text-xs text-gray-500">Preview Mode (Variables not replaced)</span>}
                                    </div>

                                    {previewMode ? (
                                        <div className="w-full border border-gray-300 rounded-lg p-0 overflow-hidden bg-gray-50">
                                            <div className="bg-white m-4 shadow-sm rounded-lg overflow-hidden min-h-[600px]">
                                                {/* Simulate email container width constraint usually present in templates */}
                                                <iframe
                                                    srcDoc={formData.htmlContent}
                                                    className="w-full h-[600px] border-none"
                                                    title="Preview"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <textarea
                                            className="w-full border border-gray-300 rounded-lg p-3 font-mono text-sm focus:ring-2 focus:ring-indigo-500 h-[600px]"
                                            value={formData.htmlContent}
                                            onChange={e => setFormData({ ...formData, htmlContent: e.target.value })}
                                        />
                                    )}
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 bg-white rounded-xl border border-gray-200 border-dashed">
                            <div className="text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                <span className="mt-2 block text-sm font-medium text-gray-900">Select a template to view or edit</span>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Test Email Modal */}
            {showTestModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Send Test Email</h3>
                        <form onSubmit={handleSendTest}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Email</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
                                        value={testEmail}
                                        onChange={e => setTestEmail(e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                                        <select
                                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
                                            value={testLang}
                                            onChange={e => setTestLang(e.target.value)}
                                        >
                                            <option value="pt">Português (Default)</option>
                                            <option value="en">English</option>
                                            <option value="fr">Français</option>
                                            <option value="de">Deutsch (Swiss)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
                                        <select
                                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
                                            value={testTemplate}
                                            onChange={e => setTestTemplate(e.target.value)}
                                        >
                                            <option value="CURRENT">Current Only</option>
                                            <option value="ALL">Send ALL Files</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowTestModal(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={sendingTest}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {sendingTest ? 'Sending...' : 'Send Test'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
