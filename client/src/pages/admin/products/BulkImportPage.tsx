import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, ArrowLeft, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../../lib/api';

export default function BulkImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [importResult, setImportResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setStatus('uploading');
    setLogs(['Starting upload process...', `Reading file: ${file.name}`]);
    setImportResult(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      setLogs(prev => [...prev, 'Uploading file to server...']);
      
      const res = await api.post('/admin/bulk-import/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      const data = res.data;
      setImportResult(data);
      
      // Build detailed logs from server response
      const newLogs: string[] = [];
      newLogs.push(`Found ${data.totalRows} rows to process.`);
      if (data.logs) {
        data.logs.forEach((log: string) => newLogs.push(log));
      }
      newLogs.push(`✅ Success: ${data.successCount} products imported.`);
      if (data.skippedCount > 0) {
        newLogs.push(`⏭️ Skipped: ${data.skippedCount} empty rows.`);
      }
      if (data.failCount > 0) {
        newLogs.push(`❌ Failed: ${data.failCount} rows had errors.`);
        data.errors?.forEach((err: any) => {
          newLogs.push(`  Row ${err.row}: ${err.error}`);
        });
      }
      
      setLogs(prev => [...prev, ...newLogs]);
      setStatus(data.failCount > 0 && data.successCount === 0 ? 'error' : 'success');
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.response?.data?.error || err.message || 'Upload failed. Please try again.';
      setLogs(prev => [...prev, `❌ Error: ${errorMsg}`]);
      setStatus('error');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await api.get('/admin/bulk-import/template', {
        responseType: 'blob',
      });
      
      const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Talukder_Furniture_Product_Template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download template:', err);
      alert('Failed to download template. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/products" className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-primary transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-serif font-bold text-primary">Bulk Import Products</h1>
          <p className="text-sm text-gray-500">Upload an Excel (.xlsx) file to add or update multiple products at once.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div 
            className={`bg-white p-12 rounded-xl border-2 border-dashed transition-colors text-center ${
              file ? 'border-accent bg-accent/5' : 'border-gray-300 hover:border-accent hover:bg-gray-50'
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleFileChange}
            />
            
            {file ? (
              <div className="flex flex-col items-center">
                <FileSpreadsheet size={48} className="text-accent mb-4" />
                <h3 className="text-lg font-bold text-primary mb-1">{file.name}</h3>
                <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <button 
                  className="mt-4 text-sm text-red-500 hover:text-red-700 font-medium"
                  onClick={(e) => { e.stopPropagation(); setFile(null); setStatus('idle'); setLogs([]); setImportResult(null); }}
                >
                  Remove File
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center cursor-pointer">
                <UploadCloud size={48} className="text-gray-400 mb-4" />
                <h3 className="text-lg font-bold text-primary mb-1">Click or drag file to this area to upload</h3>
                <p className="text-sm text-gray-500">Supports .xlsx and .xls files up to 10MB</p>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button 
              className="btn bg-black text-white hover:bg-gray-900 px-8 transition-colors" 
              disabled={!file || status === 'uploading' || status === 'success'}
              onClick={handleUpload}
            >
              {status === 'uploading' ? 'Importing...' : 'Start Import'}
            </button>
          </div>

          {/* Import Logs/Status */}
          {status !== 'idle' && (
            <div className={`p-6 rounded-xl border ${
              status === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 
              status === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 
              'bg-blue-50 border-blue-200 text-blue-800'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                {status === 'success' ? <CheckCircle2 size={24} /> : 
                 status === 'error' ? <AlertCircle size={24} /> : 
                 <div className="w-6 h-6 border-2 border-blue-800 border-t-transparent rounded-full animate-spin"></div>}
                <h3 className="font-bold text-lg">
                  {status === 'success' ? 'Import Complete' : 
                   status === 'error' ? 'Import Failed' : 'Importing...'}
                </h3>
              </div>
              
              {/* Summary Cards */}
              {importResult && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-white/70 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-green-700">{importResult.successCount}</p>
                    <p className="text-xs font-medium">Imported</p>
                  </div>
                  <div className="bg-white/70 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-gray-500">{importResult.skippedCount}</p>
                    <p className="text-xs font-medium">Skipped</p>
                  </div>
                  <div className="bg-white/70 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-red-600">{importResult.failCount}</p>
                    <p className="text-xs font-medium">Failed</p>
                  </div>
                </div>
              )}

              <div className="bg-white/50 rounded p-4 font-mono text-sm space-y-1 max-h-64 overflow-y-auto">
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="opacity-50 flex-shrink-0">[{new Date().toLocaleTimeString()}]</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-primary mb-4">Import Guidelines</h3>
            <ul className="text-sm text-gray-600 space-y-3 list-disc pl-5">
              <li>File must be in <strong>.xlsx</strong> format.</li>
              <li>Maximum file size is <strong>10MB</strong>.</li>
              <li><strong>Product Code</strong> is used as a unique key — re-importing the same file will update existing products (not duplicate them).</li>
              <li>Categories (Main & Sub) will be <strong>auto-created</strong> if they don't exist yet.</li>
              <li>The first <strong>4 rows</strong> (title & headers) are automatically skipped.</li>
              <li><strong>Discount</strong> can be entered as <code>22%</code> or <code>0.22</code> — both are handled correctly.</li>
            </ul>
            <div className="mt-6 pt-6 border-t border-gray-100">
              <button 
                onClick={handleDownloadTemplate}
                className="text-accent hover:text-primary font-medium text-sm flex items-center gap-2 transition-colors"
              >
                <Download size={16} /> Download Template
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
