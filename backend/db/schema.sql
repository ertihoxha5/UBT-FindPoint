-- Active: 1774977057822@@localhost@3306@findpoint_db
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

CREATE TABLE user_profiles (
  profile_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  bio TEXT,
  avatar_url VARCHAR(255),
  faculty VARCHAR(100),
  phone_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(userId) ON DELETE CASCADE
);

CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE locations (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NULL,

    title VARCHAR(255) NOT NULL,
    description TEXT,

    type ENUM('lost', 'found') NOT NULL,
    status ENUM('open', 'claimed', 'resolved', 'expired') NOT NULL,

    category_id INT,
    location_id INT,

    date Date,
    reward VARCHAR(100),

    is_anonymous BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (category_id) REFERENCES categories(category_id),
    FOREIGN KEY (location_id) REFERENCES locations(location_id),
    FOREIGN KEY (user_id) REFERENCES users(userId)
);

CREATE TABLE media (
    media_id INT AUTO_INCREMENT PRIMARY KEY,

    item_id INT NOT NULL,

    url VARCHAR(255) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (item_id)
        REFERENCES items(item_id)
        ON DELETE CASCADE
);

ALTER TABLE items 
CHANGE found_date date Date;

 /*Ketu jane tabelat e konversationit dhe mesazheve */
CREATE TABLE conversations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user1_id INT NOT NULL,
  user2_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversation_id INT NOT NULL,
  sender_id INT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
