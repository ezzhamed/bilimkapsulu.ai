
import React from 'react';
import { Paper } from '../types';
import { Calendar, User, Building2, Clock, Tag, ArrowRight, Globe } from 'lucide-react';

interface PaperCardProps {
  paper: Paper;
  onClick: (id: string) => void;
  isFeatured?: boolean;
}

export const PaperCard: React.FC<PaperCardProps> = ({ paper, onClick, isFeatured = false }) => {
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick(paper.id);
  };

  return (
    <div 
      onClick={handleClick}
      className={`group relative bg-white dark:bg-slate-900 rounded-xl border p-6 cursor-pointer flex flex-col h-full transition-all duration-300
        ${isFeatured 
          ? 'border-indigo-200 dark:border-indigo-900 shadow-lg shadow-indigo-100 dark:shadow-none ring-1 ring-indigo-50 dark:ring-indigo-900 hover:shadow-indigo-200' 
          : 'border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700'
        }
      `}
    >
      {isFeatured && (
        <div className="absolute -top-3 left-6 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wide uppercase shadow-sm">
          Haftalık Seçki
        </div>
      )}

      {paper.isExternal && (
         <div className="absolute -top-3 left-6 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wide uppercase shadow-sm flex items-center gap-1">
          <Globe size={10} /> Canlı Veri
        </div>
      )}

      <div className="flex items-start justify-between mb-3 mt-1">
        <div className="flex gap-2 flex-wrap">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider">
             {paper.category}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700">
             <Clock size={10} className="mr-1" /> {paper.readTimeMinutes} dk okuma
          </span>
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
        {paper.title}
      </h3>
      <h4 className="text-xs text-slate-400 font-medium mb-3 italic truncate">
        Orig: {paper.originalTitle}
      </h4>

      <div className="flex items-center gap-2 text-xs text-indigo-900/80 dark:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-900/30 p-2 rounded-lg mb-3 border border-indigo-50 dark:border-indigo-900/50">
         <Building2 size={14} className="shrink-0 text-indigo-600 dark:text-indigo-400" />
         <span className="font-semibold truncate">{paper.university}</span>
      </div>

      <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-3 leading-relaxed">
        {paper.abstract}
      </p>

      <div className="flex flex-wrap gap-2 mb-4 mt-auto">
        {paper.keywords.slice(0, 2).map(k => (
          <span key={k} className="flex items-center px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[10px] rounded-full">
            <Tag size={10} className="mr-1 opacity-50" /> {k}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <User size={12} />
            <span className="truncate max-w-[180px] font-medium">{paper.authors[0]} {paper.authors.length > 1 && `+${paper.authors.length - 1}`}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <Calendar size={12} />
            <span>{paper.publicationYear}</span>
          </div>
        </div>
        
        <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all dark:text-slate-300">
          <ArrowRight size={14} />
        </div>
      </div>
    </div>
  );
};
