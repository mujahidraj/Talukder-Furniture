import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Download,
  Info,
  Server,
  FileText,
  FileCheck,
  FileWarning
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div className="max-w-6xl mx-auto min-h-[80vh] pb-12">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
      >
        <div className="flex items-center gap-4">
          <Link 
            to="/admin/products" 
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 hover:text-black hover:bg-gray-100 hover:shadow-sm transition-all"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 tracking-tight">Bulk Import Products</h1>
            <p className="text-sm text-gray-500 mt-1">Upload an Excel (.xlsx) file to add or update multiple products seamlessly.</p>
          </div>
        </div>
        <button 
          onClick={handleDownloadTemplate}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 hover:shadow-lg transition-all"
        >
          <Download size={18} />
          Get Template
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Action Area */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`relative overflow-hidden bg-white p-10 rounded-2xl border-2 border-dashed transition-all duration-300 group cursor-pointer ${
              file ? 'border-green-400 bg-green-50/30 shadow-[0_0_40px_rgba(74,222,128,0.1)]' : 'border-gray-300 hover:border-gray-500 hover:bg-gray-50'
            }`}
            onDragOver={(e) => { handleDragOver(e); e.currentTarget.classList.add('border-gray-500', 'bg-gray-50'); }}
            onDragLeave={(e) => { e.currentTarget.classList.remove('border-gray-500', 'bg-gray-50'); }}
            onDrop={(e) => { handleDrop(e); e.currentTarget.classList.remove('border-gray-500', 'bg-gray-50'); }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleFileChange}
            />
            
            <AnimatePresence mode="wait">
              {file ? (
                <motion.div 
                  key="file-selected"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center text-center relative z-10"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
                    <FileSpreadsheet size={40} className="text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{file.name}</h3>
                  <p className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm mt-2 border border-gray-100">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button 
                    className="mt-6 px-4 py-2 text-sm text-red-500 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition-colors"
                    onClick={(e) => { e.stopPropagation(); setFile(null); setStatus('idle'); setLogs([]); setImportResult(null); }}
                  >
                    Remove & Select Another
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key="upload-prompt"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center text-center relative z-10"
                >
                  <div className="w-20 h-20 bg-gray-50 group-hover:bg-gray-100 rounded-full flex items-center justify-center mb-4 transition-colors">
                    <UploadCloud size={40} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Drag & drop your file here</h3>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto">
                    Supports <span className="font-semibold text-gray-700">.xlsx</span>, <span className="font-semibold text-gray-700">.xls</span> or <span className="font-semibold text-gray-700">.csv</span> up to 10MB
                  </p>
                  <div className="mt-6 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl shadow-sm group-hover:border-gray-300 group-hover:shadow transition-all pointer-events-none">
                    Browse Files
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Background decoration */}
            <div className="absolute -bottom-8 -right-8 opacity-5 pointer-events-none">
              <FileSpreadsheet size={150} />
            </div>
          </motion.div>

          <AnimatePresence>
            {file && status !== 'success' && status !== 'uploading' && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="flex justify-end overflow-hidden"
              >
                <button 
                  className="flex items-center gap-2 bg-black text-white hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5 px-8 py-3.5 rounded-xl font-medium transition-all" 
                  onClick={handleUpload}
                >
                  <Server size={18} />
                  Start Processing Data
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Import Logs/Status */}
          <AnimatePresence>
            {status !== 'idle' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`overflow-hidden rounded-2xl border ${
                  status === 'success' ? 'bg-green-50/50 border-green-200' : 
                  status === 'error' ? 'bg-red-50/50 border-red-200' : 
                  'bg-blue-50/50 border-blue-200'
                } shadow-sm mt-6`}
              >
                <div className={`p-6 border-b ${
                  status === 'success' ? 'border-green-100' : 
                  status === 'error' ? 'border-red-100' : 
                  'border-blue-100'
                } flex items-center justify-between`}>
                  <div className="flex items-center gap-4">
                    {status === 'success' ? (
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 shadow-inner">
                        <CheckCircle2 size={28} />
                      </div>
                    ) : status === 'error' ? (
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 shadow-inner">
                        <AlertCircle size={28} />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shadow-inner">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    <div>
                      <h3 className={`font-bold text-lg ${
                        status === 'success' ? 'text-green-800' : 
                        status === 'error' ? 'text-red-800' : 'text-blue-800'
                      }`}>
                        {status === 'success' ? 'Import Completed Successfully' : 
                         status === 'error' ? 'Import Failed or Completed with Errors' : 'Processing Upload...'}
                      </h3>
                      <p className={`text-sm ${
                        status === 'success' ? 'text-green-600/80' : 
                        status === 'error' ? 'text-red-600/80' : 'text-blue-600/80'
                      }`}>
                        {status === 'success' ? 'All records processed' : 
                         status === 'error' ? 'Please review the logs below' : 'Do not close this window'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Summary Cards */}
                {importResult && (
                  <div className="grid grid-cols-3 gap-3 p-6 bg-white/60">
                    <div className="bg-white rounded-xl p-5 text-center shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                      <FileCheck className="text-green-500 mb-2" size={24} />
                      <p className="text-3xl font-black text-green-600">{importResult.successCount}</p>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Imported</p>
                    </div>
                    <div className="bg-white rounded-xl p-5 text-center shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                      <FileText className="text-gray-400 mb-2" size={24} />
                      <p className="text-3xl font-black text-gray-700">{importResult.skippedCount}</p>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Skipped</p>
                    </div>
                    <div className="bg-white rounded-xl p-5 text-center shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                      <FileWarning className="text-red-500 mb-2" size={24} />
                      <p className="text-3xl font-black text-red-600">{importResult.failCount}</p>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Failed</p>
                    </div>
                  </div>
                )}

                <div className="p-6 bg-[#0d1117] rounded-b-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Process Terminal</span>
                    <span className="text-xs font-medium text-gray-500 bg-gray-800 px-2 py-1 rounded-md">{logs.length} entries</span>
                  </div>
                  <div className="font-mono text-[13px] space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                    {logs.map((log, i) => {
                      const isError = log.includes('❌') || log.includes('Failed') || log.includes('Error');
                      const isSuccess = log.includes('✅') || log.includes('Success');
                      const isWarning = log.includes('⏭️') || log.includes('Skipped');
                      
                      return (
                        <div key={i} className="flex gap-3 leading-relaxed">
                          <span className="text-gray-600 flex-shrink-0">[{new Date().toLocaleTimeString()}]</span>
                          <span className={`${
                            isError ? 'text-red-400 font-medium' : 
                            isSuccess ? 'text-green-400' : 
                            isWarning ? 'text-yellow-400' : 'text-gray-300'
                          }`}>
                            {log}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column - Guidelines */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1"
        >
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm sticky top-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <Info size={20} />
              </div>
              <h3 className="font-bold text-xl text-gray-900">Guidelines</h3>
            </div>
            
            <ul className="space-y-4">
              {[
                { text: <>File must be in <strong className="text-gray-900 font-semibold">.xlsx</strong> format.</> },
                { text: <>Maximum file size is <strong className="text-gray-900 font-semibold">10MB</strong>.</> },
                { text: <><strong className="text-gray-900 font-semibold">Product Code</strong> is used as a unique key — re-importing the same file will update existing products.</> },
                { text: <>Categories will be <strong className="text-gray-900 font-semibold">auto-created</strong> if they don't exist.</> },
                { text: <>The first <strong className="text-gray-900 font-semibold">4 rows</strong> (title & headers) are skipped.</> },
                { text: <>Discount can be <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-800 text-xs mx-1">22%</code> or <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-800 text-xs mx-1">0.22</code>.</> },
                { text: <>Ensure all <strong className="text-gray-900 font-semibold">mandatory fields</strong> (Name, Category, Price) are filled out.</> },
                { text: <><strong className="text-gray-900 font-semibold">Base Price</strong> and <strong className="text-gray-900 font-semibold">Sell Price</strong> must be valid numbers (e.g., 500).</> },
                { text: <>If adding <strong className="text-gray-900 font-semibold">Images</strong>, provide them as comma-separated valid public URLs.</> },
                { text: <>For very large datasets (1000+ rows), consider splitting the file for faster processing.</> },
              ].map((item, idx) => (
                <li key={idx} className="flex gap-3 items-start group">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0 group-hover:scale-150 transition-transform"></div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {item.text}
                  </p>
                </li>
              ))}
            </ul>
            
            <div className="mt-8 p-5 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-600 mb-4 font-medium text-center">Need a starting point? Download our standardized template.</p>
              <button 
                onClick={handleDownloadTemplate}
                className="w-full py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 hover:text-black transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
              >
                <Download size={16} /> Download Template
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
