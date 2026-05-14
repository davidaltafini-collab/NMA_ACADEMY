# Database Schema Draft (Laravel / Eloquent)

This draft outlines the required tables to support the NMA platform. It uses `users.role` to handle admin permissions instead of a separate admin table.

## 1. `users`
- `id` (PK)
- `name` (String)
- `email` (String, unique)
- `password` (String)
- `phone` (String, nullable)
- `role` (Enum: 'user', 'admin', 'superadmin', default: 'user')
- `status` (Enum: 'active', 'suspended', default: 'active')
- `email_verified_at` (Timestamp, nullable)
- `marketing_consent` (Boolean, default: false)
- `terms_accepted_at` (Timestamp, nullable)
- `last_login_at` (Timestamp, nullable)
- `created_at`
- `updated_at`
- `deleted_at` (Soft delete)

## 2. `billing_profiles`
- `id` (PK)
- `user_id` (FK to `users`, unique)
- `billing_type` (Enum: 'personal', 'company')
- `cnp` (String, nullable)
- `company_name` (String, nullable)
- `cui` (String, nullable)
- `reg_com` (String, nullable)
- `address` (Text)
- `city` (String)
- `county` (String)
- `country` (String)
- `postal_code` (String, nullable)
- `email` (String, nullable)
- `phone` (String, nullable)
- `created_at`
- `updated_at`

## 3. `user_sessions`
- `id` (PK)
- `user_id` (FK to `users`)
- `device_info` (String)
- `user_agent` (String)
- `ip_address` (String)
- `device_fingerprint` (String, nullable)
- `is_active` (Boolean, default: true)
- `last_active_at` (Timestamp)
- `expires_at` (Timestamp, nullable)
- `revoked_at` (Timestamp, nullable)
- `created_at`
- `updated_at`
- *Indexes:* `user_id`, `is_active`

## 4. `courses`
- `id` (PK)
- `title` (String)
- `slug` (String, unique)
- `short_description` (Text)
- `description` (Text)
- `price` (Decimal: 8,2)
- `currency` (String, default: 'EUR')
- `thumbnail_url` (String)
- `hero_image_url` (String, nullable)
- `preview_video_url` (String, nullable)
- `level` (Enum: 'beginner', 'intermediate', 'advanced', 'all')
- `language` (String, default: 'ro')
- `status` (Enum: 'draft', 'published', 'archived', default: 'draft')
- `sort_order` (Integer, default: 0)
- `total_duration_seconds` (Integer, default: 0)
- `created_by` (FK to `users`, nullable)
- `published_at` (Timestamp, nullable)
- `created_at`
- `updated_at`

## 5. `course_modules`
- `id` (PK)
- `course_id` (FK to `courses`)
- `title` (String)
- `description` (Text, nullable)
- `order_index` (Integer)
- `is_free_preview` (Boolean, default: false)
- `created_at`
- `updated_at`

## 6. `lessons`
- `id` (PK)
- `course_module_id` (FK to `course_modules`)
- `title` (String)
- `description` (Text, nullable)
- `is_free_preview` (Boolean, default: false)
- `lesson_type` (Enum: 'video', 'text', 'resource')
- `video_provider` (String, nullable) // e.g., 'bunny', 'vimeo'
- `video_asset_id` (String, nullable)
- `video_url` (String, nullable)
- `hls_path` (String, nullable)
- `duration_seconds` (Integer, default: 0)
- `order_index` (Integer)
- `status` (Enum: 'draft', 'published', default: 'draft')
- `created_at`
- `updated_at`

## 7. `lesson_resources`
- `id` (PK)
- `lesson_id` (FK to `lessons`)
- `title` (String)
- `file_url` (String)
- `file_type` (String) // e.g., 'pdf', 'zip'
- `order_index` (Integer, default: 0)
- `created_at`
- `updated_at`

## 8. `user_courses`
- `id` (PK)
- `user_id` (FK to `users`)
- `course_id` (FK to `courses`)
- `source_payment_id` (FK to `payments`, nullable)
- `access_status` (Enum: 'active', 'suspended', 'expired', 'refunded', 'pending')
- `progress_percent` (Integer, default: 0)
- `unlocked_at` (Timestamp, nullable)
- `last_accessed_at` (Timestamp, nullable)
- `expires_at` (Timestamp, nullable)
- `created_at`
- `updated_at`
- *Constraints:* unique(`user_id`, `course_id`)

## 9. `lesson_progress`
- `id` (PK)
- `user_id` (FK to `users`)
- `lesson_id` (FK to `lessons`)
- `is_completed` (Boolean, default: false)
- `watched_seconds` (Integer, default: 0)
- `completed_at` (Timestamp, nullable)
- `created_at`
- `updated_at`
- *Constraints:* unique(`user_id`, `lesson_id`)

