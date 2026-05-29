import type { Language } from './store';

type Strings = {
  // Intro
  intro_title: string;
  intro_subtitle: string;
  intro_cta: string;

  // Hint
  hint_explore: string;
  hint_walking: string;

  // Controls
  walk: string;
  pause: string;
  speed: string;
  restart: string;
  auto: string;
  manual: string;
  manual_hint: string;

  // Quality
  quality_low: string;
  quality_medium: string;
  quality_high: string;

  // Brand
  brand_presents: string;
  brand_gift: string;
  brand_blessing: string;

  // Closing
  closing_title: string;
  closing_subtitle: string;
  closing_cta: string;
  closing_restart: string;

  // Misc
  loading: string;
  close: string;
  size_small: string;
  size_medium: string;
  size_large: string;
  size_massive: string;
};

export const STRINGS: Record<Language, Strings> = {
  en: {
    intro_title: 'Vesak Street',
    intro_subtitle: 'A walk through Colombo on Vesak night',
    intro_cta: 'Begin the walk',

    hint_explore: 'Click any lantern to read its story',
    hint_walking: 'Drag to look around · Click any lantern',

    walk: 'Walk',
    pause: 'Pause',
    speed: 'Speed',
    restart: 'Restart',
    auto: 'Auto',
    manual: 'Manual',
    manual_hint: 'W/S or arrows · drag to look',

    quality_low: 'Low',
    quality_medium: 'Med',
    quality_high: 'High',

    brand_presents: 'Commercial Bank presents',
    brand_gift: 'A Vesak gift to the nation',
    brand_blessing: 'May your path always be illuminated. Happy Vesak.',

    closing_title: 'The light continues',
    closing_subtitle: 'Experience it in person. Visit Sri Lanka for Vesak.',
    closing_cta: 'Plan your visit',
    closing_restart: 'Walk again',

    loading: 'Lighting the lanterns',
    close: 'Close',
    size_small: 'Small',
    size_medium: 'Medium',
    size_large: 'Large',
    size_massive: 'Massive',
  },
  si: {
    intro_title: 'වෙසක් වීදිය',
    intro_subtitle: 'වෙසක් රාත්‍රියේ කොළඹ වීදිය මැද',
    intro_cta: 'ඇවිදීම ආරම්භ කරන්න',

    hint_explore: 'කථාව කියවීමට ඕනෑම කූඩුවක් ක්ලික් කරන්න',
    hint_walking: 'වටපිට බැලීමට ඇදගන්න · කූඩුවක් ක්ලික් කරන්න',

    walk: 'යන්න',
    pause: 'නවතන්න',
    speed: 'වේගය',
    restart: 'නැවත',
    auto: 'ස්වයංක්‍රීය',
    manual: 'අතින්',
    manual_hint: 'W/S හෝ ඊතල · බැලීමට ඇදගන්න',

    quality_low: 'අඩු',
    quality_medium: 'මධ්‍යම',
    quality_high: 'උසස්',

    brand_presents: 'කොමර්ෂල් බැංකුව ඉදිරිපත් කරයි',
    brand_gift: 'ජාතියට වෙසක් තෑග්ගක්',
    brand_blessing: 'ඔබේ මග සැමවිටම ආලෝකමත් වේවා. සුබ වෙසක්.',

    closing_title: 'ආලෝකය දිගටම පවතී',
    closing_subtitle: 'එය මුණගැසීමට ශ්‍රී ලංකාවට පැමිණෙන්න',
    closing_cta: 'සංචාරය සැලසුම් කරන්න',
    closing_restart: 'නැවත ඇවිදින්න',

    loading: 'කූඩු දල්වමින්',
    close: 'වසන්න',
    size_small: 'කුඩා',
    size_medium: 'මධ්‍යම',
    size_large: 'විශාල',
    size_massive: 'අතිවිශාල',
  },
  ta: {
    intro_title: 'வெசாக் தெரு',
    intro_subtitle: 'வெசாக் இரவில் கொழும்பு வழியாக நடைபயிற்சி',
    intro_cta: 'நடைபயிற்சியைத் தொடங்குங்கள்',

    hint_explore: 'கதையைப் படிக்க எந்த விளக்கையும் கிளிக் செய்யவும்',
    hint_walking: 'சுற்றிப் பார்க்க இழுக்கவும்',

    walk: 'நடக்க',
    pause: 'இடைநிறுத்து',
    speed: 'வேகம்',
    restart: 'மீண்டும்',
    auto: 'தானியங்கி',
    manual: 'கையேடு',
    manual_hint: 'W/S அல்லது அம்புகள்',

    quality_low: 'குறைந்த',
    quality_medium: 'நடுத்தர',
    quality_high: 'உயர்',

    brand_presents: 'கொமர்ஷல் வங்கி வழங்குகிறது',
    brand_gift: 'தேசத்திற்கு ஒரு வெசாக் பரிசு',
    brand_blessing: 'உங்கள் பாதை எப்போதும் ஒளிரட்டும். இனிய வெசாக்.',

    closing_title: 'ஒளி தொடர்கிறது',
    closing_subtitle: 'நேரில் அனுபவிக்கவும். வெசாக்கிற்காக இலங்கை செல்லுங்கள்.',
    closing_cta: 'பயணத்தைத் திட்டமிடுங்கள்',
    closing_restart: 'மீண்டும் நடக்கவும்',

    loading: 'விளக்குகளை ஏற்றுகிறோம்',
    close: 'மூடு',
    size_small: 'சிறிய',
    size_medium: 'நடுத்தர',
    size_large: 'பெரிய',
    size_massive: 'மிகப்பெரிய',
  },
};

export function useStrings(lang: Language): Strings {
  return STRINGS[lang];
}
