CREATE DATABASE Storefront;

\c storefront;

CREATE SCHEMA Storefront

    CREATE TABLE IF NOT EXISTS Users (
        user_id BIGSERIAL PRIMARY KEY,
        is_customer BOOLEAN DEFAULT FALSE,
        first_name VARCHAR NOT NULL,
        last_name VARCHAR NOT NULL,
        email VARCHAR NOT NULL,
        phone VARCHAR
    )

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
    )

    CREATE TABLE IF NOT EXISTS PaymentInfo (
        payment_id BIGSERIAL PRIMARY KEY,
        user_id BIGSERIAL NOT NULL REFERENCES Users (user_id),
        payment_method VARCHAR,
        card_number VARCHAR NOT NULL,
        expiry_month VARCHAR NOT NULL,
        expiry_year VARCHAR NOT NULL,
        cvv VARCHAR NOT NULL,
        account_number VARCHAR NOT NULL,
        routing_number VARCHAR,
        payment_token VARCHAR NOT NULL,
        is_default BOOLEAN DEFAULT FALSE
    )

    CREATE TABLE IF NOT EXISTS Products (
        product_id BIGSERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        brand VARCHAR NOT NULL,
        description VARCHAR,
        price MONEY,
        quantity BIGINT NOT NULL
    )

    CREATE TABLE IF NOT EXISTS Baskets (
        basket_id BIGSERIAL PRIMARY KEY,
        user_id BIGSERIAL NOT NULL REFERENCES Users (user_id),
        date_created DATE,
        status VARCHAR DEFAULT 'open'
    )

    CREATE TABLE IF NOT EXISTS BasketProducts (
        basket_id BIGSERIAL NOT NULL REFERENCES Baskets (basket_id),
        product_id BIGSERIAL NOT NULL REFERENCES Products (product_id),
        quantity INT NOT NULL,
        PRIMARY KEY (basket_id, product_id)
    )

    CREATE TABLE IF NOT EXISTS Orders (
        order_id BIGSERIAL PRIMARY KEY,
        user_id BIGSERIAL NOT NULL REFERENCES Users (user_id),
        basket_id BIGSERIAL NOT NULL REFERENCES Baskets (basket_id),
        payment_info_id BIGSERIAL NOT NULL REFERENCES PaymentInfo (payment_id)
    )
