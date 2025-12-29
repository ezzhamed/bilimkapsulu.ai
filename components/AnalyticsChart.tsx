
import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, Target, Flame, BookOpen, PieChart } from 'lucide-react';
import { TopicCategory, DailyReadingData, WeeklyReadingData } from '../types';
import {
    getDailyStats,
    getWeeklyStats,
    getCategoryStats,
    getReadingStreak,
    getTotalReadingStats
} from '../services/offlineStorage';

interface AnalyticsChartProps {
    className?: string;
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ className = '' }) => {
    const [dailyData, setDailyData] = useState<DailyReadingData[]>([]);
    const [weeklyData, setWeeklyData] = useState<WeeklyReadingData[]>([]);
    const [categoryStats, setCategoryStats] = useState<Record<TopicCategory, number>>({} as Record<TopicCategory, number>);
    const [streak, setStreak] = useState({ current: 0, longest: 0 });
    const [totalStats, setTotalStats] = useState({ totalPapers: 0, totalMinutes: 0, avgMinutesPerPaper: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'weekly' | 'daily'>('weekly');

    useEffect(() => {
        const loadAnalytics = async () => {
            setIsLoading(true);
            try {
                const [daily, weekly, categories, streakData, totals] = await Promise.all([
                    getDailyStats(14),
                    getWeeklyStats(8),
                    getCategoryStats(),
                    getReadingStreak(),
                    getTotalReadingStats()
                ]);

                setDailyData(daily);
                setWeeklyData(weekly);
                setCategoryStats(categories);
                setStreak(streakData);
                setTotalStats(totals);
            } catch (error) {
                console.error('Failed to load analytics:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadAnalytics();
    }, []);

    // Get max value for scaling
    const maxDailyPapers = Math.max(...dailyData.map(d => d.papersRead), 1);
    const maxWeeklyPapers = Math.max(...weeklyData.map(w => w.papersRead), 1);

    // Category colors
    const categoryColors: Record<string, string> = {
        'Yapay Zeka': 'bg-purple-500',
        'Tıp': 'bg-red-500',
        'Ekonomi': 'bg-green-500',
        'Fizik': 'bg-blue-500',
        'Psikoloji': 'bg-pink-500',
        'Mühendislik': 'bg-orange-500',
        'Biyoloji': 'bg-emerald-500',
        'Tarih': 'bg-amber-500',
        'Kimya': 'bg-cyan-500',
        'Matematik': 'bg-indigo-500'
    };

    // Get sorted categories
    const sortedCategories = (Object.entries(categoryStats) as [string, number][])
        .filter(([_, count]) => count > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const totalCategoryReads = sortedCategories.reduce((sum, [_, count]) => sum + count, 0);

    if (isLoading) {
        return (
            <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 ${className}`}>
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white">
                    <div className="flex items-center gap-2 mb-2">
                        <BookOpen size={20} />
                        <span className="text-sm font-medium opacity-90">Toplam Okuma</span>
                    </div>
                    <p className="text-3xl font-bold">{totalStats.totalPapers}</p>
                    <p className="text-xs opacity-75">makale</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-4 text-white">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock size={20} />
                        <span className="text-sm font-medium opacity-90">Okuma Süresi</span>
                    </div>
                    <p className="text-3xl font-bold">{Math.round(totalStats.totalMinutes / 60)}</p>
                    <p className="text-xs opacity-75">saat</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-4 text-white">
                    <div className="flex items-center gap-2 mb-2">
                        <Flame size={20} />
                        <span className="text-sm font-medium opacity-90">Güncel Seri</span>
                    </div>
                    <p className="text-3xl font-bold">{streak.current}</p>
                    <p className="text-xs opacity-75">gün (en uzun: {streak.longest})</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-4 text-white">
                    <div className="flex items-center gap-2 mb-2">
                        <Target size={20} />
                        <span className="text-sm font-medium opacity-90">Ortalama</span>
                    </div>
                    <p className="text-3xl font-bold">{totalStats.avgMinutesPerPaper}</p>
                    <p className="text-xs opacity-75">dk / makale</p>
                </div>
            </div>

            {/* Reading Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                            <BarChart3 className="text-indigo-600 dark:text-indigo-400" size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">Okuma Aktivitesi</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {activeTab === 'weekly' ? 'Son 8 hafta' : 'Son 14 gün'}
                            </p>
                        </div>
                    </div>

                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                        <button
                            onClick={() => setActiveTab('daily')}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${activeTab === 'daily'
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow'
                                : 'text-slate-500 dark:text-slate-400'
                                }`}
                        >
                            Günlük
                        </button>
                        <button
                            onClick={() => setActiveTab('weekly')}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${activeTab === 'weekly'
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow'
                                : 'text-slate-500 dark:text-slate-400'
                                }`}
                        >
                            Haftalık
                        </button>
                    </div>
                </div>

                {/* Bar Chart */}
                {activeTab === 'weekly' ? (
                    <div className="flex items-end gap-2 h-40">
                        {weeklyData.length === 0 ? (
                            <div className="w-full flex items-center justify-center text-slate-400 text-sm">
                                Henüz veri yok
                            </div>
                        ) : (
                            weeklyData.map((week, i) => {
                                const height = (week.papersRead / maxWeeklyPapers) * 100;
                                const weekLabel = new Date(week.weekStart).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });

                                return (
                                    <div key={week.weekStart} className="flex-1 flex flex-col items-center gap-1">
                                        <div className="w-full flex items-end justify-center h-32">
                                            <div
                                                className="w-full max-w-8 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-lg transition-all duration-500 hover:from-indigo-600 hover:to-purple-600"
                                                style={{ height: `${Math.max(height, 4)}%` }}
                                                title={`${week.papersRead} makale, ${week.totalMinutes} dakika`}
                                            />
                                        </div>
                                        <span className="text-[10px] text-slate-400 text-center">{weekLabel}</span>
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{week.papersRead}</span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                ) : (
                    <div className="flex items-end gap-1 h-40 overflow-x-auto">
                        {dailyData.length === 0 ? (
                            <div className="w-full flex items-center justify-center text-slate-400 text-sm">
                                Henüz veri yok
                            </div>
                        ) : (
                            dailyData.map((day) => {
                                const height = (day.papersRead / maxDailyPapers) * 100;
                                const dayLabel = new Date(day.date).toLocaleDateString('tr-TR', { day: 'numeric' });

                                return (
                                    <div key={day.date} className="flex-1 min-w-[24px] flex flex-col items-center gap-1">
                                        <div className="w-full flex items-end justify-center h-28">
                                            <div
                                                className={`w-full max-w-5 rounded-t transition-all duration-300 ${day.papersRead > 0
                                                    ? 'bg-gradient-to-t from-emerald-500 to-teal-500'
                                                    : 'bg-slate-200 dark:bg-slate-700'
                                                    }`}
                                                style={{ height: `${Math.max(height, 4)}%` }}
                                                title={`${day.papersRead} makale, ${day.minutes} dakika`}
                                            />
                                        </div>
                                        <span className="text-[10px] text-slate-400">{dayLabel}</span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>

            {/* Category Distribution */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                        <PieChart className="text-emerald-600 dark:text-emerald-400" size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">En Çok Okunan Kategoriler</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">İlgi alanlarına göre dağılım</p>
                    </div>
                </div>

                {sortedCategories.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                        Henüz okuma verisi yok
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sortedCategories.map(([category, count], index) => {
                            const percentage = totalCategoryReads > 0 ? Math.round((count / totalCategoryReads) * 100) : 0;
                            const bgColor = categoryColors[category] || 'bg-slate-500';

                            return (
                                <div key={category} className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-slate-500 w-4">{index + 1}</span>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{category}</span>
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">{count} makale</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${bgColor} rounded-full transition-all duration-500`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                    <span className="text-sm font-medium text-slate-400 w-12 text-right">%{percentage}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
