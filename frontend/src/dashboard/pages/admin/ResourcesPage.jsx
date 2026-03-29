import React from 'react';
import { FileText } from 'lucide-react';

const ResourcesPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resources</h1>
      <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">Templates, guides, and platform documentation.</p>
    </div>
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-gray-300 dark:border-zinc-700 p-16 flex flex-col items-center justify-center text-center">
      <FileText className="w-10 h-10 text-gray-300 dark:text-zinc-600 mb-4" />
      <p className="text-gray-500 dark:text-zinc-400 font-medium">Resources coming soon</p>
      <p className="text-gray-400 dark:text-zinc-500 text-sm mt-1">Contract templates, creator briefing guides, and SOPs.</p>
    </div>
  </div>
);

export default ResourcesPage;
