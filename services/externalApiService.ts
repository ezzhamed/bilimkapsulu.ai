
import { Paper, TopicCategory } from '../types';
import { batchTranslatePapers, isApiKeyConfigured } from './geminiService';

// ==========================================
// Smart Cache System
// ==========================================
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number; // milliseconds
}

interface ApiError {
  source: string;
  message: string;
  code?: string;
}

interface FetchResult<T> {
  data: T;
  errors: ApiError[];
  fromCache: boolean;
}

class SmartCache {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private readonly STORAGE_PREFIX = 'bilimkapsulu_cache_';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith(this.STORAGE_PREFIX));
      keys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          const entry = JSON.parse(value) as CacheEntry<any>;
          if (!this.isExpired(entry)) {
            this.memoryCache.set(key.replace(this.STORAGE_PREFIX, ''), entry);
          } else {
            localStorage.removeItem(key);
          }
        }
      });
    } catch (e) {
      console.warn('Cache load error:', e);
    }
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.expiresIn;
  }

  get<T>(key: string): T | null {
    const entry = this.memoryCache.get(key);
    if (entry && !this.isExpired(entry)) {
      return entry.data as T;
    }
    this.memoryCache.delete(key);
    return null;
  }

  set<T>(key: string, data: T, expiresIn: number = 3600000): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresIn
    };
    this.memoryCache.set(key, entry);

    try {
      localStorage.setItem(this.STORAGE_PREFIX + key, JSON.stringify(entry));
    } catch (e) {
      // Storage full - clear old entries
      this.clearOldEntries();
    }
  }

  private clearOldEntries(): void {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(this.STORAGE_PREFIX));
    keys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          const entry = JSON.parse(value) as CacheEntry<any>;
          if (this.isExpired(entry)) {
            localStorage.removeItem(key);
            this.memoryCache.delete(key.replace(this.STORAGE_PREFIX, ''));
          }
        } catch {
          localStorage.removeItem(key);
        }
      }
    });
  }

  clear(): void {
    this.memoryCache.clear();
    const keys = Object.keys(localStorage).filter(k => k.startsWith(this.STORAGE_PREFIX));
    keys.forEach(key => localStorage.removeItem(key));
  }
}

const cache = new SmartCache();

// CORS Proxy for APIs that don't support browser requests
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

// Cache durations
const CACHE_DURATION = {
  LIVE_PAPERS: 30 * 60 * 1000, // 30 minutes
  TRENDING: 60 * 60 * 1000, // 1 hour
  SEARCH: 15 * 60 * 1000, // 15 minutes
};

// ==========================================
// Topic Mapping
// ==========================================
const TOPIC_MAPPING: Record<TopicCategory, string> = {
  'Yapay Zeka': 'Artificial Intelligence',
  'Tıp': 'Medicine',
  'Ekonomi': 'Economics',
  'Fizik': 'Physics',
  'Psikoloji': 'Psychology',
  'Mühendislik': 'Engineering',
  'Biyoloji': 'Biology',
  'Tarih': 'History',
  'Kimya': 'Chemistry',
  'Matematik': 'Mathematics',
  'Sosyoloji': 'Sociology',
  'Felsefe': 'Philosophy',
  'Edebiyat': 'Literature',
  'Hukuk': 'Law',
  'Siyaset Bilimi': 'Political Science',
  'Astronomi': 'Astronomy',
  'Mimarlık': 'Architecture',
  'Eğitim Bilimleri': 'Education',
  'Çevre Bilimi': 'Environmental Science',
  'Sanat Tarihi': 'Art History'
};

// ==========================================
// Helper Functions
// ==========================================
function createAbstractFromInvertedIndex(index: any): string {
  if (!index) return "";
  const words: string[] = [];
  Object.keys(index).forEach(word => {
    const positions = index[word];
    if (Array.isArray(positions)) {
      positions.forEach((position: number) => {
        words[position] = word;
      });
    }
  });
  return words.join(" ").replace(/\s+([,.])/g, '$1');
}

