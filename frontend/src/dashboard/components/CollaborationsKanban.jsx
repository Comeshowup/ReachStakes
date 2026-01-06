import React, { useState } from "react";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion, AnimatePresence } from "framer-motion";
import {
    MoreHorizontal,
    Plus,
    MessageSquare,
    Clock,
    CheckCircle2,
    Play,
    FileText,
    AlertCircle,
    DollarSign,
    UploadCloud,
    CornerUpRight
} from "lucide-react";

// --- Configuration ---
const COLUMNS = [
    { id: "applied", title: "Applied", icon: Plus, color: "text-blue-400", glow: "shadow-blue-500/20", borderColor: "border-blue-500/20" },
    { id: "negotiating", title: "Negotiating", icon: MessageSquare, color: "text-purple-400", glow: "shadow-purple-500/20", borderColor: "border-purple-500/20" },
    { id: "submitted", title: "Content Submitted", icon: UploadCloud, color: "text-orange-400", glow: "shadow-orange-500/20", borderColor: "border-orange-500/20" },
    { id: "changes", title: "Changes Requested", icon: AlertCircle, color: "text-amber-400", glow: "shadow-amber-500/20", borderColor: "border-amber-500/20" },
    { id: "approved", title: "Approved", icon: CheckCircle2, color: "text-emerald-400", glow: "shadow-emerald-500/20", borderColor: "border-emerald-500/20" },
    { id: "paid", title: "Paid", icon: DollarSign, color: "text-teal-400", glow: "shadow-teal-500/20", borderColor: "border-teal-500/20" },
];

const INITIAL_TASKS = [
    { id: '1', creator: "Sarah Jenkins", handle: "@SarahJ", avatar: "https://i.pravatar.cc/150?u=1", status: "applied", price: "$500", date: "2h", platform: "YouTube", online: true },
    { id: '2', creator: "Mike Tech", handle: "@MikeTech", avatar: "https://i.pravatar.cc/150?u=2", status: "negotiating", price: "$1,200", date: "1d", platform: "TikTok", online: false },
    { id: '3', creator: "Beauty Guru", handle: "@BeautyGuru", avatar: "https://i.pravatar.cc/150?u=3", status: "submitted", price: "$850", date: "3h", hasContent: true, thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&q=80", platform: "Instagram", online: true },
    { id: '4', creator: "Gamer X", handle: "@GamerX", avatar: "https://i.pravatar.cc/150?u=4", status: "approved", price: "$2,000", date: "5d", platform: "YouTube", online: true },
    { id: '5', creator: "Yoga Life", handle: "@YogaLife", avatar: "https://i.pravatar.cc/150?u=5", status: "changes", price: "$600", date: "1d", platform: "TikTok", online: true },
    { id: '6', creator: "Travel Tom", handle: "@TravelTom", avatar: "https://i.pravatar.cc/150?u=6", status: "applied", price: "$750", date: "4h", platform: "Instagram", online: false },
    { id: '7', creator: "Crypto King", handle: "@CryptoKing", avatar: "https://i.pravatar.cc/150?u=8", status: "paid", price: "$3,500", date: "1w", platform: "YouTube", online: true },
];

// --- Components ---

const TaskCard = ({ task, isOverlay }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task.id, data: { type: "Task", task } });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="opacity-30 bg-indigo-500/10 border-2 border-indigo-500/50 rounded-2xl h-32"
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`group relative w-full bg-[#18181B] border border-white/5 hover:border-indigo-500/50 rounded-2xl p-4 cursor-grab active:cursor-grabbing overflow-hidden transition-all ${isOverlay ? "shadow-[0_0_30px_-5px_rgba(99,102,241,0.6)] scale-105 rotate-2 z-50 ring-1 ring-indigo-500/50" : "hover:shadow-lg hover:shadow-black/50"}`}
        >
            {/* Quick Actions Overlay */}
            <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0 z-20">
                <button className="p-1.5 bg-slate-800/80 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400 rounded-lg backdrop-blur-sm transition-colors border border-white/5">
                    <CornerUpRight size={14} />
                </button>
            </div>

            <div className="flex items-start gap-4 mb-3 relative max-w-[85%]">
                {/* Avatar with Neon Status Ring */}
                <div className="relative shrink-0">
                    <div className={`absolute -inset-1 rounded-full opacity-50 blur-sm ${task.online ? 'bg-emerald-500' : 'bg-slate-500'}`}></div>
                    <img
                        src={task.avatar}
                        alt={task.creator}
                        className="relative w-12 h-12 rounded-full object-cover border-2 border-[#18181B]"
                    />
                    <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#18181B] ${task.online ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-slate-600'}`}></div>
                </div>

                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-100 text-sm truncate">{task.creator}</h4>
                    <p className="text-xs text-slate-400 truncate font-medium">{task.handle}</p>

                    {/* Price Tag Pill */}
                    <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                        <span className="text-[10px] font-mono text-indigo-300 tracking-wider font-bold">{task.price}</span>
                    </div>
                </div>
            </div>

            {/* Content Preview */}
            {task.hasContent && (
                <div className="relative mt-2 mb-3 group/video rounded-xl overflow-hidden border border-white/5 bg-black/30">
                    <div className="absolute inset-0 bg-black/40 group-hover/video:bg-black/20 transition-colors z-10" />
                    <img src={task.thumbnail} alt="Content Thumbnail" className="w-full h-24 object-cover transform group-hover/video:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover/video:scale-110 transition-transform">
                            <Play size={12} className="fill-white text-white ml-0.5" />
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                    <Clock size={12} />
                    {task.date}
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-white/5 text-slate-400 border border-white/5">
                        {task.platform}
                    </span>
                </div>
            </div>
        </div>
    );
};

