-- Crear usuario Dueño (rol dueno).
-- Ejecutar en phpMyAdmin con la base u495120473_metricas seleccionada.
-- Email: alumnioyvidrioinstala@gmail.com
-- Contraseña: 2026ALuminio#

USE `u495120473_metricas`;

SET NAMES utf8mb4;
SET time_zone = '-06:00';

INSERT INTO users (email, password_hash, role, created_at)
VALUES (
  'alumnioyvidrioinstala@gmail.com',
  '$2b$10$Rixd5c/x4iBte2ouhZSKW.idizKfBxq.Ge520X3Fqx3M1dJM9/cEK',
  'dueno',
  NOW()
)
ON DUPLICATE KEY UPDATE
  password_hash = VALUES(password_hash),
  role = 'dueno';
