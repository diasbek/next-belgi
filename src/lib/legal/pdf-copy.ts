import type { Locale } from "@/i18n/config";

export type LegalPdfCopy = {
  openPdf: string;
  pdfPreviewTitle: string;
  downloadPdf: string;
  close: string;
  loading: string;
  pdfPreviewUnavailable: string;
  versionLabel: string;
  documentDateLabel: string;
  exportedAtLabel: string;
  brandLine: string;
  pageOf: string;
};

const copy: Record<Locale, LegalPdfCopy> = {
  uz: {
    openPdf: "PDF",
    pdfPreviewTitle: "Hujjat PDF",
    downloadPdf: "PDF yuklab olish",
    close: "Yopish",
    loading: "PDF tayyorlanmoqda…",
    pdfPreviewUnavailable:
      "Brauzerda PDF koʻrinmadi. Yuklab oling yoki boshqa qurilmada oching.",
    versionLabel: "Versiya",
    documentDateLabel: "Hujjat sanasi",
    exportedAtLabel: "Eksport qilingan",
    brandLine: "Belgi.ai — yuridik hujjat",
    pageOf: "Sahifa {page} / {total}",
  },
  ru: {
    openPdf: "PDF",
    pdfPreviewTitle: "Документ PDF",
    downloadPdf: "Скачать PDF",
    close: "Закрыть",
    loading: "Готовим PDF…",
    pdfPreviewUnavailable:
      "Превью PDF недоступно в этом браузере. Скачайте файл или откройте на другом устройстве.",
    versionLabel: "Версия",
    documentDateLabel: "Дата документа",
    exportedAtLabel: "Экспортировано",
    brandLine: "Belgi.ai — юридический документ",
    pageOf: "Стр. {page} из {total}",
  },
  en: {
    openPdf: "PDF",
    pdfPreviewTitle: "Document PDF",
    downloadPdf: "Download PDF",
    close: "Close",
    loading: "Preparing PDF…",
    pdfPreviewUnavailable:
      "PDF preview is unavailable in this browser. Download the file or open it on another device.",
    versionLabel: "Version",
    documentDateLabel: "Document date",
    exportedAtLabel: "Exported at",
    brandLine: "Belgi.ai — legal document",
    pageOf: "Page {page} of {total}",
  },
};

export function getLegalPdfCopy(locale: Locale): LegalPdfCopy {
  return copy[locale] ?? copy.uz;
}

export function formatLegalDocumentDate(
  isoDate: string,
  locale: Locale,
): string {
  const d = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString(
    locale === "ru" ? "ru-RU" : locale === "en" ? "en-GB" : "uz-UZ",
    { year: "numeric", month: "long", day: "numeric" },
  );
}

export function formatLegalExportDateTime(
  date: Date,
  locale: Locale,
): string {
  return date.toLocaleString(
    locale === "ru" ? "ru-RU" : locale === "en" ? "en-GB" : "uz-UZ",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    },
  );
}