// ==========================================
// OpenAlex API
// ==========================================
export const fetchLivePapers = async (
  category: TopicCategory,
  page: number = 1,
  perPage: number = 12
): Promise<FetchResult<Paper[]>> => {
  const cacheKey = `live_${category}_${page}_${perPage}`;
  const cached = cache.get<Paper[]>(cacheKey);

  if (cached) {
    return { data: cached, errors: [], fromCache: true };
  }

  const searchTerm = TOPIC_MAPPING[category];
  const year = new Date().getFullYear();
  const errors: ApiError[] = [];

  try {
    const apiUrl = `https://api.openalex.org/works?search=${encodeURIComponent(searchTerm)}&filter=from_publication_date:${year - 1}-01-01,has_abstract:true&sort=publication_date:desc&per_page=${perPage}&page=${page}&mailto=bilimkapsulu@example.com`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!data.results || !Array.isArray(data.results)) {
      return { data: [], errors: [], fromCache: false };
    }

    const rawPapers: Paper[] = data.results.map((work: any) => {
      const uni = work.authorships?.[0]?.institutions?.[0]?.display_name || 'International Research Institute';
      let abstractText = work.abstract_inverted_index ? createAbstractFromInvertedIndex(work.abstract_inverted_index) : 'Abstract not available.';
      const safeId = String(work.id).replace('https://openalex.org/', 'oa-');

      return {
        id: safeId,
        title: work.title || 'Untitled',
        originalTitle: work.title || 'Untitled',
        authors: work.authorships?.map((a: any) => a.author.display_name).slice(0, 3) || ['Unknown Author'],
        university: uni,
        publicationYear: work.publication_year || year,
        journal: work.primary_location?.source?.display_name || 'Academic Source',
        language: 'Türkçe (Çeviri)',
        abstract: abstractText,
        documentType: 'ARTICLE',
        keywords: [category, 'OpenAlex'],
        category: category,
        pdfUrl: work.open_access?.is_oa ? work.open_access.oa_url : work.doi,
        doi: work.doi,
        citations: work.cited_by_count || 0,
        isOpenAccess: work.open_access?.is_oa || false,
        readTimeMinutes: 10,
        isWeeklySelection: false,
        figures: [],
        isExternal: true
      };
    });

    // Translate if API key available
    let papers = rawPapers;
    if (isApiKeyConfigured() && rawPapers.length > 0) {
      try {
        papers = await batchTranslatePapers(rawPapers);
      } catch (e) {
        errors.push({ source: 'Gemini', message: 'Çeviri başarısız oldu' });
      }
    }

    cache.set(cacheKey, papers, CACHE_DURATION.LIVE_PAPERS);
    return { data: papers, errors, fromCache: false };

  } catch (error: any) {
    const errorMsg = error.name === 'AbortError'
      ? 'Bağlantı zaman aşımına uğradı'
      : error.message || 'Bilinmeyen hata';

    errors.push({ source: 'OpenAlex', message: errorMsg });
    return { data: [], errors, fromCache: false };
  }
};

export const fetchTrendingPapers = async (page: number = 1): Promise<FetchResult<Paper[]>> => {
  const cacheKey = `trending_${page}`;
  const cached = cache.get<Paper[]>(cacheKey);

  if (cached) {
    return { data: cached, errors: [], fromCache: true };
  }

  const year = new Date().getFullYear();
  const errors: ApiError[] = [];

  try {
    const apiUrl = `https://api.openalex.org/works?filter=from_publication_date:${year - 1}-01-01,has_abstract:true&sort=cited_by_count:desc&per_page=12&page=${page}&mailto=bilimkapsulu@example.com`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!data.results || !Array.isArray(data.results)) {
      return { data: [], errors: [], fromCache: false };
    }

    const rawPapers: Paper[] = data.results.map((work: any) => {
      const uni = work.authorships?.[0]?.institutions?.[0]?.display_name || 'International Research Institute';
      let abstractText = work.abstract_inverted_index ? createAbstractFromInvertedIndex(work.abstract_inverted_index) : 'Abstract not available.';
      const safeId = String(work.id).replace('https://openalex.org/', 'oa-');

      return {
        id: safeId,
        title: work.title || 'Untitled',
        originalTitle: work.title || 'Untitled',
        authors: work.authorships?.map((a: any) => a.author.display_name).slice(0, 3) || ['Unknown Author'],
        university: uni,
        publicationYear: work.publication_year || year,
        journal: work.primary_location?.source?.display_name || 'Academic Source',
        language: 'Türkçe (Çeviri)',
        abstract: abstractText,
        documentType: 'ARTICLE',
        keywords: ['Trending', 'Global'],
        category: 'Yapay Zeka' as TopicCategory,
        pdfUrl: work.open_access?.is_oa ? work.open_access.oa_url : work.doi,
        doi: work.doi,
        citations: work.cited_by_count || 0,
        isOpenAccess: work.open_access?.is_oa || false,
        readTimeMinutes: 15,
        isWeeklySelection: false,
        figures: [],
        isExternal: true
      };
    });

    let papers = rawPapers;
    if (isApiKeyConfigured() && rawPapers.length > 0) {
      try {
        papers = await batchTranslatePapers(rawPapers);
      } catch (e) {
        errors.push({ source: 'Gemini', message: 'Çeviri başarısız oldu' });
      }
    }

    cache.set(cacheKey, papers, CACHE_DURATION.TRENDING);
    return { data: papers, errors, fromCache: false };

  } catch (error: any) {
    const errorMsg = error.name === 'AbortError'
      ? 'Bağlantı zaman aşımına uğradı'
      : error.message || 'Bilinmeyen hata';

    errors.push({ source: 'OpenAlex', message: errorMsg });
    return { data: [], errors, fromCache: false };
  }
};

