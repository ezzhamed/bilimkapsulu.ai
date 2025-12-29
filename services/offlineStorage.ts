
import {
    Paper,
    SavedPaper,
    PaperNote,
    PaperHighlight,
    ReadingSession,
    ReadingStats,
    TopicCategory,
    DailyReadingData,
    WeeklyReadingData,
    MonthlyReadingData
} from '../types';

// ==========================================
// IndexedDB Configuration
// ==========================================
const DB_NAME = 'BilimKapsuluDB';
const DB_VERSION = 1;

const STORES = {
    SAVED_PAPERS: 'savedPapers',
    NOTES: 'notes',
    HIGHLIGHTS: 'highlights',
    READING_SESSIONS: 'readingSessions',
    DAILY_STATS: 'dailyStats'
};

// ==========================================
// Database Initialization
// ==========================================
let db: IDBDatabase | null = null;

export const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (db) {
            resolve(db);
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('IndexedDB open error:', request.error);
            reject(request.error);
        };

        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = (event.target as IDBOpenDBRequest).result;

            // Saved Papers Store
            if (!database.objectStoreNames.contains(STORES.SAVED_PAPERS)) {
                const paperStore = database.createObjectStore(STORES.SAVED_PAPERS, { keyPath: 'id' });
                paperStore.createIndex('savedAt', 'savedAt', { unique: false });
                paperStore.createIndex('category', 'paper.category', { unique: false });
            }

            // Notes Store
            if (!database.objectStoreNames.contains(STORES.NOTES)) {
                const notesStore = database.createObjectStore(STORES.NOTES, { keyPath: 'id' });
                notesStore.createIndex('paperId', 'paperId', { unique: false });
                notesStore.createIndex('createdAt', 'createdAt', { unique: false });
            }

            // Highlights Store
            if (!database.objectStoreNames.contains(STORES.HIGHLIGHTS)) {
                const highlightsStore = database.createObjectStore(STORES.HIGHLIGHTS, { keyPath: 'id' });
                highlightsStore.createIndex('paperId', 'paperId', { unique: false });
            }

            // Reading Sessions Store
            if (!database.objectStoreNames.contains(STORES.READING_SESSIONS)) {
                const sessionsStore = database.createObjectStore(STORES.READING_SESSIONS, { keyPath: 'id' });
                sessionsStore.createIndex('paperId', 'paperId', { unique: false });
                sessionsStore.createIndex('startTime', 'startTime', { unique: false });
                sessionsStore.createIndex('category', 'category', { unique: false });
            }

            // Daily Stats Store
            if (!database.objectStoreNames.contains(STORES.DAILY_STATS)) {
                database.createObjectStore(STORES.DAILY_STATS, { keyPath: 'date' });
            }
        };
    });
};

