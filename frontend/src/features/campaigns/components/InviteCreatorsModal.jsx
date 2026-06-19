import React, { useState, useCallback, useDeferredValue } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  Check,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Users,
  DollarSign,
  MessageSquare,
  Eye,
  Instagram,
  Youtube,
  Twitter,
  Send,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAvailableCreators, useInviteCreators } from '../hooks/useCampaigns.js';
import * as brandService from '../../../api/brandService';
import { PLATFORMS, CATEGORIES } from '../types/index.js';

// ─── Helpers ─────────────────────────────────────────────────────

const formatFollowers = (n) => {
  if (!n) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
};

const PlatformIcon = ({ platform }) => {
  const icons = {
    Instagram: Instagram,
    YouTube: Youtube,
    Twitter: Twitter,
    TikTok: () => (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.81a8.18 8.18 0 004.77 1.52V6.88a4.85 4.85 0 01-1-.19z" />
      </svg>
    ),
  };
  const Icon = icons[platform];
  return Icon ? <Icon className="w-3.5 h-3.5" /> : null;
};

const FOLLOWER_RANGES = [
  { label: 'Any', min: null, max: null },
  { label: '<10K', min: null, max: 10_000 },
  { label: '10K–100K', min: 10_000, max: 100_000 },
  { label: '100K–1M', min: 100_000, max: 1_000_000 },
  { label: '1M+', min: 1_000_000, max: null },
];

// ─── Step Indicators ──────────────────────────────────────────────

const STEPS = [
  { label: 'Select', icon: Users },
  { label: 'Deliverables', icon: DollarSign },
  { label: 'Message', icon: MessageSquare },
  { label: 'Review', icon: Eye },
];

const CONTENT_TYPES = [
  'Instagram_Reel','Instagram_Story','TikTok_Video',
  'YouTube_Short','YouTube_Integration','UGC_Video',
  'Product_Review','Testimonial','Static_Post','Custom',
];

const newDeliverable = () => ({
  title: '',
  contentType: '',
  platform: '',
  paymentAmount: '',
  deadline: '',
  requireScript: false,
  requireMockDraft: false,
});