## 10. `checkouts`
- `id` (PK) // string/uuid (e.g., chk_...)
- `user_id` (FK to `users`)
- `course_id` (FK to `courses`)
- `discount_code_id` (FK to `discount_codes`, nullable)
- `amount` (Decimal: 8,2)
- `currency` (String)
- `provider_payment_url` (String, nullable)
- `status` (Enum: 'started', 'redirected_to_payment', 'paid', 'abandoned', 'expired')
- `expires_at` (Timestamp, nullable)
- `created_at`
- `updated_at`

## 11. `payments`
- `id` (PK)
- `checkout_id` (FK to `checkouts`)
- `user_id` (FK to `users`)
- `course_id` (FK to `courses`, nullable)
- `provider` (String, default: 'netopia')
- `provider_order_id` (String) // unique per provider
- `netopia_transaction_id` (String, nullable)
- `amount` (Decimal: 8,2)
- `currency` (String)
- `status` (Enum: 'pending', 'processing', 'paid', 'failed', 'cancelled', 'refunded', 'expired')
- `status_reason` (String, nullable)
- `metadata_json` (Json, nullable)
- `paid_at` (Timestamp, nullable)
- `failed_at` (Timestamp, nullable)
- `created_at`
- `updated_at`
- *Indexes:* `provider_order_id`, `netopia_transaction_id`

## 12. `invoices`
- `id` (PK)
- `payment_id` (FK to `payments`)
- `user_id` (FK to `users`)
- `oblio_invoice_series` (String, nullable)
- `oblio_invoice_number` (String, nullable)
- `oblio_invoice_link` (String, nullable)
- `pdf_url` (String, nullable)
- `status` (Enum: 'draft', 'issued', 'paid', 'cancelled', 'error')
- `issued_at` (Timestamp, nullable)
- `created_at`
- `updated_at`

## 13. `leads`
- `id` (PK)
- `name` (String, nullable)
- `email` (String)
- `phone` (String, nullable)
- `source_page` (String, nullable)
- `utm_source` (String, nullable)
- `utm_medium` (String, nullable)
- `utm_campaign` (String, nullable)
- `gdpr_consent` (Boolean)
- `gdpr_consent_at` (Timestamp, nullable)
- `status` (Enum: 'new', 'contacted', 'converted', 'unsubscribed', default: 'new')
- `converted_user_id` (FK to `users`, nullable)
- `converted_at` (Timestamp, nullable)
- `created_at`
- `updated_at`
- *Indexes:* `email`

## 14. `discount_codes`
- `id` (PK)
- `code` (String, unique)
- `type` (Enum: 'percentage', 'fixed')
- `value` (Decimal: 8,2)
- `course_id` (FK to `courses`, nullable) // null means all courses
- `valid_from` (Timestamp, nullable)
- `valid_until` (Timestamp, nullable)
- `max_uses_per_user` (Integer, default: 1)
- `minimum_amount` (Decimal: 8,2, nullable)
- `max_uses` (Integer, nullable)
- `uses_count` (Integer, default: 0)
- `is_active` (Boolean, default: true)
- `created_at`
- `updated_at`

## 15. `video_access_logs`
- `id` (PK)
- `user_id` (FK to `users`)
- `lesson_id` (FK to `lessons`)
- `session_id` (FK to `user_sessions`, nullable)
- `action` (String) // e.g., 'play', 'pause', 'seek', 'error'
- `watched_seconds` (Integer, default: 0)
- `ip_address` (String)
- `user_agent` (String)
- `created_at`

## 16. `newsletter_subscribers`
- `id` (PK)
- `name` (String, nullable)
- `email` (String, unique)
- `source` (String, nullable)
- `status` (Enum: 'subscribed', 'unsubscribed', default: 'subscribed')
- `subscribed_at` (Timestamp)
- `unsubscribed_at` (Timestamp, nullable)
- `created_at`
- `updated_at`

## 17. `email_campaigns`
- `id` (PK)
- `name` (String)
- `subject` (String)
- `type` (Enum: 'newsletter', 'promotion', 'transactional', 'automated')
- `body` (Text)
- `body_html` (Text, nullable)
- `segment` (String, nullable)
- `status` (Enum: 'draft', 'sent', default: 'draft')
- `created_by` (FK to `users`, nullable)
- `sent_at` (Timestamp, nullable)
- `created_at`
- `updated_at`

## 18. `email_logs`
- `id` (PK)
- `email_campaign_id` (FK to `email_campaigns`, nullable)
- `user_id` (FK to `users`, nullable)
- `lead_id` (FK to `leads`, nullable)
- `user_email` (String)
- `provider_id` (String, nullable) // e.g. Mailgun Message ID
- `status` (Enum: 'sent', 'failed')
- `error_message` (Text, nullable)
- `opened_at` (Timestamp, nullable)
- `clicked_at` (Timestamp, nullable)
- `sent_at` (Timestamp)
- `created_at`

## 19. `admin_audit_logs`
- `id` (PK)
- `admin_id` (FK to `users`)
- `action` (String)
- `entity_type` (String, nullable)
- `entity_id` (String, nullable)
- `details` (Text)
- `metadata_json` (Json, nullable)
- `ip_address` (String)
- `created_at`
