import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link as LinkIcon, FileText, Loader2, Upload, Save, AlertTriangle, Wifi } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SUBMISSION_STATUS } from '../types/submissions.types.js';
import { useCreateSubmission, useUpdateSubmission } from '../hooks/useSubmissions.js';
import { getConnectedSocialAccounts } from '../api/submissions.api.js';

// ─── Form Field ────────────────────────────────────────────────────────────────

function FormField({ label, required, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
        {label}
        {required && <span className="text-indigo-400">*</span>}
      </label>
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[11px] text-red-400 font-medium"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

function StyledInput({ icon: Icon, ...props }) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
      )}
      <input
        {...props}
        className={cn(
          'w-full bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-600',
          'focus:outline-none focus:ring-1 focus:ring-indigo-500/60 focus:border-indigo-500/40',
          'transition-all duration-150',
          Icon ? 'pl-10 pr-4 py-3' : 'px-4 py-3',
          props.className
        )}
      />
    </div>
  );
}

function StyledTextarea(props) {
  return (
    <textarea
      {...props}
      className={cn(
        'w-full bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-600',
        'focus:outline-none focus:ring-1 focus:ring-indigo-500/60 focus:border-indigo-500/40',
        'transition-all duration-150 resize-none px-4 py-3 leading-relaxed',
        props.className
      )}
    />
  );
}

function DarkSelectTrigger({ className, children, ...props }) {
  return (
    <SelectTrigger
      className={cn(
        'w-full bg-white/5 border border-white/10 rounded-xl text-sm text-white h-11',
        'focus:ring-1 focus:ring-indigo-500/60 focus:border-indigo-500/40',
        'data-[placeholder]:text-slate-600',
        className
      )}
      {...props}
    >
      {children}
    </SelectTrigger>
  );
}

// ─── Validation ────────────────────────────────────────────────────────────────

/** @param {Object} values @param {'draft'|'submitted'} intent */
function validate(values, intent) {
  const errors = {};
  if (!values.platform) errors.platform = 'Platform is required';
  if (!values.type) errors.type = 'Content type is required';
  if (intent === 'submitted' && !values.contentUrl.trim()) {
    errors.contentUrl = 'Content URL is required to submit for review';
  }
  if (values.contentUrl.trim() && !isValidUrl(values.contentUrl.trim())) {
    errors.contentUrl = 'Please enter a valid URL';
  }
  return errors;
}

function isValidUrl(str) {
  try { new URL(str); return true; } catch { return false; }
}

// ─── Default Form State ───────────────────────────────────────────────────────

const DEFAULT_FORM = {
  platform: '',
  type: '',
  contentUrl: '',
  caption: '',
  notes: '',
};

// ─── Main Modal ────────────────────────────────────────────────────────────────

/**
 * @param {{
 *   open: boolean;
 *   onClose: () => void;
 *   campaignId: string;
 *   editingSubmission?: import('../types/submissions.types.js').Submission | null;
 *   resubmittingFrom?: import('../types/submissions.types.js').Submission | null;
 * }} props
 */
