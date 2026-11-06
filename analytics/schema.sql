-- Panel de analítica. Ejecutar en phpMyAdmin con esta base seleccionada.
-- No crea otra base ni toca ninguna distinta de u495120473_metricas.

USE `u495120473_metricas`;

SET NAMES utf8mb4;
SET time_zone = '-06:00';

CREATE TABLE IF NOT EXISTS sites (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(120) NOT NULL,
  dominio VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_sites_dominio (dominio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS visits (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  site_id INT UNSIGNED NOT NULL,
  visitor_id CHAR(36) NOT NULL,
  started_at DATETIME NOT NULL,
  last_at DATETIME NOT NULL,
  landing_page VARCHAR(200) NOT NULL,
  source ENUM('google_ads', 'organico', 'directo', 'referido', 'otro') NOT NULL,
  utm_source VARCHAR(80) NULL,
  utm_medium VARCHAR(80) NULL,
  utm_campaign VARCHAR(80) NULL,
  gclid TINYINT(1) NOT NULL DEFAULT 0,
  device ENUM('movil', 'escritorio', 'tablet') NOT NULL,
  ip_hash CHAR(64) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_visits_site_started (site_id, started_at),
  KEY idx_visits_site_visitor_last (site_id, visitor_id, last_at),
  CONSTRAINT fk_visits_site FOREIGN KEY (site_id) REFERENCES sites (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  site_id INT UNSIGNED NOT NULL,
  visit_id BIGINT UNSIGNED NOT NULL,
  type ENUM('page_view', 'section_view', 'click_whatsapp', 'click_llamada', 'envio_formulario') NOT NULL,
  page VARCHAR(200) NOT NULL,
  section VARCHAR(32) NULL,
  meta JSON NULL,
  created_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_events_site_created (site_id, created_at),
  KEY idx_events_visit_created (visit_id, created_at),
  CONSTRAINT fk_events_site FOREIGN KEY (site_id) REFERENCES sites (id),
  CONSTRAINT fk_events_visit FOREIGN KEY (visit_id) REFERENCES visits (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin') NOT NULL DEFAULT 'admin',
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS login_attempts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ip_hash CHAR(64) NOT NULL,
  email VARCHAR(255) NOT NULL,
  success TINYINT(1) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_attempts_ip_created (ip_hash, created_at),
  KEY idx_attempts_email_created (email, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO sites (nombre, dominio, created_at)
SELECT 'Aluminio y Vidrio Instala', 'aluminioyvidrioinstala.mx', NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM sites WHERE dominio = 'aluminioyvidrioinstala.mx'
);
