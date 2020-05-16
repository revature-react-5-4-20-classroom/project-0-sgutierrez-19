CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    "role" TEXT NOT NULL UNIQUE
);

INSERT INTO roles("role")
VALUES('Administrator'), ('Finance Manger'), ('Employee');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    "password" text NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    "role" TEXT NOT NULL REFERENCES "roles"("role")
);

INSERT INTO users(username, "password", first_name, last_name, email, "role") 
VALUES ('adminuser', 'pworda', 'John', 'Doe', 'admin@email.com', 'Administrator'); -- 1
INSERT INTO users(username, "password", first_name, last_name, email, "role") 
VALUES ('fmanuser', 'pwordf', 'Maggie', 'Sue', 'fman@email.com', 'Finance Manger'); -- 2
INSERT INTO users(username, "password", first_name, last_name, email, "role") 
VALUES ('empuser', 'pworde', 'Zach', 'Allen', 'emp@email.com', 'Employee'); -- 3

CREATE TABLE reimbursement_status (
    id SERIAL PRIMARY KEY,
    "status" TEXT NOT NULL UNIQUE
);

INSERT INTO reimbursement_status("status")
VALUES ('Pending'), ('Approved'), ('Denied');

CREATE TABLE reimbursement_type (
    id SERIAL PRIMARY KEY,
    "type" TEXT NOT NULL UNIQUE
);

INSERT INTO reimbursement_type("type")
VALUES ('Lodging'), ('Travel'), ('Food'), ('Other');

CREATE TABLE reimbursements (
    id SERIAL PRIMARY KEY,
    author INTEGER NOT NULL REFERENCES users(id),
    amount INTEGER NOT NULL,
    date_submitted TIMESTAMP NOT NULL,
    date_resolved TIMESTAMP,
    "description" TEXT NOT NULL,
    resolver INTEGER REFERENCES users(id),
    "status" INTEGER REFERENCES reimbursement_status(id),
    "type" INTEGER REFERENCES reimbursement_type(id)
);

INSERT INTO reimbursements(author, amount, date_submitted, "description", "status", "type")
VALUES (3, 30.00, '2020-05-01', 'Lunch meeting 4.23', 1, 3);
INSERT INTO reimbursements(author, amount, date_submitted, date_resolved, "description", resolver, "status", "type")
VALUES (3, 50.00, '2020-05-01', '2020-05-15', 'Friday night drinks', 2, 3, 4);
INSERT INTO reimbursements(author, amount, date_submitted, date_resolved, "description", resolver, "status", "type")
VALUES (1, 100.00, '2020-04-18', '2020-05-15', 'Printer Paper and Ink', 2, 2, 4);