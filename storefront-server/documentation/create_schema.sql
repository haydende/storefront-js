CREATE SCHEMA Storefront;

CREATE TABLE Storefront.Users (
    user_id bigserial PRIMARY KEY,
    first_name varchar,
    last_name varchar,
    email varchar,
    phone varchar
);

-- TODO: Requires a Sequence to be created, per table that uses serial type(s)
CREATE TABLE Storefront.Customers (
    customer_id bigserial PRIMARY KEY,
    user_id bigserial REFERENCES Storefront.Users (user_id)
);

CREATE TABLE Storefront.Addresses (
    address_id bigserial PRIMARY KEY,
    customer_id bigserial REFERENCES Storefront.Customers (customer_id),
    line_1 varchar,
    line_2 varchar,
    city_or_town varchar,
    state_or_province varchar,
    postal_code varchar,
    country varchar,
    is_default bool
);

CREATE TABLE Storefront.PaymentInfo (
    payment_id bigserial PRIMARY KEY,
    customer_id bigserial REFERENCES Storefront.Customers (customer_id),
    payment_method varchar,
    card_number varchar,
    expiry_month varchar,
    expiry_year varchar,
    cvv varchar,
    account_number varchar,
    routing_number varchar,
    payment_token varchar,
    is_default bit
);

CREATE TABLE Storefront.Products (
    product_id bigserial PRIMARY KEY,
    name varchar,
    brand varchar,
    description varchar,
    price money,
    quantity bigint
);

CREATE TABLE Storefront.Baskets (
    basket_id bigserial PRIMARY KEY,
    customer_id bigserial REFERENCES Storefront.Customers (customer_id),
    date_created date,
    status varchar
);

CREATE TABLE Storefront.BasketProducts (
    basket_product_id bigserial PRIMARY KEY,
    basket_id bigserial REFERENCES Storefront.Baskets (basket_id),
    product_id bigserial REFERENCES Storefront.Products (product_id),
    quantity int,
    price money
);

CREATE TABLE Storefront.Orders (
    order_id bigserial PRIMARY KEY,
    customer_id bigserial REFERENCES Storefront.Customers (customer_id),
    basket_id bigserial REFERENCES Storefront.Baskets (basket_id),
    payment_info_id bigserial REFERENCES Storefront.PaymentInfo (payment_id)
);