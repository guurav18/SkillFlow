import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  File,
  FileText,
  FileArchive,
  FileCode,
  Image as ImageIcon,
  X,
  ExternalLink,
  Download,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { taskService } from '../../services/taskService';

const formatBytes = (bytes, decimals = 1) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const getFileIcon = (file) => {
  const name = file.name || file.filename || '';
  const ext = name.split('.').pop().toLowerCase();
  const mime = file.mimetype || '';

  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext) || mime.startsWith('image/')) {
    return <ImageIcon className="w-4 h-4 text-emerald-400 flex-shrink-0" />;
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext) || mime.includes('zip') || mime.includes('tar')) {
    return <FileArchive className="w-4 h-4 text-amber-400 flex-shrink-0" />;
  }
  if (['pdf'].includes(ext) || mime.includes('pdf')) {
    return <FileText className="w-4 h-4 text-rose-400 flex-shrink-0" />;
  }
  if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'py', 'java', 'cpp'].includes(ext)) {
    return <FileCode className="w-4 h-4 text-cyan-400 flex-shrink-0" />;
  }
  return <File className="w-4 h-4 text-indigo-400 flex-shrink-0" />;
};

export const FileAttachmentUploader = ({
  files = [],
  onChange,
  disabled = false,
  label = 'Attachments',
  hint = 'Upload screenshots, design assets, or code zips (up to 50MB each)',
  maxFiles = 5,
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const inputRef = useRef(null);

  const handleFiles = async (selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    setUploadError('');

    if (files.length + selectedFiles.length > maxFiles) {
      setUploadError(`Maximum ${maxFiles} files allowed.`);
      return;
    }

    setUploading(true);
    try {
      if (selectedFiles.length === 1) {
        const res = await taskService.uploadFile(selectedFiles[0]);
        if (res.file) {
          onChange([...files, res.file]);
        }
      } else {
        const res = await taskService.uploadMultipleFiles(selectedFiles);
        if (res.files) {
          onChange([...files, ...res.files]);
        }
      }
    } catch (err) {
      setUploadError(err.message || 'File upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || uploading) return;
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled || uploading) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleRemove = (index) => {
    const updated = files.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300">{label}</label>
          <span className="text-[11px] text-slate-500">
            {files.length}/{maxFiles} attached
          </span>
        </div>
      )}

      {uploadError && (
        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Drop Zone */}
      {files.length < maxFiles && !disabled && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5 ${
            dragActive
              ? 'border-indigo-500 bg-indigo-500/10'
              : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/40'
          } ${uploading ? 'opacity-70 pointer-events-none' : ''}`}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(Array.from(e.target.files || []))}
            disabled={disabled || uploading}
          />

          {uploading ? (
            <div className="flex items-center gap-2 text-indigo-400 py-1">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-xs font-medium">Uploading attachment(s)...</span>
            </div>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <UploadCloud className="w-4 h-4" />
              </div>
              <div className="text-xs text-slate-300 font-medium">
                <span className="text-indigo-400 font-semibold hover:underline">Click to upload</span> or drag and drop
              </div>
              {hint && <p className="text-[11px] text-slate-500 max-w-sm">{hint}</p>}
            </>
          )}
        </div>
      )}

      {/* Files List */}
      {files.length > 0 && (
        <div className="space-y-1.5 pt-1">
          {files.map((file, idx) => {
            const fileUrl = taskService.getFileUrl(file.url);
            return (
              <div
                key={file._id || file.url || idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition group"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    {getFileIcon(file)}
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-xs font-medium text-slate-200 truncate group-hover:text-indigo-300 transition">
                      {file.name || file.filename || 'Attachment'}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {formatBytes(file.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {fileUrl && (
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition"
                      title="Open / Download"
                      download
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => handleRemove(idx)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Remove file"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
