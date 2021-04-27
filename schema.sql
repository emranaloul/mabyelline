DROP TABLE IF EXISTS maybellinep;
CREATE TABLE maybellinep (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    image VARCHAR(255),
    price VARCHAR(255),
    description TEXT
);

 INSERT INTO maybellinep (name,image,price,description) VALUES (1,2,3,4);