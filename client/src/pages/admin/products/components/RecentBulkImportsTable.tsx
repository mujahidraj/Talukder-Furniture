import React, { useEffect, useState } from 'react';
import api from '../../../../lib/api';

export default function RecentBulkImportsTable({ refreshTrigger }: { refreshTrigger?: any }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/admin/bulk-import/logs');
      setLogs(res.data);
    } catch (error) {
      console.error('Failed to fetch bulk import logs', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [refreshTrigger]);

  if (loading) return null;

  return (
    <div className="mt-8 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden w-full">
      <div className="p-6 border-b border-gray-100">
        <h2 className="font-bold text-gray-900 text-lg">Recent Bulk Imports</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 font-semibold text-sm text-gray-600">File Name</th>
              <th className="p-4 font-semibold text-sm text-gray-600">Status</th>
              <th className="p-4 font-semibold text-sm text-gray-600">Imported</th>
              <th className="p-4 font-semibold text-sm text-gray-600">Failed</th>
              <th className="p-4 font-semibold text-sm text-gray-600 text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.map((log: any) => (
              <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 text-sm font-medium text-gray-900">{log.fileName}</td>
                <td className="p-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    log.status === 'completed' && log.failCount === 0 ? 'bg-green-100 text-green-700' :
                    log.status === 'failed' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                  </span>
                </td>
                <td className="p-4 text-sm text-green-600 font-medium">{log.successCount}</td>
                <td className="p-4 text-sm text-red-600 font-medium">{log.failCount}</td>
                <td className="p-4 text-sm text-gray-500 text-right">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">No recent imports found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