// ==========================================
// Search API with Pagination
// ==========================================
export interface SearchOptions {
  query: string;
  source: 'all' | 'openalex' | 'arxiv' | 'semantic';
  page: number;
  perPage: number;
}

export interface SearchResult {
  papers: Paper[];
  errors: ApiError[];
  hasMore: boolean;
  totalBySource: {
    openalex: number;
    arxiv: number;
    semantic: number;
  };
  fromCache: boolean;
}

export const searchPapers = async (options: SearchOptions): Promise<SearchResult> => {
  const { query, source, page, perPage } = options;
  const cacheKey = `search_${query}_${source}_${page}_${perPage}`;

  const cached = cache.get<SearchResult>(cacheKey);
  if (cached) {
    return { ...cached, fromCache: true };
  }

  const results: Paper[] = [];
  const errors: ApiError[] = [];
  const totalBySource = { openalex: 0, arxiv: 0, semantic: 0 };

  const searches: Promise<{ papers: Paper[]; source: string; hasMore: boolean }>[] = [];

  if (source === 'all' || source === 'openalex') {
    searches.push(searchOpenAlex(query, page, perPage).then(r => ({ ...r, source: 'openalex' })));
  }
  if (source === 'all' || source === 'arxiv') {
    searches.push(searchArxiv(query, page, perPage).then(r => ({ ...r, source: 'arxiv' })));
  }
  if (source === 'all' || source === 'semantic') {
    searches.push(searchSemanticScholar(query, page, perPage).then(r => ({ ...r, source: 'semantic' })));
  }

  const allResults = await Promise.allSettled(searches);
  let hasMore = false;

  allResults.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      results.push(...result.value.papers);
      if (result.value.hasMore) hasMore = true;

      const src = result.value.source as keyof typeof totalBySource;
      totalBySource[src] = result.value.papers.length;
    } else {
      const sources = ['openalex', 'arxiv', 'semantic'];
      errors.push({
        source: sources[index] || 'unknown',
        message: result.reason?.message || 'Bağlantı hatası'
      });
    }
  });

  const uniquePapers = removeDuplicates(results);

  // Translate papers from non-Turkish sources
  let translatedPapers = uniquePapers;
  if (isApiKeyConfigured() && uniquePapers.length > 0) {
    try {
      translatedPapers = await batchTranslatePapers(uniquePapers);
    } catch (e) {
      errors.push({ source: 'Gemini', message: 'Çeviri başarısız oldu' });
    }
  }

  const sortedPapers = translatedPapers.sort((a, b) => b.citations - a.citations);

  const searchResult: SearchResult = {
    papers: sortedPapers,
    errors,
    hasMore,
    totalBySource,
    fromCache: false
  };

  cache.set(cacheKey, searchResult, CACHE_DURATION.SEARCH);
  return searchResult;
};

