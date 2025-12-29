
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Paper } from "../types";

// Helper to get API key from localStorage
const getApiKey = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('gemini_api_key') || '';
  }
  return '';
};

// Check if API key is configured
export const isApiKeyConfigured = (): boolean => !!getApiKey();

// Initialize Gemini Client (lazy initialization)
const getAI = () => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('API_KEY_NOT_CONFIGURED');
  }
  return new GoogleGenAI({ apiKey });
};

const MODEL_NAME = "gemini-2.5-flash";


export const createPaperChatSession = (paperContext: string): Chat => {
  return getAI().chats.create({
    model: MODEL_NAME,
    config: {
      systemInstruction: `Siz, 'BilimKapsulu.ai' platformunda görev yapan uzman bir akademik asistansınız.
      
      Bu platform, dünyanın önde gelen üniversitelerinden (MIT, Harvard, Stanford vb.) alınan makalelerin Türkçe çevirilerini sunar.
      
      GÖREVİNİZ:
      Kullanıcıların aşağıdaki uluslararası araştırma makalesini Türkçe olarak anlamalarına yardımcı olmaktır.
      
      MAKALE BAĞLAMI:
      ${paperContext}
      
      YÖNERGELER:
      1. Yanıtlarınız tamamen Türkçe olmalıdır.
      2. Makalenin orijinal dili İngilizce olsa da, terimleri açıklarken Türkçesini kullanın (parantez içinde İngilizcesini belirtebilirsiniz).
      3. Kullanıcı metinde olmayan bir şey sorarsa, makalenin kapsamı dışında olduğunu belirtin.
      4. Bilimsel doğruluğu koruyun ama anlaşılır olun.
      `,
    },
  });
};

export const summarizePaper = async (abstract: string): Promise<string> => {
  try {
    const response: GenerateContentResponse = await getAI().models.generateContent({
      model: MODEL_NAME,
      contents: `Aşağıdaki akademik makale özetini, konuya yabancı ancak meraklı bir okuyucu için Türkçe olarak KAPSAMLI ve DETAYLI bir şekilde özetle.

LÜTFEN AŞAĞIDAKİ YAPIDA YANITLAYIN:

## 📌 Ana Konu
Çalışmanın temel konusunu 2-3 cümleyle açıklayın.

## 🎯 Amaç
Araştırmacıların bu çalışmayla ne başarmak istediklerini belirtin.

## 🔬 Yöntem
Kullanılan metodoloji, veri toplama ve analiz yöntemlerini açıklayın.

## 📊 Temel Bulgular
- En az 4-5 önemli bulguyu madde halinde listeleyin
- Her madde için kısa bir açıklama ekleyin

## 💡 Sonuç ve Önem
Bu çalışmanın bilim dünyasına ve pratik uygulamalara olan katkısını açıklayın.

## 🔮 Gelecek Araştırmalar
Bu çalışmanın açtığı yeni araştırma alanlarını belirtin.

Makale özeti:
${abstract}`,
    });
    return response.text || "Özet oluşturulamadı.";
  } catch (error) {
    console.error("Summarization error:", error);
    return "Özet oluşturulurken hata oluştu.";
  }
};

export const generateSuggestedQuestions = async (abstract: string): Promise<string[]> => {
  try {
    const response: GenerateContentResponse = await getAI().models.generateContent({
      model: MODEL_NAME,
      contents: `Bu akademik makale özetine dayanarak, okuyucunun çalışmanın evrensel etkisini anlaması için sorabileceği 3 kısa, zekice Türkçe soru oluştur. YALNIZCA bir JSON dize dizisi (array of strings) döndürün. Markdown yok.\n\n${abstract}`,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Suggestion error:", error);
    return ["Bu çalışmanın temel inovasyonu nedir?", "Diğer ülkelerdeki uygulamalarla farkı ne?", "Gelecekteki etkileri neler olabilir?"];
  }
}

// NEW: Batch translate papers for the Live Feed
export const batchTranslatePapers = async (papers: Paper[]): Promise<Paper[]> => {
  if (papers.length === 0) return [];

  const promptData = papers.map((p, index) => ({
    index,
    title: p.title,
    abstract: p.abstract.substring(0, 500) // Limit length for API efficiency
  }));

  try {
    const response = await getAI().models.generateContent({
      model: MODEL_NAME,
      contents: `You are a translator for an academic platform. Translate the following JSON array of paper titles and abstracts from English to Turkish. 
      Maintain academic tone. Return ONLY valid JSON array with the same indexes.
      
      Input:
      ${JSON.stringify(promptData)}
      
      Expected Output JSON Schema:
      [
        { "index": 0, "title": "Turkish Title", "abstract": "Turkish Abstract..." }
      ]
      `,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) return papers;

    const translations = JSON.parse(text);

    // Merge translations back into papers
    const translatedPapers = [...papers];
    translations.forEach((t: any) => {
      if (translatedPapers[t.index]) {
        translatedPapers[t.index].title = t.title;
        translatedPapers[t.index].abstract = t.abstract + "... (Devamı Orijinal Kaynakta)";
      }
    });

    return translatedPapers;

  } catch (error) {
    console.error("Batch translation error:", error);
    return papers; // Return original if translation fails
  }
};
