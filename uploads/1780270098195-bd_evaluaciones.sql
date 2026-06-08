

-- Crear tabla de estudiantes
CREATE TABLE IF NOT EXISTS estudiantes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    folio VARCHAR(20) NOT NULL UNIQUE,
    grupo VARCHAR(20) NOT NULL DEFAULT '1201-LI',
    avatar VARCHAR(255) DEFAULT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo TINYINT(1) DEFAULT 1,
    INDEX idx_folio (folio),
    INDEX idx_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla de auditoría (opcional, para registrar intentos fallidos)
CREATE TABLE IF NOT EXISTS auditoria_login (
    id INT PRIMARY KEY AUTO_INCREMENT,
    folio VARCHAR(20) NOT NULL,
    intento_exito TINYINT(1),
    fecha_intento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_origen VARCHAR(45),
    user_agent TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla para profesores
CREATE TABLE IF NOT EXISTS profesores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    empleado_id VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255) DEFAULT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo TINYINT(1) DEFAULT 1,
    INDEX idx_email (email),
    INDEX idx_empleado (empleado_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla para calificaciones parciales y finales
CREATE TABLE IF NOT EXISTS calificaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    estudiante_id INT NOT NULL,
    profesor_id INT DEFAULT NULL,
    materia VARCHAR(150) NOT NULL DEFAULT 'Ambientes Ubicuos',
    parcial TINYINT NOT NULL COMMENT '1,2,3 para parciales, 0 para ponderación final',
    valor DECIMAL(5,2) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE,
    FOREIGN KEY (profesor_id) REFERENCES profesores(id) ON DELETE SET NULL,
    INDEX idx_estudiante (estudiante_id),
    INDEX idx_parcial (parcial)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla para registrar actividades por parcial (descripción + número de firmas)
CREATE TABLE IF NOT EXISTS actividades_parciales (
    id INT PRIMARY KEY AUTO_INCREMENT,
    estudiante_id INT NOT NULL,
    profesor_id INT DEFAULT NULL,
    parcial TINYINT NOT NULL COMMENT '1,2,3',
    descripcion TEXT,
    firmas INT NOT NULL DEFAULT 0,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE,
    FOREIGN KEY (profesor_id) REFERENCES profesores(id) ON DELETE SET NULL,
    INDEX idx_estudiante_act (estudiante_id),
    INDEX idx_parcial_act (parcial)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;