"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

type RiskLevel = "Düşük Risk" | "Orta Risk" | "Yüksek Risk";
type VoteType = "guvenli" | "riskli" | "emin_degil";
type IdentifierKind = "phone" | "iban" | "username";

type AnalysisFactor = {
  label: string;
  detail: string;
  points: number;
  severity: "positive" | "low" | "medium" | "high";
};

type AnalysisBreakdown = {
  title: string;
  score: number;
  level: "Güçlü" | "Dikkat" | "Riskli";
  summary: string;
  factors: AnalysisFactor[];
};

type AnalysisResult = {
  score: number;
  level: RiskLevel;
  reasons: string[];
  suggestions: string[];
  identifierHash: string | null;
  identifierMasked: string | null;
  queryId: string | null;
  communityStats: CommunityStats | null;
  priceDiff: number | null;
  analysisBreakdown: AnalysisBreakdown[];
};

type CategoryProfile = {
  expectedPriceGap: number;
  strongPriceGap: number;
  extremePriceGap: number;
  sensitiveWords: string[];
  safeHints: string[];
  categoryRisks: string[];
};

type CommunityStats = {
  total_queries: number;
  average_risk_score: number;
  high_risk_count: number;
  safe_votes: number;
  risky_votes: number;
  unsure_votes: number;
};

const categories = [
  {
    name: "Elektronik",
    icon: "📱",
    text: "Telefon, laptop, konsol ve teknolojik ürünler",
  },
  {
    name: "Araç",
    icon: "🚗",
    text: "Araç, motosiklet, kapora ve ilan kontrolü",
  },
  {
    name: "Tekstil",
    icon: "👕",
    text: "Marka ürün, butik satış ve ikinci el giyim",
  },
  {
    name: "Ev & Yaşam",
    icon: "🏠",
    text: "Mobilya, beyaz eşya ve ev ürünleri",
  },
  {
    name: "Oyun",
    icon: "🎮",
    text: "Konsol, oyun hesabı ve ekipman satışı",
  },
  {
    name: "Anne & Bebek",
    icon: "👶",
    text: "Bebek ürünü, setler ve ikinci el ürünler",
  },
  {
    name: "Diğer",
    icon: "➕",
    text: "Listede olmayan diğer ürün ve satıcılar",
  },
];

const categoryProfiles: Record<string, CategoryProfile> = {
  Elektronik: {
    expectedPriceGap: 12,
    strongPriceGap: 28,
    extremePriceGap: 45,
    sensitiveWords: [
      "imei",
      "garanti yok",
      "fatura yok",
      "kutusuz",
      "yurtdışı",
      "yurt dışı",
      "icloud",
      "şifre",
      "anakart",
      "tamirli",
      "sıfır ayarında",
    ],
    safeHints: ["fatura", "garanti", "seri no", "elden kontrol", "test ederek"],
    categoryRisks: [
      "Elektronikte fatura, garanti, IMEI/seri numarası ve cihaz test imkanı özellikle önemlidir.",
      "Kutusu olmayan, faturası bulunmayan veya hızlı satılmak istenen teknolojik ürünlerde doğrulama daha dikkatli yapılmalıdır.",
    ],
  },
  Araç: {
    expectedPriceGap: 8,
    strongPriceGap: 18,
    extremePriceGap: 32,
    sensitiveWords: [
      "kapora gönder",
      "notere kadar",
      "ruhsat",
      "plaka",
      "hasar kaydı yok",
      "acil satılık",
      "opsiyonladım",
      "rezerve",
      "galeriden",
    ],
    safeHints: ["ekspertiz", "noter", "ruhsat", "plaka açık", "tramer"],
    categoryRisks: [
      "Araç ilanlarında kapora, ruhsat/plaka belirsizliği ve ekspertizden kaçınma ciddi risk sinyalidir.",
      "Araç tarafında küçük fiyat farkı bile tek başına karar sebebi yapılmamalı; noter, ekspertiz ve tramer bilgisi birlikte kontrol edilmelidir.",
    ],
  },
  Tekstil: {
    expectedPriceGap: 18,
    strongPriceGap: 38,
    extremePriceGap: 58,
    sensitiveWords: [
      "orijinal",
      "replika",
      "birebir",
      "etiketli",
      "iade yok",
      "değişim yok",
      "son fiyat",
      "stok az",
    ],
    safeHints: ["etiket", "fatura", "iade", "değişim", "mağaza"],
    categoryRisks: [
      "Tekstilde fiyat farkı tek başına yüksek risk sayılmamalıdır; iade, etiket, mağaza geçmişi ve ürün fotoğrafları daha belirleyicidir.",
      "Marka ürünlerde aşırı düşük fiyat, replika veya teslimat sonrası uyuşmazlık riskini artırabilir.",
    ],
  },
  "Ev & Yaşam": {
    expectedPriceGap: 15,
    strongPriceGap: 32,
    extremePriceGap: 52,
    sensitiveWords: [
      "nakliye parası",
      "taşıma ücreti",
      "kapora",
      "ölçü",
      "servis yok",
      "garanti yok",
      "depoda",
      "hemen alınmalı",
    ],
    safeHints: ["servis", "garanti", "ölçü", "yerinde gör", "elden teslim"],
    categoryRisks: [
      "Ev ve yaşam ürünlerinde nakliye bahanesiyle ön ödeme istenmesi sık görülen risklerden biridir.",
      "Beyaz eşya ve mobilyada yerinde görme, ölçü ve servis/garanti bilgisi kontrol edilmelidir.",
    ],
  },
  Oyun: {
    expectedPriceGap: 14,
    strongPriceGap: 30,
    extremePriceGap: 48,
    sensitiveWords: [
      "hesap devri",
      "mail değişir",
      "şifre veririm",
      "skin",
      "ban yok",
      "garanti yok",
      "kod",
      "dijital teslim",
    ],
    safeHints: ["elden teslim", "fatura", "kutu", "seri no", "platform içi"],
    categoryRisks: [
      "Oyun hesabı, dijital kod ve üyelik devri gibi işlemlerde geri alma/hesap kurtarma riski yüksektir.",
      "Konsol ve ekipmanda seri numarası, fatura ve cihaz testi önemlidir.",
    ],
  },
  "Anne & Bebek": {
    expectedPriceGap: 20,
    strongPriceGap: 40,
    extremePriceGap: 60,
    sensitiveWords: [
      "az kullanıldı",
      "lekesiz",
      "set halinde",
      "kargo parası",
      "kapora",
      "iade yok",
      "hemen gönder",
    ],
    safeHints: ["detaylı fotoğraf", "temiz", "marka", "ölçü", "elden gör"],
    categoryRisks: [
      "Anne ve bebek ürünlerinde hijyen, ürün yaşı, parça eksikliği ve gerçek fotoğraf kontrolü önemlidir.",
      "Bu kategoride makul indirim normaldir; risk puanı daha çok satıcı davranışı ve ödeme şekline göre artmalıdır.",
    ],
  },
  Diğer: {
    expectedPriceGap: 15,
    strongPriceGap: 35,
    extremePriceGap: 55,
    sensitiveWords: [
      "kapora",
      "havale",
      "eft",
      "rezerve",
      "acil",
      "bugün",
      "whatsapp",
      "iade yok",
    ],
    safeHints: ["elden teslim", "güvenli ödeme", "fatura", "iade", "mağaza"],
    categoryRisks: [
      "Kategori belirsiz olduğunda risk sonucu daha çok ödeme yöntemi, satıcı baskısı ve açıklama netliği üzerinden hesaplanır.",
    ],
  },
};


const identifierOptions: {
  key: IdentifierKind;
  title: string;
  short: string;
  placeholder: string;
}[] = [
  {
    key: "phone",
    title: "Telefon numarası",
    short: "Satıcı size telefon numarası verdiyse bunu seçin.",
    placeholder: "Örnek: 05xx xxx xx xx",
  },
  {
    key: "iban",
    title: "IBAN",
    short: "Kapora, havale veya EFT için IBAN verdiyse bunu seçin.",
    placeholder: "Örnek: TR00 0000 0000 0000 0000 0000 00",
  },
  {
    key: "username",
    title: "Kullanıcı adı",
    short: "Instagram, Dolap, Sahibinden veya profil adını kontrol edin.",
    placeholder: "Örnek: @saticiadi veya profil adı",
  },
];

const introSteps = [
  "Sorgu ekranı hazırlanıyor",
  "Gizlilik kontrolü yükleniyor",
  "Risk soruları açılıyor",
  "GüvenSor hazır",
];

const analysisSteps = [
  "Verdiğiniz bilgiler güvenli şekilde hazırlanıyor...",
  "Satıcı mesajındaki riskli ifadeler taranıyor...",
  "Kapora, acele baskısı ve platform dışı ödeme işaretleri kontrol ediliyor...",
  "Telefon, IBAN veya kullanıcı adı gizli eşleştirme için hazırlanıyor...",
  "Fiyat farkı ve piyasa uyumu değerlendiriliyor...",
  "Aynı bilgiye ait geçmiş sorgular kontrol ediliyor...",
  "Geçmiş risk ortalaması ile yeni sorgu sonucu birleştiriliyor...",
  "Risk sonucu oluşturuluyor...",
];

