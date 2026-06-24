import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Briefcase, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../../lib/api';

export default function JobListPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const { data } = await api.get('/jobs');
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this job post?')) {
      try {
        await api.delete(`/jobs/${id}`);
        fetchJobs();
      } catch (err) {
        console.error(err);
        alert('Failed to delete job post');
      }
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-serif font-bold text-primary">Job Posts</h1>
          <p className="text-sm text-gray-500">Manage career opportunities and job listings.</p>
        </div>
        <div className="flex gap-3">
          <Link 
            to="/admin/jobs/new"
            className="btn btn-primary text-sm flex items-center gap-2"
          >
            <Plus size={16} /> Post New Job
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Job Title</th>
                <th className="p-4 font-semibold">Department & Location</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center animate-pulse text-gray-500">Loading jobs...</td></tr>
              ) : jobs.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No job posts found.</td></tr>
              ) : jobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{job.title}</div>
                    <div className="text-xs text-gray-500 mt-1">Posted: {new Date(job.postedAt).toLocaleDateString()}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      {job.department && <div className="flex items-center gap-1 text-gray-600 mb-1"><Briefcase size={12} /> {job.department}</div>}
                      {job.location && <div className="flex items-center gap-1 text-gray-500"><MapPin size={12} /> {job.location}</div>}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-medium text-gray-600 capitalize">{job.type.replace('-', ' ')}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${job.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {job.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/admin/jobs/${job.id}/edit`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                        <Edit size={16} />
                      </Link>
                      <button onClick={() => handleDelete(job.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Delete">
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
    </div>
  );
}
