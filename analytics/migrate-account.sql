-- Migración: roles Dueño + tablas de cuenta/CRM.
-- Ejecutar en phpMyAdmin con la base u495120473_metricas seleccionada.

USE `u495120473_metricas`;

SET NAMES utf8mb4;
SET time_zone = '-06:00';

ALTER TABLE users
  MODIFY role ENUM('admin', 'dueno') NOT NULL DEFAULT 'admin';

CREATE TABLE IF NOT EXISTS account_campana (
  site_id INT UNSIGNED NOT NULL,
  name VARCHAR(160) NOT NULL,
  canal VARCHAR(80) NOT NULL,
  zona VARCHAR(160) NOT NULL,
  inicio VARCHAR(40) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'Activa',
  presupuesto DECIMAL(12,2) NOT NULL DEFAULT 0,
  iva DECIMAL(12,2) NOT NULL DEFAULT 0,
  gastado DECIMAL(12,2) NOT NULL DEFAULT 0,
  visitas INT UNSIGNED NOT NULL DEFAULT 0,
  clics INT UNSIGNED NOT NULL DEFAULT 0,
  llamadas INT UNSIGNED NOT NULL DEFAULT 0,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (site_id),
  CONSTRAINT fk_account_campana_site FOREIGN KEY (site_id) REFERENCES sites (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS account_pagos_proximo (
  site_id INT UNSIGNED NOT NULL,
  fecha VARCHAR(40) NOT NULL,
  concepto VARCHAR(200) NOT NULL,
  monto DECIMAL(12,2) NOT NULL DEFAULT 0,
  estado VARCHAR(40) NOT NULL DEFAULT 'Programado',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (site_id),
  CONSTRAINT fk_account_pagos_proximo_site FOREIGN KEY (site_id) REFERENCES sites (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS account_pagos_historial (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  site_id INT UNSIGNED NOT NULL,
  fecha VARCHAR(40) NOT NULL,
  concepto VARCHAR(200) NOT NULL,
  monto DECIMAL(12,2) NOT NULL DEFAULT 0,
  estado VARCHAR(40) NOT NULL DEFAULT 'Pagado',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_account_pagos_hist_site (site_id, id),
  CONSTRAINT fk_account_pagos_hist_site FOREIGN KEY (site_id) REFERENCES sites (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS account_licencia (
  site_id INT UNSIGNED NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'Activa',
  plan VARCHAR(80) NOT NULL,
  cuenta VARCHAR(160) NOT NULL,
  inicio VARCHAR(40) NOT NULL,
  fin VARCHAR(40) NOT NULL,
  precio_pro VARCHAR(40) NOT NULL,
  precio_especial VARCHAR(40) NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (site_id),
  CONSTRAINT fk_account_licencia_site FOREIGN KEY (site_id) REFERENCES sites (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS account_referidos_config (
  site_id INT UNSIGNED NOT NULL,
  descuento_dueno TINYINT UNSIGNED NOT NULL DEFAULT 50,
  descuento_referido TINYINT UNSIGNED NOT NULL DEFAULT 10,
  activo_desde DATE NULL,
  empleado VARCHAR(120) NOT NULL DEFAULT '',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (site_id),
  CONSTRAINT fk_account_referidos_config_site FOREIGN KEY (site_id) REFERENCES sites (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS account_referidos (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  site_id INT UNSIGNED NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  telefono VARCHAR(40) NOT NULL DEFAULT '',
  estado VARCHAR(40) NOT NULL DEFAULT 'En proceso',
  cerrado TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_account_referidos_site (site_id, id),
  CONSTRAINT fk_account_referidos_site FOREIGN KEY (site_id) REFERENCES sites (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS crm_contacts (
  id VARCHAR(40) NOT NULL,
  site_id INT UNSIGNED NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  telefono VARCHAR(40) NOT NULL DEFAULT '',
  canal ENUM('whatsapp', 'llamada') NOT NULL DEFAULT 'whatsapp',
  servicio VARCHAR(80) NOT NULL DEFAULT '',
  fecha DATE NOT NULL,
  estatus VARCHAR(40) NOT NULL DEFAULT 'Nuevo',
  nota VARCHAR(500) NOT NULL DEFAULT '',
  rol ENUM('prospecto', 'cliente') NOT NULL DEFAULT 'prospecto',
  historial JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_crm_contacts_site_rol (site_id, rol, fecha),
  CONSTRAINT fk_crm_contacts_site FOREIGN KEY (site_id) REFERENCES sites (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS crm_quotes (
  id VARCHAR(40) NOT NULL,
  site_id INT UNSIGNED NOT NULL,
  contact_id VARCHAR(40) NOT NULL,
  payload JSON NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_crm_quotes_contact (site_id, contact_id),
  CONSTRAINT fk_crm_quotes_site FOREIGN KEY (site_id) REFERENCES sites (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
