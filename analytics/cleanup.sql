-- Borra eventos y visitas de más de 13 meses.
-- Ejecutar en phpMyAdmin con u495120473_metricas seleccionada,
-- o programar analytics/private/cleanup.php en el cron de Hostinger.

USE `u495120473_metricas`;

DELETE FROM events
WHERE created_at < (NOW() - INTERVAL 13 MONTH);

DELETE FROM visits
WHERE started_at < (NOW() - INTERVAL 13 MONTH);

DELETE FROM login_attempts
WHERE created_at < (NOW() - INTERVAL 13 MONTH);
