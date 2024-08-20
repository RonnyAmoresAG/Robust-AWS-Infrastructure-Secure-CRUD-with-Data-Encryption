-- to create a new database
CREATE DATABASE nameclouddatabase;

-- to use database
use nameclouddatabase;

-- creating a new table
CREATE TABLE customer (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    address VARCHAR(100) NOT NULL,
    phone VARCHAR(15) DEFAULT NULL,
    iv_name VARCHAR(32) DEFAULT NULL,
    iv_address VARCHAR(32) DEFAULT NULL,
    iv_phone VARCHAR(32) DEFAULT NULL
);


-- to show all tables
show tables;

-- to describe table
describe customer;
