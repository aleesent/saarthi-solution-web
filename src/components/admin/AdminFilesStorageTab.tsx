import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { FileRecord, StorageProvider, StorageHealthStatus } from '../../types';
import { fetchStorageHealth } from '../../lib/storageService';
import {
  FolderArchive,
  Upload,
  HardDrive,
  Database,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  FileCode,
  Download,
  ExternalLink,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Eye,
  Settings,
  Layers,
  ArrowUpDown,
  Code,
  FolderOpen,
  Info
} from 'lucide-react';

export const AdminFilesStorageTab: React.FC = () => {
  const {
    storageFiles,
    refreshStorageFiles,
    uploadStorageFile,
    deleteFileRecord,
    replaceFileRecord,
    candidates,
    invoices
  } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<'ALL' | StorageProvider>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<StorageHealthStatus | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileRecord | null>(null);
  const [replacingFileId, setReplacingFileId] = useState<string | null>(null);

  // Upload Form State
  const [uploadCategory, setUploadCategory] = useState<string>('document');
  const [relatedEntityId, setRelatedEntityId] = useState<string>('');
  const [uploaderName, setUploaderName] = useState<string>('Admin (Raajesh V)');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const replaceInputRef = useRef<HTMLInputElement | null>(null);

  // Load health on mount
  useEffect(() => {
    fetchStorageHealth()
      .then(setHealthStatus)
      .catch((e) => console.warn('Could not fetch storage health:', e));
  }, []);

  // Filtered files
  const filteredFiles = storageFiles.filter((file) => {
    if (selectedProvider !== 'ALL' && file.storage_provider !== selectedProvider) {
      return false;
    }
    if (selectedCategory !== 'ALL' && file.related_entity_type !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = file.file_name.toLowerCase().includes(q) || file.original_file_name.toLowerCase().includes(q);
      const matchUploader = file.uploaded_by && file.uploaded_by.toLowerCase().includes(q);
      const matchType = file.related_entity_type && file.related_entity_type.toLowerCase().includes(q);
      return matchName || matchUploader || matchType;
    }
    return true;
  });

  // Calculate metrics
  const totalFiles = storageFiles.length;
  const driveFilesCount = storageFiles.filter((f) => f.storage_provider === 'google_drive').length;
  const supabaseFilesCount = storageFiles.filter((f) => f.storage_provider === 'supabase').length;
  const totalSizeBytes = storageFiles.reduce((acc, f) => acc + (f.file_size || 0), 0);

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getFileIcon = (mimeType: string, fileName: string) => {
    const lower = fileName.toLowerCase();
    if (mimeType.includes('pdf') || lower.endsWith('.pdf')) {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    if (mimeType.includes('image') || lower.match(/\.(jpg|jpeg|png|webp|svg|gif)$/)) {
      return <ImageIcon className="w-5 h-5 text-emerald-500" />;
    }
    if (mimeType.includes('sheet') || lower.match(/\.(xls|xlsx|csv)$/)) {
      return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
    }
    if (mimeType.includes('word') || lower.match(/\.(doc|docx)$/)) {
      return <FileText className="w-5 h-5 text-blue-600" />;
    }
    if (mimeType.includes('zip') || lower.match(/\.(zip|rar|7z)$/)) {
      return <FolderArchive className="w-5 h-5 text-amber-600" />;
    }
    return <FileCode className="w-5 h-5 text-slate-500" />;
  };

  const handleCopyLink = (file: FileRecord) => {
    const link = file.google_drive_url || file.download_url || '';
    if (link) {
      navigator.clipboard.writeText(link);
      setCopiedId(file.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const handleDelete = async (file: FileRecord) => {
    const isDrive = file.storage_provider === 'google_drive';
    const msg = `Are you sure you want to delete "${file.original_file_name}"?\n\nThis will permanently delete the file from ${
      isDrive ? 'Google Drive' : 'Supabase Storage'
    } and remove its metadata from Supabase PostgreSQL.`;

    if (window.confirm(msg)) {
      try {
        await deleteFileRecord(file.id);
      } catch (err: any) {
        alert(`Failed to delete file: ${err.message}`);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    try {
      setIsUploading(true);
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const targetProvider = isPdf || file.size >= 2 * 1024 * 1024 ? 'Google Drive' : 'Supabase Storage';
      
      setUploadProgressMsg(`Uploading "${file.name}" to ${targetProvider}...`);

      await uploadStorageFile(file, {
        fileName: file.name,
        relatedEntityType: uploadCategory,
        relatedEntityId: relatedEntityId || undefined,
        uploadedBy: uploaderName || 'Admin (Raajesh V)'
      });

      setUploadProgressMsg(`Successfully uploaded & indexed in Supabase!`);
      setTimeout(() => setUploadProgressMsg(null), 3000);
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleReplaceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !replacingFileId) return;
    const file = e.target.files[0];

    try {
      setIsUploading(true);
      setUploadProgressMsg(`Replacing file with "${file.name}"...`);
      await replaceFileRecord(replacingFileId, file, uploaderName);
      setUploadProgressMsg(`File replaced successfully!`);
      setTimeout(() => setUploadProgressMsg(null), 3000);
      setReplacingFileId(null);
    } catch (err: any) {
      alert(`Replacement error: ${err.message}`);
    } finally {
      setIsUploading(false);
      if (replaceInputRef.current) replaceInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-50 text-[#0A3D91]">
                <HardDrive className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Hybrid Cloud File Storage & Supabase Registry
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Unified enterprise architecture: <b>Google Drive</b> for PDFs & large documents • <b>Supabase Storage</b> for UI assets & logos • <b>Supabase PostgreSQL</b> for metadata
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => setShowSqlModal(true)}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Code className="w-4 h-4 text-slate-600" />
              <span>SQL Migration</span>
            </button>

            <button
              onClick={() => setShowConfigModal(true)}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-600" />
              <span>Storage Config</span>
            </button>

            <button
              onClick={() => refreshStorageFiles()}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0A3D91] flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Files</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Files</span>
              <FolderArchive className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalFiles}</p>
            <span className="text-[10px] text-slate-400">{formatFileSize(totalSizeBytes)} total</span>
          </div>

          <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">Google Drive</span>
              <HardDrive className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-blue-900 mt-1">{driveFilesCount}</p>
            <span className="text-[10px] text-blue-600 font-semibold">PDFs & Large Docs</span>
          </div>

          <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Supabase Storage</span>
              <Database className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-900 mt-1">{supabaseFilesCount}</p>
            <span className="text-[10px] text-emerald-600 font-semibold">UI Assets & Logos</span>
          </div>

          <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-100">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Max Asset Size</span>
              <Layers className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-amber-900 mt-1">2 MB</p>
            <span className="text-[10px] text-amber-700 font-semibold">&gt; 2MB auto-routes to Drive</span>
          </div>
        </div>
      </div>

      {/* Direct Upload Form Card */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-4">
          <Upload className="w-4 h-4 text-[#0A3D91]" />
          Upload & Index New File
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">File Category</label>
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="candidate_resume">Candidate Resume (PDF/Doc)</option>
              <option value="invoice_pdf">Client Invoice (PDF)</option>
              <option value="document">Corporate Brochure / Document</option>
              <option value="asset">UI Asset / Website Image</option>
              <option value="logo">Company Logo (SVG/PNG)</option>
              <option value="other">Other File</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Related Entity ID (Optional)</label>
            <input
              type="text"
              placeholder="e.g. cand-001 or INV-2026-081"
              value={relatedEntityId}
              onChange={(e) => setRelatedEntityId(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Uploaded By</label>
            <input
              type="text"
              value={uploaderName}
              onChange={(e) => setUploaderName(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Drag-and-drop / File upload trigger */}
        <div className="mt-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            id="admin-direct-file-input"
          />
          <label
            htmlFor="admin-direct-file-input"
            className="border-2 border-dashed border-slate-300 hover:border-[#0A3D91] hover:bg-blue-50/40 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center"
          >
            <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0A3D91] flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                Click to browse or drag and drop your file here
              </p>
              <p className="text-xs text-slate-500 mt-1">
                PDFs, DOCX, Invoices &gt; 2MB are auto-routed to <b>Google Drive</b> • Images and SVGs &lt; 2MB are uploaded to <b>Supabase Storage</b>
              </p>
            </div>
          </label>
        </div>

        {uploadProgressMsg && (
          <div className="mt-3 p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold text-[#0A3D91] flex items-center gap-2 animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin" />
            {uploadProgressMsg}
          </div>
        )}
      </div>

      {/* Hidden input for Replace File */}
      <input
        type="file"
        ref={replaceInputRef}
        onChange={handleReplaceUpload}
        className="hidden"
      />

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search files by name, uploader, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-semibold pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value as any)}
            className="text-xs font-bold px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Storage Providers</option>
            <option value="google_drive">Google Drive Only</option>
            <option value="supabase">Supabase Storage Only</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs font-bold px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Categories</option>
            <option value="candidate_resume">Candidate Resumes</option>
            <option value="invoice_pdf">Client Invoices</option>
            <option value="document">Corporate Documents</option>
            <option value="asset">UI Assets / Logos</option>
          </select>
        </div>

        <div className="flex items-center gap-1 self-end md:self-center">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              viewMode === 'table' ? 'bg-[#0A3D91] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Table View
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              viewMode === 'grid' ? 'bg-[#0A3D91] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Card Grid
          </button>
        </div>
      </div>

      {/* File Registry List View */}
      {filteredFiles.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <FolderArchive className="w-6 h-6" />
          </div>
          <h4 className="text-base font-black text-slate-800">No files match the active filters</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Try adjusting your search query or upload a new file above to register it in Supabase and Google Drive.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">File Name & Type</th>
                  <th className="py-3 px-4">Storage Provider</th>
                  <th className="py-3 px-4">Category / Link</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Uploaded By / Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFiles.map((file) => {
                  const isDrive = file.storage_provider === 'google_drive';
                  return (
                    <tr key={file.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-slate-100 flex-shrink-0">
                            {getFileIcon(file.mime_type, file.original_file_name)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate max-w-xs sm:max-w-sm" title={file.original_file_name}>
                              {file.original_file_name}
                            </p>
                            <span className="text-[10px] text-slate-400 block truncate font-mono">
                              {file.folder_path || (isDrive ? 'Google Drive / Sarthi Solutions' : 'Supabase Storage / assets')}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {isDrive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                            <HardDrive className="w-3.5 h-3.5 text-blue-600" />
                            Google Drive (PDF/Large)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            <Database className="w-3.5 h-3.5 text-emerald-600" />
                            Supabase Storage
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div>
                          <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700">
                            {file.related_entity_type || 'document'}
                          </span>
                          {file.related_entity_id && (
                            <span className="block text-[10px] font-mono text-blue-700 mt-0.5">
                              ID: {file.related_entity_id}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-600">
                        {formatFileSize(file.file_size)}
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800">{file.uploaded_by || 'System'}</p>
                        <span className="text-[10px] text-slate-400">
                          {new Date(file.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Preview / Open */}
                          <button
                            onClick={() => setPreviewFile(file)}
                            title="Preview File"
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* External Link */}
                          {(file.google_drive_url || file.download_url) && (
                            <a
                              href={file.google_drive_url || file.download_url}
                              target="_blank"
                              rel="noreferrer"
                              title="Open External URL"
                              className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}

                          {/* Copy Link */}
                          <button
                            onClick={() => handleCopyLink(file)}
                            title="Copy File Link"
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                          >
                            {copiedId === file.id ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>

                          {/* Replace File */}
                          <button
                            onClick={() => {
                              setReplacingFileId(file.id);
                              replaceInputRef.current?.click();
                            }}
                            title="Replace with new file"
                            className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>

                          {/* Delete File */}
                          <button
                            onClick={() => handleDelete(file)}
                            title="Delete File"
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file) => {
            const isDrive = file.storage_provider === 'google_drive';
            return (
              <div
                key={file.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="p-2.5 rounded-xl bg-slate-100">
                      {getFileIcon(file.mime_type, file.original_file_name)}
                    </div>
                    {isDrive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                        <HardDrive className="w-3 h-3 text-blue-600" />
                        Google Drive
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <Database className="w-3 h-3 text-emerald-600" />
                        Supabase
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 break-words mb-1" title={file.original_file_name}>
                    {file.original_file_name}
                  </h4>

                  <p className="text-[11px] text-slate-400 font-mono mb-3">
                    Size: {formatFileSize(file.file_size)} • Type: {file.related_entity_type || 'document'}
                  </p>

                  <div className="bg-slate-50 p-2.5 rounded-xl text-[11px] text-slate-600 space-y-1 mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Uploaded By:</span>
                      <span className="font-semibold">{file.uploaded_by || 'System'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Date:</span>
                      <span>{new Date(file.created_at).toLocaleDateString('en-IN')}</span>
                    </div>
                    {file.google_drive_file_id && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Drive ID:</span>
                        <span className="font-mono text-[10px] truncate max-w-[120px]">{file.google_drive_file_id}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setPreviewFile(file)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0A3D91] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Preview
                  </button>

                  <button
                    onClick={() => handleCopyLink(file)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    title="Copy Link"
                  >
                    {copiedId === file.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => handleDelete(file)}
                    className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 bg-[#0A3D91] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/10">
                  {getFileIcon(previewFile.mime_type, previewFile.original_file_name)}
                </div>
                <div>
                  <h3 className="font-bold text-sm truncate max-w-md">{previewFile.original_file_name}</h3>
                  <span className="text-[10px] text-blue-200">
                    {previewFile.storage_provider === 'google_drive' ? 'Stored in Google Drive' : 'Stored in Supabase Storage'} • {formatFileSize(previewFile.file_size)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {previewFile.google_drive_url && (
                  <a
                    href={previewFile.google_drive_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                    title="Open in Google Drive"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() => setPreviewFile(null)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-100 p-4 min-h-[400px] flex items-center justify-center overflow-auto">
              {previewFile.mime_type.includes('image') ? (
                <img
                  src={previewFile.download_url || previewFile.google_drive_url}
                  alt={previewFile.original_file_name}
                  className="max-h-[70vh] object-contain rounded-lg shadow-md"
                />
              ) : (
                <iframe
                  src={
                    previewFile.google_drive_view_url ||
                    previewFile.google_drive_url?.replace('/view', '/preview') ||
                    previewFile.download_url ||
                    ''
                  }
                  className="w-full h-[65vh] rounded-xl border border-slate-300 bg-white shadow-inner"
                  title="File Preview"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* SQL Migration Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-sm">Supabase PostgreSQL Schema Migration</h3>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-950 text-slate-200 font-mono text-xs overflow-auto flex-1">
              <pre className="whitespace-pre">{`-- SUPABASE POSTGRESQL SCHEMA: files table
CREATE TABLE IF NOT EXISTS public.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  original_file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  storage_provider TEXT NOT NULL CHECK (storage_provider IN ('supabase', 'google_drive', 'local')),
  storage_path TEXT,
  google_drive_file_id TEXT,
  google_drive_url TEXT,
  google_drive_view_url TEXT,
  download_url TEXT,
  thumbnail_url TEXT,
  folder_id TEXT,
  folder_path TEXT DEFAULT 'Sarthi Solutions/',
  related_entity_type TEXT,
  related_entity_id TEXT,
  uploaded_by TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_files_provider ON public.files(storage_provider);
CREATE INDEX IF NOT EXISTS idx_files_related ON public.files(related_entity_type, related_entity_id);
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;`}</pre>
            </div>

            <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`CREATE TABLE IF NOT EXISTS public.files (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  file_name TEXT NOT NULL,\n  original_file_name TEXT NOT NULL,\n  mime_type TEXT NOT NULL,\n  file_size BIGINT NOT NULL,\n  storage_provider TEXT NOT NULL CHECK (storage_provider IN ('supabase', 'google_drive', 'local')),\n  storage_path TEXT,\n  google_drive_file_id TEXT,\n  google_drive_url TEXT,\n  download_url TEXT,\n  related_entity_type TEXT,\n  related_entity_id TEXT,\n  uploaded_by TEXT,\n  created_at TIMESTAMPTZ NOT NULL DEFAULT now()\n);`);
                  alert('SQL copied to clipboard!');
                }}
                className="px-4 py-2 rounded-xl bg-[#0A3D91] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy SQL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Storage Configuration Inspector Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 bg-[#0A3D91] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-300" />
                <h3 className="font-black text-sm">Storage Configuration & Credentials Status</h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-auto flex-1">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                  <Info className="w-4 h-4" />
                  Hybrid Storage Routing Rules
                </div>
                <ul className="text-xs text-blue-800 mt-2 space-y-1 list-disc list-inside">
                  <li><b>PDFs (Resumes & Invoices)</b>: Always stored in Google Drive folders (`Sarthi Solutions/Resumes/`, `Sarthi Solutions/Invoices/`).</li>
                  <li><b>Large Files (&gt; 2MB)</b>: Videos, large archives, catalogs routed to Google Drive.</li>
                  <li><b>Small Assets (&lt; 2MB)</b>: Company logos, website images stored in Supabase Storage (`assets` bucket).</li>
                  <li><b>Metadata & Indexing</b>: Recorded in Supabase PostgreSQL `files` table for instant search, filtering, and role-based access.</li>
                </ul>
              </div>

              <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Environment Credentials Checklist</h4>
              <div className="space-y-2">
                {[
                  { name: 'SUPABASE_URL', label: 'Supabase Project URL', active: healthStatus?.environment.hasSupabaseUrl },
                  { name: 'SUPABASE_SERVICE_ROLE_KEY / ANON_KEY', label: 'Supabase API Keys', active: healthStatus?.environment.hasSupabaseServiceKey || healthStatus?.environment.hasSupabaseAnonKey },
                  { name: 'GOOGLE_DRIVE_CLIENT_ID', label: 'Google Drive OAuth Client ID', active: healthStatus?.environment.hasGoogleDriveClientId },
                  { name: 'GOOGLE_DRIVE_CLIENT_SECRET', label: 'Google Drive OAuth Client Secret', active: healthStatus?.environment.hasGoogleDriveClientSecret },
                  { name: 'GOOGLE_DRIVE_REFRESH_TOKEN', label: 'Google Drive OAuth Refresh Token', active: healthStatus?.environment.hasGoogleDriveRefreshToken },
                  { name: 'GOOGLE_DRIVE_FOLDER_ID', label: 'Google Drive Root Folder ID', active: healthStatus?.environment.hasGoogleDriveFolderId },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <p className="font-mono font-bold text-xs text-slate-800">{item.name}</p>
                      <span className="text-[10px] text-slate-500">{item.label}</span>
                    </div>
                    {item.active ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Configured
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Pending in .env
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