const Column = ({ column, tasks }) => {
    const { setNodeRef, isOver } = useSortable({
        id: column.id,
        data: { type: "Column", column },
    });

    return (
        <div
            ref={setNodeRef}
            className={`flex flex-col min-w-[280px] w-[300px] h-full rounded-2xl border transition-all duration-300 ${isOver
                ? "bg-white/[0.04] border-indigo-500/30 shadow-[0_0_30px_-10px_rgba(99,102,241,0.2)] scale-[1.01]"
                : "bg-[#09090B]/40 border-white/5 hover:border-white/10"
                }`}
        >
            {/* Header */}
            <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg bg-slate-900/50 border border-white/5 ${column.color} shadow-lg ${isOver ? 'shadow-indigo-500/20' : ''}`}>
                        <column.icon size={14} strokeWidth={2.5} />
                    </div>
                    <h3 className="font-bold text-slate-200 text-xs tracking-wide">{column.title}</h3>
                    <div className="px-1.5 py-0.5 rounded-full bg-slate-800 border border-white/5">
                        <span className={`text-[10px] font-extrabold ${column.color}`}>
                            {tasks.length}
                        </span>
                    </div>
                </div>
                <button className="p-1 text-slate-500 hover:text-white hover:bg-white/10 rounded transition-colors">
                    <MoreHorizontal size={14} />
                </button>
            </div>

            {/* Task List */}
            <div className="flex-1 p-2 overflow-y-auto custom-scrollbar flex flex-col gap-2">
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map((task) => (
                        <TaskCard key={task.id} task={task} />
                    ))}
                </SortableContext>
                {tasks.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-700/50 min-h-[100px] border-2 border-dashed border-white/5 rounded-xl m-1">
                        <p className="text-[10px] font-medium">Drop items here</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const CollaborationsKanban = () => {
    const [tasks, setTasks] = useState(INITIAL_TASKS);
    const [activeTask, setActiveTask] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const onDragStart = (event) => {
        if (event.active.data.current?.type === "Task") {
            setActiveTask(event.active.data.current.task);
        }
    };

    const onDragOver = (event) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveTask = active.data.current?.type === "Task";
        const isOverTask = over.data.current?.type === "Task";
        const isOverColumn = over.data.current?.type === "Column";

        if (!isActiveTask) return;

        // Dropping Task over another Task
        if (isActiveTask && isOverTask) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId);
                const overIndex = tasks.findIndex((t) => t.id === overId);

                if (tasks[activeIndex].status !== tasks[overIndex].status) {
                    // Check if moved to different column but hovered over a card
                    const newTasks = [...tasks];
                    newTasks[activeIndex].status = tasks[overIndex].status;
                    return arrayMove(newTasks, activeIndex, overIndex);
                }

                return arrayMove(tasks, activeIndex, overIndex);
            });
        }

        // Dropping Task over a Column (Empty area)
        if (isActiveTask && isOverColumn) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId);
                const newStatus = over.id; // Column ID

                if (tasks[activeIndex].status !== newStatus) {
                    const newTasks = [...tasks];
                    newTasks[activeIndex].status = newStatus;
                    return arrayMove(newTasks, activeIndex, activeIndex);
                }
                return tasks;
            });
        }
    };

    const onDragEnd = (event) => {
        setActiveTask(null);
    };

    const dropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
        >
            <div className="h-full flex gap-3 overflow-x-auto pb-4 pt-4 px-6 snap-x snap-mandatory">
                {COLUMNS.map((col) => (
                    <div key={col.id} className="snap-start h-full">
                        <Column
                            column={col}
                            tasks={tasks.filter((t) => t.status === col.id)}
                        />
                    </div>
                ))}
                {/* Spacer to allow scrolling past last column */}
                <div className="min-w-6" />
            </div>

            <DragOverlay dropAnimation={dropAnimation}>
                {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
            </DragOverlay>
        </DndContext>
    );
};

export default CollaborationsKanban;
