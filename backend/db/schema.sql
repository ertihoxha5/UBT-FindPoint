CREATE DATABASE IF NOT EXISTS findpoint_db;


USE findpoint_db;

CREATE TABLE users (
  userId INT AUTO_INCREMENT PRIMARY KEY,
  fullName VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  passwordHash VARCHAR(255),
  role ENUM('user', 'admin') DEFAULT 'user',
  faculty VARCHAR(100),
  phoneNumber VARCHAR(20),
  profilePictureUrl VARCHAR(255),
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  lastLogin TIMESTAMP NULL
);