const TOTAL_STEPS = 7;
const DRAFT_KEY = "guvensor_query_draft";

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [authMessage, setAuthMessage] = useState("");

  const [showIntro, setShowIntro] = useState(true);
  const [introStep, setIntroStep] = useState(0);
  const [step, setStep] = useState(1);

  const [productCategory, setProductCategory] = useState("Elektronik");
  const [platform, setPlatform] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [marketAveragePrice, setMarketAveragePrice] = useState("");
  const [sellerMessage, setSellerMessage] = useState("");
  const [identifierKind, setIdentifierKind] = useState<IdentifierKind>("phone");
  const [identifier, setIdentifier] = useState("");

  const [depositAsked, setDepositAsked] = useState(false);
  const [outsidePayment, setOutsidePayment] = useState(false);
  const [pressure, setPressure] = useState(false);
  const [noRiskSigns, setNoRiskSigns] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [voteLoading, setVoteLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [voteMessage, setVoteMessage] = useState("");

  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [showResultModal, setShowResultModal] = useState(false);
  const [finishMessage, setFinishMessage] = useState("");
const [showFeedbackModal, setShowFeedbackModal] = useState(false);
const [feedbackRating, setFeedbackRating] = useState(0);
const [feedbackHelpfulness, setFeedbackHelpfulness] = useState<
  "yardimci_oldu" | "kismen" | "yetersiz" | ""
>("");
const [feedbackComment, setFeedbackComment] = useState("");
const [feedbackLoading, setFeedbackLoading] = useState(false);
const [pendingFinishMessage, setPendingFinishMessage] = useState("");
  const selectedIdentifier = useMemo(() => {
    return (
      identifierOptions.find((item) => item.key === identifierKind) ??
      identifierOptions[0]
    );
  }, [identifierKind]);

  const progress = Math.round((step / TOTAL_STEPS) * 100);

  const inputClass =
    "w-full rounded-[1.5rem] border border-white/20 bg-[#243a31] px-5 py-5 text-base font-semibold text-white caret-lime-300 outline-none transition placeholder:text-white/70 focus:border-lime-300/70 focus:bg-[#2d493d]";

  const textareaClass =
    "w-full resize-none rounded-[1.5rem] border border-white/20 bg-[#243a31] px-5 py-5 text-base font-semibold leading-7 text-white caret-lime-300 outline-none transition placeholder:text-white/70 focus:border-lime-300/70 focus:bg-[#2d493d]";

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setIntroStep((current) => (current + 1) % introSteps.length);
    }, 420);

    const closeTimer = setTimeout(() => {
      setShowIntro(false);
    }, 1500);

    return () => {
      clearInterval(stepTimer);
      clearTimeout(closeTimer);
    };
  }, []);

  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);

    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);

        setProductCategory(draft.productCategory ?? "Elektronik");
        setPlatform(draft.platform ?? "");
        setTitle(draft.title ?? "");
        setPrice(draft.price ?? "");
        setMarketAveragePrice(draft.marketAveragePrice ?? "");
        setSellerMessage(draft.sellerMessage ?? "");
        setIdentifierKind(draft.identifierKind ?? "phone");
        setIdentifier(draft.identifier ?? "");
        setDepositAsked(Boolean(draft.depositAsked));
        setOutsidePayment(Boolean(draft.outsidePayment));
        setPressure(Boolean(draft.pressure));
        setNoRiskSigns(Boolean(draft.noRiskSigns));
        setStep(draft.step ?? 7);
      } catch {
        localStorage.removeItem(DRAFT_KEY);
      }
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  function clearError() {
    if (errorMessage) setErrorMessage("");
  }

  function saveDraft() {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        productCategory,
        platform,
        title,
        price,
        marketAveragePrice,
        sellerMessage,
        identifierKind,
        identifier,
        depositAsked,
        outsidePayment,
        pressure,
        noRiskSigns,
        step,
      })
    );
  }

  function resetForm() {
    setStep(1);
    setProductCategory("Elektronik");
    setPlatform("");
    setTitle("");
    setPrice("");
    setMarketAveragePrice("");
    setSellerMessage("");
    setIdentifierKind("phone");
    setIdentifier("");
    setDepositAsked(false);
    setOutsidePayment(false);
    setPressure(false);
    setNoRiskSigns(false);
    setResult(null);
    setVoteMessage("");
    setAuthMessage("");
    setErrorMessage("");
    localStorage.removeItem(DRAFT_KEY);

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 80);
  }

  async function signInWithGoogle() {
    setAuthMessage("");
    saveDraft();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      setAuthMessage("Google ile giriş başlatılamadı. Lütfen tekrar deneyin.");
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setResult(null);
    setShowResultModal(false);
  }

  function validateStep(currentStep: number) {
    setErrorMessage("");

    if (currentStep === 2 && !identifier.trim()) {
      setErrorMessage(`${selectedIdentifier.title} alanını doldurmalısınız.`);
      return false;
    }

    if (currentStep === 3) {
      if (!platform.trim()) {
        setErrorMessage("İlanı gördüğünüz platformu yazmalısınız.");
        return false;
      }

      if (!title.trim()) {
        setErrorMessage("Ürün veya ilan başlığını yazmalısınız.");
        return false;
      }
    }

    if (currentStep === 4 && sellerMessage.trim().length < 10) {
      setErrorMessage("Satıcı mesajını veya ilan açıklamasını yazmalısınız.");
      return false;
    }

    if (currentStep === 5) {
      if (!price.trim()) {
        setErrorMessage("İlan fiyatını yazmalısınız.");
        return false;
      }

      if (!marketAveragePrice.trim()) {
        setErrorMessage("Ortalama piyasa fiyatını yazmalısınız.");
        return false;
      }

      if (Number(price) <= 0 || Number(marketAveragePrice) <= 0) {
        setErrorMessage("Fiyat alanlarına geçerli bir sayı yazmalısınız.");
        return false;
      }
    }

    if (
      currentStep === 6 &&
      !depositAsked &&
      !outsidePayment &&
      !pressure &&
      !noRiskSigns
    ) {
      setErrorMessage("Bu adımda en az bir seçenek işaretlemelisiniz.");
      return false;
    }

    return true;
  }

  function validateAllRequiredFields() {
    if (!identifier.trim()) {
      setStep(2);
      setErrorMessage(`${selectedIdentifier.title} alanını doldurmalısınız.`);
      return false;
    }

    if (!platform.trim() || !title.trim()) {
      setStep(3);
      setErrorMessage("Platform ve ilan başlığı alanlarını doldurmalısınız.");
      return false;
    }

    if (sellerMessage.trim().length < 10) {
      setStep(4);
      setErrorMessage("Satıcı mesajını veya ilan açıklamasını yazmalısınız.");
      return false;
    }

    if (
      !price.trim() ||
      !marketAveragePrice.trim() ||
      Number(price) <= 0 ||
      Number(marketAveragePrice) <= 0
    ) {
      setStep(5);
      setErrorMessage("İlan fiyatı ve ortalama piyasa fiyatını doğru girmelisiniz.");
      return false;
    }

    if (!depositAsked && !outsidePayment && !pressure && !noRiskSigns) {
      setStep(6);
      setErrorMessage("Risk davranışı adımında bir seçim yapmalısınız.");
      return false;
    }

    return true;
  }

  function goNext() {
    if (!validateStep(step)) return;

    setStep((current) => Math.min(current + 1, TOTAL_STEPS));

    setTimeout(() => {
      document.getElementById("sorgu-paneli")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  }

  function goBack() {
    setErrorMessage("");
    setStep((current) => Math.max(current - 1, 1));
  }

  async function createHash(value: string): Promise<string | null> {
    const cleanValue = value.trim().toLowerCase().replace(/\s+/g, "");
    if (!cleanValue) return null;

    const encoder = new TextEncoder();
    const data = encoder.encode(cleanValue);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);

    return Array.from(new Uint8Array(hashBuffer))
      .map((item) => item.toString(16).padStart(2, "0"))
      .join("");
  }

  function maskIdentifier(value: string): string | null {
    const cleanValue = value.trim().replace(/\s+/g, "");
    if (!cleanValue) return null;

    if (cleanValue.toUpperCase().startsWith("TR")) {
      return `${cleanValue.slice(0, 4)} **** **** **** **** ${cleanValue.slice(
        -4
      )}`;
    }

    if (/^\d+$/.test(cleanValue)) {
      return `${cleanValue.slice(0, 4)} *** ** ${cleanValue.slice(-2)}`;
    }

    if (cleanValue.includes("@")) {
      const [name, domain] = cleanValue.split("@");
      return `${name.slice(0, 2)}***@${domain}`;
    }

    return `${cleanValue.slice(0, 2)}***${cleanValue.slice(-2)}`;
  }

  function getRiskLevel(score: number): RiskLevel {
    if (score >= 70) return "Yüksek Risk";
    if (score >= 40) return "Orta Risk";
    return "Düşük Risk";
  }

  function combineRiskWithHistory(
    currentScore: number,
    stats: CommunityStats | null
  ) {
    if (!stats || stats.total_queries <= 0) {
      return {
        combinedScore: currentScore,
        historyUsed: false,
        previousAverage: null as number | null,
        previousTotal: 0,
      };
    }

    const previousTotal = Number(stats.total_queries);
    const previousAverage = Number(stats.average_risk_score || 0);

    const combinedScore = Math.round(
      (previousAverage * previousTotal + currentScore) / (previousTotal + 1)
    );

    return {
      combinedScore: Math.min(combinedScore, 100),
      historyUsed: true,
      previousAverage,
      previousTotal,
    };
  }

  function normalizeText(value: string) {
    return value
      .toLowerCase()
      .replace(/[ı]/g, "i")
      .replace(/[ğ]/g, "g")
      .replace(/[ü]/g, "u")
      .replace(/[ş]/g, "s")
      .replace(/[ö]/g, "o")
      .replace(/[ç]/g, "c")
      .replace(/\s+/g, " ")
      .trim();
  }

  function countMatches(text: string, words: string[]) {
    return words.filter((word) => text.includes(normalizeText(word)));
  }

  function calculateSectionLevel(score: number): AnalysisBreakdown["level"] {
    if (score >= 70) return "Riskli";
    if (score >= 38) return "Dikkat";
    return "Güçlü";
  }

  function addUnique(list: string[], item: string) {
    if (!list.includes(item)) list.push(item);
  }

  function calculateRisk() {
    let score = 10;
    const reasons: string[] = [];
    const suggestions: string[] = [];
    const breakdown: AnalysisBreakdown[] = [];

    const profile =
      categoryProfiles[productCategory] ?? categoryProfiles.Diğer;
    const rawText = `${title} ${platform} ${sellerMessage}`;
    const text = normalizeText(rawText);
    const messageText = normalizeText(sellerMessage);
    const platformText = normalizeText(platform);

    const numericPrice = Number(price);
    const average = Number(marketAveragePrice);
    let priceDiff: number | null = null;

    const behaviorFactors: AnalysisFactor[] = [];
    let behaviorScore = 18;

    if (depositAsked) {
      score += 24;
      behaviorScore += 28;
      behaviorFactors.push({
        label: "Kapora / ön ödeme",
        detail: "Satıcı ürün ayrılması, kargo veya rezerve için ödeme istiyor.",
        points: 24,
        severity: "high",
      });
      addUnique(reasons, "Satıcı kapora veya ön ödeme istiyor.");
      addUnique(
        suggestions,
        "Kapora göndermeden önce satıcıyı, ürünü ve teslimat bilgisini doğrulayın."
      );
    }

    if (outsidePayment) {
      score += 23;
      behaviorScore += 26;
      behaviorFactors.push({
        label: "Platform dışı ödeme",
        detail:
          "Satıcı güvenli ödeme akışı yerine IBAN, EFT, havale veya WhatsApp yönlendirmesi yapıyor.",
        points: 23,
        severity: "high",
      });
      addUnique(reasons, "Satıcı platform dışı ödeme istiyor.");
      addUnique(
        suggestions,
        "Mümkünse platformun güvenli ödeme sistemini veya elden kontrol yöntemini tercih edin."
      );
    }

    if (pressure) {
      score += 16;
      behaviorScore += 19;
      behaviorFactors.push({
        label: "Acele baskısı",
        detail:
          "Bugün al, başkası yazdı veya hemen gönder gibi karar baskısı var.",
        points: 16,
        severity: "medium",
      });
      addUnique(reasons, "Satıcı hızlı karar vermeniz için baskı kuruyor.");
      addUnique(
        suggestions,
        "Aceleyle ödeme yapmayın. Aynı ürünün benzer ilanlarını ve fiyatlarını karşılaştırın."
      );
    }

    if (noRiskSigns) {
      score -= 7;
      behaviorScore -= 10;
      behaviorFactors.push({
        label: "Açık risk davranışı seçilmedi",
        detail:
          "Kapora, platform dışı ödeme ve acele baskısı kullanıcı tarafından işaretlenmedi.",
        points: -7,
        severity: "positive",
      });
      addUnique(
        reasons,
        "Kapora, platform dışı ödeme veya acele baskısı seçilmedi."
      );
    }

    const directRiskWords = [
      "kapora",
      "on odeme",
      "ön ödeme",
      "havale",
      "eft",
      "iban",
      "platform disi",
      "platform dışı",
      "whatsapp",
      "kargo parasi",
      "kargo parası",
      "rezerve",
      "ayiririm",
      "ayırırım",
      "bugun",
      "bugün",
      "hemen",
      "acele",
      "firsat",
      "fırsat",
      "baskasi yazdi",
      "başkası yazdı",
      "son fiyat",
      "iade yok",
    ];

    const matchedDirectRiskWords = countMatches(text, directRiskWords);
    const uniqueDirectMatches = Array.from(new Set(matchedDirectRiskWords));

    if (uniqueDirectMatches.length > 0) {
      const wordScore = Math.min(uniqueDirectMatches.length * 4, 22);
      score += wordScore;
      behaviorScore += Math.min(uniqueDirectMatches.length * 5, 24);

      behaviorFactors.push({
        label: "Metin içi riskli ifadeler",
        detail: `Satıcı metninde şu risk sinyalleri geçti: ${uniqueDirectMatches
          .slice(0, 6)
          .join(", ")}.`,
        points: wordScore,
        severity: uniqueDirectMatches.length >= 4 ? "high" : "medium",
      });

      addUnique(
        reasons,
        `Satıcı metninde ${uniqueDirectMatches.length} adet riskli ifade tespit edildi.`
      );
    }

    if (messageText.length > 0 && messageText.length < 35) {
      score += 5;
      behaviorScore += 6;
      behaviorFactors.push({
        label: "Kısa açıklama",
        detail:
          "Satıcı mesajı çok kısa olduğu için ürün ve süreç hakkında yeterli güven sinyali üretmiyor.",
        points: 5,
        severity: "low",
      });
      addUnique(reasons, "Satıcı mesajı çok kısa olduğu için güven sinyali sınırlı.");
    }

    if (behaviorFactors.length === 0) {
      behaviorFactors.push({
        label: "Belirgin davranış riski yok",
        detail:
          "Kapora, baskı veya platform dışı ödeme gibi güçlü davranış sinyali görülmedi.",
        points: 0,
        severity: "positive",
      });
    }

    breakdown.push({
      title: "Satıcı davranışı",
      score: Math.min(Math.max(behaviorScore, 0), 100),
      level: calculateSectionLevel(behaviorScore),
      summary:
        "Kapora, platform dışı ödeme, acele baskısı ve satıcının kullandığı ifadeler birlikte değerlendirildi.",
      factors: behaviorFactors,
    });

    const priceFactors: AnalysisFactor[] = [];
    let priceScore = 18;

    if (numericPrice > 0 && average > 0) {
      priceDiff = Math.round(((average - numericPrice) / average) * 100);

      if (priceDiff >= profile.extremePriceGap) {
        score += 24;
        priceScore += 38;
        priceFactors.push({
          label: "Aşırı düşük fiyat",
          detail: `Bu kategoride %${priceDiff} fiyat farkı olağanın üzerinde. ${productCategory} için güçlü risk eşiği yaklaşık %${profile.strongPriceGap}, aşırı risk eşiği yaklaşık %${profile.extremePriceGap} kabul edildi.`,
          points: 24,
          severity: "high",
        });
        addUnique(
          reasons,
          `İlan fiyatı bu kategoriye göre piyasanın yaklaşık %${priceDiff} altında ve aşırı düşük görünüyor.`
        );
      } else if (priceDiff >= profile.strongPriceGap) {
        score += 14;
        priceScore += 25;
        priceFactors.push({
          label: "Güçlü indirim",
          detail: `Fiyat yaklaşık %${priceDiff} düşük. Bu oran ${productCategory} için dikkat seviyesinde değerlendirildi.`,
          points: 14,
          severity: "medium",
        });
        addUnique(
          reasons,
          `İlan fiyatı ortalama piyasa fiyatının yaklaşık %${priceDiff} altında görünüyor.`
        );
      } else if (priceDiff >= profile.expectedPriceGap) {
        score += 5;
        priceScore += 10;
        priceFactors.push({
          label: "Makul alt fiyat",
          detail: `Fiyat yaklaşık %${priceDiff} düşük. Tek başına ağır risk sayılmadı; diğer sinyallerle birlikte değerlendirildi.`,
          points: 5,
          severity: "low",
        });
        addUnique(
          reasons,
          `İlan fiyatı piyasanın yaklaşık %${priceDiff} altında; bu fark tek başına yüksek risk sayılmadı.`
        );
      } else if (priceDiff > -20) {
        score -= 3;
        priceScore -= 4;
        priceFactors.push({
          label: "Piyasaya yakın fiyat",
          detail:
            "Fiyat, girilen ortalama piyasa değerine yakın. Bu durum tek başına olumlu bir sinyal olarak değerlendirildi.",
          points: -3,
          severity: "positive",
        });
      } else {
        score += 4;
        priceScore += 6;
        priceFactors.push({
          label: "Ortalamanın üzerinde fiyat",
          detail:
            "İlan fiyatı ortalamanın üzerinde. Dolandırıcılık sinyali değil fakat fiyat/ürün bilgisinin yeniden kontrol edilmesi iyi olur.",
          points: 4,
          severity: "low",
        });
        addUnique(
          reasons,
          "İlan fiyatı ortalamanın üzerinde; fiyat bilgisini tekrar kontrol etmek faydalı olabilir."
        );
      }
    } else {
      priceScore += 8;
      priceFactors.push({
        label: "Fiyat verisi sınırlı",
        detail:
          "İlan fiyatı veya ortalama piyasa fiyatı net olmadığı için fiyat analizi sınırlı kaldı.",
        points: 8,
        severity: "low",
      });
    }

    breakdown.push({
      title: "Fiyat ve piyasa uyumu",
      score: Math.min(Math.max(priceScore, 0), 100),
      level: calculateSectionLevel(priceScore),
      summary:
        "Fiyat farkı kategoriye göre yorumlandı. %10 civarı düşük fiyat ağır risk olarak sayılmadı.",
      factors: priceFactors,
    });

    const categoryFactors: AnalysisFactor[] = [];
    let categoryScore = 14;
    const matchedCategoryWords = countMatches(text, profile.sensitiveWords);
    const matchedSafeHints = countMatches(text, profile.safeHints);

    if (matchedCategoryWords.length > 0) {
      const categoryWordScore = Math.min(matchedCategoryWords.length * 5, 18);
      score += categoryWordScore;
      categoryScore += categoryWordScore + 10;
      categoryFactors.push({
        label: `${productCategory} kategori sinyalleri`,
        detail: `Bu kategori için dikkat edilmesi gereken ifadeler bulundu: ${Array.from(
          new Set(matchedCategoryWords)
        )
          .slice(0, 6)
          .join(", ")}.`,
        points: categoryWordScore,
        severity: matchedCategoryWords.length >= 3 ? "medium" : "low",
      });
      addUnique(
        reasons,
        `${productCategory} kategorisine özel ek risk sinyalleri bulundu.`
      );
    }

    if (matchedSafeHints.length > 0) {
      const safeScore = Math.min(matchedSafeHints.length * 3, 9);
      score -= safeScore;
      categoryScore -= safeScore;
      categoryFactors.push({
        label: "Kategoriye uygun güven sinyalleri",
        detail: `Metinde şu olumlu doğrulama sinyalleri var: ${Array.from(
          new Set(matchedSafeHints)
        )
          .slice(0, 6)
          .join(", ")}.`,
        points: -safeScore,
        severity: "positive",
      });
    }

    if (categoryFactors.length === 0) {
      categoryFactors.push({
        label: "Kategori sinyali nötr",
        detail:
          "Seçilen kategoriye özel çok güçlü olumlu veya olumsuz ifade tespit edilmedi.",
        points: 0,
        severity: "low",
      });
    }

    profile.categoryRisks.forEach((item) => addUnique(suggestions, item));

    breakdown.push({
      title: "Kategoriye özel kontrol",
      score: Math.min(Math.max(categoryScore, 0), 100),
      level: calculateSectionLevel(categoryScore),
      summary:
        "Ürün kategorisine göre değişen fiyat toleransı, açıklama riski ve doğrulama ihtiyacı ayrı hesaplandı.",
      factors: categoryFactors,
    });

    const identityFactors: AnalysisFactor[] = [];
    let identityScore = 16;

    if (identifierKind === "iban") {
      score += 9;
      identityScore += 18;
      identityFactors.push({
        label: "IBAN kontrolü",
        detail:
          "IBAN ile ödeme ihtimali olduğu için kimlik ve ödeme doğrulaması daha hassas değerlendirildi.",
        points: 9,
        severity: "medium",
      });
      addUnique(
        suggestions,
        "IBAN'a para göndermeden önce alıcı adını, satıcı profiliyle ve ilan bilgisiyle eşleştirin."
      );
    } else if (identifierKind === "phone") {
      identityScore += 8;
      identityFactors.push({
        label: "Telefon kontrolü",
        detail:
          "Telefon numarası tek başına riskli değildir; ancak WhatsApp yönlendirmesi ve ödeme isteğiyle birleşirse risk artar.",
        points: 0,
        severity: "low",
      });
    } else {
      identityScore += 6;
      identityFactors.push({
        label: "Kullanıcı adı kontrolü",
        detail:
          "Kullanıcı adı için profil yaşı, yorumlar, takipçi kalitesi ve önceki satış izleri kontrol edilmelidir.",
        points: 0,
        severity: "low",
      });
    }

    if (platformText.includes("instagram") || platformText.includes("facebook")) {
      score += 6;
      identityScore += 10;
      identityFactors.push({
        label: "Sosyal medya satışı",
        detail:
          "Sosyal medya üzerinden satışlarda platform içi alıcı koruması sınırlı olabilir.",
        points: 6,
        severity: "low",
      });
    }

    if (
      platformText.includes("sahibinden") ||
      platformText.includes("dolap") ||
      platformText.includes("letgo")
    ) {
      score -= 2;
      identityScore -= 4;
      identityFactors.push({
        label: "İlan platformu sinyali",
        detail:
          "Bilinen ilan platformu kullanımı tek başına güvenli sayılmaz; fakat platform içi işlem yapılırsa risk azalır.",
        points: -2,
        severity: "positive",
      });
    }

    breakdown.push({
      title: "Kimlik ve platform kontrolü",
      score: Math.min(Math.max(identityScore, 0), 100),
      level: calculateSectionLevel(identityScore),
      summary:
        "Telefon, IBAN veya kullanıcı adı; platform tipi ve ödeme yönlendirmesiyle birlikte değerlendirildi.",
      factors: identityFactors,
    });

    const evidenceFactors: AnalysisFactor[] = [];
    let evidenceScore = 20;

    const evidenceWords = [
      "fatura",
      "garanti",
      "elden",
      "test",
      "video",
      "detayli fotograf",
      "detaylı fotoğraf",
      "seri no",
      "magaza",
      "mağaza",
      "iade",
      "guvenli odeme",
      "güvenli ödeme",
    ];

    const matchedEvidence = countMatches(text, evidenceWords);

    if (matchedEvidence.length >= 3) {
      score -= 10;
      evidenceScore -= 16;
      evidenceFactors.push({
        label: "Güçlü doğrulama sinyali",
        detail: `Metinde doğrulamaya yardımcı ifadeler var: ${Array.from(
          new Set(matchedEvidence)
        )
          .slice(0, 6)
          .join(", ")}.`,
        points: -10,
        severity: "positive",
      });
    } else if (matchedEvidence.length > 0) {
      score -= 4;
      evidenceScore -= 6;
      evidenceFactors.push({
        label: "Kısmi doğrulama sinyali",
        detail: `Bazı güven sinyalleri var: ${Array.from(
          new Set(matchedEvidence)
        )
          .slice(0, 6)
          .join(", ")}.`,
        points: -4,
        severity: "positive",
      });
    } else {
      score += 8;
      evidenceScore += 13;
      evidenceFactors.push({
        label: "Doğrulama bilgisi eksik",
        detail:
          "Fatura, garanti, elden kontrol, video veya güvenli ödeme gibi net güven sinyali görülmedi.",
        points: 8,
        severity: "low",
      });
      addUnique(
        suggestions,
        "Satıcıdan ürünün güncel videosunu, detaylı fotoğraflarını ve mümkünse fatura/garanti bilgisini isteyin."
      );
    }

    breakdown.push({
      title: "Kanıt ve doğrulama",
      score: Math.min(Math.max(evidenceScore, 0), 100),
      level: calculateSectionLevel(evidenceScore),
      summary:
        "Satıcının ürünü gerçekten elinde tuttuğunu ve satış şartlarını doğrulatabilecek sinyaller kontrol edildi.",
      factors: evidenceFactors,
    });

    addUnique(
      suggestions,
      "Ödeme yapmadan önce ürün fotoğraflarını, satıcı profilini ve teslimat bilgisini doğrulayın."
    );
    addUnique(suggestions, "Kimlik, kart bilgisi veya özel şifrelerinizi paylaşmayın.");
    addUnique(
      suggestions,
      "Şüpheli durumda ödemeyi durdurun ve satıcıdan doğrulanabilir bilgi isteyin."
    );

    if (reasons.length === 0) {
      reasons.push("Belirgin yüksek risk işareti tespit edilmedi.");
    }

    const finalScore = Math.min(Math.max(Math.round(score), 0), 100);
    const level = getRiskLevel(finalScore);

    return {
      score: finalScore,
      level,
      reasons,
      suggestions,
      priceDiff,
      analysisBreakdown: breakdown,
    };
  }

  async function getCommunityStats(identifierHash: string | null) {
    if (!identifierHash) return null;

    const { data, error } = await supabase.rpc("get_identifier_stats", {
      p_identifier_hash: identifierHash,
    });

    if (error) {
      console.error(error);
      return null;
    }

    return (data?.[0] as CommunityStats) ?? null;
  }

  async function handleAnalyze() {
    setVoteMessage("");

    if (!validateAllRequiredFields()) return;

    saveDraft();

    if (!user) {
      setAuthMessage(
        "Risk sonucunu görmek için Google hesabınızla giriş yapmanız gerekiyor."
      );
      return;
    }

    setLoading(true);
    setShowAnalysisModal(true);
    setShowResultModal(false);
    setAnalysisStep(0);

    try {
      for (let i = 0; i < analysisSteps.length; i += 1) {
        setAnalysisStep(i);
        await wait(520);
      }

      const rawRisk = calculateRisk();
      const identifierHash = await createHash(identifier);
      const identifierMasked = maskIdentifier(identifier);
      const stats = await getCommunityStats(identifierHash);

      const historyResult = combineRiskWithHistory(rawRisk.score, stats);

      const risk = {
        ...rawRisk,
        score: historyResult.combinedScore,
        level: getRiskLevel(historyResult.combinedScore),
        reasons: [
          ...rawRisk.reasons,
          ...(historyResult.historyUsed
            ? [
                `Bu bilgi daha önce ${historyResult.previousTotal} kez sorgulanmış. Önceki ortalama risk puanı ${historyResult.previousAverage}/100 olarak bulundu. Mevcut sorgu ile geçmiş sonuçlar birlikte hesaplandı.`,
              ]
            : []),
        ],
        suggestions: [
          ...rawRisk.suggestions,
          ...(historyResult.historyUsed &&
          historyResult.previousAverage !== null &&
          historyResult.previousAverage >= 70
            ? [
                "Bu bilgi geçmiş sorgularda yüksek riskli göründüğü için ödeme yapmadan önce ekstra dikkatli olun.",
              ]
            : []),
        ],
      };

      const { data, error } = await supabase
        .from("queries")
        .insert({
          user_id: user.id,
          query_type: "ilan_kontrol",
          product_category: productCategory,
          platform: platform || null,
          title: title || null,
          price: price ? Number(price) : null,
          market_average_price: marketAveragePrice
            ? Number(marketAveragePrice)
            : null,
          price_difference_percent: risk.priceDiff,
          seller_message: sellerMessage || null,
          identifier_hash: identifierHash,
          identifier_masked: identifierMasked,
          risk_score: risk.score,
          risk_level: risk.level,
          risk_reasons: risk.reasons,
        })
        .select("id")
        .single();

      if (error) {
        console.error(error);
        setShowAnalysisModal(false);
        alert("Sorgu kaydedilemedi. RLS veya tablo ayarını kontrol et.");
        return;
      }

      localStorage.removeItem(DRAFT_KEY);

      setResult({
        ...risk,
        identifierHash,
        identifierMasked,
        queryId: data?.id ?? null,
        communityStats: stats,
      });

      await wait(500);
      setShowAnalysisModal(false);
      setShowResultModal(true);
    } catch (error) {
      console.error(error);
      setShowAnalysisModal(false);
      alert("Beklenmeyen bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

 function completeQuery(message: string) {
  setPendingFinishMessage(message);
  setShowResultModal(false);
  setShowFeedbackModal(true);
}

function closeFeedbackAndReset(message?: string) {
  setShowFeedbackModal(false);
  setFeedbackRating(0);
  setFeedbackHelpfulness("");
  setFeedbackComment("");

  resetForm();

  setFinishMessage(
    message ||
      pendingFinishMessage ||
      "Sorgulamanız tamamlandı. Umarız karar vermenize yardımcı olmuştur."
  );

  setPendingFinishMessage("");

  setTimeout(() => {
    setFinishMessage("");
  }, 3600);
}

async function submitFeedback() {
  if (!user || !result?.queryId) {
    closeFeedbackAndReset();
    return;
  }

  if (!feedbackRating || !feedbackHelpfulness) {
    closeFeedbackAndReset();
    return;
  }

  setFeedbackLoading(true);

  const { error } = await supabase.from("feedbacks").insert({
    user_id: user.id,
    query_id: result.queryId,
    rating: feedbackRating,
    helpfulness: feedbackHelpfulness,
    comment: feedbackComment.trim() || null,
  });

  setFeedbackLoading(false);

  if (error) {
    console.error(error);
    closeFeedbackAndReset(
      "Sorgunuz tamamlandı. Geri bildiriminiz kaydedilemedi ama sorun değil."
    );
    return;
  }

  closeFeedbackAndReset("Teşekkürler. Geri bildiriminiz kaydedildi.");
}

  async function handleVote(voteType: VoteType) {
    if (!user || !result?.queryId) return;

    setVoteLoading(true);
    setVoteMessage("");

    const { error } = await supabase.from("votes").insert({
      user_id: user.id,
      query_id: result.queryId,
      identifier_hash: result.identifierHash,
      vote_type: voteType,
      comment: null,
    });

    if (error) {
      console.error(error);
      setVoteMessage("Oy kaydedilemedi. Yine de sorguyu tamamlayabilirsiniz.");
      setVoteLoading(false);
      return;
    }

    setVoteLoading(false);
    completeQuery(
      "Oyunuz kaydedildi. Umarız bu sorgu karar vermenize yardımcı olmuştur."
    );
  }

  function renderStep() {
    if (step === 1) {
      return (
        <div>
          <p className="text-sm font-black text-lime-200">Soru 1</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.06em] md:text-5xl">
            Hangi ürünü kontrol etmek istiyorsunuz?
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/78">
            Ürün kategorisini seçin. Böylece risk sonucu daha doğru yorumlanır.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => {
                  setProductCategory(cat.name);
                  clearError();
                }}
                className={`rounded-[1.5rem] border p-5 text-left transition ${
                  productCategory === cat.name
                    ? "border-lime-300/70 bg-lime-300 text-[#06100d]"
                    : "border-white/14 bg-white/[0.095] text-white hover:bg-white/[0.14]"
                }`}
              >
                <div className="text-3xl">{cat.icon}</div>
                <p className="mt-4 text-lg font-black">{cat.name}</p>
                <p
                  className={`mt-1 text-xs leading-5 ${
                    productCategory === cat.name
                      ? "text-[#06100d]/72"
                      : "text-white/78"
                  }`}
                >
                  {cat.text}
                </p>
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div>
          <p className="text-sm font-black text-lime-200">Soru 2</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.06em] md:text-5xl">
            Satıcıya ait hangi bilgi elinizde var?
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/78">
            Sadece elinizde olan bilgiyi seçin. Telefon, IBAN ve kullanıcı adını aynı anda girmeniz gerekmez.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {identifierOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => {
                  setIdentifierKind(option.key);
                  setIdentifier("");
                  clearError();
                }}
                className={`rounded-[1.5rem] border p-5 text-left transition ${
                  identifierKind === option.key
                    ? "border-lime-300/70 bg-lime-300 text-[#06100d]"
                    : "border-white/14 bg-white/[0.095] text-white hover:bg-white/[0.14]"
                }`}
              >
                <p className="text-lg font-black">{option.title}</p>
                <p
                  className={`mt-2 text-xs leading-5 ${
                    identifierKind === option.key
                      ? "text-[#06100d]/72"
                      : "text-white/78"
                  }`}
                >
                  {option.short}
                </p>
              </button>
            ))}
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-white/70">
              {selectedIdentifier.title}
            </label>
            <input
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                clearError();
              }}
              placeholder={selectedIdentifier.placeholder}
              className={inputClass}
            />
            <p className="mt-3 text-xs leading-5 text-white/74">
              Bu bilgi açık şekilde saklanmaz. Sistem yalnızca güvenli eşleştirme için hash üretir.
            </p>
          </div>
        </div>
      );
    }

    if (step === 3) {
      return (
        <div>
          <p className="text-sm font-black text-lime-200">Soru 3</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.06em] md:text-5xl">
            İlanı nerede gördünüz?
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/78">
            Platform ve ilan başlığı, satıcı davranışıyla birlikte değerlendirilir.
          </p>

          <div className="mt-6 grid gap-4">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-white/70">
                Platform
              </label>
              <input
                value={platform}
                onChange={(e) => {
                  setPlatform(e.target.value);
                  clearError();
                }}
                placeholder="Örnek: Sahibinden, Dolap, Instagram, Facebook..."
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-white/70">
                Ürün veya ilan başlığı
              </label>
              <input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  clearError();
                }}
                placeholder="Örnek: iPhone 13 Pro 128 GB temiz cihaz"
                className={inputClass}
              />
            </div>
          </div>
        </div>
      );
    }

    if (step === 4) {
      return (
        <div>
          <p className="text-sm font-black text-lime-200">Soru 4</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.06em] md:text-5xl">
            Satıcı size ne yazdı?
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/78">
            Satıcının mesajını veya ilan açıklamasını buraya yapıştırın. Kapora, acele, havale ve benzeri riskli ifadeler bu metinden kontrol edilir.
          </p>

          <div className="mt-6">
            <textarea
              value={sellerMessage}
              onChange={(e) => {
                setSellerMessage(e.target.value);
                clearError();
              }}
              placeholder="Örnek: Ürün elimde, bugün alırsanız ayırırım. Kapora gönderirseniz başkasına vermem..."
              rows={8}
              className={textareaClass}
            />
          </div>
        </div>
      );
    }

    if (step === 5) {
      return (
        <div>
          <p className="text-sm font-black text-lime-200">Soru 5</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.06em] md:text-5xl">
            Fiyat piyasanın çok altında mı?
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/78">
            İlan fiyatı piyasa değerinden çok düşükse risk puanı artabilir.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-white/70">
                İlan fiyatı
              </label>
              <input
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  clearError();
                }}
                placeholder="Örnek: 18500"
                type="number"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-white/70">
                Ortalama piyasa fiyatı
              </label>
              <input
                value={marketAveragePrice}
                onChange={(e) => {
                  setMarketAveragePrice(e.target.value);
                  clearError();
                }}
                placeholder="Örnek: 26000"
                type="number"
                className={inputClass}
              />
            </div>
          </div>

          <p className="mt-4 text-xs leading-5 text-white/74">
            Ortalama fiyatı bilmiyorsanız yakın bir tahmin yazabilirsiniz.
          </p>
        </div>
      );
    }

    if (step === 6) {
      return (
        <div>
          <p className="text-sm font-black text-lime-200">Soru 6</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.06em] md:text-5xl">
            Satıcıda bu davranışlardan biri var mı?
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/78">
            Size uyan maddeleri seçin. Hiçbiri yoksa son seçeneği işaretleyin.
          </p>

          <div className="mt-6 grid gap-3">
            <button
              onClick={() => {
                setDepositAsked((value) => !value);
                setNoRiskSigns(false);
                clearError();
              }}
              className={`rounded-[1.5rem] border p-5 text-left transition ${
                depositAsked
                  ? "border-lime-300/70 bg-lime-300 text-[#06100d]"
                  : "border-white/14 bg-white/[0.095] text-white hover:bg-white/[0.14]"
              }`}
            >
              <p className="text-lg font-black">Kapora veya ön ödeme istiyor</p>
              <p
                className={`mt-1 text-xs leading-5 ${
                  depositAsked ? "text-[#06100d]/72" : "text-white/78"
                }`}
              >
                Ürünü ayırmak, rezerve etmek veya kargolamak için önce para istiyor.
              </p>
            </button>

            <button
              onClick={() => {
                setOutsidePayment((value) => !value);
                setNoRiskSigns(false);
                clearError();
              }}
              className={`rounded-[1.5rem] border p-5 text-left transition ${
                outsidePayment
                  ? "border-lime-300/70 bg-lime-300 text-[#06100d]"
                  : "border-white/14 bg-white/[0.095] text-white hover:bg-white/[0.14]"
              }`}
            >
              <p className="text-lg font-black">Platform dışı ödeme istiyor</p>
              <p
                className={`mt-1 text-xs leading-5 ${
                  outsidePayment ? "text-[#06100d]/72" : "text-white/78"
                }`}
              >
                Güvenli ödeme yerine havale, EFT, IBAN veya WhatsApp üzerinden yönlendiriyor.
              </p>
            </button>

            <button
              onClick={() => {
                setPressure((value) => !value);
                setNoRiskSigns(false);
                clearError();
              }}
              className={`rounded-[1.5rem] border p-5 text-left transition ${
                pressure
                  ? "border-lime-300/70 bg-lime-300 text-[#06100d]"
                  : "border-white/14 bg-white/[0.095] text-white hover:bg-white/[0.14]"
              }`}
            >
              <p className="text-lg font-black">Acele ettiriyor</p>
              <p
                className={`mt-1 text-xs leading-5 ${
                  pressure ? "text-[#06100d]/72" : "text-white/78"
                }`}
              >
                “Bugün al”, “başkası yazdı”, “hemen gönder” gibi baskı kuruyor.
              </p>
            </button>

            <button
              onClick={() => {
                setNoRiskSigns((value) => !value);
                setDepositAsked(false);
                setOutsidePayment(false);
                setPressure(false);
                clearError();
              }}
              className={`rounded-[1.5rem] border p-5 text-left transition ${
                noRiskSigns
                  ? "border-lime-300/70 bg-lime-300 text-[#06100d]"
                  : "border-white/14 bg-white/[0.095] text-white hover:bg-white/[0.14]"
              }`}
            >
              <p className="text-lg font-black">Hayır, bunların hiçbiri yok</p>
              <p
                className={`mt-1 text-xs leading-5 ${
                  noRiskSigns ? "text-[#06100d]/72" : "text-white/78"
                }`}
              >
                Satıcı kapora istemedi, platform dışına yönlendirmedi ve acele baskısı kurmadı.
              </p>
            </button>
          </div>
        </div>
      );
    }

    return (
      <div>
        <p className="text-sm font-black text-lime-200">Son adım</p>
        <h2 className="mt-2 text-3xl font-black tracking-[-0.06em] md:text-5xl">
          Bilgiler hazır. Risk sonucu hesaplanabilir.
        </h2>
        <p className="mt-3 text-sm leading-6 text-white/78">
          Şimdi verdiğiniz cevaplara ve geçmiş sorgu sinyallerine göre risk puanı hazırlanacak.
        </p>

        <div className="mt-6 grid gap-3">
          <div className="rounded-[1.5rem] border border-white/14 bg-white/[0.095] p-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-white/70">
              Sorgu özeti
            </p>

            <div className="mt-4 grid gap-3 text-sm text-white/82 md:grid-cols-2">
              <p>
                Kategori:{" "}
                <span className="font-black text-white">{productCategory}</span>
              </p>
              <p>
                Kontrol edilen bilgi:{" "}
                <span className="font-black text-white">
                  {selectedIdentifier.title}
                </span>
              </p>
              <p>
                Platform:{" "}
                <span className="font-black text-white">
                  {platform || "Belirtilmedi"}
                </span>
              </p>
              <p>
                İlan fiyatı:{" "}
                <span className="font-black text-white">
                  {price || "Belirtilmedi"}
                </span>
              </p>
            </div>
          </div>

          {!user && (
            <div className="rounded-[1.5rem] border border-lime-300/25 bg-lime-300/12 p-5">
              <p className="text-sm font-black text-lime-200">
                Risk sonucunu görmek için Google ile giriş yapmanız gerekir.
              </p>
              <p className="mt-2 text-xs leading-5 text-white/76">
                Girişten sonra cevaplarınız kaybolmaz. Sorguya kaldığınız yerden devam edebilirsiniz.
              </p>
            </div>
          )}

          {authMessage && (
            <p className="rounded-2xl border border-lime-300/25 bg-lime-300/12 px-4 py-3 text-sm text-lime-200">
              {authMessage}
            </p>
          )}

          <button
            onClick={user ? handleAnalyze : signInWithGoogle}
            disabled={loading}
            className="rounded-[1.5rem] bg-lime-300 px-5 py-5 text-sm font-black text-[#06100d] shadow-[0_16px_45px_rgba(190,242,100,0.16)] transition hover:bg-white disabled:opacity-60"
          >
            {loading
              ? "Analiz hazırlanıyor..."
              : user
              ? "Riskimi gör"
              : "Google ile giriş yap ve riskimi gör"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#06100d] text-white">
      {showIntro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#06100d] px-5">
          <div className="absolute inset-0">
            <div className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
            <div className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-lime-300/20" />
            <div className="absolute left-[18%] top-[17%] h-48 w-48 rounded-full bg-lime-300/20 blur-3xl" />
            <div className="absolute bottom-[14%] right-[15%] h-56 w-56 rounded-full bg-emerald-300/20 blur-3xl" />
          </div>

          <div className="relative w-full max-w-[420px] rounded-[2rem] border border-white/10 bg-white/[0.08] p-6 text-center shadow-[0_40px_140px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-lime-300 text-3xl text-[#06100d] shadow-[0_0_40px_rgba(190,242,100,0.35)]">
              🛡️
            </div>

            <div className="mt-5 text-5xl font-black tracking-[-0.07em]">
              GüvenSor
            </div>

            <p className="mt-2 text-sm text-white/76">
              Alışveriş yapmadan önce satıcı riskini kontrol edin.
            </p>

            <div className="mt-6 rounded-2xl bg-black/30 p-4 text-left">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-lime-200">
                  {introSteps[introStep]}
                </p>
                <span className="h-2 w-2 rounded-full bg-lime-300 shadow-[0_0_18px_rgba(190,242,100,0.9)]" />
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-lime-300 transition-all duration-300"
                  style={{
                    width: `${((introStep + 1) / introSteps.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            <button
              onClick={() => setShowIntro(false)}
              className="mt-5 text-xs font-bold text-white/60 underline underline-offset-4"
            >
              Hemen geç
            </button>
          </div>
        </div>
      )}

      {showAnalysisModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-xl">
          <div className="relative w-full max-w-[520px] overflow-hidden rounded-[2.2rem] border border-white/10 bg-[#0e1915] p-6 shadow-[0_40px_140px_rgba(0,0,0,0.65)]">
            <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-lime-300/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-emerald-300/14 blur-3xl" />

            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-300 text-xl text-[#06100d]">
                  🛡️
                </div>
                <div>
                  <p className="text-lg font-black">Derin analiz yapılıyor</p>
                  <p className="text-xs text-white/74">
                    Lütfen birkaç saniye bekleyin.
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-black text-lime-200">
                  {analysisSteps[analysisStep]}
                </p>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-lime-300 transition-all duration-500"
                    style={{
                      width: `${Math.round(
                        ((analysisStep + 1) / analysisSteps.length) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-5 space-y-2">
                {analysisSteps.slice(0, analysisStep + 1).map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-xs text-white/74"
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        index === analysisStep
                          ? "bg-lime-300 shadow-[0_0_16px_rgba(190,242,100,0.8)]"
                          : "bg-white/40"
                      }`}
                    />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {finishMessage && (
        <div className="fixed inset-x-4 top-5 z-50 mx-auto max-w-[520px] rounded-[1.5rem] border border-lime-300/25 bg-[#0e1915] px-5 py-4 text-center text-sm font-bold text-lime-200 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          {finishMessage}
        </div>
      )}
{showFeedbackModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-xl">
    <div className="relative w-full max-w-[520px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#0e1915] p-5 text-white shadow-[0_40px_140px_rgba(0,0,0,0.65)] md:p-6">
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-lime-300/16 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-emerald-300/12 blur-3xl" />

      <div className="relative">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-300 text-2xl text-[#06100d]">
          🛡️
        </div>

        <h2 className="mt-5 text-2xl font-black tracking-[-0.05em] md:text-3xl">
          Bu sorgu size yardımcı oldu mu?
        </h2>

        <p className="mt-2 text-sm leading-6 text-white/72">
          GüvenSor’u daha doğru hale getirmek için kısa bir geri bildirim bırakabilirsiniz.
        </p>

        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          {[
            { key: "yardimci_oldu", label: "Yardımcı oldu" },
            { key: "kismen", label: "Kısmen" },
            { key: "yetersiz", label: "Yeterli değildi" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() =>
                setFeedbackHelpfulness(
                  item.key as "yardimci_oldu" | "kismen" | "yetersiz"
                )
              }
              className={`rounded-2xl border px-4 py-3 text-sm font-black transition ${
                feedbackHelpfulness === item.key
                  ? "border-lime-300/70 bg-lime-300 text-[#06100d]"
                  : "border-white/12 bg-white/[0.08] text-white hover:bg-white/[0.14]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.07] p-4">
          <p className="text-sm font-black text-white">
            GüvenSor deneyiminizi puanlar mısınız?
          </p>

          <div className="mt-3 flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setFeedbackRating(star)}
                className={`text-3xl transition ${
                  feedbackRating >= star
                    ? "text-lime-300"
                    : "text-white/24 hover:text-white/55"
                }`}
                aria-label={`${star} yıldız`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={feedbackComment}
          onChange={(e) => setFeedbackComment(e.target.value)}
          placeholder="İsterseniz eksik gördüğünüz şeyi yazabilirsiniz."
          rows={4}
          className="mt-4 w-full resize-none rounded-[1.5rem] border border-white/12 bg-[#243a31] px-4 py-4 text-sm font-semibold leading-6 text-white outline-none placeholder:text-white/55 focus:border-lime-300/60"
        />

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => closeFeedbackAndReset()}
            disabled={feedbackLoading}
            className="rounded-full border border-white/12 px-5 py-3 text-sm font-black text-white/78 transition hover:bg-white hover:text-[#06100d] disabled:opacity-60"
          >
            Atla
          </button>

          <button
            onClick={submitFeedback}
            disabled={feedbackLoading}
            className="rounded-full bg-lime-300 px-5 py-3 text-sm font-black text-[#06100d] transition hover:bg-white disabled:opacity-60"
          >
            {feedbackLoading ? "Kaydediliyor..." : "Gönder"}
          </button>
        </div>
      </div>
    </div>
  </div>
)}
      <section className="relative min-h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-180px] top-[-140px] h-[460px] w-[460px] rounded-full bg-lime-300/20 blur-3xl" />
          <div className="absolute right-[-180px] top-[8%] h-[460px] w-[460px] rounded-full bg-emerald-300/14 blur-3xl" />
          <div className="absolute bottom-[-220px] left-[28%] h-[560px] w-[560px] rounded-full bg-sky-300/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_35%)]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-4 md:px-8">
          <nav className="flex items-center justify-between rounded-[1.6rem] border border-white/10 bg-white/[0.06] px-4 py-3 shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-300 text-xl text-[#06100d]">
                🛡️
              </div>

              <div>
                <div className="text-xl font-black tracking-[-0.05em]">
                  GüvenSor
                </div>
                <div className="text-xs text-white/70">
                  Almadan önce sor, riskini gör.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <span className="hidden max-w-[220px] truncate text-sm text-white/70 md:inline">
                    {user.email}
                  </span>
                  <button
                    onClick={signOut}
                    className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black text-white transition hover:bg-white hover:text-[#06100d] md:text-sm"
                  >
                    Çıkış
                  </button>
                </>
              ) : (
                <button
                  onClick={signInWithGoogle}
                  className="rounded-full bg-lime-300 px-4 py-2 text-xs font-black text-[#06100d] transition hover:bg-white md:text-sm"
                >
                  Google ile giriş
                </button>
              )}
            </div>
          </nav>

          <div className="mx-auto max-w-4xl pb-5 pt-6 text-center md:pb-8 md:pt-14">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/10 px-4 py-2 text-xs font-black text-lime-200">
              <span className="h-2 w-2 rounded-full bg-lime-300 shadow-[0_0_18px_rgba(190,242,100,0.85)]" />
              6 kısa soru sonra risk sonucu hazırlanır
            </div>

            <h1 className="mx-auto mt-4 max-w-3xl text-3xl font-black leading-[0.95] tracking-[-0.075em] md:mt-6 md:text-7xl">
              Satıcı güvenli mi?
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/76 md:mt-5 md:text-base md:leading-7">
              Birkaç kısa sorudan sonra risk sonucunu görün.
            </p>
          </div>

          <section
            id="sorgu-paneli"
            className="mx-auto max-w-4xl overflow-hidden rounded-[1.9rem] border border-white/12 bg-[#0e1915] p-4 text-white shadow-[0_34px_140px_rgba(0,0,0,0.48)] md:rounded-[2.6rem] md:p-7"
          >
            <div className="mb-6">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-white/70">
                  Soru {step} / {TOTAL_STEPS}
                </p>
                <p className="text-xs font-black text-lime-200">
                  %{progress} tamamlandı
                </p>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-lime-300 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {errorMessage && (
              <div className="mb-5 rounded-2xl border border-red-300/30 bg-red-400/16 px-4 py-3 text-sm font-bold text-red-100">
                {errorMessage}
              </div>
            )}

            {renderStep()}

            <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={goBack}
                disabled={step === 1}
                className="rounded-full border border-white/12 px-5 py-3 text-sm font-black text-white/80 transition hover:bg-white hover:text-[#06100d] disabled:cursor-not-allowed disabled:opacity-35"
              >
                Geri
              </button>

              {step < TOTAL_STEPS ? (
                <button
                  onClick={goNext}
                  className="rounded-full bg-lime-300 px-6 py-3 text-sm font-black text-[#06100d] transition hover:bg-white"
                >
                  Devam et
                </button>
              ) : (
                <button
                  onClick={user ? handleAnalyze : signInWithGoogle}
                  disabled={loading}
                  className="rounded-full bg-lime-300 px-6 py-3 text-sm font-black text-[#06100d] transition hover:bg-white disabled:opacity-60"
                >
                  {loading
                    ? "Analiz hazırlanıyor..."
                    : user
                    ? "Riskimi gör"
                    : "Google ile giriş yap ve riskimi gör"}
                </button>
              )}
            </div>
          </section>

          <div className="mx-auto mt-5 grid max-w-4xl gap-3 pb-10 text-sm text-white/76 md:grid-cols-3">
            <div className="rounded-2xl border border-white/12 bg-white/[0.095] p-4 backdrop-blur">
              <p className="font-black text-white">Kolay sorgu</p>
              <p className="mt-1 text-xs leading-5">
                Bilgiler tek tek alındığı için uzun form yorgunluğu oluşturmaz.
              </p>
            </div>

            <div className="rounded-2xl border border-white/12 bg-white/[0.095] p-4 backdrop-blur">
              <p className="font-black text-white">Google ile giriş</p>
              <p className="mt-1 text-xs leading-5">
                Sonucu görmek için hızlı ve güvenli giriş yapılır.
              </p>
            </div>

            <div className="rounded-2xl border border-white/12 bg-white/[0.095] p-4 backdrop-blur">
              <p className="font-black text-white">Gizli eşleştirme</p>
              <p className="mt-1 text-xs leading-5">
                Telefon, IBAN ve kullanıcı adı açık metin olarak saklanmaz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {showResultModal && result && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-hidden bg-black/74 px-3 py-3 backdrop-blur-xl md:items-center md:px-6 md:py-6">
          <div className="relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl flex-col overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#0e1915] text-white shadow-[0_40px_150px_rgba(0,0,0,0.65)] md:max-h-[calc(100dvh-3rem)] md:rounded-[2.5rem]">
            <div className="pointer-events-none absolute -left-28 -top-28 h-72 w-72 rounded-full bg-lime-300/14 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 -right-28 h-80 w-80 rounded-full bg-emerald-300/12 blur-3xl" />

            <div className="sticky top-0 z-20 border-b border-white/10 bg-[#0e1915]/95 px-4 py-3 backdrop-blur-xl md:px-7 md:py-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 md:text-xs">
                    Analiz sonucu
                  </p>
                  <h2 className="mt-1 text-xl font-black tracking-[-0.05em] md:text-4xl">
                    Risk sonucunuz hazır.
                  </h2>
                </div>

                <button
                  onClick={() =>
                    completeQuery(
                      "Sorgulamanız tamamlandı. Umarız karar vermenize yardımcı olmuştur."
                    )
                  }
                  className="shrink-0 rounded-full border border-white/12 px-4 py-2 text-xs font-black text-white/75 transition hover:bg-white hover:text-[#06100d]"
                >
                  Kapat
                </button>
              </div>
            </div>

            <div className="relative overflow-y-auto overscroll-contain px-4 pb-5 pt-4 md:px-7 md:pb-8 md:pt-6">
              <div className="grid gap-4 lg:grid-cols-[0.72fr_1.28fr] lg:gap-6">
                <div className="space-y-4">
                  <div className="rounded-[1.7rem] border border-white/12 bg-white/[0.08] p-5 md:rounded-[2rem] md:p-7">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-white/60">
                      Genel risk skoru
                    </p>

                    <div className="mt-4 flex items-end gap-2 leading-none">
                      <span className="text-6xl font-black tracking-[-0.04em] text-white md:text-8xl">
                        {result.score}
                      </span>
                      <span className="pb-2 text-xl font-black text-white/60 md:pb-3 md:text-2xl">
                        /100
                      </span>
                    </div>

                    <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full ${
                          result.level === "Yüksek Risk"
                            ? "bg-red-300"
                            : result.level === "Orta Risk"
                            ? "bg-yellow-300"
                            : "bg-lime-300"
                        }`}
                        style={{ width: `${result.score}%` }}
                      />
                    </div>

                    <div
                      className={`mt-4 inline-flex rounded-full px-4 py-2 text-sm font-black ${
                        result.level === "Yüksek Risk"
                          ? "bg-red-400/18 text-red-100"
                          : result.level === "Orta Risk"
                          ? "bg-yellow-400/18 text-yellow-100"
                          : "bg-lime-300/18 text-lime-200"
                      }`}
                    >
                      {result.level}
                    </div>

                    <p className="mt-4 text-sm leading-6 text-white/76">
                      Sonuç kesin karar yerine geçmez. Sistem; satıcı davranışı,
                      fiyat farkı, kategori riski, kimlik/platform sinyali,
                      doğrulama bilgisi ve geçmiş sorguları birlikte hesaplar.
                    </p>

                    <div className="mt-5 grid gap-2 text-sm text-white/76">
                      <p>
                        Kontrol edilen bilgi:{" "}
                        <span className="font-black text-white">
                          {result.identifierMasked || "Bilgi girilmedi"}
                        </span>
                      </p>

                      {result.priceDiff !== null && (
                        <p>
                          Fiyat farkı:{" "}
                          <span className="font-black text-white">
                            %{result.priceDiff}
                          </span>
                        </p>
                      )}

                      <p>
                        Kategori:{" "}
                        <span className="font-black text-white">
                          {productCategory}
                        </span>
                      </p>
                    </div>
                  </div>

                  {result.communityStats && (
                    <div className="rounded-[1.7rem] border border-white/12 bg-white/[0.08] p-5 md:rounded-[2rem]">
                      <p className="font-black">Geçmişe göre risk</p>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-white/78">
                        <span>
                          Önceki sorgu: {result.communityStats.total_queries}
                        </span>
                        <span>
                          Önceki ort. risk:{" "}
                          {result.communityStats.average_risk_score}
                        </span>
                        <span>
                          Riskli oy: {result.communityStats.risky_votes}
                        </span>
                        <span>
                          Güvenli oy: {result.communityStats.safe_votes}
                        </span>
                      </div>

                      <p className="mt-4 text-xs leading-5 text-white/70">
                        Ana risk puanı, mevcut sorgu sonucu ile aynı bilgiye ait
                        geçmiş sorguların ortalaması birlikte hesaplanarak
                        oluşturulur.
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid gap-4">
                  <div className="rounded-[1.7rem] border border-white/12 bg-white/[0.075] p-4 md:rounded-[2rem] md:p-5">
                    <h3 className="text-xl font-black">Kategori bazlı analiz</h3>
                    <p className="mt-2 text-sm leading-6 text-white/70">
                      Her başlık ayrı puanlandı. Düşük fiyat tek başına sistemi
                      şişirmesin diye kategori eşiğiyle hesaplandı.
                    </p>

                    <div className="mt-4 grid gap-3">
                      {result.analysisBreakdown.map((section) => (
                        <div
                          key={section.title}
                          className="rounded-[1.35rem] border border-white/10 bg-black/18 p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-black text-white">
                                {section.title}
                              </p>
                              <p className="mt-1 text-xs leading-5 text-white/64">
                                {section.summary}
                              </p>
                            </div>

                            <div
                              className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${
                                section.level === "Riskli"
                                  ? "bg-red-400/16 text-red-100"
                                  : section.level === "Dikkat"
                                  ? "bg-yellow-400/16 text-yellow-100"
                                  : "bg-lime-300/16 text-lime-200"
                              }`}
                            >
                              {section.score}/100
                            </div>
                          </div>

                          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                            <div
                              className={`h-full rounded-full ${
                                section.level === "Riskli"
                                  ? "bg-red-300"
                                  : section.level === "Dikkat"
                                  ? "bg-yellow-300"
                                  : "bg-lime-300"
                              }`}
                              style={{ width: `${section.score}%` }}
                            />
                          </div>

                          <div className="mt-3 grid gap-2">
                            {section.factors.slice(0, 3).map((factor, index) => (
                              <div
                                key={`${section.title}-${factor.label}-${index}`}
                                className="rounded-2xl border border-white/10 bg-white/[0.06] p-3"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <p className="text-sm font-black text-white">
                                    {factor.label}
                                  </p>
                                  <span
                                    className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-black ${
                                      factor.severity === "high"
                                        ? "bg-red-400/16 text-red-100"
                                        : factor.severity === "medium"
                                        ? "bg-yellow-400/16 text-yellow-100"
                                        : factor.severity === "positive"
                                        ? "bg-lime-300/16 text-lime-200"
                                        : "bg-white/10 text-white/72"
                                    }`}
                                  >
                                    {factor.points > 0
                                      ? `+${factor.points}`
                                      : factor.points}
                                  </span>
                                </div>

                                <p className="mt-1 text-xs leading-5 text-white/68">
                                  {factor.detail}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="text-xl font-black">Neden bu sonuç çıktı?</h3>

                      <div className="mt-4 space-y-3">
                        {result.reasons.slice(0, 7).map((reason, index) => (
                          <p
                            key={index}
                            className="rounded-2xl border border-white/12 bg-white/[0.095] p-4 text-sm leading-6 text-white/82"
                          >
                            {reason}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-black">Ne yapabilirsiniz?</h3>

                      <div className="mt-4 space-y-3">
                        {result.suggestions.slice(0, 7).map((suggestion, index) => (
                          <p
                            key={index}
                            className="rounded-2xl border border-white/12 bg-white/[0.095] p-4 text-sm leading-6 text-white/82"
                          >
                            {suggestion}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-white/10 pt-5">
                <h3 className="text-xl font-black">Bu sonuç yardımcı oldu mu?</h3>
                <p className="mt-2 text-sm text-white/76">
                  Oy vermek zorunlu değildir. İsterseniz topluluk teyidine katkı sağlayabilirsiniz.
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <button
                    onClick={() => handleVote("guvenli")}
                    disabled={voteLoading}
                    className="rounded-2xl bg-lime-300/14 px-4 py-3 text-sm font-black text-lime-200 transition hover:bg-lime-300/22 disabled:opacity-60"
                  >
                    Güvenli
                  </button>

                  <button
                    onClick={() => handleVote("riskli")}
                    disabled={voteLoading}
                    className="rounded-2xl bg-red-400/14 px-4 py-3 text-sm font-black text-red-100 transition hover:bg-red-400/22 disabled:opacity-60"
                  >
                    Riskli
                  </button>

                  <button
                    onClick={() => handleVote("emin_degil")}
                    disabled={voteLoading}
                    className="rounded-2xl bg-white/12 px-4 py-3 text-sm font-black text-white/85 transition hover:bg-white/18 disabled:opacity-60"
                  >
                    Emin değilim
                  </button>

                  <button
                    onClick={() =>
                      completeQuery(
                        "Sorgulamanız tamamlandı. Umarız karar vermenize yardımcı olmuştur."
                      )
                    }
                    disabled={voteLoading}
                    className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-[#06100d] transition hover:bg-lime-300 disabled:opacity-60"
                  >
                    Sorguyu tamamla
                  </button>
                </div>

                {voteMessage && (
                  <p className="mt-4 text-sm text-lime-200">{voteMessage}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}