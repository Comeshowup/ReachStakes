import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare, Circle, Clock, User, Plus, Target, AlertTriangle,
  MoreHorizontal, ChevronDown, Calendar, X,
} from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const COLUMNS = [
  { id: 'Todo',       label: 'To Do',      color: 'text-zinc-400', dot: 'bg-zinc-500' },
  { id: 'InProgress', label: 'In Progress', color: 'text-blue-400',  dot: 'bg-blue-500' },
  { id: 'Done',       label: 'Done',        color: 'text-emerald-400', dot: 'bg-emerald-500' },
];

const PRIORITY_MAP = {
  High:   { color: 'text-amber-400', label: '↑ High' },
  Medium: { color: 'text-blue-400',  label: '→ Medium' },
  Low:    { color: 'text-zinc-500',  label: '↓ Low' },
};

const MOCK_TASKS = [
  { id: 1, title: 'Review Nike campaign deliverables', status: 'InProgress', priority: 'High', assignedTo: { name: 'Admin' }, campaign: { title: 'Nike Summer Splash' }, dueDate: new Date(Date.now() + 24 * 3600000).toISOString() },
  { id: 2, title: 'Process Tazapay payout batch', status: 'Todo', priority: 'High', assignedTo: null, campaign: null, dueDate: new Date(Date.now() + 8 * 3600000).toISOString() },
  { id: 3, title: 'Onboard new brand: Zara', status: 'Todo', priority: 'Medium', assignedTo: { name: 'Admin' }, campaign: null, dueDate: null },
  { id: 4, title: 'Resolve Puma content dispute', status: 'InProgress', priority: 'High', assignedTo: { name: 'Admin' }, campaign: { title: 'Puma Run Campaign' }, dueDate: new Date(Date.now() + 4 * 3600000).toISOString() },
  { id: 5, title: 'Update escrow release policy docs', status: 'Todo', priority: 'Low', assignedTo: null, campaign: null, dueDate: null },
  { id: 6, title: 'Creator KYC verification: Emma Wilson', status: 'Done', priority: 'Medium', assignedTo: { name: 'Admin' }, campaign: null, dueDate: null },
  { id: 7, title: 'Send campaign performance report to Adidas', status: 'Done', priority: 'Low', assignedTo: { name: 'Admin' }, campaign: { title: 'Adidas Fall Collection' }, dueDate: null },
];

const Skeleton = ({ className = '' }) => (
  <div className={`bg-zinc-800/60 rounded animate-pulse ${className}`} />
);

const formatDue = (iso) => {
  if (!iso) return null;
  const diff = new Date(iso) - Date.now();
  const hours = Math.floor(diff / 3600000);
  if (diff < 0) return { label: 'Overdue', color: 'text-red-400' };
  if (hours < 4) return { label: `${hours}h`, color: 'text-amber-400' };
  if (hours < 24) return { label: `${hours}h`, color: 'text-zinc-400' };
  return { label: `${Math.floor(hours / 24)}d`, color: 'text-zinc-500' };
};

const TaskCard = ({ task, onStatusChange, onDelete }) => {
  const p = PRIORITY_MAP[task.priority] || PRIORITY_MAP.Medium;
  const due = formatDue(task.dueDate);
  const nextStatus = { Todo: 'InProgress', InProgress: 'Done', Done: 'Todo' };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-3.5 space-y-2.5 group cursor-default transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <button
          onClick={() => onStatusChange(task.id, nextStatus[task.status])}
          className="mt-0.5 shrink-0 text-zinc-700 hover:text-emerald-400 transition-colors"
          title="Advance status"
        >
          {task.status === 'Done'
            ? <CheckSquare className="w-4 h-4 text-emerald-400" />
            : <Circle className="w-4 h-4" />
          }
        </button>
        <p className={`text-sm text-white flex-1 leading-snug ${task.status === 'Done' ? 'line-through text-zinc-600' : ''}`}>
          {task.title}
        </p>
        <button
          onClick={() => onDelete(task.id)}
          className="shrink-0 text-zinc-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-xs font-medium ${p.color}`}>{p.label}</span>
        {task.campaign && (
          <span className="flex items-center gap-1 text-xs text-zinc-600">
            <Target className="w-2.5 h-2.5" />
            <span className="max-w-[100px] truncate">{task.campaign.title}</span>
          </span>
        )}
        {task.assignedTo && (
          <span className="flex items-center gap-1 text-xs text-zinc-600">
            <User className="w-2.5 h-2.5" />{task.assignedTo.name}
          </span>
        )}
        {due && (
          <span className={`ml-auto text-xs ${due.color}`}>
            {due.label}
          </span>
        )}
      </div>
    </motion.div>
  );
};

