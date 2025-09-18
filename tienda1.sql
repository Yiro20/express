CREATE DATABASE tienda1;
USE tienda1;
-- Tabla de categorías
CREATE TABLE categorias (
id INT AUTO_INCREMENT PRIMARY KEY,
nombre VARCHAR(100) NOT NULL
);
-- Tabla de productos
CREATE TABLE productos (
id INT AUTO_INCREMENT PRIMARY KEY,
nombre VARCHAR(150) NOT NULL,
precio DECIMAL(10,2) NOT NULL,
descripcion VARCHAR(200),
categoria_id INT,
FOREIGN KEY (categoria_id) REFERENCES
categorias(id) ON DELETE SET NULL
);
-- Tabla de imágenes de productos

CREATE TABLE imagenes_productos (
id INT AUTO_INCREMENT PRIMARY KEY,
url VARCHAR(255) NOT NULL,
producto_id INT,
FOREIGN KEY (producto_id) REFERENCES
productos(id) ON DELETE CASCADE
);