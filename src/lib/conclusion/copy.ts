import type { Locale } from "@/i18n/config";

export type ConclusionCopy = {
  agencyName: string;
  title: string;
  appearanceWord: string;
  markLabel: string;
  classLabel: string;
  issuedLabel: string;
  reportLabel: string;
  methodologyIntro: string;
  excludedTitle: string;
  excluded: string[];
  adliyaTitle: string;
  madridTitle: string;
  internetTitle: string;
  internetSubtitle: string;
  emptyMatches: string;
  ownerLabel: string;
  termLabel: string;
  viewLabel: string;
  strongOverlapNote: string;
  verdictTitle: string;
  verdictLead: string;
  disclaimer: string;
  verifyLabel: string;
  downloadPdf: string;
  downloading: string;
  downloadFailed: string;
  previewWatermark: string;
  verifyPageTitle: string;
  verifyValid: string;
  verifyNotFound: string;
  verifyRevoked: string;
  verifyDocNumber: string;
  verifyHash: string;
};

const uz: ConclusionCopy = {
  agencyName: "Belgi.ai — trademark search service",
  title: "TOVAR BELGISI QIDIRUV XIZMATI HISOBOTI",
  appearanceWord: "so‘zli",
  markLabel: "Belgi",
  classLabel: "TXHK sinfi",
  issuedLabel: "Berilgan sanasi",
  reportLabel: "Hisobot sanasi",
  methodologyIntro:
    "Qidiruv O‘zbekiston Respublikasida ro‘yxatdan o‘tgan/ustuvorligi bo‘lgan va xalqaro Madrid bitimi kelishuviga ko‘ra himoyaga ega tovar belgilari ochiq bazalaridan foydalanib o‘tkazildi. Dastlabki qidiruv ixtiyoriy, ammo tavsiya etilgan jarayon bo‘lib, tovar belgisini ro‘yxatdan o‘tkazish uchun ariza topshirishdan oldin milliy va xalqaro ma’lumotlar bazalarida o‘xshash belgilari mavjudligi to‘g‘risida ma’lumot olish imkonini beradi.",
  excludedTitle: "Qidiruv vaqtida quyidagilar hisobga olinmadi:",
  excluded: [
    "hisobot berilayotgan sanada Adliya vazirligiga kelib tushgan arizalar;",
    "Jahon intellektual mulk tashkilotining Madrid bazasiga oxirgi 3 haftada kelib tushgan arizalar.",
  ],
  adliyaTitle: "1. O‘zbekiston Respublikasi Adliya vazirligi bazasi",
  madridTitle: "2. Xalqaro Madrid bazasi (WIPO)",
  internetTitle: "3. Internet",
  internetSubtitle: "(Hammaga ma’lum/mashhur nomlar)",
  emptyMatches: "Mavjud ma’lumotlarga ko‘ra o‘xshash belgilari mavjud emas.",
  ownerLabel: "Huquq egasi",
  termLabel: "Muddati",
  viewLabel: "Ko‘rinishi",
  strongOverlapNote:
    "Izoh: Qarshilik qiladigan tovarlar ajratib ko‘rsatilgan. Ular turdosh tovar/xizmatlar hisoblanadi.",
  verdictTitle: "Xulosa va tavsiya:",
  verdictLead:
    "Ekspertizaning mazkur nomni ro‘yxatga olishda ijobiy javob berish ehtimoli:",
  disclaimer:
    "Adliya vazirligi ekspertiza fikri ushbu xulosadan farq qilishi hamda yuqorida ko‘rsatilgan tovar belgilari bazalari muntazam ravishda yangilanib turishini inobatga olib, ushbu hisobotdagi xulosa o‘z kuchini yo‘qotishi mumkin. Belgi.ai avtomatlashtirilgan qidiruv va o‘xshashlik bahosini beradi; bu yuridik xulosa yoki ro‘yxatga olish kafolati emas.",
  verifyLabel: "Hisobot haqiqiyligini tekshirish",
  downloadPdf: "PDF yuklab olish",
  downloading: "PDF tayyorlanmoqda…",
  downloadFailed: "PDF yuklab boʻlmadi. Qayta urinib koʻring.",
  previewWatermark: "PREVIEW",
  verifyPageTitle: "Hisobot haqiqiyligi",
  verifyValid: "Hujjat haqiqiy",
  verifyNotFound: "Kod topilmadi",
  verifyRevoked: "Hujjat bekor qilingan",
  verifyDocNumber: "Hujjat raqami",
  verifyHash: "Hash",
};

