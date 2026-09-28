import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import {
  Calendar,
  User,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  CheckCheck,
  ExternalLink,
  Download,
  FileCheck2,
  Paperclip,
  Edit2,
  Globe,
  Github,
  Figma,
  FileText,
  FileArchive,
  Image as ImageIcon,
  FileCode,
  File,
} from 'lucide-react';
import { taskService } from '../../services/taskService';

const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getFileIcon = (file) => {
  const name = file.name || file.filename || '';
  const ext = name.split('.').pop().toLowerCase();
  const mime = file.mimetype || '';

  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext) || mime.startsWith('image/')) {
    return <ImageIcon className="w-4 h-4 text-emerald-400 flex-shrink-0" />;
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext) || mime.includes('zip')) {
    return <FileArchive className="w-4 h-4 text-amber-400 flex-shrink-0" />;
  }
  if (['pdf'].includes(ext) || mime.includes('pdf')) {
    return <FileText className="w-4 h-4 text-rose-400 flex-shrink-0" />;
  }
  if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'py'].includes(ext)) {
    return <FileCode className="w-4 h-4 text-cyan-400 flex-shrink-0" />;
  }
  return <File className="w-4 h-4 text-indigo-400 flex-shrink-0" />;
};

const getLinkIcon = (label = '', url = '') => {
  const str = (label + ' ' + url).toLowerCase();
  if (str.includes('github')) return <Github className="w-3.5 h-3.5 text-slate-300" />;
  if (str.includes('figma')) return <Figma className="w-3.5 h-3.5 text-purple-400" />;
  return <Globe className="w-3.5 h-3.5 text-indigo-400" />;
};

export const TaskDetailsModal = ({
  isOpen,
  onClose,
  task,
  isClient = false,
  isFreelancer = false,
  onApprove,
  onRequestChanges,
  onOpenSubmitReview,
  onEditTask,
  actionLoading = false,
}) => {
  if (!task) return null;

  const deliverables = task.deliverables || {};
  const hasDeliverables =
    deliverables.notes ||
    (deliverables.links && deliverables.links.length > 0) ||
    (deliverables.attachments && deliverables.attachments.length > 0);

  const statusConfig = {
    todo: { label: 'To Do', bg: 'bg-slate-800 text-slate-300 border-slate-700' },
    in_progress: { label: 'In Progress', bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' },
    review: { label: 'Under Review', bg: 'bg-purple-500/10 text-purple-300 border-purple-500/30' },
    done: { label: 'Completed', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  }[task.status] || { label: task.status, bg: 'bg-slate-800 text-slate-300 border-slate-700' };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Task Details & Deliverables"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Header Badges & Meta */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${statusConfig.bg}`}
            >
              {statusConfig.label}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                task.priority === 'high'
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : task.priority === 'medium'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}
            >
              {task.priority} Priority
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            {task.dueDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Due: {formatDate(task.dueDate)}</span>
              </div>
            )}
            {task.assignedTo && (
              <div className="flex items-center gap-1.5 text-indigo-400 font-medium">
                <User className="w-3.5 h-3.5" />
                <span>{task.assignedTo.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Task Title & Description */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-100 mb-2 leading-snug">
            {task.title}
          </h3>
          {task.description ? (
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80">
              {task.description}
            </p>
          ) : (
            <p className="text-xs text-slate-500 italic">No description provided for this task.</p>
          )}
        </div>

        {/* Changes Requested Banner */}
        {task.changesRequested && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-xs text-amber-400">
              <AlertTriangle className="w-4 h-4" /> Client Feedback & Changes Requested
            </div>
            {task.reviewComment && (
              <p className="text-xs text-slate-200 italic bg-amber-950/30 p-2.5 rounded-lg border border-amber-500/20">
                "{task.reviewComment}"
              </p>
            )}
            {task.reviewedAt && (
              <p className="text-[10px] text-amber-400/80">
                Requested on {formatDate(task.reviewedAt)}
              </p>
            )}
          </div>
        )}

        {/* General Task Specifications / Attachments */}
        {task.attachments && task.attachments.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Paperclip className="w-3.5 h-3.5 text-indigo-400" />
              Task Specifications & Assets ({task.attachments.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {task.attachments.map((file, idx) => {
                const fileUrl = taskService.getFileUrl(file.url);
                return (
                  <div
                    key={file._id || idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                        {getFileIcon(file)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-slate-200 truncate">{file.name}</p>
                        <p className="text-[10px] text-slate-500">{formatBytes(file.size)}</p>
                      </div>
                    </div>
                    {fileUrl && (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition"
                        title="Download file"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Deliverables Section (Highlighted Box) */}
        {hasDeliverables ? (
          <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-3.5">
            <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2.5">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs sm:text-sm font-bold text-slate-100">
                  Submitted Deliverables
                </h4>
              </div>
              {deliverables.submittedAt && (
                <span className="text-[11px] text-indigo-300">
                  Submitted {formatDate(deliverables.submittedAt)}
                </span>
              )}
            </div>

            {/* Notes */}
            {deliverables.notes && (
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Work Summary & Notes:
                </span>
                <p className="text-xs text-slate-200 bg-slate-900/80 p-3 rounded-lg border border-slate-800 whitespace-pre-wrap leading-relaxed">
                  {deliverables.notes}
                </p>
              </div>
            )}

            {/* Links */}
            {deliverables.links && deliverables.links.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 block">
                  Deliverable Links:
                </span>
                <div className="flex flex-wrap gap-2">
                  {deliverables.links.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-indigo-500/30 text-indigo-300 hover:text-white hover:bg-indigo-600/30 text-xs font-medium transition"
                    >
                      {getLinkIcon(link.label, link.url)}
                      <span>{link.label || 'View Deliverable'}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Deliverable Files */}
            {deliverables.attachments && deliverables.attachments.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 block">
                  Attached Files ({deliverables.attachments.length}):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {deliverables.attachments.map((file, idx) => {
                    const fileUrl = taskService.getFileUrl(file.url);
                    return (
                      <div
                        key={file._id || idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                            {getFileIcon(file)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-slate-200 truncate">{file.name}</p>
                            <p className="text-[10px] text-slate-500">{formatBytes(file.size)}</p>
                          </div>
                        </div>
                        {fileUrl && (
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition"
                            title="Download deliverable"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : task.status === 'review' ? (
          <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span>This task has been submitted for review.</span>
          </div>
        ) : null}

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2">
            {onEditTask && (isClient || task.status === 'todo' || task.status === 'in_progress') && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  onClose();
                  onEditTask(task);
                }}
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* If Client & task in review: Show Approve & Request Changes */}
            {isClient && task.status === 'review' && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onRequestChanges(task);
                  }}
                  disabled={actionLoading}
                  className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Request Changes
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={async () => {
                    await onApprove(task._id);
                    onClose();
                  }}
                  loading={actionLoading}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Approve & Complete
                </Button>
              </>
            )}

            {/* If Freelancer & task in_progress: Show Submit for Review */}
            {isFreelancer && (task.status === 'in_progress' || task.changesRequested) && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onClose();
                  onOpenSubmitReview(task);
                }}
                className="glow-indigo"
              >
                <FileCheck2 className="w-3.5 h-3.5" /> Submit Deliverables
              </Button>
            )}

            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
