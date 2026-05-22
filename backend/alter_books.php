<?php
$config = require 'config.php';
$db = $config['db'];
$conn = new mysqli($db['host'], $db['username'], $db['password'], $db['database']);
if ($conn->connect_error) die('Connection failed: ' . $conn->connect_error);
$conn->query('ALTER TABLE books ADD COLUMN category VARCHAR(100) NOT NULL DEFAULT "General"');
echo 'Category column added';
?>