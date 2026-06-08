```sql
ALTER TABLE exposiciones
  ADD COLUMN materia VARCHAR(100) NOT NULL AFTER profesor,
  ADD COLUMN tipo_exposicion VARCHAR(20) NOT NULL DEFAULT 'Práctica' AFTER materia,
  ADD COLUMN orden INT NOT NULL DEFAULT 0 AFTER archivos_programas;

ALTER TABLE exposiciones
  ADD COLUMN db_tipo VARCHAR(50) AFTER presentacion_original_name,
  ADD COLUMN db_file_path VARCHAR(255) AFTER db_tipo,
  ADD COLUMN db_file_original_name VARCHAR(255) AFTER db_file_path;

ALTER TABLE exposiciones
  ADD COLUMN db_files JSON AFTER presentacion_original_name,
  ADD COLUMN recursos_ti TEXT AFTER archivos_programas,
  ADD COLUMN estructura_directorios_path VARCHAR(255) AFTER recursos_ti,
  ADD COLUMN estructura_directorios_original_name VARCHAR(255) AFTER estructura_directorios_path,
  ADD COLUMN env_file_path VARCHAR(255) AFTER estructura_directorios_original_name,
  ADD COLUMN env_file_original_name VARCHAR(255) AFTER env_file_path;

-- Nuevo admin solicitado
INSERT INTO admin (username, password, email)
VALUES ('moisesaaron', '$2b$10$PAtFdQPXTO0dxwCV3y15hOJehs3HlaVQ6HAHQ4N89fdrDAWLsDVYS', NULL);
```