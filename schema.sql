DROP TABLE IF EXISTS maybellinep;
CREATE TABLE maybellinep (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    image VARCHAR(255),
    price VARCHAR(255),
    description TEXT
);