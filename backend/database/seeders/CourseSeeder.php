<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\CourseCategory;
use App\Models\CourseSubcategory;
use App\Models\CourseVideo;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Course ────────────────────────────────────────────────────────────
        $course = Course::updateOrCreate(
            ['slug' => 'nma-academy-curs-complet'],
            [
                'title'             => 'NMA Academy - Curs Complet',
                'short_description' => 'Sistemul complet de la zero la profit: e-commerce, social media și business scalabil.',
                'description'       => "Cursul complet NMA Academy îți oferă tot ce ai nevoie pentru a construi un business online profitabil. "
                    . "De la selecția produselor câștigătoare și setarea magazinului până la campanii de reclame plătite și automatizări, "
                    . "vei parcurge fiecare etapă cu un sistem dovedit pas cu pas.",
                'price'             => 850.00,
                'currency'          => 'RON',
                'thumbnail_url'     => 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800',
                'status'            => 'published',
                'published_at'      => now(),
                'features'          => [
                    'Selecția produselor câștigătoare',
                    'Setare magazin Shopify optimizat',
                    'Strategii de Facebook & TikTok Ads',
                    'Automatizări și scalare',
                    'Social media authority & brand personal',
                    'Monetizare directă și indirectă',
                ],
                'target_audience'   => [
                    'Antreprenori la început de drum',
                    'Proprietari de afaceri fizice ce vor să vândă online',
                    'Marketeri ce vor să îți scaleze propriile branduri',
                    'Creatori de conținut care vor să monetizeze',
                ],
                'results_promised'  => [
                    'Primul tău magazin Shopify gata de vânzare',
                    'Campanii profitabile de reclame',
                    'Sistem automatizat de fulfillment',
                    'Creștere accelerată pe Instagram și TikTok',
                    'Comunitate loială și sistem de vânzări prin DMs',
                ],
            ]
        );

        // ── Categories ────────────────────────────────────────────────────────
        $categories = [
            [
                'slug'            => 'fundatia',
                'title'           => 'Modulul 1: Fundația',
                'description'     => 'Bazele mentale, fiscale și structurale ale unui business online de succes.',
                'order_index'     => 1,
                'is_free_preview' => true,
                'status'          => 'published',
                'subcategories'   => [
                    [
                        'slug'        => 'introducere-in-ecommerce',
                        'title'       => 'Introducere în E-Commerce',
                        'description' => 'Ce este e-commerce-ul și de ce este momentul potrivit să începi.',
                        'order_index' => 1,
                        'status'      => 'published',
                        'video'       => [
                            'title'                   => 'Introducere în E-Commerce',
                            'cloudflare_video_uid'    => 'demo-uid-001',
                            'cloudflare_playback_url' => null,
                            'cloudflare_thumbnail_url'=> null,
                            'duration_seconds'        => 900,
                            'order_index'             => 1,
                            'status'                  => 'published',
                        ],
                    ],
                    [
                        'slug'        => 'mentalitatea-antreprenorului',
                        'title'       => 'Mentalitatea Antreprenorului',
                        'description' => 'Construiește mindset-ul corect înainte de a investi timp și bani.',
                        'order_index' => 2,
                        'status'      => 'published',
                        'video'       => [
                            'title'                   => 'Mentalitatea Antreprenorului',
                            'cloudflare_video_uid'    => 'demo-uid-002',
                            'cloudflare_playback_url' => null,
                            'cloudflare_thumbnail_url'=> null,
                            'duration_seconds'        => 1320,
                            'order_index'             => 1,
                            'status'                  => 'published',
                        ],
                    ],
                    [
                        'slug'        => 'structura-fiscala-si-legala',
                        'title'       => 'Structura Fiscală și Legală',
                        'description' => 'SRL, PFA sau alt regim? Ce trebuie să știi înainte de prima vânzare.',
                        'order_index' => 3,
                        'status'      => 'published',
                        'video'       => [
                            'title'                   => 'Structura Fiscală și Legală',
                            'cloudflare_video_uid'    => 'demo-uid-003',
                            'cloudflare_playback_url' => null,
                            'cloudflare_thumbnail_url'=> null,
                            'duration_seconds'        => 1080,
                            'order_index'             => 1,
                            'status'                  => 'published',
                        ],
                    ],
                ],
            ],
            [
                'slug'            => 'produsul-si-magazinul',
                'title'           => 'Modulul 2: Produsul și Magazinul',
                'description'     => 'Găsește produse câștigătoare și construiește un magazin Shopify profesionist.',
                'order_index'     => 2,
                'is_free_preview' => false,
                'status'          => 'published',
                'subcategories'   => [
                    [
                        'slug'        => 'cercetarea-de-piata',
                        'title'       => 'Cercetarea de Piață',
                        'description' => 'Cum identifici produse cu cerere mare și concurență redusă.',
                        'order_index' => 1,
                        'status'      => 'published',
                        'video'       => [
                            'title'                   => 'Cercetarea de Piață',
                            'cloudflare_video_uid'    => 'demo-uid-004',
                            'cloudflare_playback_url' => null,
                            'cloudflare_thumbnail_url'=> null,
                            'duration_seconds'        => 1800,
                            'order_index'             => 1,
                            'status'                  => 'published',
                        ],
                    ],
                    [
                        'slug'        => 'gasirea-furnizorilor',
                        'title'       => 'Găsirea Furnizorilor',
                        'description' => 'Aliexpress, Alibaba și furnizori locali — cum negociezi și ce să eviți.',
                        'order_index' => 2,
                        'status'      => 'published',
                        'video'       => [
                            'title'                   => 'Găsirea Furnizorilor',
                            'cloudflare_video_uid'    => 'demo-uid-005',
                            'cloudflare_playback_url' => null,
                            'cloudflare_thumbnail_url'=> null,
                            'duration_seconds'        => 1500,
                            'order_index'             => 1,
                            'status'                  => 'published',
                        ],
                    ],
                    [
                        'slug'        => 'crearea-magazinului-shopify',
                        'title'       => 'Crearea Magazinului Shopify',
                        'description' => 'Setup complet: domeniu, temă, pagini, metode de plată și livrare.',
                        'order_index' => 3,
                        'status'      => 'published',
                        'video'       => [
                            'title'                   => 'Crearea Magazinului Shopify',
                            'cloudflare_video_uid'    => 'demo-uid-006',
                            'cloudflare_playback_url' => null,
                            'cloudflare_thumbnail_url'=> null,
                            'duration_seconds'        => 2700,
                            'order_index'             => 1,
                            'status'                  => 'published',
                        ],
                    ],
                ],
            ],
            [
                'slug'            => 'reclame-si-scalare',
                'title'           => 'Modulul 3: Reclame și Scalare',
                'description'     => 'Facebook Ads, TikTok Ads și strategii de scalare pentru profit maxim.',
                'order_index'     => 3,
                'is_free_preview' => false,
                'status'          => 'published',
                'subcategories'   => [
                    [
                        'slug'        => 'facebook-ads-structura',
                        'title'       => 'Facebook Ads — Structura Contului',
                        'description' => 'Cum setezi Business Manager, Pixel și prima campanie corect.',
                        'order_index' => 1,
                        'status'      => 'published',
                        'video'       => [
                            'title'                   => 'Facebook Ads — Structura Contului',
                            'cloudflare_video_uid'    => 'demo-uid-007',
                            'cloudflare_playback_url' => null,
                            'cloudflare_thumbnail_url'=> null,
                            'duration_seconds'        => 2100,
                            'order_index'             => 1,
                            'status'                  => 'published',
                        ],
                    ],
                    [
                        'slug'        => 'tiktok-ads-pentru-incepatori',
                        'title'       => 'TikTok Ads pentru Începători',
                        'description' => 'Creezi video-uri convertitoare și campanii cu buget mic.',
                        'order_index' => 2,
                        'status'      => 'published',
                        'video'       => [
                            'title'                   => 'TikTok Ads pentru Începători',
                            'cloudflare_video_uid'    => 'demo-uid-008',
                            'cloudflare_playback_url' => null,
                            'cloudflare_thumbnail_url'=> null,
                            'duration_seconds'        => 1980,
                            'order_index'             => 1,
                            'status'                  => 'published',
                        ],
                    ],
                ],
            ],
        ];

        foreach ($categories as $catData) {
            $subcatsData = $catData['subcategories'];
            unset($catData['subcategories']);

            $category = CourseCategory::updateOrCreate(
                ['course_id' => $course->id, 'slug' => $catData['slug']],
                array_merge($catData, ['course_id' => $course->id])
            );

            foreach ($subcatsData as $subData) {
                $videoData = $subData['video'];
                unset($subData['video']);

                $subcategory = CourseSubcategory::updateOrCreate(
                    ['category_id' => $category->id, 'slug' => $subData['slug']],
                    array_merge($subData, [
                        'course_id'   => $course->id,
                        'category_id' => $category->id,
                    ])
                );

                CourseVideo::updateOrCreate(
                    ['subcategory_id' => $subcategory->id],
                    array_merge($videoData, [
                        'course_id'      => $course->id,
                        'category_id'    => $category->id,
                        'subcategory_id' => $subcategory->id,
                    ])
                );
            }
        }
    }
}
