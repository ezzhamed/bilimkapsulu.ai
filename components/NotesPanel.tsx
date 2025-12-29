
import React, { useState, useEffect } from 'react';
import { StickyNote, Plus, Trash2, Edit2, Check, X, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { PaperNote } from '../types';
import { addNote, updateNote, deleteNote, getNotesByPaperId } from '../services/offlineStorage';

interface NotesPanelProps {
    paperId: string;
    isOpen: boolean;
    onToggle: () => void;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({ paperId, isOpen, onToggle }) => {
    const [notes, setNotes] = useState<PaperNote[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newNoteContent, setNewNoteContent] = useState('');
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [editingContent, setEditingContent] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // Load notes on mount
    useEffect(() => {
        const loadNotes = async () => {
            setIsLoading(true);
            try {
                const paperNotes = await getNotesByPaperId(paperId);
                setNotes(paperNotes);
            } catch (error) {
                console.error('Failed to load notes:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (paperId) {
            loadNotes();
        }
    }, [paperId]);

    const handleAddNote = async () => {
        if (!newNoteContent.trim()) return;

        try {
            const note = await addNote(paperId, newNoteContent.trim());
            setNotes([note, ...notes]);
            setNewNoteContent('');
            setIsAdding(false);
        } catch (error) {
            console.error('Failed to add note:', error);
        }
    };

    const handleUpdateNote = async (noteId: string) => {
        if (!editingContent.trim()) return;

        try {
            await updateNote(noteId, editingContent.trim());
            setNotes(notes.map(n =>
                n.id === noteId
                    ? { ...n, content: editingContent.trim(), updatedAt: Date.now() }
                    : n
            ));
            setEditingNoteId(null);
            setEditingContent('');
        } catch (error) {
            console.error('Failed to update note:', error);
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        try {
            await deleteNote(noteId);
            setNotes(notes.filter(n => n.id !== noteId));
        } catch (error) {
            console.error('Failed to delete note:', error);
        }
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
            {/* Header */}
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-b border-slate-200 dark:border-slate-800"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                        <StickyNote className="text-white" size={18} />
                    </div>
                    <div className="text-left">
                        <h3 className="font-bold text-slate-900 dark:text-white">Notlarım</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{notes.length} not</p>
                    </div>
                </div>
                {isOpen ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
            </button>

            {/* Content */}
            {isOpen && (
                <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                    {/* Add New Note */}
                    {isAdding ? (
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                            <textarea
                                value={newNoteContent}
                                onChange={(e) => setNewNoteContent(e.target.value)}
                                placeholder="Notunuzu yazın..."
                                className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                                rows={3}
                                autoFocus
                            />
                            <div className="flex justify-end gap-2 mt-2">
                                <button
                                    onClick={() => { setIsAdding(false); setNewNoteContent(''); }}
                                    className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                                >
                                    <X size={18} />
                                </button>
                                <button
                                    onClick={handleAddNote}
                                    disabled={!newNoteContent.trim()}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 disabled:opacity-50"
                                >
                                    <Check size={16} /> Kaydet
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                        >
                            <Plus size={18} /> Yeni Not Ekle
                        </button>
                    )}

                    {/* Notes List */}
                    {isLoading ? (
                        <div className="text-center py-4 text-slate-400">Yükleniyor...</div>
                    ) : notes.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            <StickyNote size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Henüz not eklenmemiş</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {notes.map(note => (
                                <div
                                    key={note.id}
                                    className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                                >
                                    {editingNoteId === note.id ? (
                                        <>
                                            <textarea
                                                value={editingContent}
                                                onChange={(e) => setEditingContent(e.target.value)}
                                                className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                rows={3}
                                                autoFocus
                                            />
                                            <div className="flex justify-end gap-2 mt-2">
                                                <button
                                                    onClick={() => { setEditingNoteId(null); setEditingContent(''); }}
                                                    className="p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                                                >
                                                    <X size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateNote(note.id)}
                                                    className="p-1.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded"
                                                >
                                                    <Check size={16} />
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{note.content}</p>
                                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                                <span className="flex items-center gap-1 text-xs text-slate-400">
                                                    <Clock size={12} /> {formatDate(note.updatedAt)}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => { setEditingNoteId(note.id); setEditingContent(note.content); }}
                                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteNote(note.id)}
                                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
