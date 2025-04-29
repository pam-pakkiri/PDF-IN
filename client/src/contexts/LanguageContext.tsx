import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Supported languages
export type Language = 'en' | 'ta' | 'hi' | 'bn' | 'kn' | 'ml' | 'te';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  translations: Record<string, string>;
  t: (key: string) => string;
}

// Language display names for the selector
export const languageNames: Record<Language, string> = {
  en: 'English',
  ta: 'தமிழ்', // Tamil
  hi: 'हिन्दी', // Hindi
  bn: 'বাংলা', // Bengali
  kn: 'ಕನ್ನಡ', // Kannada
  ml: 'മലയാളം', // Malayalam
  te: 'తెలుగు', // Telugu
};

// Font families for each language
export const languageFonts: Record<Language, string> = {
  en: 'Roboto, sans-serif',
  ta: '"Noto Sans Tamil", sans-serif',
  hi: '"Noto Sans Devanagari", sans-serif',
  bn: '"Noto Sans Bengali", sans-serif',
  kn: '"Noto Sans Kannada", sans-serif',
  ml: '"Noto Sans Malayalam", sans-serif',
  te: '"Noto Sans Telugu", sans-serif',
};

// Create the context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Basic translations
const translations: Record<Language, Record<string, string>> = {
  en: {
    'app.title': 'PDF Tools',
    'app.subtitle': 'All-in-one PDF utilities',
    'app.hero.title': 'All-in-one PDF Tools',
    'app.hero.description': 'Upload your PDF files and transform them using our powerful tools. Extract text, merge files, convert to images, and much more.',
    'app.upload.title': 'Upload PDF Files',
    'app.upload.description': 'Drag & drop your PDF files here or click to browse',
    'app.upload.limit': 'Maximum file size: 10MB',
    'app.files.title': 'Your Files',
    'app.tools.title': 'PDF Tools',
    'app.tools.description': 'Select the tools you need to transform your documents',
    'tools.extract.title': 'Extract Text',
    'tools.extract.description': 'Extract all text content from your PDF files and save as TXT format.',
    'tools.merge.title': 'Merge PDFs',
    'tools.merge.description': 'Combine multiple PDF files into a single document. Maintain original formatting.',
    'tools.convert.title': 'Convert to Images',
    'tools.convert.description': 'Convert PDF pages into high-quality JPG or PNG images for sharing or editing.',
    'category.essential': 'Essential Tools',
    'category.editing': 'Editing Tools',
    'category.security': 'Security Tools',
    'category.optimization': 'Optimization Tools',
    'footer.description': 'Professional PDF tools that make document workflows easier. Edit, convert, and manage your PDFs with ease.',
    'footer.copyright': '© 2025 PDF Tools. All rights reserved.',
    'footer.quicklinks': 'Quick Links',
    'footer.legal': 'Legal',
    'footer.tagline': 'Built with modern technologies for optimal performance.',
  },
  ta: {
    'app.title': 'PDF கருவிகள்',
    'app.subtitle': 'அனைத்து-ஒன்றில் PDF பயன்பாடுகள்',
    'app.hero.title': 'அனைத்து-ஒன்றில் PDF கருவிகள்',
    'app.hero.description': 'உங்கள் PDF கோப்புகளை பதிவேற்றி எங்கள் சக்திவாய்ந்த கருவிகளைப் பயன்படுத்தி மாற்றவும். உரையை பிரித்தெடுக்கவும், கோப்புகளை இணைக்கவும், படங்களாக மாற்றவும், மேலும் பல.',
    'app.upload.title': 'PDF கோப்புகளை பதிவேற்றவும்',
    'app.upload.description': 'இங்கே உங்கள் PDF கோப்புகளை இழுத்து விடவும் அல்லது உலாவ கிளிக் செய்யவும்',
    'app.upload.limit': 'அதிகபட்ச கோப்பு அளவு: 10MB',
    'app.files.title': 'உங்கள் கோப்புகள்',
    'app.tools.title': 'PDF கருவிகள்',
    'app.tools.description': 'உங்கள் ஆவணங்களை மாற்ற தேவையான கருவிகளைத் தேர்ந்தெடுக்கவும்',
    'tools.extract.title': 'உரையை பிரித்தெடுக்கவும்',
    'tools.extract.description': 'PDF கோப்புகளில் இருந்து அனைத்து உரை உள்ளடக்கத்தையும் பிரித்தெடுத்து TXT வடிவத்தில் சேமிக்கவும்.',
    'tools.merge.title': 'PDF களை இணைக்கவும்',
    'tools.merge.description': 'பல PDF கோப்புகளை ஒரு ஆவணத்தில் ஒன்றிணைக்கவும். அசல் வடிவமைப்பை பராமரிக்கவும்.',
    'tools.convert.title': 'படங்களாக மாற்றவும்',
    'tools.convert.description': 'PDF பக்கங்களை பகிர்வு அல்லது திருத்துவதற்கு உயர்தர JPG அல்லது PNG படங்களாக மாற்றவும்.',
    'category.essential': 'அத்தியாவசிய கருவிகள்',
    'category.editing': 'திருத்தும் கருவிகள்',
    'category.security': 'பாதுகாப்பு கருவிகள்',
    'category.optimization': 'உகப்பாக்க கருவிகள்',
    'footer.description': 'ஆவண பணிப்பாய்வுகளை எளிதாக்கும் தொழில்முறை PDF கருவிகள். உங்கள் PDF களை எளிதாக திருத்தவும், மாற்றவும், நிர்வகிக்கவும்.',
    'footer.copyright': '© 2025 PDF கருவிகள். அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
    'footer.quicklinks': 'விரைவு இணைப்புகள்',
    'footer.legal': 'சட்டரீதியானவை',
    'footer.tagline': 'சிறந்த செயல்திறனுக்காக நவீன தொழில்நுட்பங்களுடன் உருவாக்கப்பட்டது.',
  },
  hi: {
    'app.title': 'PDF टूल्स',
    'app.subtitle': 'सभी-एक-में PDF यूटिलिटीज',
    'app.hero.title': 'सभी-एक-में PDF टूल्स',
    'app.hero.description': 'अपनी PDF फाइलों को अपलोड करें और हमारे शक्तिशाली टूल्स का उपयोग करके उन्हें बदलें। टेक्स्ट निकालें, फाइलों को मर्ज करें, इमेजों में कन्वर्ट करें, और बहुत कुछ।',
    'app.upload.title': 'PDF फाइलें अपलोड करें',
    'app.upload.description': 'अपनी PDF फाइलों को यहां खींचें और छोड़ें या ब्राउज़ करने के लिए क्लिक करें',
    'app.upload.limit': 'अधिकतम फाइल साइज: 10MB',
    'app.files.title': 'आपकी फाइलें',
    'app.tools.title': 'PDF टूल्स',
    'app.tools.description': 'अपने दस्तावेज़ों को बदलने के लिए आवश्यक टूल्स चुनें',
    'tools.extract.title': 'टेक्स्ट निकालें',
    'tools.extract.description': 'अपनी PDF फाइलों से सभी टेक्स्ट सामग्री निकालें और TXT फॉर्मेट में सहेजें।',
    'tools.merge.title': 'PDF मर्ज करें',
    'tools.merge.description': 'कई PDF फाइलों को एक दस्तावेज़ में मिलाएं। मूल फॉर्मेटिंग बनाए रखें।',
    'tools.convert.title': 'इमेजों में कन्वर्ट करें',
    'tools.convert.description': 'PDF पेजों को शेयरिंग या एडिटिंग के लिए उच्च गुणवत्ता वाले JPG या PNG इमेजों में कन्वर्ट करें।',
    'category.essential': 'आवश्यक टूल्स',
    'category.editing': 'एडिटिंग टूल्स',
    'category.security': 'सुरक्षा टूल्स',
    'category.optimization': 'ऑप्टिमाइज़ेशन टूल्स',
    'footer.description': 'प्रोफेशनल PDF टूल्स जो दस्तावेज़ वर्कफ़्लो को आसान बनाते हैं। अपने PDF को आसानी से एडिट, कन्वर्ट और मैनेज करें।',
    'footer.copyright': '© 2025 PDF टूल्स। सर्वाधिकार सुरक्षित।',
    'footer.quicklinks': 'त्वरित लिंक',
    'footer.legal': 'कानूनी',
    'footer.tagline': 'इष्टतम प्रदर्शन के लिए आधुनिक तकनीकों के साथ निर्मित।',
  },
  bn: {
    'app.title': 'পিডিএফ টুলস',
    'app.subtitle': 'সব-এক-মধ্যে পিডিএফ উপযোগিতা',
    'app.hero.title': 'সব-এক-মধ্যে পিডিএফ টুলস',
    'app.hero.description': 'আপনার পিডিএফ ফাইল আপলোড করুন এবং আমাদের শক্তিশালী টুল ব্যবহার করে সেগুলি পরিবর্তন করুন। টেক্সট নিষ্কাশন করুন, ফাইল মার্জ করুন, ছবিতে রূপান্তর করুন, এবং আরও অনেক কিছু।',
    'app.upload.title': 'পিডিএফ ফাইল আপলোড করুন',
    'app.upload.description': 'এখানে আপনার পিডিএফ ফাইলগুলি টেনে আনুন বা ব্রাউজ করতে ক্লিক করুন',
    'app.upload.limit': 'সর্বাধিক ফাইল আকার: 10MB',
    'app.files.title': 'আপনার ফাইলসমূহ',
    'app.tools.title': 'পিডিএফ টুলস',
    'app.tools.description': 'আপনার ডকুমেন্ট পরিবর্তন করতে প্রয়োজনীয় টুল নির্বাচন করুন',
    'tools.extract.title': 'টেক্সট নিষ্কাশন করুন',
    'tools.extract.description': 'আপনার পিডিএফ ফাইল থেকে সমস্ত টেক্সট কন্টেন্ট নিষ্কাশন করুন এবং TXT ফরম্যাটে সংরক্ষণ করুন।',
    'tools.merge.title': 'পিডিএফ মার্জ করুন',
    'tools.merge.description': 'একাধিক পিডিএফ ফাইলকে একটি ডকুমেন্টে একত্রিত করুন। মূল ফরম্যাটিং বজায় রাখুন।',
    'tools.convert.title': 'ছবিতে রূপান্তর করুন',
    'tools.convert.description': 'পিডিএফ পৃষ্ঠাগুলিকে শেয়ারিং বা এডিটিং এর জন্য উচ্চ মানের JPG বা PNG ছবিতে রূপান্তর করুন।',
    'category.essential': 'অপরিহার্য টুলস',
    'category.editing': 'এডিটিং টুলস',
    'category.security': 'সুরক্ষা টুলস',
    'category.optimization': 'অপ্টিমাইজেশন টুলস',
    'footer.description': 'পেশাদার পিডিএফ টুলস যা ডকুমেন্ট ওয়ার্কফ্লো সহজ করে। আপনার পিডিএফগুলি সহজেই এডিট, কনভার্ট এবং ম্যানেজ করুন।',
    'footer.copyright': '© 2025 পিডিএফ টুলস। সর্বস্বত্ব সংরক্ষিত।',
    'footer.quicklinks': 'দ্রুত লিঙ্ক',
    'footer.legal': 'আইনি',
    'footer.tagline': 'অপটিমাল পারফরম্যান্সের জন্য আধুনিক প্রযুক্তি দিয়ে তৈরি।',
  },
  kn: {
    'app.title': 'PDF ಟೂಲ್ಸ್',
    'app.subtitle': 'ಎಲ್ಲಾ-ಒಂದೇ-ಒಂದು PDF ಉಪಯುಕ್ತಗಳು',
    'app.hero.title': 'ಎಲ್ಲಾ-ಒಂದೇ-ಒಂದು PDF ಟೂಲ್ಸ್',
    'app.hero.description': 'ನಿಮ್ಮ PDF ಫೈಲ್‌ಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಮತ್ತು ನಮ್ಮ ಶಕ್ತಿಶಾಲಿ ಟೂಲ್‌ಗಳನ್ನು ಬಳಸಿ ಅವುಗಳನ್ನು ಪರಿವರ್ತಿಸಿ. ಪಠ್ಯವನ್ನು ಹೊರತೆಗೆಯಿರಿ, ಫೈಲ್‌ಗಳನ್ನು ವಿಲೀನಗೊಳಿಸಿ, ಚಿತ್ರಗಳಾಗಿ ಪರಿವರ್ತಿಸಿ, ಮತ್ತು ಇನ್ನೂ ಹೆಚ್ಚು.',
    'app.upload.title': 'PDF ಫೈಲ್‌ಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
    'app.upload.description': 'ನಿಮ್ಮ PDF ಫೈಲ್‌ಗಳನ್ನು ಇಲ್ಲಿ ಎಳೆದು ಬಿಡಿ ಅಥವಾ ಬ್ರೌಸ್ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ',
    'app.upload.limit': 'ಗರಿಷ್ಠ ಫೈಲ್ ಗಾತ್ರ: 10MB',
    'app.files.title': 'ನಿಮ್ಮ ಫೈಲ್‌ಗಳು',
    'app.tools.title': 'PDF ಟೂಲ್ಸ್',
    'app.tools.description': 'ನಿಮ್ಮ ಡಾಕ್ಯುಮೆಂಟ್‌ಗಳನ್ನು ಪರಿವರ್ತಿಸಲು ಅಗತ್ಯವಿರುವ ಟೂಲ್‌ಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    'tools.extract.title': 'ಪಠ್ಯವನ್ನು ಹೊರತೆಗೆಯಿರಿ',
    'tools.extract.description': 'ನಿಮ್ಮ PDF ಫೈಲ್‌ಗಳಿಂದ ಎಲ್ಲಾ ಪಠ್ಯ ವಿಷಯವನ್ನು ಹೊರತೆಗೆದು TXT ಸ್ವರೂಪದಲ್ಲಿ ಉಳಿಸಿ.',
    'tools.merge.title': 'PDF ಗಳನ್ನು ವಿಲೀನಗೊಳಿಸಿ',
    'tools.merge.description': 'ಬಹು PDF ಫೈಲ್‌ಗಳನ್ನು ಒಂದೇ ಡಾಕ್ಯುಮೆಂಟ್‌ನಲ್ಲಿ ಸಂಯೋಜಿಸಿ. ಮೂಲ ಫಾರ್ಮ್ಯಾಟಿಂಗ್ ಅನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಿ.',
    'tools.convert.title': 'ಚಿತ್ರಗಳಾಗಿ ಪರಿವರ್ತಿಸಿ',
    'tools.convert.description': 'PDF ಪುಟಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಲು ಅಥವಾ ಸಂಪಾದಿಸಲು ಅತ್ಯುನ್ನತ ಗುಣಮಟ್ಟದ JPG ಅಥವಾ PNG ಚಿತ್ರಗಳಾಗಿ ಪರಿವರ್ತಿಸಿ.',
    'category.essential': 'ಅತ್ಯಾವಶ್ಯಕ ಟೂಲ್ಸ್',
    'category.editing': 'ಸಂಪಾದನಾ ಟೂಲ್ಸ್',
    'category.security': 'ಭದ್ರತಾ ಟೂಲ್ಸ್',
    'category.optimization': 'ಆಪ್ಟಿಮೈಸೇಶನ್ ಟೂಲ್ಸ್',
    'footer.description': 'ಡಾಕ್ಯುಮೆಂಟ್ ವರ್ಕ್‌ಫ್ಲೋಗಳನ್ನು ಸುಲಭಗೊಳಿಸುವ ವೃತ್ತಿಪರ PDF ಟೂಲ್ಸ್. ನಿಮ್ಮ PDF ಗಳನ್ನು ಸುಲಭವಾಗಿ ಸಂಪಾದಿಸಿ, ಪರಿವರ್ತಿಸಿ ಮತ್ತು ನಿರ್ವಹಿಸಿ.',
    'footer.copyright': '© 2025 PDF ಟೂಲ್ಸ್. ಎಲ್ಲಾ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.',
    'footer.quicklinks': 'ತ್ವರಿತ ಲಿಂಕ್‌ಗಳು',
    'footer.legal': 'ಕಾನೂನು',
    'footer.tagline': 'ಅನುಕೂಲಕರ ಕಾರ್ಯಕ್ಷಮತೆಗಾಗಿ ಆಧುನಿಕ ತಂತ್ರಜ್ಞಾನಗಳೊಂದಿಗೆ ನಿರ್ಮಿಸಲಾಗಿದೆ.',
  },
  ml: {
    'app.title': 'PDF ടൂൾസ്',
    'app.subtitle': 'എല്ലാം-ഒന്നിൽ PDF യൂട്ടിലിറ്റികൾ',
    'app.hero.title': 'എല്ലാം-ഒന്നിൽ PDF ടൂൾസ്',
    'app.hero.description': 'നിങ്ങളുടെ PDF ഫയലുകൾ അപ്‌ലോഡ് ചെയ്ത് ഞങ്ങളുടെ ശക്തമായ ടൂളുകൾ ഉപയോഗിച്ച് അവ പരിവർത്തനം ചെയ്യുക. ടെക്‌സ്‌റ്റ് എക്‌സ്‌ട്രാക്‌റ്റ് ചെയ്യുക, ഫയലുകൾ ലയിപ്പിക്കുക, ചിത്രങ്ങളാക്കി മാറ്റുക, കൂടാതെ മറ്റ് നിരവധി കാര്യങ്ങൾ.',
    'app.upload.title': 'PDF ഫയലുകൾ അപ്‌ലോഡ് ചെയ്യുക',
    'app.upload.description': 'നിങ്ങളുടെ PDF ഫയലുകൾ ഇവിടെ വലിച്ചിടുക അല്ലെങ്കിൽ ബ്രൗസ് ചെയ്യാൻ ക്ലിക്ക് ചെയ്യുക',
    'app.upload.limit': 'പരമാവധി ഫയൽ വലുപ്പം: 10MB',
    'app.files.title': 'നിങ്ങളുടെ ഫയലുകൾ',
    'app.tools.title': 'PDF ടൂൾസ്',
    'app.tools.description': 'നിങ്ങളുടെ ഡോക്യുമെന്റുകൾ പരിവർത്തനം ചെയ്യാൻ ആവശ്യമായ ടൂളുകൾ തിരഞ്ഞെടുക്കുക',
    'tools.extract.title': 'ടെക്‌സ്‌റ്റ് എക്‌സ്‌ട്രാക്‌റ്റ് ചെയ്യുക',
    'tools.extract.description': 'നിങ്ങളുടെ PDF ഫയലുകളിൽ നിന്ന് എല്ലാ ടെക്‌സ്‌റ്റ് ഉള്ളടക്കവും എക്‌സ്‌ട്രാക്‌റ്റ് ചെയ്ത് TXT ഫോർമാറ്റിൽ സേവ് ചെയ്യുക.',
    'tools.merge.title': 'PDF കൾ ലയിപ്പിക്കുക',
    'tools.merge.description': 'ഒന്നിലധികം PDF ഫയലുകൾ ഒരൊറ്റ ഡോക്യുമെന്റിൽ സംയോജിപ്പിക്കുക. യഥാർത്ഥ ഫോർമാറ്റിംഗ് നിലനിർത്തുക.',
    'tools.convert.title': 'ചിത്രങ്ങളാക്കി മാറ്റുക',
    'tools.convert.description': 'PDF പേജുകൾ പങ്കിടുന്നതിനോ എഡിറ്റ് ചെയ്യുന്നതിനോ ഉയർന്ന നിലവാരമുള്ള JPG അല്ലെങ്കിൽ PNG ചിത്രങ്ങളാക്കി മാറ്റുക.',
    'category.essential': 'അത്യാവശ്യ ടൂളുകൾ',
    'category.editing': 'എഡിറ്റിംഗ് ടൂളുകൾ',
    'category.security': 'സുരക്ഷാ ടൂളുകൾ',
    'category.optimization': 'ഒപ്റ്റിമൈസേഷൻ ടൂളുകൾ',
    'footer.description': 'ഡോക്യുമെന്റ് വർക്ക്‌ഫ്ലോകൾ എളുപ്പമാക്കുന്ന പ്രൊഫഷണൽ PDF ടൂളുകൾ. നിങ്ങളുടെ PDF കൾ എളുപ്പത്തിൽ എഡിറ്റ് ചെയ്യുക, പരിവർത്തനം ചെയ്യുക, മാനേജ് ചെയ്യുക.',
    'footer.copyright': '© 2025 PDF ടൂൾസ്. എല്ലാ അവകാശങ്ങളും നിക്ഷിപ്തമാണ്.',
    'footer.quicklinks': 'ദ്രുത ലിങ്കുകൾ',
    'footer.legal': 'നിയമപരം',
    'footer.tagline': 'മികച്ച പ്രകടനത്തിനായി ആധുനിക സാങ്കേതികവിദ്യകൾ ഉപയോഗിച്ച് നിർമ്മിച്ചത്.',
  },
  te: {
    'app.title': 'PDF టూల్స్',
    'app.subtitle': 'అన్నీ-ఒకే-చోట PDF యుటిలిటీలు',
    'app.hero.title': 'అన్నీ-ఒకే-చోట PDF టూల్స్',
    'app.hero.description': 'మీ PDF ఫైల్‌లను అప్‌లోడ్ చేసి మా శక్తివంతమైన సాధనాలను ఉపయోగించి వాటిని మార్చండి. టెక్స్ట్‌ను వెలికితీయండి, ఫైల్‌లను విలీనం చేయండి, చిత్రాలుగా మార్చండి, మరియు మరిన్ని.',
    'app.upload.title': 'PDF ఫైల్‌లను అప్‌లోడ్ చేయండి',
    'app.upload.description': 'మీ PDF ఫైల్‌లను ఇక్కడ లాగండి & వదలండి లేదా బ్రౌజ్ చేయడానికి క్లిక్ చేయండి',
    'app.upload.limit': 'గరిష్ట ఫైల్ పరిమాణం: 10MB',
    'app.files.title': 'మీ ఫైల్‌లు',
    'app.tools.title': 'PDF టూల్స్',
    'app.tools.description': 'మీ పత్రాలను మార్చడానికి అవసరమైన సాధనాలను ఎంచుకోండి',
    'tools.extract.title': 'టెక్స్ట్‌ను వెలికితీయండి',
    'tools.extract.description': 'మీ PDF ఫైల్‌ల నుండి మొత్తం టెక్స్ట్ కంటెంట్‌ను వెలికితీసి TXT ఫార్మాట్‌లో సేవ్ చేయండి.',
    'tools.merge.title': 'PDF లను విలీనం చేయండి',
    'tools.merge.description': 'అనేక PDF ఫైల్‌లను ఒకే పత్రంలో కలపండి. అసలు ఫార్మాటింగ్‌ను నిలబెట్టుకోండి.',
    'tools.convert.title': 'చిత్రాలుగా మార్చండి',
    'tools.convert.description': 'PDF పేజీలను షేరింగ్ లేదా ఎడిటింగ్ కోసం అధిక నాణ్యత JPG లేదా PNG చిత్రాలుగా మార్చండి.',
    'category.essential': 'అవసరమైన సాధనాలు',
    'category.editing': 'ఎడిటింగ్ సాధనాలు',
    'category.security': 'భద్రతా సాధనాలు',
    'category.optimization': 'ఆప్టిమైజేషన్ సాధనాలు',
    'footer.description': 'డాక్యుమెంట్ వర్క్‌ఫ్లోలను సులభతరం చేసే ప్రొఫెషనల్ PDF టూల్స్. మీ PDF లను సులభంగా ఎడిట్ చేయండి, కన్వర్ట్ చేయండి మరియు నిర్వహించండి.',
    'footer.copyright': '© 2025 PDF టూల్స్. అన్ని హక్కులు రిజర్వ్ చేయబడ్డాయి.',
    'footer.quicklinks': 'త్వరిత లింక్‌లు',
    'footer.legal': 'చట్టపరమైన',
    'footer.tagline': 'ఆదర్శ పనితీరు కోసం ఆధునిక సాంకేతికతలతో నిర్మించబడింది.',
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

// Provider component
export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguage] = useState<Language>('en');

  // Get translations for the current language
  const currentTranslations = translations[language] || translations.en;

  // Translation function
  const t = (key: string): string => {
    return currentTranslations[key] || key;
  };

  // Update document language and font when language changes
  useEffect(() => {
    // Update HTML lang attribute
    document.documentElement.lang = language;
    
    // Update font family for body based on language
    document.body.style.fontFamily = languageFonts[language];
    
    // Store language preference
    localStorage.setItem('pdftools-language', language);
  }, [language]);

  // Load language preference from localStorage on initial render
  useEffect(() => {
    const savedLanguage = localStorage.getItem('pdftools-language') as Language;
    if (savedLanguage && Object.keys(languageNames).includes(savedLanguage)) {
      setLanguage(savedLanguage);
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.split('-')[0] as Language;
      if (Object.keys(languageNames).includes(browserLang)) {
        setLanguage(browserLang);
      }
    }
  }, []);

  const contextValue: LanguageContextType = {
    language,
    setLanguage,
    translations: currentTranslations,
    t
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook for using the language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};