const StepIndicator = ({ currentStep }) => (
  <div className="flex items-center gap-0">
    {STEPS.map((step, i) => {
      const done = i < currentStep;
      const active = i === currentStep;
      const Icon = step.icon;
      return (
        <React.Fragment key={step.label}>
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                done
                  ? 'bg-indigo-600 text-white'
                  : active
                  ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 ring-2 ring-indigo-500'
                  : 'bg-gray-100 text-gray-400 dark:bg-zinc-800 dark:text-zinc-500'
              }`}
            >
              {done ? <Check className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
            </div>
            <span
              className={`text-xs font-medium ${
                active
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : done
                  ? 'text-gray-700 dark:text-zinc-300'
                  : 'text-gray-400 dark:text-zinc-500'
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`flex-1 h-px mx-3 mb-5 transition-all ${
                done ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-zinc-700'
              }`}
              style={{ width: 32 }}
            />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ─── Step 1: Select Creators ──────────────────────────────────────

const Step1SelectCreators = ({ selected, onSelect }) => {
  const [searchInput, setSearchInput] = useState('');
  const [platform, setPlatform] = useState('');
  const [followerRange, setFollowerRange] = useState(0); // index in FOLLOWER_RANGES
  const [category, setCategory] = useState('');

  const search = useDeferredValue(searchInput);
  const range = FOLLOWER_RANGES[followerRange];

  const { data, isLoading } = useAvailableCreators({
    search,
    platform: platform || undefined,
    minFollowers: range.min || undefined,
    maxFollowers: range.max || undefined,
    category: category || undefined,
  });

  const creators = data?.data ?? data?.creators ?? [];

  const toggle = (creator) => {
    onSelect((prev) => {
      const next = new Map(prev);
      if (next.has(creator.id)) next.delete(creator.id);
      else next.set(creator.id, creator);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Search creators by name or handle…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 focus:outline-none"
        >
          <option value="">All Platforms</option>
          {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select
          value={followerRange}
          onChange={(e) => setFollowerRange(Number(e.target.value))}
          className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 focus:outline-none"
        >
          {FOLLOWER_RANGES.map((r, i) => <option key={i} value={i}>{r.label}</option>)}
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 focus:outline-none"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {selected.size > 0 && (
          <span className="px-3 py-1.5 text-xs rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 font-medium">
            {selected.size} selected
          </span>
        )}
      </div>

      {/* Creator List */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-gray-100 dark:border-zinc-800 divide-y divide-gray-50 dark:divide-zinc-800/60 min-h-[240px] max-h-[360px]">
        {isLoading &&
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-zinc-800 animate-pulse" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-gray-100 dark:bg-zinc-800 rounded animate-pulse w-32" />
                <div className="h-3 bg-gray-100 dark:bg-zinc-800 rounded animate-pulse w-20" />
              </div>
            </div>
          ))}

        {!isLoading && creators.length === 0 && (
          <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
            No creators found
          </div>
        )}

        {!isLoading &&
          creators.map((creator) => {
            const profile = creator.creatorProfile;
            const isSelected = selected.has(creator.id);
            const initials = creator.name?.charAt(0)?.toUpperCase() ?? '?';
            const followers = formatFollowers(profile?.followersCount);

            return (
              <button
                key={creator.id}
                onClick={() => toggle(creator)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950/30'
                    : 'hover:bg-gray-50 dark:hover:bg-zinc-800/40'
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                    {profile?.avatarUrl ? (
                      <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  {isSelected && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {creator.name}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1.5">
                    <PlatformIcon platform={profile?.primaryPlatform} />
                    @{profile?.handle || '—'} · {followers}
                  </p>
                </div>

                {/* Category pill */}
                {profile?.category && (
                  <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400">
                    {profile.category}
                  </span>
                )}
              </button>
            );
          })}
      </div>
    </div>
  );
};

// ─── Step 2: Structured Deliverable Builder ───────────────────────

const DeliverableRow = ({ d, i, total, onChange, onRemove }) => (
  <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.15)' }}>
    <div className="flex items-center justify-between">
      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Deliverable {i + 1}</span>
      {total > 1 && (
        <button onClick={() => onRemove(i)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>

    {/* Title */}
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1">Title <span className="text-red-500">*</span></label>
      <input
        placeholder="e.g. Instagram Reel — Product Review"
        value={d.title}
        onChange={e => onChange(i, 'title', e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>

    {/* Content Type + Platform */}
    <div className="grid grid-cols-2 gap-2">
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1">Content Type</label>
        <select value={d.contentType} onChange={e => onChange(i, 'contentType', e.target.value)}
          className="w-full px-2 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">— Select —</option>
          {CONTENT_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1">Platform</label>
        <select value={d.platform} onChange={e => onChange(i, 'platform', e.target.value)}
          className="w-full px-2 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">— Select —</option>
          {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
    </div>

    {/* Payment + Deadline */}
    <div className="grid grid-cols-2 gap-2">
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1">Payment ($)</label>
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
          <input type="number" min="0" placeholder="500" value={d.paymentAmount}
            onChange={e => onChange(i, 'paymentAmount', e.target.value)}
            className="w-full pl-6 pr-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1">Deadline</label>
        <input type="date" value={d.deadline} onChange={e => onChange(i, 'deadline', e.target.value)}
          className="w-full px-2 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>
    </div>

    {/* Workflow flags */}
    <div className="flex items-center gap-4">
      {[['requireScript','Require Script'],['requireMockDraft','Require Mock Draft']].map(([key,label]) => (
        <label key={key} className="flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" checked={d[key]} onChange={e => onChange(i, key, e.target.checked)}
            className="w-3.5 h-3.5 rounded accent-indigo-600" />
          <span className="text-xs text-gray-600 dark:text-zinc-400">{label}</span>
        </label>
      ))}
    </div>
  </div>
);

const Step2OfferSetup = ({ offer, setOffer, errors }) => {
  const [templates, setTemplates] = React.useState([]);

  React.useEffect(() => {
    brandService.getTemplates()
      .then(res => {
        if (res.status === 'success') {
          setTemplates(res.data || []);
        }
      })
      .catch(err => console.error('Error fetching templates in invite modal:', err));
  }, []);

  const updateDeliverable = (i, key, val) =>
    setOffer(prev => ({ ...prev, structuredDeliverables: prev.structuredDeliverables.map((d, idx) => idx === i ? { ...d, [key]: val } : d) }));

  const addDeliverable = () =>
    setOffer(prev => ({ ...prev, structuredDeliverables: [...prev.structuredDeliverables, newDeliverable()] }));

  const addFromTemplate = (templateId) => {
    if (!templateId) return;
    const t = templates.find(temp => temp.id === parseInt(templateId));
    if (!t) return;
    const newD = {
      title: t.name,
      contentType: t.contentType || '',
      platform: t.platform || '',
      paymentAmount: '',
      deadline: '',
      requireScript: t.requireScript || false,
      requireMockDraft: t.requireMockDraft || false,
    };
    setOffer(prev => {
      // If the first item is empty, replace it, otherwise append.
      const current = prev.structuredDeliverables;
      if (current.length === 1 && !current[0].title.trim() && !current[0].paymentAmount) {
        return { ...prev, structuredDeliverables: [newD] };
      }
      return { ...prev, structuredDeliverables: [...current, newD] };
    });
  };

  const removeDeliverable = (i) =>
    setOffer(prev => ({ ...prev, structuredDeliverables: prev.structuredDeliverables.filter((_, idx) => idx !== i) }));

  const totalPay = offer.structuredDeliverables.reduce((s, d) => s + (parseFloat(d.paymentAmount) || 0), 0);

  return (
    <div className="space-y-4">
      {/* Pricing model */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1">Payment Model</label>
          <select value={offer.pricingModel} onChange={e => setOffer(prev => ({ ...prev, pricingModel: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="flat_fee">Flat per video</option>
            <option value="cpm">CPM based</option>
            <option value="milestone">Milestone based</option>
          </select>
        </div>
        {totalPay > 0 && (
          <div className="flex flex-col justify-end">
            <p className="text-xs text-gray-500 dark:text-zinc-400">Total offer</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">${totalPay.toLocaleString()}</p>
          </div>
        )}
      </div>

      {/* Templates select */}
      {templates.length > 0 && (
        <div className="bg-slate-50 dark:bg-zinc-800/40 p-3 rounded-xl border border-gray-100 dark:border-zinc-800 flex items-center justify-between gap-4">
          <div className="shrink-0">
            <p className="text-xs font-semibold text-gray-700 dark:text-zinc-300">Deliverable Templates</p>
            <p className="text-[10px] text-gray-500 dark:text-zinc-500">Pre-fill standard task settings</p>
          </div>
          <select
            onChange={e => {
              addFromTemplate(e.target.value);
              e.target.value = '';
            }}
            className="px-2 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-gray-800 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-[200px]"
          >
            <option value="">— Select Template —</option>
            {templates.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Deliverable cards */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {offer.structuredDeliverables.map((d, i) => (
          <DeliverableRow key={i} d={d} i={i} total={offer.structuredDeliverables.length}
            onChange={updateDeliverable} onRemove={removeDeliverable} />
        ))}
      </div>

      {errors?.deliverables && <p className="text-xs text-red-500">{errors.deliverables}</p>}

      <button onClick={addDeliverable}
        className="flex items-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors">
        <Plus className="w-3.5 h-3.5" /> Add Deliverable
      </button>
    </div>
  );
};

// ─── Step 3: Message ──────────────────────────────────────────────

const DEFAULT_MESSAGE =
  "Hi, we'd like to invite you to collaborate on this campaign. We think you'd be a great fit and look forward to working together!";

const Step3Message = ({ message, setMessage }) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
        Personalised Message <span className="text-gray-400 text-xs">(optional)</span>
      </label>
      <span className="text-xs text-gray-400">{message.length} / 500</span>
    </div>
    <textarea
      rows={6}
      maxLength={500}
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
      placeholder={DEFAULT_MESSAGE}
    />
    <p className="text-xs text-gray-400">
      This message will be sent to all selected creators alongside the offer details.
    </p>
  </div>
);

// ─── Step 4: Review ───────────────────────────────────────────────

const Step4Review = ({ selected, offer, message }) => (
  <div className="space-y-5">
    {/* Creators */}
    <div>
      <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase mb-2">
        {selected.size} Creator{selected.size !== 1 ? 's' : ''}
      </p>
      <div className="flex flex-wrap gap-2">
        {Array.from(selected.values()).map((creator) => {
          const profile = creator.creatorProfile;
          return (
            <div
              key={creator.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-sm text-gray-700 dark:text-zinc-300"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  creator.name?.charAt(0)
                )}
              </div>
              {creator.name}
            </div>
          );
        })}
      </div>
    </div>

    {/* Offer */}
    <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-4 space-y-2.5">
      <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase mb-1">Offer</p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">${Number(offer.amount).toLocaleString()}</span>
        <span className="text-sm text-gray-500">{offer.pricingModel.replace('_', ' ')}</span>
      </div>
      {Number(offer.estimatedViews) > 0 && (
        <p className="text-xs text-gray-500 dark:text-zinc-400">
          {Number(offer.estimatedViews).toLocaleString()} estimated views · ${(Number(offer.amount) / Number(offer.estimatedViews) * 1000).toFixed(2)} CPM
        </p>
      )}
      <div>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mb-1">Deliverables</p>
        <div className="flex flex-wrap gap-1.5">
          {offer.deliverables.filter(Boolean).map((d, i) => (
            <span key={i} className="text-xs px-2 py-1 rounded-lg bg-white dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 text-gray-700 dark:text-zinc-300">
              {d}
            </span>
          ))}
        </div>
      </div>
      {offer.deadline && (
        <p className="text-xs text-gray-500 dark:text-zinc-400">
          Deadline: <span className="text-gray-700 dark:text-zinc-200">{new Date(offer.deadline).toLocaleDateString()}</span>
        </p>
      )}
    </div>

    {/* Message */}
    {message && (
      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase mb-2">Message</p>
        <p className="text-sm text-gray-700 dark:text-zinc-300 bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-4 italic">
          "{message}"
        </p>
      </div>
    )}
  </div>
);

// ─── Main Modal ───────────────────────────────────────────────────

const InviteCreatorsModal = ({ campaignId, isOpen, onClose }) => {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(new Map()); // id → creator
  const [offer, setOffer] = useState({
    pricingModel: 'flat_fee',
    amount: '',
    estimatedViews: '',
    deliverables: [''],   // legacy plain-text (kept for backward compat)
    structuredDeliverables: [newDeliverable()], // new structured format
    deadline: '',
  });
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [errors, setErrors] = useState({});

  const inviteMutation = useInviteCreators(campaignId);

  const reset = useCallback(() => {
    setStep(0);
    setSelected(new Map());
    setOffer({ pricingModel: 'flat_fee', amount: '', estimatedViews: '', deliverables: [''], structuredDeliverables: [newDeliverable()], deadline: '' });
    setMessage(DEFAULT_MESSAGE);
    setErrors({});
  }, []);

  const handleClose = () => {
    reset();
    onClose();
  };

  const validateStep = (stepIndex) => {
    if (stepIndex === 0) {
      if (selected.size === 0) { toast.error('Select at least one creator'); return false; }
    }
    if (stepIndex === 1) {
      const errs = {};
      const valid = offer.structuredDeliverables.filter(d => d.title.trim());
      if (valid.length === 0) errs.deliverables = 'Add at least one deliverable with a title';
      setErrors(errs);
      return Object.keys(errs).length === 0;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep((s) => s + 1);
  };

  const handleBack = () => {
    setErrors({});
    setStep((s) => s - 1);
  };

  const handleSend = async () => {
    const validStructured = offer.structuredDeliverables.filter(d => d.title.trim());
    const totalPay = validStructured.reduce((s, d) => s + (parseFloat(d.paymentAmount) || 0), 0);
    const payload = {
      creatorIds: Array.from(selected.keys()),
      offer: {
        amount: totalPay || Number(offer.amount) || 0,
        proposedPrice: totalPay || Number(offer.amount) || 0,
        pricingModel: offer.pricingModel,
        estimatedViews: offer.estimatedViews ? Number(offer.estimatedViews) : undefined,
        // Legacy plain-text deliverables (backward compat)
        deliverables: validStructured.map(d => d.title),
        // New structured deliverables — backend creates Deliverable records
        structuredDeliverables: validStructured.map(d => ({
          title: d.title,
          contentType: d.contentType || null,
          platform: d.platform || null,
          paymentAmount: d.paymentAmount ? parseFloat(d.paymentAmount) : null,
          deadline: d.deadline || null,
          requireScript: d.requireScript,
          requireMockDraft: d.requireMockDraft,
        })),
        deadline: validStructured[0]?.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
      message: message || undefined,
    };

    inviteMutation.mutate(payload, {
      onSuccess: () => {
        toast.success(`Invited ${selected.size} creator${selected.size > 1 ? 's' : ''} successfully`);
        handleClose();
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message || 'Failed to send invites');
      },
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Invite Creators
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {STEPS[step].label} — step {step + 1} of {STEPS.length}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stepper */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/20">
              <StepIndicator currentStep={step} />
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.18 }}
                >
                  {step === 0 && (
                    <Step1SelectCreators selected={selected} onSelect={setSelected} />
                  )}
                  {step === 1 && (
                    <Step2OfferSetup offer={offer} setOffer={setOffer} errors={errors} />
                  )}
                  {step === 2 && (
                    <Step3Message message={message} setMessage={setMessage} />
                  )}
                  {step === 3 && (
                    <Step4Review selected={selected} offer={offer} message={message} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/20">
              {step > 0 ? (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <div />
              )}

              {step < STEPS.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={inviteMutation.isPending}
                  className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {inviteMutation.isPending ? (
                    <>
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Send Invites
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default InviteCreatorsModal;
