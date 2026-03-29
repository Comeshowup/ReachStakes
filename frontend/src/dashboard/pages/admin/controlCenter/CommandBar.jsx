/**
 * CommandBar.jsx — ⌘K quick-action overlay.
 * Fuzzy-searches nav items and quick actions. Fully keyboard-navigable.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, LayoutGrid, Target, AlertOctagon, Banknote, Users, CheckCircle,
  ScrollText, Zap, CheckSquare, AlertTriangle, X, Command,
} from 'lucide-react';
import { COMMAND_BAR_ACTIONS } from './mockData';

const ICON_MAP = {
  LayoutGrid, Target, AlertOctagon, Banknote, Users, CheckCircle,
  ScrollText, Zap, CheckSquare, AlertTriangle,
};

const groupOrder = ['Navigate', 'Quick Actions'];

// Simple fuzzy filter: every word of query must appear in label
const fuzzyMatch = (label, query) => {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  return q.split(' ').every(word => label.toLowerCase().includes(word));
};

const ActionRow = ({ action, isActive, onSelect }) => {
  const Icon = ICON_MAP[action.icon] || Zap;
  return (
    <button
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors duration-100 text-left group ${
        isActive ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
      }`}
      onClick={() => onSelect(action)}
    >
      <div className={`p-1.5 rounded-lg shrink-0 transition-colors ${isActive ? 'bg-zinc-700' : 'bg-zinc-800/80 group-hover:bg-zinc-700'}`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <span className="text-sm font-medium truncate">{action.label}</span>
      {action.action && (
        <span className="ml-auto text-[10px] text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded font-mono">quick</span>
      )}
    </button>
  );
};

const CommandBar = ({ open, onClose }) => {
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Filter and flatten for keyboard navigation
  const filtered = COMMAND_BAR_ACTIONS.filter(a => fuzzyMatch(a.label, query));

  const handleSelect = useCallback((action) => {
    if (action.path) navigate(action.path);
    // Quick actions would call an API; for now navigate to best guess path
    if (action.action === 'release_all') navigate('/admin/finance/payouts');
    if (action.action === 'approve_all') navigate('/admin/campaigns/approvals');
    onClose();
    setQuery('');
  }, [navigate, onClose]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, filtered.length - 1)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
      if (e.key === 'Enter')     { e.preventDefault(); if (filtered[activeIdx]) handleSelect(filtered[activeIdx]); }
      if (e.key === 'Escape')    { onClose(); setQuery(''); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, filtered, activeIdx, handleSelect, onClose]);

  // Reset active when results change
  useEffect(() => setActiveIdx(0), [query]);

  // Focus input on open
  useEffect(() => { if (open) { setTimeout(() => inputRef.current?.focus(), 60); } }, [open]);

  // Group filtered items
  const groups = groupOrder
    .map(g => ({ group: g, items: filtered.filter(a => a.group === g) }))
    .filter(g => g.items.length > 0);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => { onClose(); setQuery(''); }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed top-[20vh] left-1/2 -translate-x-1/2 z-[61] w-full max-w-lg"
          >
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-800">
                <Search className="w-4 h-4 text-zinc-500 shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search actions or navigate…"
                  className="flex-1 bg-transparent text-sm text-white placeholder-zinc-600 outline-none"
                  autoComplete="off"
                  spellCheck={false}
                />
                <div className="flex items-center gap-1 shrink-0">
                  <kbd className="text-[10px] font-mono bg-zinc-800 text-zinc-500 border border-zinc-700 px-1.5 py-0.5 rounded">Esc</kbd>
                  <button onClick={() => { onClose(); setQuery(''); }} className="p-0.5 text-zinc-600 hover:text-zinc-400">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto p-2">
                {groups.length === 0 && (
                  <p className="py-8 text-center text-sm text-zinc-600">No results for "{query}"</p>
                )}
                {groups.map(({ group, items }) => {
                  // Compute global index offset for keyboard tracking
                  const groupStart = filtered.indexOf(items[0]);
                  return (
                    <div key={group} className="mb-1">
                      <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-600">{group}</p>
                      {items.map((action, localIdx) => {
                        const globalIdx = groupStart + localIdx;
                        return (
                          <ActionRow
                            key={action.id}
                            action={action}
                            isActive={activeIdx === globalIdx}
                            onSelect={handleSelect}
                          />
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {/* Footer hint */}
              <div className="px-4 py-2.5 border-t border-zinc-800 flex items-center gap-3 text-[10px] text-zinc-700">
                <span><kbd className="font-mono">↑↓</kbd> navigate</span>
                <span><kbd className="font-mono">↵</kbd> select</span>
                <span><kbd className="font-mono">Esc</kbd> close</span>
                <div className="ml-auto flex items-center gap-1">
                  <Command className="w-3 h-3" />
                  <span>K</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommandBar;
