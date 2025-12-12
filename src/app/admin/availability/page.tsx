'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, momentLocalizer, Views, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Plus, Trash2, Edit2, X, Check, ArrowLeft, Users, User } from 'lucide-react';

const localizer = momentLocalizer(moment);

interface Location {
  id: string;
  name: string;
  city: string;
}

interface BulkAvailabilityForm {
  locationId: string;
  sessionType: 'PRESENCIAL' | 'ONLINE';
  sessionFormat: 'GROUP' | 'INDIVIDUAL';
  startDate: string;
  endDate: string;
  times: string[];
  duration: number;
  daysOfWeek: number[];
  maxPeople: number;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const COMMON_TIMES = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
];

export default function AdminAvailabilityPage() {
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('manage');
  const [existingSlots, setExistingSlots] = useState<any[]>([]);
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());

  // Create Form State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [customTime, setCustomTime] = useState('');

  const [formData, setFormData] = useState<BulkAvailabilityForm>({
    locationId: '',
    sessionType: 'PRESENCIAL',
    sessionFormat: 'INDIVIDUAL',
    startDate: '',
    endDate: '',
    times: [],
    duration: 60,
    daysOfWeek: [1, 2, 3, 4, 5],
    maxPeople: 1,
  });

  // Edit State
  const [editingSlot, setEditingSlot] = useState<any | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editCapacity, setEditCapacity] = useState('1');
  const [editSessionFormat, setEditSessionFormat] = useState<'GROUP' | 'INDIVIDUAL'>('INDIVIDUAL');

  // Calendar Events
  const events = existingSlots.map(slot => {
    const dateStr = slot.date.split('T')[0];
    const start = new Date(`${dateStr}T${slot.time}:00`);
    const end = new Date(start.getTime() + (slot.duration || 60) * 60000);

    const formatIcon = slot.sessionFormat === 'GROUP' ? '👥' : '👤';
    return {
      id: slot.id,
      title: slot.type === 'ONLINE'
        ? `${formatIcon} Online${slot.price ? ` (€${(slot.price / 100).toFixed(2)})` : ''} - ${slot.bookings?.length || 0}/${slot.maxCapacity || 1}`
        : `${formatIcon} ${slot.location?.name || 'In-Person'}${slot.price ? ` (€${(slot.price / 100).toFixed(2)})` : ''} - ${slot.bookings?.length || 0}/${slot.maxCapacity || 1}`,
      start,
      end,
      resource: slot,
      color: slot.sessionFormat === 'GROUP' ? '#10b981' : (slot.type === 'ONLINE' ? '#8b5cf6' : '#f59e0b'),
    };
  });

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch('/api/locations', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch locations');
        const data = await res.json();
        setLocations(data);
      } catch (e) {
        console.error('Error loading locations:', e);
        setError('Failed to load locations.');
      } finally {
        setLoading(false);
      }
    };
    loadLocations();
  }, []);

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/admin/availability/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      setExistingSlots(Array.isArray(json) ? json : []);
    } catch (e) {
      console.error(e);
      setExistingSlots([]);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/admin');
      return;
    }

    if (formData.sessionType === 'PRESENCIAL' && !formData.locationId) {
      setError('Please select a location for presencial sessions');
      setSubmitting(false);
      return;
    }

    if (formData.times.length === 0) {
      setError('Please select at least one time slot');
      setSubmitting(false);
      return;
    }

    if (formData.daysOfWeek.length === 0) {
      setError('Please select at least one day of the week');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/availability/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          locationId: formData.sessionType === 'PRESENCIAL' ? formData.locationId : null,
          sessionType: formData.sessionType,
          sessionFormat: formData.sessionFormat,
          startDate: formData.startDate,
          endDate: formData.endDate,
          times: formData.times,
          duration: formData.duration,
          daysOfWeek: formData.daysOfWeek,
          maxPeople: formData.maxPeople,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create availability slots');
      }

      const result = await response.json();
      setSuccess(`Successfully created ${result.count} availability slot(s)!`);
      fetchSlots();
      setActiveTab('manage');

      setFormData(prev => ({
        ...prev,
        times: [],
        startDate: '',
        endDate: ''
      }));

    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTimeToggle = (time: string) => {
    setFormData((prev) => ({
      ...prev,
      times: prev.times.includes(time)
        ? prev.times.filter((t) => t !== time)
        : [...prev.times, time].sort(),
    }));
  };

  const handleDayToggle = (day: number) => {
    setFormData((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter((d) => d !== day)
        : [...prev.daysOfWeek, day].sort(),
    }));
  };

  const handleAddCustomTime = () => {
    if (customTime && !formData.times.includes(customTime)) {
      setFormData(prev => ({ ...prev, times: [...prev.times, customTime].sort() }));
      setCustomTime('');
    }
  };

  const handleSelectEvent = (event: any) => {
    setEditingSlot(event.resource);
    setEditPrice(event.resource.price ? (event.resource.price / 100).toString() : '');
    setEditCapacity(event.resource.maxCapacity ? event.resource.maxCapacity.toString() : '1');
    setEditSessionFormat(event.resource.sessionFormat || 'INDIVIDUAL');
  };

  const handleDeleteSlot = async (id: string) => {
    if (!confirm('Are you sure you want to delete this slot?')) return;
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/admin/availability/list?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setEditingSlot(null);
        fetchSlots();
      } else {
        alert('Failed to delete (maybe booked?)');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to delete slot.');
    }
  };

  const handleUpdateSlot = async () => {
    if (!editingSlot) return;
    try {
      const token = localStorage.getItem('authToken');
      const priceInCents = editPrice ? Math.round(parseFloat(editPrice) * 100) : null;
      const capacity = parseInt(editCapacity);

      if (isNaN(capacity) || capacity < 1) {
        alert('Capacity must be at least 1');
        return;
      }

      const res = await fetch('/api/admin/availability/list', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id: editingSlot.id,
          price: priceInCents,
          maxCapacity: capacity,
          sessionFormat: editSessionFormat
        })
      });

      if (!res.ok) throw new Error('Failed to update');
      fetchSlots();
      setEditingSlot(null);
    } catch (e) {
      alert('Failed to update slot');
      console.error(e);
    }
  };

  const eventStyleGetter = (event: any) => {
    return {
      style: {
        backgroundColor: event.color,
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin')}
            className="p-2 -ml-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Availability Manager</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your schedule and pricing</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'manage' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Calendar View
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'create' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            <Plus size={16} />
            Create Slots
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-[1600px] w-full mx-auto">
        {activeTab === 'manage' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-[800px]">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              views={[Views.MONTH, Views.WEEK, Views.DAY]}
              view={view}
              date={date}
              onNavigate={setDate}
              onView={setView}
              onSelectEvent={handleSelectEvent}
              eventPropGetter={eventStyleGetter}
              messages={{
                today: 'Today',
                previous: 'Back',
                next: 'Next'
              }}
            />
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-bold mb-6">Create Availability Slots</h2>

              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
              {success && <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm">{success}</div>}

              <form onSubmit={handleCreateSubmit} className="space-y-6">
                {/* Session Format */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Session Format</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button type="button" onClick={() => setFormData({ ...formData, sessionFormat: 'INDIVIDUAL' })} className={`p-3 rounded-xl border text-left transition-all ${formData.sessionFormat === 'INDIVIDUAL' ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className="font-medium text-gray-900 flex items-center gap-2"><User size={16} /> Individual</div>
                      <div className="text-xs text-gray-500">One-on-one session</div>
                    </button>
                    <button type="button" onClick={() => setFormData({ ...formData, sessionFormat: 'GROUP' })} className={`p-3 rounded-xl border text-left transition-all ${formData.sessionFormat === 'GROUP' ? 'border-green-600 bg-green-50 ring-1 ring-green-600' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className="font-medium text-gray-900 flex items-center gap-2"><Users size={16} /> Group</div>
                      <div className="text-xs text-gray-500">Multiple participants</div>
                    </button>
                  </div>
                </div>

                {/* Session Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Session Type</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button type="button" onClick={() => setFormData({ ...formData, sessionType: 'PRESENCIAL', locationId: '' })} className={`p-3 rounded-xl border text-left transition-all ${formData.sessionType === 'PRESENCIAL' ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className="font-medium text-gray-900">In-Person</div>
                      <div className="text-xs text-gray-500">Physical location</div>
                    </button>
                    <button type="button" onClick={() => setFormData({ ...formData, sessionType: 'ONLINE', locationId: '' })} className={`p-3 rounded-xl border text-left transition-all ${formData.sessionType === 'ONLINE' ? 'border-purple-600 bg-purple-50 ring-1 ring-purple-600' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className="font-medium text-gray-900">Online</div>
                      <div className="text-xs text-gray-500">Virtual meeting</div>
                    </button>
                  </div>
                </div>

                {formData.sessionType === 'PRESENCIAL' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <select
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData.locationId}
                      onChange={e => setFormData({ ...formData, locationId: e.target.value })}
                      required
                    >
                      <option value="">Select Location...</option>
                      {locations.map(l => <option key={l.id} value={l.id}>{l.name} ({l.city})</option>)}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Participants (Capacity)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-gray-300"
                    value={formData.maxPeople || ''}
                    onChange={e => setFormData({ ...formData, maxPeople: parseInt(e.target.value) || 1 })}
                  />
                  <p className="text-xs text-gray-500 mt-1">Number of people that can book each slot.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input type="date" required className="w-full px-3 py-2 rounded-lg border border-gray-300" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input type="date" required className="w-full px-3 py-2 rounded-lg border border-gray-300" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Times</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {COMMON_TIMES.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleTimeToggle(t)}
                        className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${formData.times.includes(t) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input placeholder="Custom time (HH:MM)" className="px-3 py-2 border rounded-lg text-sm w-32" value={customTime} onChange={e => setCustomTime(e.target.value)} />
                    <button type="button" onClick={handleAddCustomTime} className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200">Add</button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Repeat On</label>
                  <div className="flex gap-2">
                    {DAYS_OF_WEEK.map(d => (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => handleDayToggle(d.value)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${formData.daysOfWeek.includes(d.value) ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                        title={d.label}
                      >
                        {d.label[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <button disabled={submitting} type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 disabled:opacity-50 transition-all">
                    {submitting ? 'Creating...' : 'Generate Slots'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {editingSlot && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all scale-100">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Manage Slot</h3>
                <p className="text-sm text-gray-500">{new Date(editingSlot.date).toLocaleDateString()} at {editingSlot.time}</p>
              </div>
              <button onClick={() => setEditingSlot(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            <div className="space-y-6">
              <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Type</span>
                  <span className="font-semibold text-indigo-900">{editingSlot.type}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Format</span>
                  <span className="font-semibold text-indigo-900">{editingSlot.sessionFormat || 'INDIVIDUAL'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Location</span>
                  <span className="font-semibold text-indigo-900">{editingSlot.location?.name || 'Remote'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Capacity</span>
                  <span className="font-semibold text-indigo-900">{editingSlot.bookings?.length || 0} / {editingSlot.maxCapacity || 1} Booked</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Format</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditSessionFormat('INDIVIDUAL')}
                    className={`p-3 rounded-lg border text-left transition-all ${editSessionFormat === 'INDIVIDUAL' ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="font-medium text-gray-900 text-sm flex items-center gap-2"><User size={14} /> Individual</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditSessionFormat('GROUP')}
                    className={`p-3 rounded-lg border text-left transition-all ${editSessionFormat === 'GROUP' ? 'border-green-600 bg-green-50 ring-1 ring-green-600' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="font-medium text-gray-900 text-sm flex items-center gap-2"><Users size={14} /> Group</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Custom Price (€)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400">€</span>
                  <input
                    type="number"
                    step="0.01"
                    value={editPrice}
                    onChange={e => setEditPrice(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Default"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Leave blank to use the standard price.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Capacity</label>
                <input
                  type="number"
                  min="1"
                  value={editCapacity}
                  onChange={e => setEditCapacity(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => handleDeleteSlot(editingSlot.id)} className="flex-1 py-2.5 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 flex items-center justify-center gap-2">
                  <Trash2 size={16} /> Delete
                </button>
                <button onClick={handleUpdateSlot} className="flex-[2] py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center justify-center gap-2">
                  <Check size={16} /> Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Styles for Calendar overrides */}
      <style jsx global>{`
        .rbc-calendar { font-family: inherit; }
        .rbc-header { padding: 12px 0; font-weight: 600; color: #4b5563; border-bottom: none; }
        .rbc-month-view { border: none; }
        .rbc-day-bg { border-left: 1px solid #f3f4f6; }
        .rbc-off-range-bg { background: #f9fafb; }
        .rbc-today { background: #eff6ff; }
        .rbc-event { padding: 4px 8px; font-size: 0.85rem; border-radius: 6px; }
        .rbc-toolbar { margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
        .rbc-toolbar button { border-radius: 8px; border: 1px solid #e5e7eb; padding: 8px 16px; font-weight: 500; color: #374151; background-color: white; transition: all 0.2s ease-in-out; }
        .rbc-toolbar button:hover { background-color: #f9fafb; border-color: #d1d5db; }
        .rbc-toolbar button.rbc-active { background: #f3f4f6; color: #111827; box-shadow: none; border-color: #e5e7eb; }
        .rbc-toolbar-label { font-size: 1.25rem; font-weight: 600; color: #1f2937; }
        .rbc-btn-group { display: flex; gap: 8px; }
        .rbc-event-content { white-space: normal; }
        .rbc-time-view .rbc-allday-cell { display: none; } /* Hide all-day events in time views if not used */
        .rbc-time-view .rbc-time-header-content { border-bottom: 1px solid #e5e7eb; }
        .rbc-time-view .rbc-time-content { border-left: 1px solid #e5e7eb; }
        .rbc-time-slot { border-top: 1px solid #f3f4f6; }
        .rbc-day-slot .rbc-event { margin-bottom: 2px; }
      `}</style>
    </div>
  );
}
