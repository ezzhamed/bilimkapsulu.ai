
import { Paper, TopicCategory } from '../types';

export const TOPICS: TopicCategory[] = [
  'Yapay Zeka', 'Tıp', 'Ekonomi', 'Fizik', 'Psikoloji', 'Mühendislik', 'Biyoloji', 'Tarih',
  'Kimya', 'Matematik', 'Sosyoloji', 'Felsefe', 'Edebiyat', 'Hukuk', 'Siyaset Bilimi',
  'Astronomi', 'Mimarlık', 'Eğitim Bilimleri', 'Çevre Bilimi', 'Sanat Tarihi'
];

// Sample Featured Papers (real examples for demonstration)
const FEATURED_PAPERS: Paper[] = [
  {
    id: 'featured-1',
    title: 'Dikkat Mekanizması: Tek İhtiyacınız Olan',
    originalTitle: 'Attention Is All You Need',
    authors: ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar'],
    university: 'Google Research',
    publicationYear: 2017,
    journal: 'NeurIPS',
    language: 'Türkçe (Çeviri)',
    abstract: 'Transformer mimarisi, RNN ve CNN\'lere dayanmadan tamamen dikkat mekanizmalarına dayanan yeni bir yaklaşım sunmaktadır. Bu model, makine çevirisi görevlerinde üstün performans göstermiş ve modern dil modellerinin temelini oluşturmuştur.',
    documentType: 'ARTICLE',
    keywords: ['Yapay Zeka', 'Deep Learning', 'NLP'],
    category: 'Yapay Zeka',
    citations: 95000,
    readTimeMinutes: 25,
    figures: ['https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80'],
    isOpenAccess: true,
    isWeeklySelection: true,
    doi: '10.48550/arXiv.1706.03762',
    pdfUrl: 'https://arxiv.org/pdf/1706.03762.pdf'
  },
  {
    id: 'featured-2',
    title: 'CRISPR-Cas9 ile Genom Düzenleme',
    originalTitle: 'A programmable dual-RNA-guided DNA endonuclease in adaptive bacterial immunity',
    authors: ['Martin Jinek', 'Krzysztof Chylinski', 'Jennifer Doudna', 'Emmanuelle Charpentier'],
    university: 'UC Berkeley & Umeå University',
    publicationYear: 2012,
    journal: 'Science',
    language: 'Türkçe (Çeviri)',
    abstract: 'CRISPR-Cas9 sisteminin genom düzenlemede nasıl kullanılabileceğini gösteren çığır açıcı çalışma. Bu teknoloji, genetik hastalıkların tedavisinden tarımsal uygulamalara kadar geniş bir alanda devrim yaratmıştır.',
    documentType: 'ARTICLE',
    keywords: ['Biyoloji', 'Genetik', 'Tıp'],
    category: 'Biyoloji',
    citations: 18000,
    readTimeMinutes: 30,
    figures: ['https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=800&q=80'],
    isOpenAccess: false,
    isWeeklySelection: true,
    doi: '10.1126/science.1225829'
  },
  {
    id: 'featured-3',
    title: 'Derin Öğrenme ile Görüntü Tanıma: ImageNet Zaferi',
    originalTitle: 'ImageNet Classification with Deep Convolutional Neural Networks',
    authors: ['Alex Krizhevsky', 'Ilya Sutskever', 'Geoffrey E. Hinton'],
    university: 'University of Toronto',
    publicationYear: 2012,
    journal: 'NeurIPS',
    language: 'Türkçe (Çeviri)',
    abstract: 'AlexNet olarak bilinen bu model, ImageNet yarışmasında rekor kırarak derin öğrenme çağını başlatmıştır. Evrişimli sinir ağlarının görüntü sınıflandırmasındaki gücünü kanıtlamıştır.',
    documentType: 'ARTICLE',
    keywords: ['Yapay Zeka', 'Computer Vision', 'Deep Learning'],
    category: 'Yapay Zeka',
    citations: 120000,
    readTimeMinutes: 20,
    figures: ['https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=800&q=80'],
    isOpenAccess: true,
    isWeeklySelection: true,
    pdfUrl: 'https://papers.nips.cc/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf'
  },
  {
    id: 'featured-4',
    title: 'Kuantum Üstünlüğü: 53 Kübitlik İşlemci',
    originalTitle: 'Quantum supremacy using a programmable superconducting processor',
    authors: ['Frank Arute', 'John M. Martinis', 'Sergio Boixo'],
    university: 'Google AI Quantum',
    publicationYear: 2019,
    journal: 'Nature',
    language: 'Türkçe (Çeviri)',
    abstract: 'Google\'ın Sycamore işlemcisi, klasik süper bilgisayarların 10.000 yılda çözeceği bir hesaplamayı 200 saniyede tamamlayarak kuantum üstünlüğünü kanıtlamıştır.',
    documentType: 'ARTICLE',
    keywords: ['Fizik', 'Kuantum Bilgisayar', 'Teknoloji'],
    category: 'Fizik',
    citations: 4500,
    readTimeMinutes: 35,
    figures: ['https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80'],
    isOpenAccess: false,
    isWeeklySelection: true,
    doi: '10.1038/s41586-019-1666-5'
  },
  {
    id: 'featured-5',
    title: 'İklim Değişikliği: IPCC 6. Değerlendirme Raporu',
    originalTitle: 'Climate Change 2021: The Physical Science Basis',
    authors: ['IPCC Working Group I'],
    university: 'Intergovernmental Panel on Climate Change',
    publicationYear: 2021,
    journal: 'IPCC Report',
    language: 'Türkçe (Çeviri)',
    abstract: 'Kapsamlı IPCC raporu, küresel ısınmanın bilimsel kanıtlarını, gelecek projeksiyonlarını ve olası senaryoları detaylı şekilde sunmaktadır. 1.5°C hedefine ulaşmak için acil eylem çağrısı yapılmaktadır.',
    documentType: 'PROJECT',
    keywords: ['Çevre Bilimi', 'İklim', 'Sürdürülebilirlik'],
    category: 'Çevre Bilimi',
    citations: 8000,
    readTimeMinutes: 45,
    figures: ['https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=800&q=80'],
    isOpenAccess: true,
    isWeeklySelection: true,
    pdfUrl: 'https://www.ipcc.ch/report/ar6/wg1/'
  }
];

