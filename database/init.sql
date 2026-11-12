-- Select your already-created database before running this script.
-- Run once on an empty database. This intentionally fails if tasks already exists.
CREATE TABLE tasks (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO tasks (title, completed) VALUES
    ('Install the required tools', FALSE),
    ('Configure the database connection', FALSE),
    ('Test the Task Management API', FALSE);