const SubmissionFormModal = ({
  open,
  onClose,
  campaignId,
  editingSubmission = null,
  resubmittingFrom = null,
}) => {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState({});

  // Social account connection state
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(false);

  const { mutate: createSubmit, isPending: isCreating } = useCreateSubmission();
  const { mutate: updateSubmit, isPending: isUpdating } = useUpdateSubmission();
  const isPending = isCreating || isUpdating;

  // Pre-populate form if editing or resubmitting
  useEffect(() => {
    if (editingSubmission) {
      setForm({
        platform: editingSubmission.platform,
        type: editingSubmission.type,
        contentUrl: editingSubmission.contentUrl,
        caption: editingSubmission.caption || '',
        notes: editingSubmission.notes || '',
      });
    } else if (resubmittingFrom) {
      setForm({
        platform: resubmittingFrom.platform,
        type: resubmittingFrom.type,
        contentUrl: '',
        caption: resubmittingFrom.caption || '',
        notes: '',
      });
    } else {
      setForm(DEFAULT_FORM);
    }
    setErrors({});
  }, [editingSubmission, resubmittingFrom, open]);

  // Fetch connected social accounts whenever modal opens
  useEffect(() => {
    if (!open) return;
    setAccountsLoading(true);
    const userId = JSON.parse(atob((localStorage.getItem('token') || '').split('.')[1] || 'e30='))?.id;
    if (!userId) { setAccountsLoading(false); return; }
    getConnectedSocialAccounts(userId)
      .then(setConnectedAccounts)
      .catch(() => setConnectedAccounts([]))
      .finally(() => setAccountsLoading(false));
  }, [open]);

  const isAccountConnected = (platform) => {
    const platformMap = { instagram: 'Instagram', youtube: 'YouTube', tiktok: 'TikTok' };
    const backendName = platformMap[platform] || platform;
    return connectedAccounts.some((a) => a.platform === backendName);
  };

  const connectedAccount = (platform) => {
    const platformMap = { instagram: 'Instagram', youtube: 'YouTube', tiktok: 'TikTok' };
    const backendName = platformMap[platform] || platform;
    return connectedAccounts.find((a) => a.platform === backendName);
  };

  const update = useCallback((field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }, []);

  const handleSubmit = useCallback((intent) => {
    const errs = validate(form, intent);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    if (editingSubmission) {
      // Edit in place
      updateSubmit(
        {
          submissionId: editingSubmission.id,
          campaignId,
          updates: {
            platform: form.platform,
            type: form.type,
            contentUrl: form.contentUrl,
            caption: form.caption,
            notes: form.notes,
            status: intent === 'submitted' ? SUBMISSION_STATUS.SUBMITTED : SUBMISSION_STATUS.DRAFT,
          },
        },
        { onSuccess: onClose }
      );
    } else if (resubmittingFrom) {
      // Create new version
      createSubmit(
        {
          campaignId,
          platform: form.platform,
          type: form.type,
          contentUrl: form.contentUrl,
          caption: form.caption,
          notes: form.notes,
          status: SUBMISSION_STATUS.SUBMITTED,
          parentSubmissionId: resubmittingFrom.id,
        },
        { onSuccess: onClose }
      );
    } else {
      // New submission
      createSubmit(
        {
          campaignId,
          platform: form.platform,
          type: form.type,
          contentUrl: form.contentUrl,
          caption: form.caption,
          notes: form.notes,
          status: intent === 'submitted' ? SUBMISSION_STATUS.SUBMITTED : SUBMISSION_STATUS.DRAFT,
          parentSubmissionId: null,
        },
        { onSuccess: onClose }
      );
    }
  }, [form, editingSubmission, resubmittingFrom, campaignId, createSubmit, updateSubmit, onClose]);

  const title = resubmittingFrom
    ? 'Resubmit Content'
    : editingSubmission
    ? 'Edit Submission'
    : 'New Submission';

  const selectedPlatformConnected = !form.platform || isAccountConnected(form.platform);
  const accountForPlatform = connectedAccount(form.platform);
  const submitDisabled = isPending || accountsLoading || (!!form.platform && !selectedPlatformConnected);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="bg-slate-900 border border-white/10 text-white p-0 rounded-2xl overflow-hidden sm:max-w-lg w-full gap-0"
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-white/5 flex-row items-center justify-between">
          <DialogTitle className="text-lg font-bold text-white">{title}</DialogTitle>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </DialogHeader>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 overflow-y-auto max-h-[60vh] custom-scrollbar">
          {/* Platform + Type row */}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Platform" required error={errors.platform}>
              <Select value={form.platform} onValueChange={(v) => update('platform', v)}>
                <DarkSelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </DarkSelectTrigger>
                <SelectContent className="bg-slate-900 border border-white/10 text-white">
                  <SelectItem value="instagram">📸 Instagram</SelectItem>
                  <SelectItem value="youtube">▶️ YouTube</SelectItem>
                  <SelectItem value="tiktok">🎵 TikTok</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Content Type" required error={errors.type}>
              <Select value={form.type} onValueChange={(v) => update('type', v)}>
                <DarkSelectTrigger>
                  <SelectValue placeholder="Select type" />
                </DarkSelectTrigger>
                <SelectContent className="bg-slate-900 border border-white/10 text-white">
                  <SelectItem value="post">Post</SelectItem>
                  <SelectItem value="reel">Reel</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="story">Story</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>

          {/* Social account status banner */}
          {form.platform && !accountsLoading && (
            selectedPlatformConnected ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Wifi className="w-3.5 h-3.5" />
                Connected as @{accountForPlatform?.username || accountForPlatform?.handle || 'your account'}
              </div>
            ) : (
              <div className="flex items-start gap-2.5 p-3 rounded-xl text-xs bg-amber-500/8 border border-amber-500/20 text-amber-300">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
                <p>
                  <span className="font-bold block mb-0.5">{form.platform.charAt(0).toUpperCase() + form.platform.slice(1)} not connected</span>
                  Go to{' '}
                  <a href="/creator/settings" className="underline font-bold text-amber-300">Settings &gt; Social Accounts</a>
                  {' '}to connect your account before submitting.
                </p>
              </div>
            )
          )}
          {form.platform && accountsLoading && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Checking account status...
            </div>
          )}

          {/* Content URL */}
          <FormField label="Content URL" required={!editingSubmission} error={errors.contentUrl}>
            <StyledInput
              icon={LinkIcon}
              type="url"
              value={form.contentUrl}
              onChange={(e) => update('contentUrl', e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              autoFocus={!editingSubmission}
            />
          </FormField>

          {/* Caption */}
          <FormField label="Caption" error={errors.caption}>
            <StyledTextarea
              rows={3}
              value={form.caption}
              onChange={(e) => update('caption', e.target.value)}
              placeholder="Your post caption or description..."
            />
          </FormField>

          {/* Notes to brand */}
          <FormField label="Notes to Brand" error={errors.notes}>
            <StyledTextarea
              rows={2}
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
              placeholder="Anything specific you'd like the brand to know..."
            />
          </FormField>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5 flex items-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-semibold rounded-xl transition-all"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2 ml-auto">
            {/* Save Draft — not shown for resubmit */}
            {!resubmittingFrom && (
              <button
                onClick={() => handleSubmit('draft')}
                disabled={isPending}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-40 text-slate-300 text-sm font-semibold rounded-xl transition-all"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Draft
              </button>
            )}

            {/* Submit */}
            <button
              onClick={() => handleSubmit('submitted')}
              disabled={submitDisabled}
              title={!selectedPlatformConnected ? `Connect your ${form.platform} account first` : undefined}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
            >
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {resubmittingFrom ? 'Resubmit' : 'Submit for Review'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubmissionFormModal;
