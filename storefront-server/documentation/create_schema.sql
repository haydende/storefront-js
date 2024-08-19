CREATE DATABASE Storefront;

\c storefront;

CREATE SCHEMA storefront

    CREATE TABLE Users (
        user_id BIGSERIAL PRIMARY KEY,
        is_customer BOOLEAN DEFAULT FALSE,
        first_name VARCHAR,
        last_name VARCHAR,
        email VARCHAR,
        phone VARCHAR
    )

    CREATE TABLE Addresses (
        address_id BIGSERIAL PRIMARY KEY,
        user_id BIGSERIAL REFERENCES Users (user_id),
        line_1 VARCHAR,
        line_2 VARCHAR,
        city_or_town VARCHAR,
        state_or_province VARCHAR,
        postal_code VARCHAR,
        country VARCHAR,
        is_default bool
    )

    CREATE TABLE PaymentInfo (
        payment_id BIGSERIAL PRIMARY KEY,
        user_id BIGSERIAL REFERENCES Users (user_id),
        payment_method VARCHAR,
        card_number VARCHAR,
        expiry_month VARCHAR,
        expiry_year VARCHAR,
        cvv VARCHAR,
        account_number VARCHAR,
        routing_number VARCHAR,
        payment_token VARCHAR,
        is_default BIT
    )

    CREATE TABLE Products (
        product_id BIGSERIAL PRIMARY KEY,
        name VARCHAR,
        brand VARCHAR,
        description VARCHAR,
        price MONEY,
        quantity bigint
    )

    CREATE TABLE Baskets (
        basket_id BIGSERIAL PRIMARY KEY,
        user_id BIGSERIAL REFERENCES Users (user_id),
        date_created date,
        status VARCHAR
    )

    CREATE TABLE BasketProducts (
        basket_id BIGSERIAL REFERENCES Baskets (basket_id),
        product_id BIGSERIAL REFERENCES Products (product_id),
        quantity INT,
        PRIMARY KEY (basket_id, product_id)
    )

    CREATE TABLE Orders (
        order_id BIGSERIAL PRIMARY KEY,
        user_id BIGSERIAL REFERENCES Users (user_id),
        basket_id BIGSERIAL REFERENCES Baskets (basket_id),
        payment_info_id BIGSERIAL REFERENCES PaymentInfo (payment_id)
    );