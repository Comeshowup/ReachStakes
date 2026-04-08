import React, { useState, useRef, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Send, Loader2, Briefcase, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useComments, useCreateComment } from '../hooks/useSubmissions.js';

// ─── Role Avatar ──────────────────────────────────────────────────────────────

function RoleAvatar({ role }) {
  const isBrand = role === 'brand';
  return (
    <div
      className={cn(
        'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border',
        isBrand
          ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
          : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400'
      )}
    >
      {isBrand ? <Briefcase className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
    </div>
  );
}

// ─── Comment Bubble ───────────────────────────────────────────────────────────

function CommentBubble({ comment }) {
  const isBrand = comment.role === 'brand';

  return (
    <div className={cn('flex gap-2.5', isBrand ? 'flex-row' : 'flex-row-reverse')}>
      <RoleAvatar role={comment.role} />

      <div className={cn('flex flex-col gap-1 max-w-[80%]', isBrand ? 'items-start' : 'items-end')}>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            {isBrand ? 'Brand' : 'You'}
          </span>
          <span className="text-[10px] text-slate-700">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </span>
        </div>

        <div
          className={cn(
            'px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed',
            isBrand
              ? 'bg-slate-800/80 text-slate-200 rounded-tl-sm border border-white/5'
              : 'bg-indigo-600/80 text-white rounded-tr-sm'
          )}
        >
          {comment.message}
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CommentSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1].map((i) => (
        <div key={i} className={cn('flex gap-2.5', i % 2 === 0 ? 'flex-row' : 'flex-row-reverse')}>
          <div className="w-7 h-7 rounded-full bg-slate-800/80 animate-pulse flex-shrink-0" />
          <div className={cn('space-y-1.5', i % 2 === 0 ? 'items-start' : 'items-end flex flex-col')}>
            <div className="h-2.5 w-20 bg-slate-800/60 rounded animate-pulse" />
            <div className="h-10 w-48 bg-slate-800/60 rounded-2xl animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Comments ────────────────────────────────────────────────────────────

/**
 * @param {{
 *   submissionId: string;
 * }} props
 */
const SubmissionComments = ({ submissionId }) => {
  const [message, setMessage] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const { data: comments = [], isLoading } = useComments(submissionId);
  const { mutate: sendComment, isPending: isSending } = useCreateComment();

  // Scroll to bottom when new comment arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments.length]);

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed || isSending) return;

    sendComment({
      submissionId,
      userId: 'creator-user-1',
      role: 'creator',
      message: trimmed,
    });

    setMessage('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Comment list */}
      <div className="space-y-3 min-h-[80px]">
        {isLoading ? (
          <CommentSkeleton />
        ) : comments.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-xs text-slate-600">No comments yet. Start the conversation.</p>
          </div>
        ) : (
          <>
            {comments.map((comment) => (
              <CommentBubble key={comment.id} comment={comment} />
            ))}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="flex items-end gap-2 pt-3 border-t border-white/5">
        <RoleAvatar role="creator" />
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a message... (Enter to send)"
            rows={1}
            className={cn(
              'w-full bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-600',
              'focus:outline-none focus:ring-1 focus:ring-indigo-500/60 focus:border-indigo-500/40',
              'transition-all duration-150 resize-none pl-3.5 pr-10 py-2.5 leading-relaxed',
              'max-h-28 overflow-y-auto'
            )}
            style={{ minHeight: '42px' }}
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || isSending}
            className={cn(
              'absolute right-2 bottom-2 w-7 h-7 rounded-lg flex items-center justify-center transition-all',
              message.trim() && !isSending
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                : 'bg-white/5 text-slate-600 cursor-default'
            )}
          >
            {isSending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmissionComments;
