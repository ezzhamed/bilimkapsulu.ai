
import React, { useState } from 'react';
import { Highlighter, X, Check } from 'lucide-react';
import { PaperHighlight } from '../types';
import { addHighlight } from '../services/offlineStorage';

interface HighlightPopupProps {
    paperId: string;
    selectedText: string;
    position: { x: number; y: number };
    onClose: () => void;
    onHighlightAdded: (highlight: PaperHighlight) => void;
}

const HIGHLIGHT_COLORS: { color: PaperHighlight['color']; bg: string; name: string }[] = [
    { color: 'yellow', bg: 'bg-yellow-300', name: 'Sarı' },
    { color: 'green', bg: 'bg-green-300', name: 'Yeşil' },
    { color: 'blue', bg: 'bg-blue-300', name: 'Mavi' },
    { color: 'pink', bg: 'bg-pink-300', name: 'Pembe' },
    { color: 'purple', bg: 'bg-purple-300', name: 'Mor' }
];

export const HighlightPopup: React.FC<HighlightPopupProps> = ({
    paperId,
    selectedText,
    position,
    onClose,
    onHighlightAdded
}) => {
    const [selectedColor, setSelectedColor] = useState<PaperHighlight['color']>('yellow');
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveHighlight = async () => {
        if (!selectedText.trim()) return;

        setIsSaving(true);
        try {
            // Get selection range info (simplified - using text offsets)
            const selection = window.getSelection();
            let startOffset = 0;
            let endOffset = selectedText.length;

            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                startOffset = range.startOffset;
                endOffset = range.endOffset;
            }

            const highlight = await addHighlight(
                paperId,
                selectedText,
                selectedColor,
                startOffset,
                endOffset
            );

            onHighlightAdded(highlight);
            onClose();
        } catch (error) {
            console.error('Failed to save highlight:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div
            className="fixed z-50 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-3 min-w-[200px] animate-in fade-in zoom-in-95 duration-200"
            style={{
                left: Math.min(position.x, window.innerWidth - 220),
                top: position.y + 10
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <Highlighter size={16} className="text-amber-500" />
                    Vurgula
                </div>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                >
                    <X size={16} className="text-slate-400" />
                </button>
            </div>

            {/* Selected Text Preview */}
            <div className="mb-3 p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    "{selectedText.substring(0, 100)}{selectedText.length > 100 ? '...' : ''}"
                </p>
            </div>

            {/* Color Picker */}
            <div className="flex items-center gap-2 mb-3">
                {HIGHLIGHT_COLORS.map(({ color, bg, name }) => (
                    <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-7 h-7 rounded-full ${bg} transition-transform hover:scale-110 ${selectedColor === color ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''
                            }`}
                        title={name}
                    />
                ))}
            </div>

            {/* Save Button */}
            <button
                onClick={handleSaveHighlight}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
                {isSaving ? (
                    <span className="animate-spin">⏳</span>
                ) : (
                    <>
                        <Check size={16} /> Kaydet
                    </>
                )}
            </button>
        </div>
    );
};

// Edit Popup for existing highlights
interface HighlightEditPopupProps {
    highlight: PaperHighlight;
    position: { x: number; y: number };
    onClose: () => void;
    onColorChange: (highlightId: string, newColor: PaperHighlight['color']) => void;
    onDelete: (highlightId: string) => void;
}

export const HighlightEditPopup: React.FC<HighlightEditPopupProps> = ({
    highlight,
    position,
    onClose,
    onColorChange,
    onDelete
}) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleColorChange = (color: PaperHighlight['color']) => {
        onColorChange(highlight.id, color);
        onClose();
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        onDelete(highlight.id);
    };

    return (
        <div
            className="fixed z-50 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-3 min-w-[200px] animate-in fade-in zoom-in-95 duration-200"
            style={{
                left: Math.min(position.x - 100, window.innerWidth - 220),
                top: position.y + 10
            }}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <Highlighter size={16} className="text-amber-500" />
                    Vurguyu Düzenle
                </div>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                >
                    <X size={16} className="text-slate-400" />
                </button>
            </div>

            {/* Text Preview */}
            <div className="mb-3 p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    "{highlight.text.substring(0, 50)}{highlight.text.length > 50 ? '...' : ''}"
                </p>
            </div>

            {/* Color Options */}
            <div className="mb-3">
                <p className="text-xs text-slate-400 mb-2">Renk Değiştir:</p>
                <div className="flex items-center gap-2">
                    {HIGHLIGHT_COLORS.map(({ color, bg, name }) => (
                        <button
                            key={color}
                            onClick={() => handleColorChange(color)}
                            className={`w-7 h-7 rounded-full ${bg} transition-transform hover:scale-110 ${highlight.color === color ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''
                                }`}
                            title={name}
                        />
                    ))}
                </div>
            </div>

            {/* Delete Button */}
            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
                {isDeleting ? (
                    <span className="animate-spin">⏳</span>
                ) : (
                    <>
                        <X size={16} /> Vurguyu Sil
                    </>
                )}
            </button>
        </div>
    );
};

// Component to render highlighted text
interface HighlightedTextProps {
    text: string;
    highlights: PaperHighlight[];
    onHighlightClick?: (highlight: PaperHighlight, event: React.MouseEvent) => void;
}

export const HighlightedText: React.FC<HighlightedTextProps> = ({
    text,
    highlights,
    onHighlightClick
}) => {
    if (!highlights || highlights.length === 0) {
        return <span>{text}</span>;
    }

    const colorClasses: Record<PaperHighlight['color'], string> = {
        yellow: 'bg-yellow-200 dark:bg-yellow-600 text-slate-900 dark:text-white',
        green: 'bg-green-200 dark:bg-green-600 text-slate-900 dark:text-white',
        blue: 'bg-blue-200 dark:bg-blue-600 text-slate-900 dark:text-white',
        pink: 'bg-pink-200 dark:bg-pink-600 text-slate-900 dark:text-white',
        purple: 'bg-purple-200 dark:bg-purple-600 text-slate-900 dark:text-white'
    };

    // Sort highlights by position in text (case-insensitive search)
    const sortedHighlights = [...highlights]
        .map(h => ({
            ...h,
            position: text.toLowerCase().indexOf(h.text.toLowerCase())
        }))
        .filter(h => h.position !== -1)
        .sort((a, b) => a.position - b.position);

    if (sortedHighlights.length === 0) {
        return <span>{text}</span>;
    }

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    sortedHighlights.forEach((highlight, i) => {
        const startIndex = text.toLowerCase().indexOf(highlight.text.toLowerCase(), lastIndex);

        if (startIndex === -1) return;

        // Add text before highlight
        if (startIndex > lastIndex) {
            parts.push(
                <span key={`text-${i}`}>{text.substring(lastIndex, startIndex)}</span>
            );
        }

        // Add highlighted text (use the original text slice to preserve case)
        const originalText = text.substring(startIndex, startIndex + highlight.text.length);
        parts.push(
            <mark
                key={highlight.id}
                className={`${colorClasses[highlight.color]} px-0.5 rounded cursor-pointer hover:opacity-80 transition-opacity`}
                onClick={(e) => {
                    e.stopPropagation();
                    onHighlightClick?.(highlight, e);
                }}
                title="Vurguyu kaldırmak için tıklayın"
            >
                {originalText}
            </mark>
        );

        lastIndex = startIndex + highlight.text.length;
    });

    // Add remaining text
    if (lastIndex < text.length) {
        parts.push(<span key="text-end">{text.substring(lastIndex)}</span>);
    }

    return <>{parts}</>;
};
