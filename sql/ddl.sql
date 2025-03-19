DROP TABLE users, subjects, events;

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    username VARCHAR(50) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_logged_at TIMESTAMP,
	UNIQUE (email)
);

CREATE TABLE subjects (
    subject_id SERIAL PRIMARY KEY,
	user_id INTEGER NOT NULL,
	subject_name VARCHAR(50) NOT NULL,
	weekdays INTEGER[] NOT NULL,
	class_time TIME,
	is_required BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated_at TIMESTAMP DEFAULT NULL,
	UNIQUE (user_id, subject_name)
);

CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255),
    subject_name VARCHAR(50),
    date DATE,
    status VARCHAR(20),
    UNIQUE(user_email, subject_name, date)
);