// OpenAlex Search with pagination
async function searchOpenAlex(query: string, page: number, perPage: number): Promise<{ papers: Paper[]; hasMore: boolean }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const apiUrl = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&filter=has_abstract:true&sort=cited_by_count:desc&per_page=${perPage}&page=${page}&mailto=bilimkapsulu@example.com`;

    const response = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    if (!data.results) return { papers: [], hasMore: false };

    const papers: Paper[] = data.results.map((work: any) => ({
      id: 'oa-' + String(work.id).replace('https://openalex.org/', ''),
      title: work.title || 'Untitled',
      originalTitle: work.title || 'Untitled',
      authors: work.authorships?.map((a: any) => a.author.display_name).slice(0, 3) || ['Unknown'],
      university: work.authorships?.[0]?.institutions?.[0]?.display_name || 'Unknown Institution',
      publicationYear: work.publication_year || new Date().getFullYear(),
      journal: work.primary_location?.source?.display_name || 'OpenAlex',
      language: 'Türkçe (Çeviri)',
      abstract: work.abstract_inverted_index ? createAbstractFromInvertedIndex(work.abstract_inverted_index) : 'Abstract not available.',
      documentType: 'ARTICLE' as const,
      keywords: ['OpenAlex', 'Search'],
      category: 'Yapay Zeka' as TopicCategory,
      pdfUrl: work.open_access?.oa_url || work.doi,
      doi: work.doi,
      citations: work.cited_by_count || 0,
      isOpenAccess: work.open_access?.is_oa || false,
      readTimeMinutes: 12,
      isWeeklySelection: false,
      figures: [],
      isExternal: true
    }));

    const hasMore = data.meta?.count > page * perPage;
    return { papers, hasMore };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// arXiv Search with pagination
async function searchArxiv(query: string, page: number, perPage: number): Promise<{ papers: Paper[]; hasMore: boolean }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  const start = (page - 1) * perPage;

  try {
    const baseUrl = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=${start}&max_results=${perPage}&sortBy=relevance&sortOrder=descending`;
    const apiUrl = CORS_PROXY + encodeURIComponent(baseUrl);

    const response = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const text = await response.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'text/xml');
    const entries = xml.querySelectorAll('entry');
    const totalResults = parseInt(xml.querySelector('opensearch\\:totalResults')?.textContent || '0');

    const papers: Paper[] = [];

    entries.forEach((entry, index) => {
      const id = entry.querySelector('id')?.textContent?.replace('http://arxiv.org/abs/', 'arxiv-') || `arxiv-${start + index}`;
      const title = entry.querySelector('title')?.textContent?.replace(/\n/g, ' ').trim() || 'Untitled';
      const summary = entry.querySelector('summary')?.textContent?.replace(/\n/g, ' ').trim() || '';
      const published = entry.querySelector('published')?.textContent || '';
      const year = published ? new Date(published).getFullYear() : new Date().getFullYear();

      const authorNodes = entry.querySelectorAll('author name');
      const authors: string[] = [];
      authorNodes.forEach(node => {
        if (node.textContent) authors.push(node.textContent);
      });

      const links = entry.querySelectorAll('link');
      let pdfUrl = '';
      links.forEach(link => {
        if (link.getAttribute('title') === 'pdf') {
          pdfUrl = link.getAttribute('href') || '';
        }
      });

      const categories = entry.querySelectorAll('category');
      const keywords: string[] = ['arXiv'];
      categories.forEach(cat => {
        const term = cat.getAttribute('term');
        if (term) keywords.push(term);
      });

      papers.push({
        id,
        title,
        originalTitle: title,
        authors: authors.slice(0, 3),
        university: 'arXiv Preprint',
        publicationYear: year,
        journal: 'arXiv',
        language: 'Türkçe (Çeviri)',
        abstract: summary.substring(0, 500) + (summary.length > 500 ? '...' : ''),
        documentType: 'ARTICLE',
        keywords,
        category: 'Yapay Zeka' as TopicCategory,
        pdfUrl: pdfUrl || `https://arxiv.org/pdf/${id.replace('arxiv-', '')}.pdf`,
        citations: 0,
        isOpenAccess: true,
        readTimeMinutes: 15,
        isWeeklySelection: false,
        figures: [],
        isExternal: true
      });
    });

    const hasMore = totalResults > start + perPage;
    return { papers, hasMore };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Semantic Scholar Search with pagination
async function searchSemanticScholar(query: string, page: number, perPage: number): Promise<{ papers: Paper[]; hasMore: boolean }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);
  const offset = (page - 1) * perPage;

  try {
    const baseUrl = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&offset=${offset}&limit=${perPage}&fields=title,abstract,authors,year,venue,citationCount,isOpenAccess,openAccessPdf,externalIds`;
    const apiUrl = CORS_PROXY + encodeURIComponent(baseUrl);

    const response = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Çok fazla istek - lütfen bekleyin');
      }
      throw new Error(`HTTP ${response.status}`);
    }

    const text = await response.text();

    // Handle rate limit or error responses
    if (text.startsWith('Too Many') || text.startsWith('<!') || text.startsWith('<html')) {
      console.warn('Semantic Scholar rate limited or returned HTML');
      return { papers: [], hasMore: false };
    }

    const data = JSON.parse(text);
    if (!data.data) return { papers: [], hasMore: false };

    const papers: Paper[] = data.data.map((paper: any) => ({
      id: 'ss-' + (paper.paperId || Math.random().toString(36).substr(2, 9)),
      title: paper.title || 'Untitled',
      originalTitle: paper.title || 'Untitled',
      authors: paper.authors?.map((a: any) => a.name).slice(0, 3) || ['Unknown'],
      university: 'Semantic Scholar',
      publicationYear: paper.year || new Date().getFullYear(),
      journal: paper.venue || 'Academic Journal',
      language: 'Türkçe (Çeviri)',
      abstract: paper.abstract?.substring(0, 500) + (paper.abstract?.length > 500 ? '...' : '') || 'Abstract not available.',
      documentType: 'ARTICLE' as const,
      keywords: ['Semantic Scholar', 'Search'],
      category: 'Yapay Zeka' as TopicCategory,
      pdfUrl: paper.openAccessPdf?.url || (paper.externalIds?.DOI ? `https://doi.org/${paper.externalIds.DOI}` : ''),
      doi: paper.externalIds?.DOI,
      citations: paper.citationCount || 0,
      isOpenAccess: paper.isOpenAccess || false,
      readTimeMinutes: 12,
      isWeeklySelection: false,
      figures: [],
      isExternal: true
    }));

    const hasMore = data.total > offset + perPage;
    return { papers, hasMore };
  } catch (error: any) {
    clearTimeout(timeoutId);
    // Return empty instead of throwing to allow other sources to work
    console.warn('Semantic Scholar error:', error.message);
    return { papers: [], hasMore: false };
  }
}

