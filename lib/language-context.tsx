"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from "react";

type Language = "en" | "ne";

interface Translations {
  [key: string]: {
    en: string;
    ne: string;
  };
}

export const translations: Translations = {
  // Navigation
  home: { en: "Home", ne: "गृहपृष्ठ" },
  notices: { en: "Notices", ne: "सूचना" },
  blogs: { en: "Blogs", ne: "ब्लग" },
  complaints: { en: "Complaints", ne: "गुनासो" },
  contact: { en: "Contact", ne: "सम्पर्क" },
  gallery: { en: "Gallery", ne: "ग्यालरी" },
  reports: { en: "Reports", ne: "प्रतिवेदन" },
  development: { en: "Development Works", ne: "विकास कार्य" },
  admin: { en: "Admin", ne: "प्रशासक" },

  // Hero
  welcome: { en: "Welcome to", ne: "स्वागत छ" },
  portalName: { en: "Hello Adyaksh Portal", ne: "हेलो अध्यक्ष पोर्टल" },
  heroSubtitle: {
    en: "Transparent Governance, Empowered Citizens",
    ne: "पारदर्शी शासन, सशक्त नागरिक",
  },
  mission: {
    en: "Our mission is to provide transparent, efficient, and citizen-centric governance for sustainable development.",
    ne: "हाम्रो लक्ष्य दिगो विकासको लागि पारदर्शी, कुशल र नागरिक-केन्द्रित शासन प्रदान गर्नु हो।",
  },

  // Statistics
  population: { en: "Population", ne: "जनसंख्या" },
  households: { en: "Households", ne: "घरधुरी" },
  schools: { en: "Schools", ne: "विद्यालय" },
  roadsKm: { en: "Roads (km)", ne: "सडक (कि.मी.)" },

  // Quick Links
  quickLinks: { en: "Quick Links", ne: "द्रुत लिंकहरू" },
  fileComplaint: { en: "File Complaint", ne: "गुनासो दर्ता" },
  viewNotices: { en: "View Notices", ne: "सूचना हेर्नुहोस्" },
  readBlogs: { en: "Read Blogs", ne: "ब्लग पढ्नुहोस्" },
  trackWorks: { en: "Track Works", ne: "कार्य ट्र्याक" },
  contactUs: { en: "Contact Us", ne: "सम्पर्क गर्नुहोस्" },

  // Sections
  recentNotices: { en: "Recent Notices", ne: "हालका सूचना" },
  latestBlogs: { en: "Latest Blogs", ne: "नयाँ ब्लगहरू" },
  developmentWorks: { en: "Development Works", ne: "विकास कार्यहरू" },
  mediaGallery: { en: "Media Gallery", ne: "मिडिया ग्यालरी" },
  reportsData: { en: "Reports & Data", ne: "प्रतिवेदन र डाटा" },

  // Forms
  fullName: { en: "Full Name", ne: "पूरा नाम" },
  email: { en: "Email", ne: "इमेल" },
  phone: { en: "Phone", ne: "फोन" },
  subject: { en: "Subject", ne: "विषय" },
  message: { en: "Message", ne: "सन्देश" },
  category: { en: "Category", ne: "वर्ग" },
  description: { en: "Description", ne: "विवरण" },
  attachFile: { en: "Attach File", ne: "फाइल संलग्न" },
  submit: { en: "Submit", ne: "पेश गर्नुहोस्" },
  submitting: { en: "Submitting...", ne: "पेश गर्दै..." },

  // Complaint Categories
  infrastructure: { en: "Infrastructure", ne: "पूर्वाधार" },
  waterSupply: { en: "Water Supply", ne: "खानेपानी" },
  electricity: { en: "Electricity", ne: "विद्युत" },
  sanitation: { en: "Sanitation", ne: "सरसफाई" },
  publicService: { en: "Public Service", ne: "सार्वजनिक सेवा" },
  other: { en: "Other", ne: "अन्य" },

  // Status
  pending: { en: "Pending", ne: "विचाराधीन" },
  processing: { en: "Processing", ne: "प्रक्रियामा" },
  resolved: { en: "Resolved", ne: "समाधान भयो" },

  // Common
  viewAll: { en: "View All", ne: "सबै हेर्नुहोस्" },
  readMore: { en: "Read More", ne: "थप पढ्नुहोस्" },
  download: { en: "Download", ne: "डाउनलोड" },
  search: { en: "Search", ne: "खोज्नुहोस्" },
  filter: { en: "Filter", ne: "फिल्टर" },

  // Footer
  footerText: {
    en: "Tilathi Koiladi Rural Municipality Office, Tilathi, Saptari",
    ne: "तिलाठी कोइलाडी गाउँपालिकाको कार्यालय, तिलाठी, सप्तरी",
  },
  allRightsReserved: {
    en: "All Rights Reserved",
    ne: "सर्वाधिकार सुरक्षित",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const t = useCallback(
    (key: string): string => {
      return translations[key]?.[language] || key;
    },
    [language],
  );

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, t],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
