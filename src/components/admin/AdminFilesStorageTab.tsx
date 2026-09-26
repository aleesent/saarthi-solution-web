import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { FileRecord, StorageHealthStatus } from '../../types';
import { fetchStorageHealth } from '../../lib/storageService';
import {
  FolderArchive,
  Upload,
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
    replaceFileRecord
  } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBucket, setSelectedBucket] = useState<string>('ALL');
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
  const [uploadCategory, setUploadCategory] = useState<string>('candidate_resume');
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
    const bucket = file.bucket || (file.storage_path?.split('/')[0]) || 'resumes';
    if (selectedBucket !== 'ALL' && bucket !== selectedBucket) {
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
  const resumesCount = storageFiles.filter((f) => 
    f.bucket === 'resumes' || 
    f.related_entity_type?.includes('resume') || 
    f.original_file_name.toLowerCase().includes('resume')
  ).length;
  const invoicesCount = storageFiles.filter((f) => 
    f.bucket === 'invoices' || 
    f.related_entity_type?.includes('invoice') || 
    f.original_file_name.toLowerCase().includes('invoice')
  ).length;
  const assetsCount = storageFiles.filter((f) => 
    f.bucket === 'assets' || 
    f.mime_type?.startsWith('image/') || 
    f.related_entity_type === 'asset' || 
    f.related_entity_type === 'logo'
  ).length;
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
    const link = file.download_url || `/api/storage/files/${file.id}/content`;
    if (link) {
      navigator.clipboard.writeText(link.startsWith('http') ? link : `${window.location.origin}${link}`);
      setCopiedId(file.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const handleDelete = async (file: FileRecord) => {
    const msg = `Are you sure you want to delete "${file.original_file_name}"?\n\nThis will permanently delete the file from Supabase Storage and remove its metadata from Supabase PostgreSQL.`;

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
      setUploadProgressMsg(`Uploading "${file.name}" to Supabase Storage...`);

      await uploadStorageFile(file, {
        fileName: file.name,
        relatedEntityType: uploadCategory,
        relatedEntityId: relatedEntityId || undefined,
        uploadedBy: uploaderName || 'Admin (Raajesh V)'
      });

      setUploadProgressMsg(`Successfully stored in Supabase Storage!`);
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
      setUploadProgressMsg(`Replacing file with "${file.name}" in Supabase...`);
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
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <Database className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Supabase Cloud File Storage & Database Registry
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  100% Supabase architecture: <b>Supabase Storage</b> for Resumes, Invoices, Documents & UI Assets • <b>Supabase PostgreSQL</b> for Structured Database
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
            <span className="text-[10px] text-slate-400">{formatFileSize(totalSizeBytes)} stored</span>
          </div>

          <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">Resumes & CVs</span>
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-blue-900 mt-1">{resumesCount}</p>
            <span className="text-[10px] text-blue-600 font-semibold">'resumes' bucket</span>
          </div>

          <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider">Invoices & Docs</span>
              <FolderOpen className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-black text-indigo-900 mt-1">{invoicesCount}</p>
            <span className="text-[10px] text-indigo-600 font-semibold">'invoices' / 'documents'</span>
          </div>

          <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">UI Assets & Logos</span>
              <ImageIcon className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-900 mt-1">{assetsCount}</p>
            <span className="text-[10px] text-emerald-600 font-semibold">'assets' bucket</span>
          </div>
        </div>
      </div>

      {/* Direct Upload Form Card */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-4">
          <Upload className="w-4 h-4 text-[#0A3D91]" />
          Upload & Index New File in Supabase Storage
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">File Category</label>
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="candidate_resume">Candidate Resume (PDF/Doc) &rarr; 'resumes'</option>
              <option value="invoice_pdf">Client Invoice (PDF) &rarr; 'invoices'</option>
              <option value="job_description">Job Description (JD) &rarr; 'documents'</option>
              <option value="document">Corporate Brochure / Document &rarr; 'documents'</option>
              <option value="asset">UI Asset / Image &rarr; 'assets'</option>
              <option value="logo">Company Logo (SVG/PNG) &rarr; 'assets'</option>
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
                Files are uploaded directly to <b>Supabase Storage</b> buckets with full public view/download URLs and indexed in Supabase PostgreSQL
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
            value={selectedBucket}
            onChange={(e) => setSelectedBucket(e.target.value)}
            className="text-xs font-bold px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Storage Buckets</option>
            <option value="resumes">Bucket: resumes</option>
            <option value="invoices">Bucket: invoices</option>
            <option value="documents">Bucket: documents</option>
            <option value="assets">Bucket: assets</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs font-bold px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Categories</option>
            <option value="candidate_resume">Candidate Resumes</option>
            <option value="invoice_pdf">Client Invoices</option>
            <option value="job_description">Job Descriptions</option>
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
            Try adjusting your search query or upload a new file above to register it in Supabase Storage.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">File Name & Type</th>
                  <th className="py-3 px-4">Storage Bucket</th>
                  <th className="py-3 px-4">Category / Link</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Uploaded By</th>
                  <th className="py-3 px-4">Date Added</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredFiles.map((file) => {
                  const bucketName = file.bucket || file.storage_path?.split('/')[0] || 'resumes';
                  const fileUrl = file.download_url || `/api/storage/files/${file.id}/content`;

                  return (
                    <tr key={file.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <span className="p-2 rounded-xl bg-slate-100 shrink-0">
                            {getFileIcon(file.mime_type, file.original_file_name)}
                          </span>
                          <div className="truncate max-w-[220px]">
                            <p className="font-bold text-slate-900 truncate" title={file.original_file_name}>
                              {file.original_file_name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono truncate">
                              {file.storage_path || `resumes/${file.file_name}`}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <Database className="w-3 h-3 text-emerald-600" />
                          Supabase ({bucketName})
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 capitalize">
                            {(file.related_entity_type || 'document').replace(/_/g, ' ')}
                          </span>
                          {file.related_entity_id && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              ID: {file.related_entity_id}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                        {formatFileSize(file.file_size)}
                      </td>

                      <td className="py-3 px-4 text-slate-700">
                        {file.uploaded_by || 'Admin'}
                      </td>

                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {file.created_at ? new Date(file.created_at).toLocaleDateString() : 'Recent'}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Preview / View button */}
                          <button
                            onClick={() => setPreviewFile(file)}
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0A3D91] transition-all cursor-pointer"
                            title="Preview Document"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Direct External Link */}
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                            title="Open URL directly"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          {/* Copy Link */}
                          <button
                            onClick={() => handleCopyLink(file)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                            title="Copy File URL"
                          >
                            {copiedId === file.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Replace File */}
                          <button
                            onClick={() => {
                              setReplacingFileId(file.id);
                              replaceInputRef.current?.click();
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                            title="Replace this file"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete File */}
                          <button
                            onClick={() => handleDelete(file)}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-all cursor-pointer"
                            title="Delete File from Supabase"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file) => {
            const bucketName = file.bucket || file.storage_path?.split('/')[0] || 'resumes';
            const fileUrl = file.download_url || `/api/storage/files/${file.id}/content`;

            return (
              <div
                key={file.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="p-3 rounded-2xl bg-slate-50 shrink-0">
                      {getFileIcon(file.mime_type, file.original_file_name)}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <Database className="w-3 h-3 text-emerald-600" />
                      {bucketName}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 mt-3 truncate" title={file.original_file_name}>
                    {file.original_file_name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 capitalize">
                    {(file.related_entity_type || 'document').replace(/_/g, ' ')}
                  </p>

                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Size:</span>
                      <span className="font-mono font-semibold text-slate-700">{formatFileSize(file.file_size)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Uploader:</span>
                      <span className="font-semibold text-slate-700">{file.uploaded_by || 'Admin'}</span>
                    </div>
                    {file.related_entity_id && (
                      <div className="flex justify-between text-slate-500">
                        <span>Entity ID:</span>
                        <span className="font-mono font-semibold text-slate-700 truncate max-w-[130px]">{file.related_entity_id}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400">
                    {file.created_at ? new Date(file.created_at).toLocaleDateString() : 'Recent'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPreviewFile(file)}
                      className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0A3D91] transition-all cursor-pointer"
                      title="Preview"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                      title="Open URL"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => handleCopyLink(file)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                      title="Copy URL"
                    >
                      {copiedId === file.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleDelete(file)}
                      className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-all cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
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
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                {getFileIcon(previewFile.mime_type, previewFile.original_file_name)}
                <div className="truncate">
                  <h3 className="font-bold text-sm truncate">{previewFile.original_file_name}</h3>
                  <p className="text-[10px] text-slate-400">
                    Stored in Supabase Storage ({previewFile.bucket || 'resumes'}) • {formatFileSize(previewFile.file_size)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewFile.download_url || `/api/storage/files/${previewFile.id}/content`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Full</span>
                </a>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-slate-100 flex items-center justify-center min-h-[420px] p-4">
              {previewFile.mime_type.startsWith('image/') ? (
                <img
                  src={previewFile.download_url || `/api/storage/files/${previewFile.id}/content`}
                  alt={previewFile.original_file_name}
                  className="max-h-[70vh] max-w-full rounded-xl object-contain shadow-md"
                />
              ) : previewFile.mime_type.includes('pdf') || previewFile.original_file_name.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={previewFile.download_url || `/api/storage/files/${previewFile.id}/content`}
                  title="PDF Preview"
                  className="w-full h-[70vh] rounded-xl border border-slate-200 bg-white"
                />
              ) : (
                <div className="text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-xs max-w-md">
                  <FolderArchive className="w-12 h-12 text-[#0A3D91] mx-auto mb-3" />
                  <h4 className="font-black text-slate-900 text-base">{previewFile.original_file_name}</h4>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    This document format cannot be embedded inline. Click below to download or view via your default system viewer.
                  </p>
                  <a
                    href={`/api/storage/files/${previewFile.id}/download`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0A3D91] text-white text-xs font-bold shadow-md hover:bg-[#083275] transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Document</span>
                  </a>
                </div>
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
                <h3 className="font-black text-sm">Supabase Storage & Database SQL Schema</h3>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-950 text-slate-200 font-mono text-xs overflow-auto flex-1 leading-relaxed">
              <pre className="whitespace-pre">{`-- ==============================================================================
-- SUPABASE POSTGRESQL & STORAGE ARCHITECTURE (100% SUPABASE ONLY)
-- Project: Saarthi Solutions (Recruitment & Advisory)
-- ==============================================================================

-- 1. Create Supabase Storage Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('resumes', 'resumes', true),
  ('invoices', 'invoices', true),
  ('documents', 'documents', true),
  ('assets', 'assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Storage RLS Policies
DROP POLICY IF EXISTS "Public Read All Saarthi Buckets" ON storage.objects;
CREATE POLICY "Public Read All Saarthi Buckets"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('resumes', 'invoices', 'documents', 'assets'));

DROP POLICY IF EXISTS "Public & Auth Upload to Saarthi Buckets" ON storage.objects;
CREATE POLICY "Public & Auth Upload to Saarthi Buckets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id IN ('resumes', 'invoices', 'documents', 'assets'));

-- 3. Core Files Metadata Table
CREATE TABLE IF NOT EXISTS public.files (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  file_name TEXT NOT NULL,
  original_file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  storage_provider TEXT NOT NULL DEFAULT 'supabase',
  storage_path TEXT,
  download_url TEXT,
  thumbnail_url TEXT,
  folder_path TEXT DEFAULT 'Saarthi Solutions/',
  related_entity_type TEXT,
  related_entity_id TEXT,
  uploaded_by TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Enable RLS
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public files access" ON public.files FOR ALL USING (true) WITH CHECK (true);`}</pre>
            </div>

            <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Copy and run in <b>Supabase Dashboard &gt; SQL Editor</b> to create buckets and tables.
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', true), ('invoices', 'invoices', true), ('documents', 'documents', true), ('assets', 'assets', true) ON CONFLICT (id) DO UPDATE SET public = true;`);
                  alert('Supabase SQL copied to clipboard!');
                }}
                className="px-4 py-1.5 rounded-xl bg-[#0A3D91] text-white text-xs font-bold hover:bg-[#083275] transition-all cursor-pointer"
              >
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
                <h3 className="font-black text-sm">Supabase Storage Configuration & Environment Status</h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-auto flex-1">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  100% Supabase Unified Storage Architecture
                </div>
                <ul className="text-xs text-emerald-800 mt-2 space-y-1 list-disc list-inside">
                  <li><b>'resumes' Bucket</b>: Candidate resumes & job application CVs (PDF, Word DOC/DOCX).</li>
                  <li><b>'invoices' Bucket</b>: Generated client invoices, billing PDFs, receipts.</li>
                  <li><b>'documents' Bucket</b>: Corporate brochures, company job descriptions (JDs), mandates.</li>
                  <li><b>'assets' Bucket</b>: Company logos, candidate profile photos, reviewer avatars, badges.</li>
                  <li><b>PostgreSQL Database</b>: All structured forms, candidacies, applications, and settings.</li>
                </ul>
              </div>

              <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Supabase Storage Buckets Status</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'resumes', desc: 'Resumes & Applications' },
                  { name: 'invoices', desc: 'Invoices & Billing PDFs' },
                  { name: 'documents', desc: 'JDs & Corporate Brochures' },
                  { name: 'assets', desc: 'Logos, Photos & Avatars' }
                ].map((b, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="font-mono font-bold text-xs text-slate-900">{b.name}</p>
                      <p className="text-[10px] text-slate-500">{b.desc}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Active
                    </span>
                  </div>
                ))}
              </div>

              <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Environment Credentials Checklist</h4>
              <div className="space-y-2">
                {[
                  { name: 'SUPABASE_URL', label: 'Supabase Project Endpoint URL', active: healthStatus?.environment.hasSupabaseUrl },
                  { name: 'SUPABASE_ANON_KEY', label: 'Public Anonymous API Key', active: healthStatus?.environment.hasSupabaseAnonKey },
                  { name: 'SUPABASE_SERVICE_ROLE_KEY', label: 'Service Role Backend Secret Key', active: healthStatus?.environment.hasSupabaseServiceKey }
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
