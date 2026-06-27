CREATE DATABASE hellomayor;
USE hellomayor;

-- ========================
-- TABLES
-- ========================
CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO admins (username, password) VALUES ('admin', '$2b$10$gTDoxJM4XZXpLYtknuWGX.EuKZIMusB8l5lECr1NMHRYZ1W2Yweuu');

CREATE TABLE ward_statistics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(100),
  label_en VARCHAR(255),
  label_np VARCHAR(255),
  value DECIMAL(15,2),
  unit VARCHAR(100),
  year INT,
  month INT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE notices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title_en VARCHAR(255) NOT NULL,
  title_np VARCHAR(255),
  content_en TEXT NOT NULL,
  content_np TEXT,
  category VARCHAR(100),
  is_important BOOLEAN DEFAULT false,
  publish_date DATE DEFAULT (CURDATE()),
  expiry_date DATE,
  attachment_url TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE blogs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title_en VARCHAR(255) NOT NULL,
  title_np VARCHAR(255),
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt_en TEXT,
  excerpt_np TEXT,
  content_en LONGTEXT NOT NULL,
  content_np LONGTEXT,
  cover_image_url TEXT,
  author_name VARCHAR(255),
  category VARCHAR(100),
  tags JSON,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  view_count INT DEFAULT 0,
  created_by INT,
  published_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE development_works (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title_en VARCHAR(255) NOT NULL,
  title_np VARCHAR(255),
  description_en TEXT,
  description_np TEXT,
  category VARCHAR(100),
  budget DECIMAL(15,2) DEFAULT 0,
  spent DECIMAL(15,2) DEFAULT 0,
  progress INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'planned',
  start_date DATE,
  expected_completion DATE,
  actual_completion DATE,
  contractor_name VARCHAR(255),
  location TEXT,
  image_urls JSON,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE gallery_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title_en VARCHAR(255) NOT NULL,
  title_np VARCHAR(255),
  description_en TEXT,
  description_np TEXT,
  media_type VARCHAR(50) DEFAULT 'image',
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category VARCHAR(100) DEFAULT 'general',
  event_date DATE,
  is_featured BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title_en VARCHAR(255) NOT NULL,
  title_np VARCHAR(255),
  description_en TEXT,
  description_np TEXT,
  report_type VARCHAR(100),
  fiscal_year VARCHAR(20),
  file_url TEXT,
  file_size INT,
  download_count INT DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_by INT,
  published_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tracking_id VARCHAR(100),
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  subject VARCHAR(255),
  description TEXT,
  category VARCHAR(100),
  address TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(50) DEFAULT 'normal',
  assigned_to INT,
  admin_notes TEXT,
  resolved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  subject VARCHAR(255),
  message TEXT,
  status VARCHAR(50) DEFAULT 'unread',
  response_message TEXT,
  responded_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- Performance indexes for hellomayor database
-- Run this once in your MySQL client
-- =============================================

-- complaints: filtered by status, sorted by created_at
ALTER TABLE complaints
  ADD INDEX idx_complaints_status (status),
  ADD INDEX idx_complaints_created_at (created_at DESC),
  ADD INDEX idx_complaints_tracking_id (tracking_id);

-- contact_messages: filtered by status, sorted by created_at
ALTER TABLE contact_messages
  ADD INDEX idx_contact_status (status),
  ADD INDEX idx_contact_created_at (created_at DESC);

-- blogs: filtered by is_published, sorted by published_at
ALTER TABLE blogs
  ADD INDEX idx_blogs_published (is_published, published_at DESC),
  ADD INDEX idx_blogs_featured (is_featured, is_published),
  ADD INDEX idx_blogs_slug (slug);

-- notices: filtered by expiry_date and is_important
ALTER TABLE notices
  ADD INDEX idx_notices_expiry (expiry_date),
  ADD INDEX idx_notices_important (is_important, publish_date DESC),
  ADD INDEX idx_notices_publish_date (publish_date DESC);

-- gallery_items: filtered by category, sorted by is_featured
ALTER TABLE gallery_items
  ADD INDEX idx_gallery_category (category),
  ADD INDEX idx_gallery_featured (is_featured, sort_order, created_at DESC);

-- reports: filtered by is_published, report_type, fiscal_year
ALTER TABLE reports
  ADD INDEX idx_reports_published (is_published, published_at DESC),
  ADD INDEX idx_reports_type (report_type),
  ADD INDEX idx_reports_fiscal_year (fiscal_year);

-- development_works: filtered by status and category
ALTER TABLE development_works
  ADD INDEX idx_dev_status (status),
  ADD INDEX idx_dev_category (category),
  ADD INDEX idx_dev_created_at (created_at DESC);

-- ward_statistics: filtered by is_active, sorted by sort_order
ALTER TABLE ward_statistics
  ADD INDEX idx_stats_active (is_active, sort_order);

-- ========================
-- SEED DATA
-- ========================

INSERT INTO ward_statistics (category, label_en, label_np, value, unit, year, month, sort_order, is_active) VALUES
('population', 'Total Population', 'कुल जनसंख्या', 45672.00, 'people', 2024, NULL, 1, true),
('population', 'Male Population', 'पुरुष जनसंख्या', 22134.00, 'people', 2024, NULL, 2, true),
('population', 'Female Population', 'महिला जनसंख्या', 23538.00, 'people', 2024, NULL, 3, true),
('households', 'Total Households', 'कुल घरधुरी', 9876.00, 'households', 2024, NULL, 4, true),
('education', 'Literacy Rate', 'साक्षरता दर', 78.50, 'percent', 2024, NULL, 5, true),
('budget', 'Annual Budget', 'वार्षिक बजेट', 125000000.00, 'NPR', 2024, NULL, 6, true),
('development', 'Active Projects', 'सक्रिय परियोजनाहरू', 12.00, 'projects', 2024, NULL, 7, true),
('services', 'Services Delivered', 'सेवाहरू प्रदान', 3456.00, 'services', 2024, NULL, 8, true);

INSERT INTO notices (title_en, title_np, content_en, content_np, category, is_important, publish_date, expiry_date, attachment_url, created_by) VALUES
('Ward Office Opening Hours Update', 'वडा कार्यालय खुला समय अपडेट', 'The ward office will now be open from 10 AM to 5 PM on all working days.', 'वडा कार्यालय अब सबै कार्य दिनहरूमा बिहान १० बजेदेखि साँझ ५ बजेसम्म खुला रहनेछ।', 'announcement', true, '2026-03-27', NULL, NULL, NULL),
('New Citizenship Application Process', 'नयाँ नागरिकता आवेदन प्रक्रिया', 'Citizens can now apply for citizenship certificates online through our portal.', 'नागरिकहरूले अब हाम्रो पोर्टल मार्फत अनलाइन नागरिकता प्रमाणपत्रको लागि आवेदन दिन सक्नुहुन्छ।', 'services', false, '2026-03-27', NULL, NULL, NULL),
('Community Health Camp', 'सामुदायिक स्वास्थ्य शिविर', 'Free health checkup camp will be organized on Saturday at the community hall.', 'शनिबार सामुदायिक हलमा निःशुल्क स्वास्थ्य जाँच शिविर आयोजना गरिनेछ।', 'health', true, '2026-03-27', NULL, NULL, NULL);

INSERT INTO blogs (title_en, title_np, slug, excerpt_en, excerpt_np, content_en, content_np, cover_image_url, author_name, category, tags, is_featured, is_published, view_count, created_by, published_at) VALUES
('Ward Development Plan 2081-2085', 'वडा विकास योजना २०८१-२०८५', 'ward-development-plan-2081-2085', 'Comprehensive development plan for the next 5 years focusing on infrastructure and education.', 'पूर्वाधार र शिक्षामा केन्द्रित आगामी ५ वर्षको विस्तृत विकास योजना।', 'Our ward has prepared a comprehensive development plan that focuses on sustainable infrastructure, quality education, healthcare facilities, and environmental conservation.', 'हाम्रो वडाले दिगो पूर्वाधार, गुणस्तरीय शिक्षा, स्वास्थ्य सुविधा र वातावरण संरक्षणमा केन्द्रित विस्तृत विकास योजना तयार गरेको छ।', NULL, 'Ward Secretary', 'development', NULL, true, true, 0, NULL, '2026-03-27 14:11:56'),
('Annual Budget Report Published', 'वार्षिक बजेट प्रतिवेदन प्रकाशित', 'annual-budget-report-published', 'The annual budget allocation and expenditure report for fiscal year 2080-81 is now available.', 'आर्थिक वर्ष २०८०-८१ को वार्षिक बजेट विनियोजन र खर्च प्रतिवेदन अब उपलब्ध छ।', 'We are pleased to announce the publication of our annual budget report. This report provides complete transparency on how public funds were allocated and spent during the fiscal year.', 'हामी वार्षिक बजेट प्रतिवेदन प्रकाशनको घोषणा गर्न खुसी छौं।', NULL, 'Finance Officer', 'finance', NULL, false, true, 0, NULL, '2026-03-27 14:11:56');

INSERT INTO development_works (title_en, title_np, description_en, description_np, category, budget, spent, progress, status, start_date, expected_completion, actual_completion, contractor_name, location, image_urls, created_by) VALUES
('Main Road Blacktopping', 'मुख्य सडक कालोपत्रे', 'Blacktopping of 5km main road connecting ward center to highway', 'वडा केन्द्रदेखि राजमार्गसम्म जोड्ने ५ किमी मुख्य सडक कालोपत्रे', 'road', 15000000.00, 12500000.00, 85, 'ongoing', '2024-01-15', '2024-06-30', NULL, NULL, 'Ward Center to Highway', NULL, NULL),
('Primary School Building', 'प्राथमिक विद्यालय भवन', 'Construction of new 8-room primary school building', 'नयाँ ८ कोठे प्राथमिक विद्यालय भवन निर्माण', 'education', 8000000.00, 8000000.00, 100, 'completed', '2023-06-01', '2024-02-28', NULL, NULL, 'Tole-3', NULL, NULL),
('Community Health Post', 'सामुदायिक स्वास्थ्य चौकी', 'Establishment of fully equipped health post', 'पूर्ण सुसज्जित स्वास्थ्य चौकी स्थापना', 'health', 5000000.00, 1500000.00, 30, 'ongoing', '2024-03-01', '2024-12-31', NULL, NULL, 'Tole-5', NULL, NULL),
('Drinking Water Supply', 'खानेपानी आपूर्ति', 'Installation of drinking water pipeline to 500 households', '५०० घरधुरीमा खानेपानी पाइपलाइन जडान', 'water', 12000000.00, 0.00, 0, 'planned', '2024-06-01', '2025-06-30', NULL, NULL, 'Tole-1 to Tole-7', NULL, NULL);

INSERT INTO reports (title_en, title_np, description_en, description_np, report_type, fiscal_year, file_url, file_size, download_count, is_published, created_by, published_at) VALUES
('Annual Budget Report 2080-81', 'वार्षिक बजेट प्रतिवेदन २०८०-८१', 'Complete budget allocation and expenditure report', 'पूर्ण बजेट विनियोजन र खर्च प्रतिवेदन', 'budget', '2080-81', '/reports/budget-2080-81.pdf', 2400000, 0, true, NULL, '2026-03-27 14:26:10'),
('Development Works Progress Q1', 'विकास कार्य प्रगति Q1', 'Quarterly progress report of development works', 'विकास कार्यको त्रैमासिक प्रगति प्रतिवेदन', 'development', '2081-82', '/reports/progress-q1.pdf', 1800000, 0, true, NULL, '2026-03-27 14:26:10'),
('Ward Census Data 2081', 'वडा जनगणना डाटा २०८१', 'Complete census data of the ward', 'वडाको पूर्ण जनगणना डाटा', 'census', '2081', '/reports/census-2081.pdf', 3200000, 0, true, NULL, '2026-03-27 14:26:10'),
('Audit Report 2080-81', 'लेखापरीक्षण प्रतिवेदन २०८०-८१', 'Annual audit report', 'वार्षिक लेखापरीक्षण प्रतिवेदन', 'audit', '2080-81', '/reports/audit-2080-81.pdf', 1500000, 0, true, NULL, '2026-03-27 14:26:10');