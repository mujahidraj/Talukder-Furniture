import React, { useState } from 'react';
import { 
  FolderSearch, 
  Server,
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  FileCheck,
  FileText,
  FileWarning,
  Info,
  XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../lib/api';
import RecentBulkImportsTable from './components/RecentBulkImportsTable';

export default function BulkImageImportPage() {
  const [folderPath, setFolderPath] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [importResult, setImportResult] = useState<any>(null);

  const handleImport = async () => {
    if (!folderPath.trim()) return;
    
    setStatus('processing');
    setLogs([`Connecting to server...`, `Requesting scan of directory: ${folderPath}`]);
    setImportResult(null);
    
    try {
      const res = await api.post('/admin/bulk-image-import', 
        { folderPath: folderPath.trim() },
        { timeout: 300000 } // 5 minutes timeout for bulk image processing
      );
      const data = res.data;
      
      setImportResult(data);
      
      const newLogs: string[] = [];
      if (data.logs) {
        data.logs.forEach((log: string) => newLogs.push(log));
      }
      
      newLogs.push(`✅ Success: ${data.matchedCount} images matched to products.`);
      if (data.skippedCount > 0) {
        newLogs.push(`⏭️ Skipped: ${data.skippedCount} duplicate images.`);
        const skippedFiles = data.results.filter((r: any) => r.status === 'skipped').map((r: any) => r.file);
        if (skippedFiles.length > 0) {
          newLogs.push(`   Skipped files: ${skippedFiles.join(', ')}`);
        }
      }
      if (data.unmatchedCount > 0) {
        newLogs.push(`⚠️ Unmatched: ${data.unmatchedCount} images found no matching product/set.`);
        const unmatchedFiles = data.results.filter((r: any) => r.status === 'unmatched').map((r: any) => r.file);
        if (unmatchedFiles.length > 0) {
          newLogs.push(`   Unmatched files: ${unmatchedFiles.join(', ')}`);
        }
      }
      if (data.errorCount > 0) {
        newLogs.push(`❌ Failed: ${data.errorCount} errors occurred during processing.`);
      }
      
      setLogs(prev => [...prev, ...newLogs]);
      setStatus(data.errorCount > 0 && data.matchedCount === 0 ? 'error' : 'success');
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.response?.data?.error || err.message || 'Import failed. Please check the path and try again.';
      setLogs(prev => [...prev, `❌ Error: ${errorMsg}`]);
      setStatus('error');
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
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 tracking-tight">Bulk Image Import</h1>
            <p className="text-sm text-gray-500 mt-1">Scan a local directory to automatically match and import product images based on SKUs.</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Action Area */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm"
          >
            <div className="mb-6">
              <label htmlFor="folderPath" className="block text-sm font-bold text-gray-900 mb-2">Absolute Folder Path</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FolderSearch size={20} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="folderPath"
                  value={folderPath}
                  onChange={(e) => setFolderPath(e.target.value)}
                  placeholder="e.g. D:\Talukder Furniture\Documents\Bedroom Set\FInal Image"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono text-sm"
                  disabled={status === 'processing'}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 ml-1">Must be an absolute path accessible by the server running the API.</p>
            </div>

            <div className="flex justify-end">
              <button 
                onClick={handleImport}
                disabled={!folderPath.trim() || status === 'processing'}
                className="flex items-center gap-2 bg-accent text-white hover:bg-[#E51C2A] disabled:bg-gray-400 hover:shadow-lg px-8 py-3.5 rounded-xl font-medium transition-all"
              >
                {status === 'processing' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Scanning & Processing...
                  </>
                ) : (
                  <>
                    <Server size={18} />
                    Scan & Import
                  </>
                )}
              </button>
            </div>
          </motion.div>

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
                } shadow-sm`}
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
                        {status === 'success' ? 'Import Completed' : 
                         status === 'error' ? 'Import Failed or Completed with Errors' : 'Processing Directory...'}
                      </h3>
                      <p className={`text-sm ${
                        status === 'success' ? 'text-green-600/80' : 
                        status === 'error' ? 'text-red-600/80' : 'text-blue-600/80'
                      }`}>
                        {status === 'success' ? 'All files processed' : 
                         status === 'error' ? 'Please review the logs below' : 'Do not close this window'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Summary Cards */}
                {importResult && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-6 bg-white/60">
                    <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
                      <FileCheck className="text-green-500 mb-2 mx-auto" size={24} />
                      <p className="text-3xl font-black text-green-600">{importResult.matchedCount}</p>
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mt-1">Matched</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
                      <FileText className="text-blue-400 mb-2 mx-auto" size={24} />
                      <p className="text-3xl font-black text-blue-600">{importResult.skippedCount}</p>
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mt-1">Skipped (Dupes)</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
                      <FileWarning className="text-orange-400 mb-2 mx-auto" size={24} />
                      <p className="text-3xl font-black text-orange-600">{importResult.unmatchedCount}</p>
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mt-1">Unmatched</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
                      <XCircle className="text-red-500 mb-2 mx-auto" size={24} />
                      <p className="text-3xl font-black text-red-600">{importResult.errorCount}</p>
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mt-1">Errors</p>
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
                      const isError = log.includes('❌') || log.includes('Failed') || log.includes('Error') || log.includes('Fatal');
                      const isSuccess = log.includes('✅') || log.includes('Success');
                      const isWarning = log.includes('⏭️') || log.includes('Skipped') || log.includes('⚠️') || log.includes('Unmatched');
                      
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
                
                {importResult && importResult.results && importResult.results.length > 0 && (
                  <div className="p-6 bg-white border-t border-gray-200">
                    <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Detailed Results</h4>
                    <div className="max-h-80 overflow-y-auto custom-scrollbar border border-gray-100 rounded-xl">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 font-medium text-gray-500 border-b">Filename</th>
                            <th className="px-4 py-3 font-medium text-gray-500 border-b">Status</th>
                            <th className="px-4 py-3 font-medium text-gray-500 border-b">Message</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {importResult.results.map((r: any, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium text-gray-800">{r.file}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${
                                  r.status === 'matched' ? 'bg-green-100 text-green-700' :
                                  r.status === 'skipped' ? 'bg-blue-100 text-blue-700' :
                                  r.status === 'unmatched' ? 'bg-orange-100 text-orange-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {r.status.toUpperCase()}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-600">{r.message}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
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
              <h3 className="font-bold text-xl text-gray-900">How it Works</h3>
            </div>
            
            <ul className="space-y-4">
              {[
                { text: <>Provide the <strong className="text-gray-900 font-semibold">absolute path</strong> to the root folder containing your product images.</> },
                { text: <>The scanner will look through all <strong className="text-gray-900 font-semibold">subfolders</strong> recursively.</> },
                { text: <>Only <strong className="text-gray-900 font-semibold">.jpg, .png, .webp</strong> files will be processed.</> },
                { text: <>Image filenames should exactly match the <strong className="text-gray-900 font-semibold">Product SKU</strong> (e.g. <code>TFL-BED-109 LB.png</code>).</> },
                { text: <>Filenames starting with <strong className="text-gray-900 font-semibold">set </strong> (e.g. <code>set 109.png</code>) will be matched against Sets.</> },
                { text: <>Copies like <code>TFL-CBD-201 LB (2).png</code> will be parsed as SKU <code>TFL-CBD-201 LB</code> and added as an additional product image.</> },
                { text: <>Already imported images (with matching original filenames) are <strong className="text-gray-900 font-semibold">skipped</strong> to prevent duplicates.</> },
                { text: <>Images will be automatically optimized to <strong className="text-gray-900 font-semibold">WebP format</strong> and thumbnails generated.</> },
              ].map((item, idx) => (
                <li key={idx} className="flex gap-3 items-start group">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0 group-hover:scale-150 transition-transform"></div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {item.text}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
      
      <RecentBulkImportsTable refreshTrigger={status} />
    </div>
  );
}