const TaskBoardPage = () => {
  const queryClient = useQueryClient();
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [addingTo, setAddingTo] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'tasks'],
    queryFn: async () => {
      const { data } = await axios.get(`${API}/api/admin/tasks`, { headers: authHeader() });
      return data;
    },
    staleTime: 30_000,
    retry: 1,
    onSuccess: (d) => { if (d?.data?.length > 0) setTasks(d.data); },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => axios.put(`${API}/api/admin/tasks/${id}`, { status }, { headers: authHeader() }),
    onSuccess: () => queryClient.invalidateQueries(['admin', 'tasks']),
  });

  const handleStatusChange = (id, newStatus) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    updateStatus.mutate({ id, status: newStatus });
  };

  const handleDelete = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleAddTask = (columnId) => {
    if (!newTaskTitle.trim()) return;
    const newTask = {
      id: Date.now(),
      title: newTaskTitle.trim(),
      status: columnId,
      priority: 'Medium',
      assignedTo: null,
      campaign: null,
      dueDate: null,
    };
    setTasks(prev => [...prev, newTask]);
    setNewTaskTitle('');
    setAddingTo(null);
  };

  const tasksByStatus = (colId) => tasks.filter(t => t.status === colId);

  return (
    <div className="space-y-6 max-w-[1280px]">
      <div>
        <h1 className="text-2xl font-bold text-white">Tasks</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Track team tasks — linked to campaigns and issues</p>
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        {COLUMNS.map(col => {
          const colTasks = tasksByStatus(col.id);
          return (
            <div key={col.id} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
              {/* Column header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                  <span className={`text-xs font-semibold uppercase tracking-wide ${col.color}`}>{col.label}</span>
                  <span className="text-xs font-bold text-zinc-600">{colTasks.length}</span>
                </div>
                <button
                  onClick={() => setAddingTo(addingTo === col.id ? null : col.id)}
                  className="p-1 text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 rounded-md transition-colors"
                  title="Add task"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-3 space-y-2 min-h-[120px]">
                {/* Add task input */}
                <AnimatePresence>
                  {addingTo === col.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-zinc-800 rounded-xl p-3 space-y-2">
                        <input
                          autoFocus
                          value={newTaskTitle}
                          onChange={e => setNewTaskTitle(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleAddTask(col.id); if (e.key === 'Escape') setAddingTo(null); }}
                          placeholder="Task title..."
                          className="w-full bg-transparent text-sm text-white placeholder-zinc-600 focus:outline-none"
                        />
                        <div className="flex gap-2">
                          <button onClick={() => handleAddTask(col.id)} className="text-xs px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors">Add</button>
                          <button onClick={() => { setAddingTo(null); setNewTaskTitle(''); }} className="text-xs px-3 py-1.5 text-zinc-500 hover:text-zinc-300 transition-colors">Cancel</button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Task cards */}
                {isLoading && col.id === 'Todo' && Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}

                <AnimatePresence mode="popLayout">
                  {colTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDelete}
                    />
                  ))}
                </AnimatePresence>

                {!isLoading && colTasks.length === 0 && addingTo !== col.id && (
                  <p className="text-xs text-zinc-700 text-center py-6">No tasks</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskBoardPage;
