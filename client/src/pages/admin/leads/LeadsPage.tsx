import React, { useState, useEffect } from 'react';
import { Search, Download, Trash2, Mail, Eye } from 'lucide-react';
import api from '../../../lib/api';

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewLead, setViewLead] = useState<any>(null);

  useEffect(() => {
    api.get('/leads')
      .then(res => {
        setLeads(res.data.leads || []);
      })
      .catch(err => {
        console.error('Failed to fetch leads:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleView = async (lead: any) => {
    setViewLead(lead);
    if (lead.status === 'new') {
      try {
        await api.patch(`/leads/${lead.id}/status`, { status: 'seen' });
        setLeads(leads.map(l => l.id === lead.id ? { ...l, status: 'seen' } : l));
        setViewLead(prev => prev ? { ...prev, status: 'seen' } : null);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleManualStatusChange = async (leadId: number, newStatus: string) => {
    try {
      await api.patch(`/leads/${leadId}/status`, { status: newStatus });
      setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
      setViewLead(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  const handleReply = async (lead: any) => {
    window.location.href = `mailto:${lead.email}?subject=RE: ${lead.category || 'Inquiry'}`;
    if (lead.status !== 'replied') {
      try {
        await api.patch(`/leads/${lead.id}/status`, { status: 'replied' });
        setLeads(leads.map(l => l.id === lead.id ? { ...l, status: 'replied' } : l));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      try {
        await api.delete(`/leads/${id}`);
        setLeads(leads.filter(l => l.id !== id));
      } catch (err) {
        console.error(err);
        alert('Failed to delete lead');
      }
    }
  };

  const handleExportCSV = () => {
    // Simple CSV Export logic
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Subject', 'Message', 'Date', 'Status'];
    const csvContent = [
      headers.join(','),
      ...leads.map(l => [l.id, `"${l.name}"`, `"${l.email}"`, `"${l.phone}"`, `"${l.subject}"`, `"${l.message}"`, l.date, l.status].join(','))
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'leads_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-serif font-bold text-primary">Leads / Inbox</h1>
          <p className="text-sm text-gray-500">Manage contact form submissions and customer inquiries.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportCSV} className="btn btn-outline text-sm flex items-center gap-2">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between">
          <div className="relative w-full sm:w-96">
            <input 
              type="text" 
              placeholder="Search leads..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Contact</th>
                <th className="p-4 font-semibold">Subject</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center animate-pulse">Loading...</td></tr>
              ) : leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="p-4">
                    <p className="font-semibold text-primary">{lead.name}</p>
                    <p className="text-xs text-gray-500">{lead.email}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-primary font-medium">{lead.category || 'General Inquiry'}</p>
                    <p className="text-xs text-gray-500 truncate max-w-xs">{lead.message}</p>
                    {lead.referenceNumber && <p className="text-xs text-blue-500 mt-1">Ref: {lead.referenceNumber}</p>}
                  </td>
                  <td className="p-4 text-sm text-gray-600">{new Date(lead.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      lead.status === 'new' ? 'bg-red-100 text-red-800' : 
                      lead.status === 'replied' ? 'bg-purple-100 text-purple-800' :
                      lead.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {lead.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleView(lead)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="View Details">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => handleReply(lead)} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Reply">
                        <Mail size={16} />
                      </button>
                      <button onClick={() => handleDelete(lead.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {viewLead && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-xl text-primary">Lead Details</h3>
              <button 
                onClick={() => setViewLead(null)}
                className="text-gray-400 hover:text-red-500 transition-colors p-2 text-xl"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-3">
              <p><strong>Name:</strong> {viewLead.name}</p>
              <p><strong>Email:</strong> {viewLead.email}</p>
              <p><strong>Phone:</strong> {viewLead.phone || 'N/A'}</p>
              <p><strong>Subject / Category:</strong> {viewLead.category || 'General Inquiry'}</p>
              {viewLead.referenceNumber && <p><strong>Ref Code:</strong> {viewLead.referenceNumber}</p>}
              <p><strong>Submitted:</strong> {new Date(viewLead.createdAt).toLocaleString()}</p>
              
              <div className="flex items-center gap-3 pt-2">
                <p><strong>Current Status:</strong></p>
                <select 
                  value={viewLead.status} 
                  onChange={(e) => handleManualStatusChange(viewLead.id, e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-accent"
                >
                  <option value="new">New</option>
                  <option value="seen">Seen</option>
                  <option value="replied">Replied (Email / Phone)</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <strong>Message:</strong>
                <p className="mt-2 text-gray-700 whitespace-pre-wrap">{viewLead.message}</p>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setViewLead(null)} className="btn btn-outline border-gray-300 text-gray-700">Close</button>
                <button onClick={() => { setViewLead(null); handleReply(viewLead); }} className="btn bg-black text-white hover:bg-gray-900 border-none flex items-center gap-2">
                  <Mail size={16} /> Reply via Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
