/*!
 * AllRight 10 — конфіг сторінки і квізу (v2: квіз = нативна Webflow-форма anniv10-quiz).
 * Тут ЄДИНЕ місце для: цифр (stats), локалей, текстів помилок, режиму сабміту, аналітики.
 * Варіанти відповідей (childAge / goals / child_hobby) живуть у Designer як radio/checkbox
 * з Group Name / Choice Value = поля CRM. Тут їх не дублюємо.
 * Дедлайн задається один раз у <head> (window.ANNIV10_DEADLINE), див. head.html.
 *
 * Усе, що позначено TODO, заповнює розробка / маркетинг до запуску.
 */
window.ANNIV10_CONFIG = {
  quizVersion: 'anniv10_v1',
  deadline: window.ANNIV10_DEADLINE || '2026-10-31T21:59:59Z',
  deadlineTimeZone: 'Europe/Kyiv',
  defaultLocale: 'uk',
  debug: false,                              // або ?anniv_debug=1

  // Повна воронка (запасний перехід після 2 невдач). Контракт з основного лендінгу, TODO: підтвердити з розробкою
  fullFunnelUrl: function (locale, age) {
    return 'https://allright.com/' + locale + '/app/sign-up?child_age=' + encodeURIComponent(age || '') +
      '&event_transition_from=FREE_TRIAL_CLICKED_AGE';
  },

  // Як відправляти форму:
  //  'webflow' — нативний сабміт Webflow (Forms → webhook → CRM). Після успіху: redirect на afterSubmitUrl, якщо задано.
  //  'api'     — JS-сабміт fetch на api.url (urlencoded name=value, як Webflow), відповідь з lead_id і booking_url.
  submitMode: 'webflow',                      // TODO: обирає розробка
  afterSubmitUrl: '',                         // TODO: URL кроку вибору часу для режиму 'webflow' (статичний redirect)

  api: {
    url: 'https://TODO/api/leads',           // TODO: endpoint для режиму 'api'
    timeoutMs: 15000,
    headers: {},
    parseSuccess: function (body) {
      if (!body) return null;
      var d = body.data || body;
      return { lead_id: d.lead_id, booking_url: d.booking_url };
    },
    buildBookingUrl: function (leadId, locale) {   // TODO: правило від розробки, якщо API не повертає booking_url
      return 'https://allright.com/' + locale + '/app/booking/lesson-time-select?lead_id=' + encodeURIComponent(leadId);
    },
    parseFieldErrors: function (body) {             // 4xx → { phone: 'текст', email: 'текст' }
      var out = {};
      if (!body || !body.errors) return out;
      var list = Array.isArray(body.errors) ? body.errors
        : Object.keys(body.errors).map(function (k) { return { field: k, message: body.errors[k] }; });
      list.forEach(function (e) {
        var f = String(e.field || '').split('.').pop();
        if (f === 'phone' || f === 'email') out[f] = e.message;
      });
      return out;
    }
  },

  analytics: {
    // TODO: звірити з версією Jitsu на сайті (v1: jitsu('track',…), v2: jitsu.track(…))
    send: function (name, params) {
      try { if (window.jitsu && typeof window.jitsu.track === 'function') window.jitsu.track(name, params); } catch (e) {}
      try {
        if (typeof window.gtag === 'function') window.gtag('event', name, params);
        else (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: name }, params));
      } catch (e) {}
    }
  },

  consent: {
    // Лише для локалей з eu: true. TODO: під'єднати CMP сайту; після згоди CMP викликає
    //   document.dispatchEvent(new CustomEvent('anniv10:consent', { detail: { analytics: true } }))
    hasConsent: function () {
      if (window.Cookiebot && window.Cookiebot.consent) return !!window.Cookiebot.consent.statistics;
      return false;
    }
  },

  // УСІ цифри сторінки: data-anniv-stat="ключ" або {ключ} у текстах з data-anniv-tpl (у т. ч. CMS-полях)
  stats: {
    lessons: '5 млн', students: '100 тис.', teachers: '800+',
    studentCountries: '46', teacherCountries: '67', refundDays: '28',
    fbRating: '98%', otzyvRating: '4,8', teacherExpYears: '2', deviceShare: '42%', lessonMinutes: '25'
  },
  statsByLocale: {                          // перевизначення цифр для локалей (решта з stats)
    pl: { lessons: '5 mln', students: '100 tys.' }
  },

  // Поле телефону з вибором країни (intl-tel-input 18.2.1 з cdnjs, як на self-v9-math).
  // Якщо бібліотека не завантажилась — працює простий режим з кодом країни сторінки (locales нижче).
  phone: {
    utilsUrl: 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/18.2.1/js/utils.min.js',
    preferred: ['pl', 'it', 'ua', 'kz', 'es', 'ro', 'gb', 'de', 'fr', 'cz', 'sk', 'bg', 'si', 'rs', 'il', 'us'],
    countryByLocale: {
      uk: 'ua', pl: 'pl', it: 'it', es: 'es', ro: 'ro', en: 'gb', de: 'de', fr: 'fr', pt: 'pt', ru: 'ua', sr: 'rs',
      el: 'gr', cs: 'cz', sk: 'sk', hu: 'hu', he: 'il', ar: 'ae', tr: 'tr', ms: 'my', id: 'id', vi: 'vn', th: 'th',
      ko: 'kr', ja: 'jp', 'pt-br': 'br', bg: 'bg', hr: 'hr', sl: 'si'
    }
  },

  // Конфеті на першому екрані (data-anniv-confetti). Кольори — CSS-змінні сайту або будь-які CSS-кольори.
  confetti: {
    enabled: true, colors: ['--heliotrope', '--tree-poppy', '--heliotrope/0.5'], shapes: ['rect', 'strip', 'circle'],
    size: 14, density: 1, gravity: 1, life: 6, fade: 0.25, maxPieces: 900, burst: true, burstCount: 120, intro: true
  },

  // Відео (ключ = значення data-anniv-video). Google Drive: h — горизонтальне, v — вертикальне з субтитрами (телефон).
  // Мови без власного відео показують fallback. Папка: drive.google.com/drive/folders/1nl-4kYHdYcLEAemQG_abNABll7PmQNnf
  videos: {
    charlie: {
      fallback: 'en',
      byLocale: {
        uk: { h: '1p5mXL2yfMSQ3TK6WskUMLz767hIoVXtz', v: '1js7Ix5bkXt1qn7wY1GJlT4QmUCA5JDQM' },
        en: { h: '14OvnB9lVS_QE2nhgn2-nGxfrA4_WiQTh', v: '1Zh-mlYIkDnNJIUzRluoM4qKLSjnxrUGW' },
        pl: { h: '1mw45aghJN2koFozuCxkqZwS5RsSQ38Ly', v: '13OK3rl4sLEhrjDS8T1nXEd-A0oelDJnF' },
        it: { h: '11nQ1UZ-pApJ9HXtYxRnRJ1HhP_J8JSKZ', v: '15pzUDNQpPZERcmHTneT6VpgMJqgyOxjk' },
        ro: { h: '1LorarQM92nXNclv78PygN32yMRm0ChI6', v: '19BN5vYomvor84ggp5YKybYil9u1lS22-' },
        sr: { h: '1aV8zDxvR4tDJwxkuawuKpZsISn7F1gXJ', v: '1mFMhDgvz1hMfN0-d5Euy0an6MJQfF2Za' },
        he: { h: '1b6v050ZIOIlfvbntagbSnz74toqGCOj6', v: '10t9mvZ4c_kxu3niwLZwGG8s-k7XFyJkt' }
      }
    }
  },

  // Вигнута галерея віх (data-anniv-gallery на Collection List). bend — глибина дуги (0 = пряма стрічка);
  // loop: false — 10 карток від першої до останньої, «→» на останній відмотує на першу; true — нескінченна стрічка
  gallery: { enabled: true, loop: false, bend: 3, ease: 0.08, dragSpeed: 1.2 },

  // Нескінченна стрічка (data-anniv-marquee на обгортці Collection List нагород), як на allright.com
  marquee: { enabled: true, speed: 0.6, stopOnMouseEnter: true },
  // «Розгортання» заголовка hero, як reactbits.dev/text-animations/fold-text (paper, hinge top).
  // duration — сек на літеру, stagger — затримка між літерами, angle — кут згину, crease — тінь на згині (0..1)
  // Поява блоків при прокрутці, як reactbits.dev/animations/animated-content (vertical, distance 100, 0.8s, power3.out, once).
  // stagger — затримка між сусідами, що з'являються разом; threshold — частка висоти екрана знизу, з якої стартує
  reveal: { enabled: true, distance: 100, duration: 0.8, stagger: 0.08, threshold: 0.1,
    selector: '.anniv_main > section:not(.section_hero) .section_title, .anniv_main > section:not(.section_hero) .trust_subtitle, .milestones_list.is-gallery, .anniv-gallery_nav, .milestones_footnote, .reasons_grid > *, .section_cta, .review_item, .quote_card, .how_step, .trust_item, .awards_block, .faq_item, .title_bgonquize, .quiz-again_content .quiz_wrap' },
  fold: { enabled: true, selector: '.hero_title', duration: 0.65, stagger: 0.035, angle: 92, perspective: 700, crease: 0.55 },

  // Мовні версії сторінки: /{code}/<slug>. liveLocales — які показувати в перемикачі мов (null = усі з розмітки)
  liveLocales: null,
  rtlLocales: ['he'],

  // 28 локалей сайту: [телефонний код, к-сть цифр без коду (null = не перевіряти, TODO), ринок ЄС]
  locales: {
    uk: ['+380', 9, false], pl: ['+48', 9, true], it: ['+39', null, true], es: ['+34', 9, true], ro: ['+40', 9, true],
    en: ['+1', null, false], de: ['+49', null, true], fr: ['+33', 9, true], pt: ['+351', 9, true], ru: ['+7', 10, false],
    sr: ['+381', null, false], el: ['+30', 10, true], cs: ['+420', 9, true], sk: ['+421', 9, true], hu: ['+36', 9, true],
    he: ['+972', 9, false], ar: ['+971', null, false], tr: ['+90', 10, false], ms: ['+60', null, false], id: ['+62', null, false],
    vi: ['+84', null, false], th: ['+66', null, false], ko: ['+82', null, false], ja: ['+81', null, false], 'pt-br': ['+55', 11, false],
    bg: ['+359', 9, true], hr: ['+385', null, true], sl: ['+386', 8, true]
  },

  // Тексти, які генерує JS (решта — у Designer). Інші мови: i18n/{lang}.json → build_code.py додає їх у код своєї сторінки.
  texts: {
    uk: {
      dateLocale: 'uk-UA',
      htmlLang: 'uk',
      badge: '10 років',
      step: 'Крок {n} із 5',
      resultTitle: 'Ювілейний набір для {name} готовий',
      resultTitleEmpty: 'Ваш ювілейний набір готовий',
      ageChip: '{age} р.',
      nameError: "Введіть ім'я дитини",
      phoneError: 'Введіть коректний номер телефону',   // TODO: підтвердити текст
      emailError: 'Введіть коректний email',             // TODO: підтвердити текст
      sendError: 'Не вдалося надіслати. Спробуйте ще раз',
      sending: 'Надсилаємо…',
      headerCta: 'Пройти квіз',
      headerCtaDone: 'Обрати час уроку',
      galleryPrev: 'Попередня віха',
      galleryNext: 'Наступна віха',
      placeholders: { child_name: "Ім'я дитини", phone: '00 000 00 00', email: 'name@mail.com' }
    }
  }
};

window.ANNIV10_CONFIG.texts["fr"] = {"step": "Étape {n} sur 5", "resultTitle": "Le pack anniversaire de {name} est prêt", "resultTitleEmpty": "Votre pack anniversaire est prêt", "ageChip": "{age} ans", "nameError": "Saisissez le prénom de votre enfant", "phoneError": "Saisissez un numéro de téléphone valide", "emailError": "Saisissez une adresse e-mail valide", "sendError": "Échec de l'envoi. Veuillez réessayer", "sending": "Envoi en cours…", "headerCta": "Faire le quiz", "headerCtaDone": "Choisir un horaire", "badge": "10 ans", "galleryPrev": "Étape précédente", "galleryNext": "Étape suivante", "dateLocale": "fr-FR", "htmlLang": "fr", "placeholders": {"child_name": "Prénom de l'enfant", "phone": "000 000 000", "email": "name@mail.com"}};
window.ANNIV10_CONFIG.statsByLocale["fr"] = {"lessons": "5 M", "students": "100 000"};