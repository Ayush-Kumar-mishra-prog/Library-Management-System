CREATE DATABASE IF NOT EXISTS library_management;
USE library_management;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    university_id VARCHAR(60) DEFAULT NULL,
    position VARCHAR(80) DEFAULT NULL,
    faculty VARCHAR(120) DEFAULT NULL,
    department VARCHAR(120) DEFAULT NULL,
    batch VARCHAR(60) DEFAULT NULL,
    contact VARCHAR(20) DEFAULT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    username VARCHAR(80) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'member', 'student') NOT NULL,
    created_by INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_uid VARCHAR(60) NOT NULL UNIQUE,
    book_number VARCHAR(60) NOT NULL,
    book_name VARCHAR(160) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    author VARCHAR(140) NOT NULL,
    publish_date DATE NOT NULL,
    image_url TEXT NOT NULL,
    total_qty INT NOT NULL DEFAULT 1,
    available_qty INT NOT NULL DEFAULT 1,
    category VARCHAR(100) NOT NULL DEFAULT 'General',
    created_by INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS issues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    student_id INT NOT NULL,
    member_id INT NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE DEFAULT NULL,
    status ENUM('issued', 'returned') NOT NULL DEFAULT 'issued',
    penalty INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS book_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    requested_by_member_id INT NOT NULL,
    title VARCHAR(200) DEFAULT NULL,
    author VARCHAR(120) DEFAULT NULL,
    message TEXT NOT NULL,
    status ENUM('pending', 'seen', 'closed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reissue_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    issue_id INT NOT NULL,
    student_id INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    processed_by INT DEFAULT NULL,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS issue_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    student_id INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    processed_by_member_id INT DEFAULT NULL,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS return_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    issue_id INT NOT NULL,
    student_id INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    processed_by_member_id INT DEFAULT NULL,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL DEFAULT NULL
);

INSERT IGNORE INTO users (id, name, email, username, password_hash, role)
VALUES (
    1,
    'Ayush Kumar Mishra',
    'ayushrajmishra960@outlook.com',
    'admin',
    '$2y$10$w5J.JQjYwPj8dSlTQ7YTWu5X3qbM8UEjSLB6Q2XAWY7EQu5uRYw7m',
    'admin'
);