// In-memory cache for live papers fetched from API
let livePapersCache: Paper[] = [];

// Services
export const getAllPapers = (): Paper[] => {
  // Combine featured papers with cached live papers
  const allPapersMap = new Map<string, Paper>();

  [...livePapersCache, ...FEATURED_PAPERS].forEach(paper => {
    allPapersMap.set(paper.id, paper);
  });

  return Array.from(allPapersMap.values());
};

export const getWeeklyRecommendations = (userInterests: TopicCategory[]): Paper[] => {
  const papers = getAllPapers();

  // If no interests, return generic featured ones
  if (!userInterests || userInterests.length === 0) {
    return papers.filter(p => p.isWeeklySelection).slice(0, 5);
  }

  // Filter by interest and score
  return papers
    .filter(p =>
      userInterests.includes(p.category) ||
      p.keywords.some(k => userInterests.includes(k as TopicCategory))
    )
    .sort((a, b) => b.citations - a.citations)
    .slice(0, 5);
};

export const getPaperById = (id: string): Paper | undefined => {
  return getAllPapers().find(p => p.id === id);
};

export const cacheLivePapers = (papers: Paper[]) => {
  // Add new papers to the beginning of the cache
  const existingIds = new Set(livePapersCache.map(p => p.id));
  const newPapers = papers.filter(p => !existingIds.has(p.id));

  livePapersCache = [...newPapers, ...livePapersCache];

  // Keep cache size reasonable (e.g., 100 items)
  if (livePapersCache.length > 100) {
    livePapersCache = livePapersCache.slice(0, 100);
  }

  // Persist to localStorage to survive refresh
  try {
    localStorage.setItem('livePapersCache', JSON.stringify(livePapersCache));
  } catch (e) {
    console.warn('Failed to cache live papers to localStorage', e);
  }
};

// Load cache from local storage on init
try {
  const savedCache = localStorage.getItem('livePapersCache');
  if (savedCache) {
    livePapersCache = JSON.parse(savedCache);
  }
} catch (e) {
  console.warn('Failed to load live papers cache', e);
}
