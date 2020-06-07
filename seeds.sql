CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    "role" TEXT NOT NULL UNIQUE
);

INSERT INTO roles("role")
VALUES('Administrator'), ('Finance Manager'), ('Employee');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    "password" text NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    "role" INTEGER NOT NULL REFERENCES "roles"(id)
);

INSERT INTO users(username, "password", first_name, last_name, email, "role") 
VALUES ('adminuser', 'pworda', 'Christina', 'Crutchley', 'admin@email.com', 1);
INSERT INTO users(username, "password", first_name, last_name, email, "role") 
VALUES ('fmanuser', 'pwordf', 'Steven', 'Gutierrez', 'fman@email.com', 2);
INSERT INTO users(username, "password", first_name, last_name, email, "role") 
VALUES ('empuser', 'pworde', 'Sam', 'Malate', 'emp@email.com', 3);
INSERT INTO users(username, "password", first_name, last_name, email, "role") 
VALUES ('coolname', 'secret', 'Ash', 'Ketchum', 'cool@email.com', 3);
INSERT INTO users(username, "password", first_name, last_name, email, "role") 
VALUES ('ambiguous', 'nottelling', 'Jill', 'Valentine', 'amb@email.com', 3);

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
    amount DECIMAL(10, 2) NOT NULL,
    date_submitted TEXT NOT NULL,
    date_resolved TEXT,
    "description" TEXT NOT NULL,
    resolver INTEGER REFERENCES users(id),
    "status" INTEGER REFERENCES reimbursement_status(id),
    "type" INTEGER REFERENCES reimbursement_type(id)
);

INSERT INTO reimbursements(author, amount, date_submitted, "description", "status", "type")
VALUES (2, 30.45, '2020-05-01 00:00:00', 'Lunch meeting 4.23', 1, 3);
INSERT INTO reimbursements(author, amount, date_submitted, date_resolved, "description", resolver, "status", "type")
VALUES (4, 50.00, '2020-05-01 00:00:00', '2020-05-15 00:00:00', 'Friday night drinks', 2, 3, 4);

INSERT INTO reimbursements(author, amount, date_submitted, date_resolved, "description", resolver, "status", "type")
VALUES (1, 100.45, '2020-04-18 00:00:00', '2020-05-12 00:00:00', 'Printer Paper and Ink', 2, 2, 4);

INSERT INTO reimbursements(author, amount, date_submitted, "description", "status", "type")
VALUES (3, 79.99, '2020-05-01 00:00:00', 'Hotel stay 4/28', 1, 1);

INSERT INTO reimbursements(author, amount, date_submitted, date_resolved, "description", resolver, "status", "type")
VALUES (1, 50.00, '2020-05-02 00:00:00', '2020-05-17 00:00:00', 'Parking ticket from meeting March 12th', 2, 3, 4);

INSERT INTO reimbursements(author, amount, date_submitted, date_resolved, "description", resolver, "status", "type")
VALUES (3, 100.87, '2020-04-10 00:00:00', '2020-04-21 00:00:00', 'Car rental 4.5-4.6', 2, 2, 2);