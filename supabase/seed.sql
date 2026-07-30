-- ============================================================
-- SYLLOSPHERE ADMIN DASHBOARD — SEED DATA
-- Run this AFTER schema.sql in Supabase SQL Editor
-- ============================================================

-- Home Page
INSERT INTO pages (id, slug, title, is_published)
VALUES (gen_random_uuid(), 'home', 'Home Page', true)
ON CONFLICT (slug) DO NOTHING;

-- Hero Section
INSERT INTO sections (id, page_id, type, label, order_index, is_visible)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM pages WHERE slug = 'home'),
  'hero', 'Hero Banner', 0, true
)
ON CONFLICT DO NOTHING;

-- Hero Content Keys
INSERT INTO content_keys (id, section_id, key, value, type, description)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM sections WHERE label = 'Hero Banner' LIMIT 1),
   'hero.headline', 'SYLLOSPHERE', 'text', 'Main headline in the hero section'),
  (gen_random_uuid(),
   (SELECT id FROM sections WHERE label = 'Hero Banner' LIMIT 1),
   'hero.subheadline', 'Master Logic. Ace Every Exam.', 'text', 'Subheadline below main title'),
  (gen_random_uuid(),
   (SELECT id FROM sections WHERE label = 'Hero Banner' LIMIT 1),
   'hero.description', 'The ultimate study portal for mastering logical reasoning and verbal ability.', 'textarea', 'Hero body description text'),
  (gen_random_uuid(),
   (SELECT id FROM sections WHERE label = 'Hero Banner' LIMIT 1),
   'hero.cta_primary_label', 'Start Learning', 'text', 'Primary call-to-action button text'),
  (gen_random_uuid(),
   (SELECT id FROM sections WHERE label = 'Hero Banner' LIMIT 1),
   'hero.cta_secondary_label', 'View Syllabus', 'text', 'Secondary CTA button text')
ON CONFLICT DO NOTHING;

-- Summary Box Section
INSERT INTO sections (id, page_id, type, label, order_index, is_visible)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM pages WHERE slug = 'home'),
  'summary_box', 'Summary Box', 1, true
)
ON CONFLICT DO NOTHING;

INSERT INTO content_keys (id, section_id, key, value, type, description)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM sections WHERE label = 'Summary Box' LIMIT 1),
   'summary.title', 'About Syllosphere', 'text', 'Summary section heading'),
  (gen_random_uuid(),
   (SELECT id FROM sections WHERE label = 'Summary Box' LIMIT 1),
   'summary.body', 'Syllosphere is a comprehensive learning platform designed to help you master logical reasoning, verbal ability, and quantitative aptitude through structured lessons, practice questions, and adaptive quizzes.', 'textarea', 'Summary section body text')
ON CONFLICT DO NOTHING;

-- Concept Grid Section
INSERT INTO sections (id, page_id, type, label, order_index, is_visible)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM pages WHERE slug = 'home'),
  'concept_grid', 'Concept Grid', 2, true
)
ON CONFLICT DO NOTHING;

INSERT INTO content_keys (id, section_id, key, value, type, description)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM sections WHERE label = 'Concept Grid' LIMIT 1),
   'grid.title', 'Core Concepts', 'text', 'Concept grid section title'),
  (gen_random_uuid(),
   (SELECT id FROM sections WHERE label = 'Concept Grid' LIMIT 1),
   'grid.subtitle', 'Explore the building blocks of logical mastery', 'text', 'Concept grid subtitle')
ON CONFLICT DO NOTHING;

-- Grid Items for Concept Grid
INSERT INTO grid_items (id, section_id, order_index, data, is_visible)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM sections WHERE label = 'Concept Grid' LIMIT 1),
   0, '{"title": "Syllogisms", "description": "Master deductive reasoning with categorical propositions.", "icon": "🧠", "color": "#F59E0B"}', true),
  (gen_random_uuid(),
   (SELECT id FROM sections WHERE label = 'Concept Grid' LIMIT 1),
   1, '{"title": "Blood Relations", "description": "Decode complex family relationship puzzles.", "icon": "🔗", "color": "#10B981"}', true),
  (gen_random_uuid(),
   (SELECT id FROM sections WHERE label = 'Concept Grid' LIMIT 1),
   2, '{"title": "Seating Arrangements", "description": "Visualize and solve circular and linear arrangements.", "icon": "💺", "color": "#6366F1"}', true),
  (gen_random_uuid(),
   (SELECT id FROM sections WHERE label = 'Concept Grid' LIMIT 1),
   3, '{"title": "Coding-Decoding", "description": "Crack pattern-based encoding puzzles.", "icon": "🔐", "color": "#EC4899"}', true)
ON CONFLICT DO NOTHING;

-- Modes of Acquisition Section
INSERT INTO sections (id, page_id, type, label, order_index, is_visible)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM pages WHERE slug = 'home'),
  'modes_of_acquisition', 'Modes of Acquisition', 3, true
)
ON CONFLICT DO NOTHING;

INSERT INTO content_keys (id, section_id, key, value, type, description)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM sections WHERE label = 'Modes of Acquisition' LIMIT 1),
   'modes.title', 'Ways to Master', 'text', 'Modes section heading'),
  (gen_random_uuid(),
   (SELECT id FROM sections WHERE label = 'Modes of Acquisition' LIMIT 1),
   'modes.subtitle', 'Choose your learning path', 'text', 'Modes section subtitle')
ON CONFLICT DO NOTHING;

-- CTA Section
INSERT INTO sections (id, page_id, type, label, order_index, is_visible)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM pages WHERE slug = 'home'),
  'cta', 'Call to Action', 4, true
)
ON CONFLICT DO NOTHING;

INSERT INTO content_keys (id, section_id, key, value, type, description)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM sections WHERE label = 'Call to Action' LIMIT 1),
   'cta.headline', 'Ready to Begin?', 'text', 'CTA section main heading'),
  (gen_random_uuid(),
   (SELECT id FROM sections WHERE label = 'Call to Action' LIMIT 1),
   'cta.subtext', 'Join thousands of students sharpening their minds daily.', 'text', 'CTA supporting text'),
  (gen_random_uuid(),
   (SELECT id FROM sections WHERE label = 'Call to Action' LIMIT 1),
   'cta.button_label', 'Get Started Free', 'text', 'CTA button label')
ON CONFLICT DO NOTHING;
