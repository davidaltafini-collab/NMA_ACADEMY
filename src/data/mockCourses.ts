import { Course } from "../types";

export const mockCoursesDetailed: Course[] = [
  {
    course_id: "ecommerce",
    slug: "e-commerce-elite",
    title: "E-Commerce Elite",
    description: "De la zero la 100k prin infrastructură solidă. Sistem complet, de la idee la profit.",
    price: 850,
    thumbnail: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800",
    features: [
      "Selecția produselor câștigătoare",
      "Setare magazin Shopify optimizat",
      "Strategii de Facebook & TikTok Ads",
      "Automatizări și scalare",
    ],
    target_audience: [
      "Antreprenori la început de drum",
      "Proprietari de afaceri fizice ce vor sa vanda online",
      "Marketeri ce vor sa isi scaleze propriile branduri"
    ],
    results_promised: [
      "Primul tau magazin Shopify gata de vanzare",
      "Campanii profitabile de reclame",
      "Sistem automatizat de fulfillment"
    ],
    total_duration_minutes: 155,
    modules: [
      {
        module_id: "mod_1",
        course_id: "ecommerce",
        title: "Modul 1: Fundația",
        order: 1,
        lessons: [
          { lesson_id: "les_1_1", module_id: "mod_1", title: "Introducere în E-Commerce", video_url: "/assets/videohero/panther-hero.mp4", duration_minutes: 15, is_free_preview: true, order: 1 },
          { lesson_id: "les_1_2", module_id: "mod_1", title: "Mentalitatea antreprenorului", video_url: "/assets/videohero/panther-hero.mp4", duration_minutes: 22, is_free_preview: true, order: 2 },
          { lesson_id: "les_1_3", module_id: "mod_1", title: "Structura fiscală și legală", video_url: "/assets/videohero/panther-hero.mp4", duration_minutes: 18, is_free_preview: false, order: 3 },
        ]
      },
      {
        module_id: "mod_2",
        course_id: "ecommerce",
        title: "Modul 2: Produsul și Magazinul",
        order: 2,
        lessons: [
          { lesson_id: "les_2_1", module_id: "mod_2", title: "Cercetarea de piață", video_url: "/assets/videohero/panther-hero.mp4", duration_minutes: 30, is_free_preview: false, order: 1 },
          { lesson_id: "les_2_2", module_id: "mod_2", title: "Găsirea furnizorilor", video_url: "/assets/videohero/panther-hero.mp4", duration_minutes: 25, is_free_preview: false, order: 2 },
          { lesson_id: "les_2_3", module_id: "mod_2", title: "Crearea magazinului Shopify", video_url: "/assets/videohero/panther-hero.mp4", duration_minutes: 45, is_free_preview: false, order: 3 },
        ]
      }
    ]
  },
  {
    course_id: "social-media",
    slug: "social-media-authority",
    title: "Social Media Authority",
    description: "Control total asupra algoritmilor și vânzărilor. Domină atenția online.",
    price: 889,
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800",
    features: [
      "Crearea unui brand personal puternic",
      "Strategii de conținut viral",
      "Monetizare directă și indirectă",
      "Mentorat săptămânal",
    ],
    target_audience: [
      "Creatori de continut",
      "Freelanceri",
      "Antreprenori in cautare de leaduri organice"
    ],
    results_promised: [
      "Crestere accelerata pe Instagram si TikTok",
      "Sistem de vanzari prin DMs",
      "Comunitate loiala"
    ],
    total_duration_minutes: 10,
    modules: [
      {
        module_id: "sm_mod_1",
        course_id: "social-media",
        title: "Platformele. Bazele",
        order: 1,
        lessons: [
          { lesson_id: "sm_les_1_1", module_id: "sm_mod_1", title: "Introducere", video_url: "/assets/videohero/panther-hero.mp4", duration_minutes: 10, is_free_preview: true, order: 1 }
        ]
      }
    ]
  }
];