const ru: ConclusionCopy = {
  agencyName: "Belgi.ai — сервис поиска товарных знаков",
  title: "ОТЧЁТ ПО ПОИСКУ ТОВАРНОГО ЗНАКА",
  appearanceWord: "словесный",
  markLabel: "Обозначение",
  classLabel: "Класс МКТУ",
  issuedLabel: "Дата выдачи",
  reportLabel: "Дата отчёта",
  methodologyIntro:
    "Поиск выполнен по открытым базам товарных знаков, зарегистрированных / имеющих приоритет в Республике Узбекистан, а также охраняемых по Мадридскому соглашению. Предварительный поиск рекомендуется до подачи заявки.",
  excludedTitle: "При поиске не учитывались:",
  excluded: [
    "заявки, поступившие в Министерство юстиции на дату отчёта;",
    "заявки, поступившие в базу Madrid (ВОИС) за последние 3 недели.",
  ],
  adliyaTitle: "1. База Министерства юстиции Республики Узбекистан",
  madridTitle: "2. Международная база Madrid (WIPO)",
  internetTitle: "3. Интернет",
  internetSubtitle: "(Общеизвестные / известные обозначения)",
  emptyMatches: "По имеющимся данным сходные обозначения не найдены.",
  ownerLabel: "Правообладатель",
  termLabel: "Срок",
  viewLabel: "Вид",
  strongOverlapNote:
    "Примечание: выделены товары/услуги, создающие риск конфликта; они считаются однородными.",
  verdictTitle: "Заключение и рекомендация:",
  verdictLead:
    "Вероятность положительного ответа экспертизы при регистрации обозначения:",
  disclaimer:
    "Заключение экспертизы Министерства юстиции может отличаться от данного отчёта; базы товарных знаков регулярно обновляются, поэтому выводы могут утратить актуальность. Belgi.ai выполняет автоматизированный поиск и оценку сходства; результат не является юридическим заключением и не гарантирует регистрацию.",
  verifyLabel: "Проверить подлинность отчёта",
  downloadPdf: "Скачать PDF",
  downloading: "Готовим PDF…",
  downloadFailed: "Не удалось скачать PDF. Попробуйте ещё раз.",
  previewWatermark: "PREVIEW",
  verifyPageTitle: "Подлинность отчёта",
  verifyValid: "Документ подлинный",
  verifyNotFound: "Код не найден",
  verifyRevoked: "Документ отозван",
  verifyDocNumber: "Номер документа",
  verifyHash: "Hash",
};

const en: ConclusionCopy = {
  agencyName: "Belgi.ai — trademark search service",
  title: "TRADEMARK SEARCH REPORT",
  appearanceWord: "word mark",
  markLabel: "Mark",
  classLabel: "Nice class",
  issuedLabel: "Issued",
  reportLabel: "Report date",
  methodologyIntro:
    "The search used open databases of trademarks registered or with priority in Uzbekistan and marks protected under the Madrid System. A preliminary search is recommended before filing.",
  excludedTitle: "The search did not include:",
  excluded: [
    "applications received by the Ministry of Justice on the report date;",
    "Madrid (WIPO) filings from the last 3 weeks.",
  ],
  adliyaTitle: "1. Uzbekistan Ministry of Justice registry",
  madridTitle: "2. Madrid System (WIPO)",
  internetTitle: "3. Internet",
  internetSubtitle: "(Well-known / famous names)",
  emptyMatches: "No similar marks found in available data.",
  ownerLabel: "Owner",
  termLabel: "Term",
  viewLabel: "Appearance",
  strongOverlapNote:
    "Note: conflicting goods/services are highlighted as homogeneous.",
  verdictTitle: "Conclusion and recommendation:",
  verdictLead:
    "Estimated chance of a positive examination outcome for this mark:",
  disclaimer:
    "The Ministry of Justice examination opinion may differ from this report; trademark databases are updated regularly, so conclusions may become outdated. Belgi.ai provides an automated similarity estimate; it is not a legal opinion and does not guarantee registration.",
  verifyLabel: "Verify report authenticity",
  downloadPdf: "Download PDF",
  downloading: "Preparing PDF…",
  downloadFailed: "Could not download PDF. Please try again.",
  previewWatermark: "PREVIEW",
  verifyPageTitle: "Report authenticity",
  verifyValid: "Document is authentic",
  verifyNotFound: "Code not found",
  verifyRevoked: "Document revoked",
  verifyDocNumber: "Document number",
  verifyHash: "Hash",
};

export function getConclusionCopy(locale: Locale): ConclusionCopy {
  if (locale === "ru") return ru;
  if (locale === "en") return en;
  return uz;
}
