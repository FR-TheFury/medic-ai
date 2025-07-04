
-- Script d'initialisation de la base de données
-- Ce script sera exécuté automatiquement lors du premier démarrage de MySQL

-- Création de la base de données si elle n'existe pas
CREATE DATABASE IF NOT EXISTS dwh CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE dwh;

-- Création d'un utilisateur pour Grafana si nécessaire
-- CREATE USER IF NOT EXISTS 'grafana'@'%' IDENTIFIED BY 'grafana_password';
-- GRANT SELECT ON dwh.* TO 'grafana'@'%';

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_releve_date ON Releve(dateReleve);
CREATE INDEX IF NOT EXISTS idx_releve_region ON Releve(idRegion);
CREATE INDEX IF NOT EXISTS idx_releve_maladie ON Releve(idMaladie);
CREATE INDEX IF NOT EXISTS idx_region_pays ON Regions(idPays);
CREATE INDEX IF NOT EXISTS idx_pays_continent ON Pays(idContinent);

-- Table pour les logs ETL
CREATE TABLE IF NOT EXISTS etl_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    process_name VARCHAR(100) NOT NULL,
    status ENUM('started', 'completed', 'failed') NOT NULL,
    message TEXT,
    records_processed INT DEFAULT 0,
    execution_time DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pour les métriques de performance
CREATE TABLE IF NOT EXISTS performance_metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(50) NOT NULL,
    endpoint VARCHAR(100) NOT NULL,
    response_time DECIMAL(10,3) NOT NULL,
    status_code INT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_service_time (service_name, timestamp)
);

-- Vue pour les statistiques quotidiennes
CREATE OR REPLACE VIEW daily_stats AS
SELECT 
    DATE(dateReleve) as date,
    SUM(nbNouveauCas) as total_nouveaux_cas,
    SUM(nbDeces) as total_deces,
    SUM(nbHospitalisation) as total_hospitalisations,
    COUNT(*) as nombre_releves
FROM Releve 
GROUP BY DATE(dateReleve)
ORDER BY date DESC;

-- Vue pour les statistiques par pays
CREATE OR REPLACE VIEW country_stats AS
SELECT 
    p.nomPays,
    p.populationTotale,
    COUNT(DISTINCT r.idRegion) as nombre_regions,
    COUNT(rel.idReleve) as nombre_releves,
    SUM(rel.nbNouveauCas) as total_cas,
    SUM(rel.nbDeces) as total_deces
FROM Pays p
LEFT JOIN Regions r ON p.idPays = r.idPays
LEFT JOIN Releve rel ON r.idRegion = rel.idRegion
GROUP BY p.idPays, p.nomPays, p.populationTotale
ORDER BY total_cas DESC;

-- Insertion de données de test si les tables sont vides
INSERT IGNORE INTO Continent (nomContinent) VALUES 
('Europe'), ('Amérique du Nord'), ('Amérique du Sud'), ('Asie'), ('Afrique'), ('Océanie');

INSERT IGNORE INTO Maladie (nomMaladie) VALUES 
('COVID-19'), ('Grippe'), ('Tuberculose');

-- Procédure pour nettoyer les anciens logs
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS CleanOldLogs()
BEGIN
    DELETE FROM etl_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
    DELETE FROM performance_metrics WHERE timestamp < DATE_SUB(NOW(), INTERVAL 7 DAY);
END //
DELIMITER ;

-- Événement pour nettoyer automatiquement les logs (exécuté quotidiennement)
-- CREATE EVENT IF NOT EXISTS clean_logs_event
-- ON SCHEDULE EVERY 1 DAY
-- DO CALL CleanOldLogs();

FLUSH PRIVILEGES;
