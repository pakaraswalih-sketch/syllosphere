-- ============================================================
-- SYLLOSPHERE — User-Side Content Keys
-- Run in Supabase SQL Editor
-- Adds a "UI Strings" section to the home page for all
-- user-facing hardcoded text in the student app.
-- ============================================================

-- 1. Ensure home page exists
INSERT INTO pages (slug, title, is_published)
VALUES ('home', 'Home Page', true)
ON CONFLICT (slug) DO NOTHING;

-- 2. Create a "UI Strings" section to hold all app labels
INSERT INTO sections (page_id, type, label, order_index, is_visible)
VALUES (
  (SELECT id FROM pages WHERE slug = 'home'),
  'custom', 'UI Strings', 99, true
)
ON CONFLICT DO NOTHING;

-- 3. Insert all user-facing text keys
INSERT INTO content_keys (section_id, key, value, type, description)
VALUES

-- ── Landing Page ───────────────────────────────────────────
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.nav.login',           'Login',           'text', 'Nav: Login button label'),
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.nav.about',           'About',           'text', 'Nav: About button label'),
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.nav.contact',         'Contact',         'text', 'Nav: Contact button label'),
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.nav.signup',          'Signup',          'text', 'Nav: Signup button label'),
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.nav.dashboard',       'Dashboard',       'text', 'Nav: Dashboard (logged in)'),
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.nav.continue',        'Continue',        'text', 'Nav: Continue (logged in)'),

-- ── Enrollment Screen ──────────────────────────────────────
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.enrollment.title',    'Identity Registration', 'text', 'Enrollment: Screen title'),
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.enrollment.placeholder', 'Enter Name',   'text', 'Enrollment: Input placeholder'),
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.enrollment.confirm',  'CONFIRM',         'text', 'Enrollment: Confirm button'),
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.enrollment.cancel',   'Cancel',          'text', 'Enrollment: Cancel button'),

-- ── Level Selection ────────────────────────────────────────
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.levels.title',        'Course Levels',   'text', 'Levels: Page heading'),
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.levels.locked_msg',   'Complete the previous level to unlock this.', 'text', 'Levels: Locked popup message'),
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.levels.locked_label', 'Locked',          'text', 'Levels: Lock badge text'),
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.levels.return_btn',   'Return to Identity', 'text', 'Levels: Back button label'),
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.profile.label',       'Candidate Profile', 'text', 'Profile: Label above name'),
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.profile.path_label',  'Syllospherical Path', 'text', 'Profile: Progress bar label'),
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.profile.verified',    'Verified',        'text', 'Profile: Verified stat label'),
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.profile.status',      'Status',          'text', 'Profile: Status stat label'),
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.profile.adept',       'Adept',           'text', 'Profile: Completed status'),
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.profile.initiate',    'Initiate',        'text', 'Profile: In-progress status'),

-- ── Dashboard (Lesson list) ────────────────────────────────
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.dashboard.modules_label', 'Verification Modules', 'text', 'Dashboard: Subtitle below level name'),
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.dashboard.levels_btn', 'Levels',         'text', 'Dashboard: Back to levels button'),
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.lesson.verified',     'Verified',        'text', 'Lesson badge: Completed label'),
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.lesson.locked',       'Locked',          'text', 'Lesson badge: Locked label'),

-- ── Lesson View ────────────────────────────────────────────
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.tabs.theory',         'Theory',          'text', 'Lesson tab: Learn tab label'),
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.tabs.validate',       'Validate',        'text', 'Lesson tab: Quiz tab label'),
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.tabs.consult',        'Consult',         'text', 'Lesson tab: Tutor tab label'),
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.lesson.focus_btn',    'Enter Focus Mode', 'text', 'Lesson: Focus mode button'),
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.lesson.reset_btn',    'Recycle Logical Stream', 'text', 'Lesson: Reset button'),
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.lesson.loading',      'Decoding verification protocols...', 'text', 'Lesson: Loading message'),
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.quiz.loading',        'Generating integrity checks...', 'text', 'Quiz: Loading message'),
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.quiz.check_btn',      'Check Protocol',  'text', 'Quiz: Check answer button'),
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.quiz.continue_btn',   'Continue',        'text', 'Quiz: Continue button'),
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.quiz.restart_btn',    'Restart Protocol', 'text', 'Quiz: Restart button'),
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.quiz.complete_title', 'Evaluation Complete', 'text', 'Quiz: Completion heading'),
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.quiz.correct_label',  'Excellent! Meaning:', 'text', 'Quiz: Correct answer label'),
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.quiz.wrong_label',    'Incorrect. Target:',  'text', 'Quiz: Wrong answer label'),

-- ── Tutor ──────────────────────────────────────────────────
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.tutor.placeholder',   'Type inquiry for verification...', 'text', 'Tutor: Input placeholder'),
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.tutor.candidate',     'Candidate',       'text', 'Tutor: User role label'),
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.tutor.ai',            'Syllosphere_AI',  'text', 'Tutor: AI role label'),

-- ── Signup Success ─────────────────────────────────────────
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.signup.title',        'Account Created', 'text', 'Signup success: Heading'),
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.signup.verify_note',  'Please check your inbox and verify your account before logging in.', 'text', 'Signup success: Verify note'),
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.signup.open_gmail',   'Open Gmail',      'text', 'Signup success: Open Gmail btn'),
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.signup.open_email',   'Open Email Provider', 'text', 'Signup success: Open email btn'),
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.signup.go_login',     'Go to Login',     'text', 'Signup success: Go to login btn'),
  ((SELECT id FROM sections WHERE label = 'UI Strings' LIMIT 1),
   'ui.signup.resend',       'Resend Verification Email', 'text', 'Signup success: Resend btn')

ON CONFLICT (section_id, key) DO NOTHING;
