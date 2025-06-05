"use client";

import { useState } from 'react';
import { FileText } from 'lucide-react';
import { ConsolidatedDocsViewer } from './ConsolidatedDocsViewer';

interface ConsolidationButtonProps {
  collectionName?: string;
  projectName?: string;
  variant?: 'primary' | 'secondary' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ConsolidationButton({ 
  collectionName = 'doc-scrapper-docs', 
  projectName,
  variant = 'outlined',
  size = 'md',
  showLabel = true
}: ConsolidationButtonProps) {
  const [showViewer, setShowViewer] = useState(false);

  const handleClick = () => {
    setShowViewer(true);
  };

  const handleClose = () => {
    setShowViewer(false);
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  // Variant classes
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600',
    secondary: 'bg-slate-600 hover:bg-slate-700 text-white border-slate-600',
    outlined: 'bg-transparent hover:bg-slate-800 text-slate-300 border-slate-600 hover:border-slate-500'
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`
          inline-flex items-center gap-2 rounded-lg border transition-colors font-medium
          ${sizeClasses[size]}
          ${variantClasses[variant]}
        `}
      >
        <FileText className={`${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'}`} />
        {showLabel && (
          <span>
            {size === 'sm' ? 'Консолідація' : 'Консолідована Документація'}
          </span>
        )}
      </button>

      {/* Modal/Overlay for Consolidated Docs Viewer */}
      {showViewer && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-auto rounded-lg shadow-2xl">
            <ConsolidatedDocsViewer
              collectionName={collectionName}
              projectName={projectName}
              onClose={handleClose}
            />
          </div>
        </div>
      )}
    </>
  );
} 