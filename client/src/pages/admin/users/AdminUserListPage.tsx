import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Shield, AlertCircle } from 'lucide-react';
import api from '../../../lib/api';
import useAuthStore from '../../../stores/useAuthStore';

export default function AdminUserListPage() {
  const { admin: currentAdmin } = useAuthStore();
  const isSuperAdmin = currentAdmin?.role === 'SUPER_ADMIN' || currentAdmin?.role === 'superadmin';

  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'admin', password: '', superAdminPassword: '' });
  const [error, setError] = useState('');

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users');
      setAdmins(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleEdit = (admin: any) => {
    setEditingId(admin.id);
    setFormData({ name: admin.name, email: admin.email, role: admin.role, password: '', superAdminPassword: '' });
    setError('');
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', role: 'admin', password: '', superAdminPassword: '' });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...formData,
        role: formData.role === 'superadmin' ? 'SUPER_ADMIN' : 'ADMIN'
      };

      if (editingId) {
        await api.put(`/admin/users/${editingId}`, payload);
      } else {
        if (!formData.password) {
          throw new Error('Password is required for new users');
        }
        await api.post('/admin/users', payload);
      }
      setShowModal(false);
      fetchAdmins();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/admin/users/${id}`);
        fetchAdmins();
      } catch (err: any) {
        alert(err.response?.data?.error || 'Failed to delete');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-primary">Dashboard Users</h1>
          <p className="text-gray-500 mt-1">Manage admin access to the dashboard.</p>
        </div>
        {isSuperAdmin && (
          <button 
            onClick={handleAddNew}
            className="bg-primary hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            Add User
          </button>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                {isSuperAdmin && <th className="px-6 py-4 font-medium text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={isSuperAdmin ? 4 : 3} className="px-6 py-10 text-center">
                    <div className="flex justify-center"><img src="/LOGO.gif" alt="Loading..." className="w-20 h-20 object-contain" /></div>
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={isSuperAdmin ? 4 : 3} className="px-6 py-10 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold border border-accent/20">
                          {admin.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{admin.name}</p>
                          <p className="text-gray-500 text-xs">{admin.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        (admin.role === 'SUPER_ADMIN' || admin.role === 'superadmin')
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {(admin.role === 'SUPER_ADMIN' || admin.role === 'superadmin') && <Shield size={12} />}
                        {(admin.role === 'SUPER_ADMIN' || admin.role === 'superadmin') ? 'Super Admin' : 'Admin'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>
                    {isSuperAdmin && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleEdit(admin)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(admin.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-serif font-bold text-primary">
                {editingId ? 'Edit User' : 'Add New User'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 flex items-start gap-3 text-sm">
                  <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <form id="adminUserForm" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="e.g. john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select 
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  >
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {editingId ? "User's New Password" : "Password"} {editingId && <span className="text-gray-400 font-normal">(Leave blank to keep unchanged)</span>}
                  </label>
                  <input 
                    type="password" 
                    required={!editingId}
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
                {editingId && (
                  <div className="pt-4 mt-4 border-t border-gray-100">
                    <label className="block text-sm font-bold text-red-600 mb-1 flex items-center gap-2">
                      <Shield size={16} />
                      Confirm Your Super Admin Password
                    </label>
                    <p className="text-xs text-gray-500 mb-2">Required to save any changes</p>
                    <input 
                      type="password" 
                      required
                      value={formData.superAdminPassword}
                      onChange={e => setFormData({...formData, superAdminPassword: e.target.value})}
                      className="w-full border border-red-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                      placeholder="Your Password"
                    />
                  </div>
                )}
              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
              <button 
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="adminUserForm"
                disabled={saving}
                className="bg-primary hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-medium transition-colors text-sm disabled:opacity-70 flex items-center gap-2"
              >
                {saving ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                ) : (
                  editingId ? 'Save Changes' : 'Create User'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
