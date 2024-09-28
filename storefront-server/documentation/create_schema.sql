CREATE DATABASE Storefront;

\c storefront;

CREATE DOMAIN month_int AS VARCHAR CHECK (
    VALUE ~ '^[0-9]{2}$'
    AND CAST(VALUE as INTEGER) BETWEEN 1 AND 12
);
CREATE DOMAIN year_int AS VARCHAR CHECK (VALUE ~ '^[0-9]{2}$');

CREATE TYPE EXPIRY_DATE AS (
    month MONTH_INT,
    year YEAR_INT
);

CREATE TABLE IF NOT EXISTS Users (
    user_id BIGSERIAL PRIMARY KEY,
    is_customer BOOLEAN DEFAULT FALSE,
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    phone VARCHAR
);

CREATE TABLE IF NOT EXISTS Addresses (
    address_id BIGSERIAL PRIMARY KEY,
    user_id BIGSERIAL NOT NULL REFERENCES Users (user_id),
    line_1 VARCHAR NOT NULL,
    line_2 VARCHAR,
    city_or_town VARCHAR,
    state_or_province VARCHAR,
    postal_code VARCHAR NOT NULL,
    country VARCHAR NOT NULL,
    is_default BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS PaymentInfo (
    payment_id BIGSERIAL PRIMARY KEY,
    user_id BIGSERIAL NOT NULL REFERENCES Users (user_id),
    method VARCHAR,
    card_number VARCHAR NOT NULL,
    expiry_date EXPIRY_DATE NOT NULL,
    cvv VARCHAR NOT NULL,
    account_number VARCHAR NOT NULL,
    is_default BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS Products (
    product_id BIGSERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    brand VARCHAR NOT NULL,
    description VARCHAR,
    price MONEY NOT NULL,
    quantity BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS Baskets (
    basket_id BIGSERIAL PRIMARY KEY,
    user_id BIGSERIAL NOT NULL REFERENCES Users (user_id),
    date_created DATE,
    status VARCHAR DEFAULT 'open'
);

CREATE TABLE IF NOT EXISTS BasketProducts (
    basket_id BIGSERIAL NOT NULL REFERENCES Baskets (basket_id),
    product_id BIGSERIAL NOT NULL REFERENCES Products (product_id),
    quantity INT NOT NULL,
    PRIMARY KEY (basket_id, product_id)
);

CREATE TABLE IF NOT EXISTS Orders (
    order_id BIGSERIAL PRIMARY KEY,
    address_id BIGSERIAL NOT NULL REFERENCES Addresses (address_id),
    basket_id BIGSERIAL NOT NULL REFERENCES Baskets (basket_id),
    payment_info_id BIGSERIAL NOT NULL REFERENCES PaymentInfo (payment_id)
);
