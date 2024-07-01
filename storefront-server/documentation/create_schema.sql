CREATE DATABASE Storefront;

\c storefront;

CREATE SCHEMA storefront

    CREATE TABLE Users (
        user_id bigserial PRIMARY KEY,
        first_name varchar,
        last_name varchar,
        email varchar,
        phone varchar
    )

    CREATE TABLE Customers (
        customer_id bigserial PRIMARY KEY,
        user_id bigserial REFERENCES Users (user_id)
    )

    CREATE TABLE Addresses (
        address_id bigserial PRIMARY KEY,
        customer_id bigserial REFERENCES Customers (customer_id),
        line_1 varchar,
        line_2 varchar,
        city_or_town varchar,
        state_or_province varchar,
        postal_code varchar,
        country varchar,
        is_default bool
    )

    CREATE TABLE PaymentInfo (
        payment_id bigserial PRIMARY KEY,
        customer_id bigserial REFERENCES Customers (customer_id),
        payment_method varchar,
        card_number varchar,
        expiry_month varchar,
        expiry_year varchar,
        cvv varchar,
        account_number varchar,
        routing_number varchar,
        payment_token varchar,
        is_default bit
    )

    CREATE TABLE Products (
        product_id bigserial PRIMARY KEY,
        name varchar,
        brand varchar,
        description varchar,
        price money,
        quantity bigint
    )

    CREATE TABLE Baskets (
        basket_id bigserial PRIMARY KEY,
        customer_id bigserial REFERENCES Customers (customer_id),
        date_created date,
        status varchar
    )

    CREATE TABLE BasketProducts (
        basket_id bigserial REFERENCES Baskets (basket_id),
        product_id bigserial REFERENCES Products (product_id),
        quantity int,
        PRIMARY KEY (basket_id, product_id)
    )

    CREATE TABLE Orders (
        order_id bigserial PRIMARY KEY,
        customer_id bigserial REFERENCES Customers (customer_id),
        basket_id bigserial REFERENCES Baskets (basket_id),
        payment_info_id bigserial REFERENCES PaymentInfo (payment_id)
    );