CREATE TABLE users (
    email VARCHAR(255) NOT NULL,
    username VARCHAR(50) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (email)
);

CREATE TABLE subjects (
	user_email VARCHAR(255) NOT NULL,
	subject_name VARCHAR(50) NOT NULL,
	weekdays INTEGER[] NOT NULL,
	class_time TIME,
	is_required BOOLEAN NOT NULL,
	PRIMARY KEY (user_email, subject_name)
)