// Helper to get store
const getStore = async (storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> => {
    const database = await initDB();
    const transaction = database.transaction(storeName, mode);
    return transaction.objectStore(storeName);
};

// ==========================================
// Saved Papers (Offline Reading)
// ==========================================
export const savePaperForOffline = async (paper: Paper): Promise<void> => {
    const database = await initDB();
    const transaction = database.transaction(STORES.SAVED_PAPERS, 'readwrite');
    const store = transaction.objectStore(STORES.SAVED_PAPERS);

    return new Promise((resolve, reject) => {
        // First get existing paper (if any) within same transaction
        const getRequest = store.get(paper.id);

        getRequest.onsuccess = () => {
            const existingPaper = getRequest.result as SavedPaper | undefined;

            const savedPaper: SavedPaper = {
                id: paper.id,
                paper,
                savedAt: Date.now(),
                notes: existingPaper?.notes || [],
                highlights: existingPaper?.highlights || [],
                lastReadAt: existingPaper?.lastReadAt,
                readingProgress: existingPaper?.readingProgress || 0
            };

            const putRequest = store.put(savedPaper);
            putRequest.onsuccess = () => resolve();
            putRequest.onerror = () => reject(putRequest.error);
        };

        getRequest.onerror = () => reject(getRequest.error);

        transaction.onerror = () => reject(transaction.error);
    });
};

export const removeSavedPaper = async (paperId: string): Promise<void> => {
    const store = await getStore(STORES.SAVED_PAPERS, 'readwrite');
    return new Promise((resolve, reject) => {
        const request = store.delete(paperId);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

export const getPaperById = async (paperId: string): Promise<SavedPaper | null> => {
    const store = await getStore(STORES.SAVED_PAPERS);
    return new Promise((resolve, reject) => {
        const request = store.get(paperId);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
    });
};

export const getAllSavedPapers = async (): Promise<SavedPaper[]> => {
    const store = await getStore(STORES.SAVED_PAPERS);
    return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
};

export const isPaperSavedOffline = async (paperId: string): Promise<boolean> => {
    const paper = await getPaperById(paperId);
    return paper !== null;
};

export const updateReadingProgress = async (paperId: string, progress: number): Promise<void> => {
    const savedPaper = await getPaperById(paperId);
    if (!savedPaper) return;

    savedPaper.readingProgress = Math.max(savedPaper.readingProgress, progress);
    savedPaper.lastReadAt = Date.now();

    const store = await getStore(STORES.SAVED_PAPERS, 'readwrite');
    return new Promise((resolve, reject) => {
        const request = store.put(savedPaper);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

// ==========================================
// Notes
// ==========================================
export const addNote = async (paperId: string, content: string): Promise<PaperNote> => {
    const note: PaperNote = {
        id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        paperId,
        content,
        createdAt: Date.now(),
        updatedAt: Date.now()
    };

    const store = await getStore(STORES.NOTES, 'readwrite');
    return new Promise((resolve, reject) => {
        const request = store.add(note);
        request.onsuccess = () => resolve(note);
        request.onerror = () => reject(request.error);
    });
};

export const updateNote = async (noteId: string, content: string): Promise<void> => {
    const store = await getStore(STORES.NOTES, 'readwrite');

    return new Promise((resolve, reject) => {
        const getRequest = store.get(noteId);
        getRequest.onsuccess = () => {
            const note = getRequest.result as PaperNote;
            if (note) {
                note.content = content;
                note.updatedAt = Date.now();
                const putRequest = store.put(note);
                putRequest.onsuccess = () => resolve();
                putRequest.onerror = () => reject(putRequest.error);
            } else {
                resolve();
            }
        };
        getRequest.onerror = () => reject(getRequest.error);
    });
};

export const deleteNote = async (noteId: string): Promise<void> => {
    const store = await getStore(STORES.NOTES, 'readwrite');
    return new Promise((resolve, reject) => {
        const request = store.delete(noteId);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

export const getNotesByPaperId = async (paperId: string): Promise<PaperNote[]> => {
    const store = await getStore(STORES.NOTES);
    const index = store.index('paperId');

    return new Promise((resolve, reject) => {
        const request = index.getAll(paperId);
        request.onsuccess = () => {
            const notes = request.result as PaperNote[];
            resolve(notes.sort((a, b) => b.createdAt - a.createdAt));
        };
        request.onerror = () => reject(request.error);
    });
};

// ==========================================
// Highlights
// ==========================================
export const addHighlight = async (
    paperId: string,
    text: string,
    color: PaperHighlight['color'],
    startOffset: number,
    endOffset: number
): Promise<PaperHighlight> => {
    const highlight: PaperHighlight = {
        id: `highlight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        paperId,
        text,
        color,
        startOffset,
        endOffset,
        createdAt: Date.now()
    };

    const store = await getStore(STORES.HIGHLIGHTS, 'readwrite');
    return new Promise((resolve, reject) => {
        const request = store.add(highlight);
        request.onsuccess = () => resolve(highlight);
        request.onerror = () => reject(request.error);
    });
};

export const deleteHighlight = async (highlightId: string): Promise<void> => {
    const store = await getStore(STORES.HIGHLIGHTS, 'readwrite');
    return new Promise((resolve, reject) => {
        const request = store.delete(highlightId);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

export const getHighlightsByPaperId = async (paperId: string): Promise<PaperHighlight[]> => {
    const store = await getStore(STORES.HIGHLIGHTS);
    const index = store.index('paperId');

    return new Promise((resolve, reject) => {
        const request = index.getAll(paperId);
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
};

// ==========================================
// Reading Sessions
// ==========================================
export const startReadingSession = async (
    paperId: string,
    paperTitle: string,
    category: TopicCategory
): Promise<string> => {
    const session: ReadingSession = {
        id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        paperId,
        paperTitle,
        category,
        startTime: Date.now(),
        endTime: 0,
        duration: 0,
        scrollPercentage: 0,
        completed: false
    };

    const store = await getStore(STORES.READING_SESSIONS, 'readwrite');
    return new Promise((resolve, reject) => {
        const request = store.add(session);
        request.onsuccess = () => resolve(session.id);
        request.onerror = () => reject(request.error);
    });
};

export const endReadingSession = async (
    sessionId: string,
    scrollPercentage: number,
    actualReadingTime: number // in seconds
): Promise<void> => {
    const store = await getStore(STORES.READING_SESSIONS, 'readwrite');

    return new Promise((resolve, reject) => {
        const getRequest = store.get(sessionId);
        getRequest.onsuccess = () => {
            const session = getRequest.result as ReadingSession;
            if (session) {
                session.endTime = Date.now();
                session.duration = actualReadingTime;
                session.scrollPercentage = scrollPercentage;
                session.completed = scrollPercentage >= 80;

                const putRequest = store.put(session);
                putRequest.onsuccess = async () => {
                    // Update daily stats
                    await updateDailyStats(session);
                    resolve();
                };
                putRequest.onerror = () => reject(putRequest.error);
            } else {
                resolve();
            }
        };
        getRequest.onerror = () => reject(getRequest.error);
    });
};

export const getReadingSessions = async (limit: number = 50): Promise<ReadingSession[]> => {
    const store = await getStore(STORES.READING_SESSIONS);

    return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
            const sessions = (request.result as ReadingSession[])
                .filter(s => s.duration > 0)
                .sort((a, b) => b.startTime - a.startTime)
                .slice(0, limit);
            resolve(sessions);
        };
        request.onerror = () => reject(request.error);
    });
};

// ==========================================
// Daily Stats & Analytics
// ==========================================
const getTodayKey = (): string => {
    return new Date().toISOString().split('T')[0];
};

const updateDailyStats = async (session: ReadingSession): Promise<void> => {
    const today = getTodayKey();
    const store = await getStore(STORES.DAILY_STATS, 'readwrite');

    return new Promise((resolve, reject) => {
        const getRequest = store.get(today);
        getRequest.onsuccess = () => {
            const existing = getRequest.result as DailyReadingData | undefined;

            const stats: DailyReadingData = existing || {
                date: today,
                papersRead: 0,
                minutes: 0
            };

            if (session.completed) {
                stats.papersRead += 1;
            }
            stats.minutes += Math.round(session.duration / 60);

            const putRequest = store.put(stats);
            putRequest.onsuccess = () => resolve();
            putRequest.onerror = () => reject(putRequest.error);
        };
        getRequest.onerror = () => reject(getRequest.error);
    });
};

export const getDailyStats = async (days: number = 30): Promise<DailyReadingData[]> => {
    const store = await getStore(STORES.DAILY_STATS);

    return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
            const allStats = request.result as DailyReadingData[];
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            const cutoffStr = cutoffDate.toISOString().split('T')[0];

            const filtered = allStats
                .filter(s => s.date >= cutoffStr)
                .sort((a, b) => a.date.localeCompare(b.date));

            resolve(filtered);
        };
        request.onerror = () => reject(request.error);
    });
};

export const getWeeklyStats = async (weeks: number = 8): Promise<WeeklyReadingData[]> => {
    const dailyStats = await getDailyStats(weeks * 7);
    const weeklyMap = new Map<string, WeeklyReadingData>();

    dailyStats.forEach(day => {
        const date = new Date(day.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];

        const existing = weeklyMap.get(weekKey) || {
            weekStart: weekKey,
            papersRead: 0,
            totalMinutes: 0
        };

        existing.papersRead += day.papersRead;
        existing.totalMinutes += day.minutes;
        weeklyMap.set(weekKey, existing);
    });

    return Array.from(weeklyMap.values()).sort((a, b) => a.weekStart.localeCompare(b.weekStart));
};

export const getCategoryStats = async (): Promise<Record<TopicCategory, number>> => {
    const sessions = await getReadingSessions(500);
    const categoryCount: Record<string, number> = {};

    sessions.forEach(session => {
        if (session.completed) {
            categoryCount[session.category] = (categoryCount[session.category] || 0) + 1;
        }
    });

    return categoryCount as Record<TopicCategory, number>;
};

export const getReadingStreak = async (): Promise<{ current: number; longest: number }> => {
    const dailyStats = await getDailyStats(365);

    if (dailyStats.length === 0) {
        return { current: 0, longest: 0 };
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = getTodayKey();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().split('T')[0];

    // Sort descending
    const sorted = [...dailyStats].sort((a, b) => b.date.localeCompare(a.date));

    // Calculate current streak
    let checkDate = today;
    for (const stat of sorted) {
        if (stat.date === checkDate && stat.papersRead > 0) {
            currentStreak++;
            const prevDate = new Date(checkDate);
            prevDate.setDate(prevDate.getDate() - 1);
            checkDate = prevDate.toISOString().split('T')[0];
        } else if (stat.date === yesterdayKey && checkDate === today && stat.papersRead > 0) {
            // Allow for today not having reads yet
            currentStreak++;
            checkDate = yesterdayKey;
            const prevDate = new Date(checkDate);
            prevDate.setDate(prevDate.getDate() - 1);
            checkDate = prevDate.toISOString().split('T')[0];
        } else {
            break;
        }
    }

    // Calculate longest streak
    const sortedAsc = [...dailyStats].sort((a, b) => a.date.localeCompare(b.date));
    let prevDate = '';

    for (const stat of sortedAsc) {
        if (stat.papersRead > 0) {
            if (prevDate) {
                const prev = new Date(prevDate);
                prev.setDate(prev.getDate() + 1);
                const expectedNext = prev.toISOString().split('T')[0];

                if (stat.date === expectedNext) {
                    tempStreak++;
                } else {
                    longestStreak = Math.max(longestStreak, tempStreak);
                    tempStreak = 1;
                }
            } else {
                tempStreak = 1;
            }
            prevDate = stat.date;
        }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return { current: currentStreak, longest: longestStreak };
};

export const getTotalReadingStats = async (): Promise<{
    totalPapers: number;
    totalMinutes: number;
    avgMinutesPerPaper: number;
}> => {
    const dailyStats = await getDailyStats(365);

    const totalPapers = dailyStats.reduce((sum, d) => sum + d.papersRead, 0);
    const totalMinutes = dailyStats.reduce((sum, d) => sum + d.minutes, 0);
    const avgMinutesPerPaper = totalPapers > 0 ? Math.round(totalMinutes / totalPapers) : 0;

    return { totalPapers, totalMinutes, avgMinutesPerPaper };
};

// ==========================================
// Clear All Data
// ==========================================
export const clearAllOfflineData = async (): Promise<void> => {
    const database = await initDB();

    const stores = [STORES.SAVED_PAPERS, STORES.NOTES, STORES.HIGHLIGHTS, STORES.READING_SESSIONS, STORES.DAILY_STATS];

    for (const storeName of stores) {
        const transaction = database.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        await new Promise<void>((resolve, reject) => {
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
};