// ==========================================
// Fetch by category from multiple sources
// ==========================================
export const fetchPapersFromAllSources = async (
  category: TopicCategory,
  page: number = 1
): Promise<FetchResult<Paper[]>> => {
  const cacheKey = `all_sources_${category}_${page}`;
  const cached = cache.get<Paper[]>(cacheKey);

  if (cached) {
    return { data: cached, errors: [], fromCache: true };
  }

  const searchTerm = TOPIC_MAPPING[category];
  const errors: ApiError[] = [];

  const [openAlexResult, arxivResult, semanticResult] = await Promise.allSettled([
    fetchLivePapers(category, page, 6),
    searchArxiv(searchTerm, page, 6),
    searchSemanticScholar(searchTerm, page, 6)
  ]);

  const results: Paper[] = [];

  if (openAlexResult.status === 'fulfilled') {
    results.push(...openAlexResult.value.data);
    errors.push(...openAlexResult.value.errors);
  } else {
    errors.push({ source: 'OpenAlex', message: openAlexResult.reason?.message || 'Bağlantı hatası' });
  }

  if (arxivResult.status === 'fulfilled') {
    results.push(...arxivResult.value.papers);
  } else {
    errors.push({ source: 'arXiv', message: arxivResult.reason?.message || 'Bağlantı hatası' });
  }

  if (semanticResult.status === 'fulfilled') {
    results.push(...semanticResult.value.papers);
  } else {
    errors.push({ source: 'Semantic Scholar', message: semanticResult.reason?.message || 'Bağlantı hatası' });
  }

  // Update category for all results
  results.forEach(p => {
    p.category = category;
    if (!p.keywords.includes(category)) {
      p.keywords.push(category);
    }
  });

  let uniquePapers = removeDuplicates(results);

  // Translate arXiv and Semantic Scholar papers (OpenAlex papers are already translated)
  const papersToTranslate = uniquePapers.filter(p => p.id.startsWith('arxiv-') || p.id.startsWith('ss-'));
  if (isApiKeyConfigured() && papersToTranslate.length > 0) {
    try {
      const translatedPapers = await batchTranslatePapers(papersToTranslate);
      // Merge translated papers back
      const translatedMap = new Map(translatedPapers.map(p => [p.id, p]));
      uniquePapers = uniquePapers.map(p => translatedMap.get(p.id) || p);
    } catch (e) {
      errors.push({ source: 'Gemini', message: 'Çeviri başarısız oldu' });
    }
  }

  const sortedPapers = uniquePapers.sort((a, b) => b.citations - a.citations);

  cache.set(cacheKey, sortedPapers, CACHE_DURATION.LIVE_PAPERS);
  return { data: sortedPapers, errors, fromCache: false };
};

// Helper to remove duplicates
function removeDuplicates(papers: Paper[]): Paper[] {
  const seen = new Map<string, Paper>();

  papers.forEach(paper => {
    const normalizedTitle = paper.title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 50);

    if (!seen.has(normalizedTitle)) {
      seen.set(normalizedTitle, paper);
    } else {
      const existing = seen.get(normalizedTitle)!;
      if (paper.citations > existing.citations) {
        seen.set(normalizedTitle, paper);
      }
    }
  });

  return Array.from(seen.values());
}

// Export for clearing cache from settings
export const clearApiCache = () => cache.clear();
