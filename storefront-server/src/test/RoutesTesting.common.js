
import postgres from 'postgres'
import console from 'console'
import { PostgreSqlContainer } from "@testcontainers/postgresql"
import express from 'express'

const jestConsole = global.console
let container
let containerPort

export let app
export let sql

export async function preSuiteSetup(routerImportPath, endpointPath) {
    global.console = console;

    let user = "peegee";
    let password = "somepassword";
    let database = "storefront";
    let host = "localhost";

    process.env.PGUSER = user;
    process.env.PGPASSWORD = password;
    process.env.PGDATABASE = database;
    process.env.PGHOST = host;

    container = await new PostgreSqlContainer("postgres:16.2")
        .withExposedPorts(5432)
        .withUsername(user)
        .withPassword(password)
        .withLogConsumer(stream => {
            stream.on("data", line => global.console.log(`container: ${line.trim()}`))
            stream.on("err", line => global.console.error(line.trim()))
            stream.on("end", () => global.console.log("The container's log stream has closed."))
        })
        .withCopyFilesToContainer([
            {
                target: "/docker-entrypoint-initdb.d/create_schema.sql",
                source: "./documentation/create_schema.sql"
            }
        ])
        .start();

    containerPort = container.getMappedPort(5432);
    process.env.PGPORT = containerPort;

    console.debug(
        `Attempting to connect to '${host}:${containerPort}' with params:\n`,
        `    username: ${user}\n`,
        `    password: ${password}\n`,
        `    database: ${database}\n`,
        `    port: ${containerPort}`
    );

    sql = postgres({
        username: user,
        password: password,
        database: database,
        host: host,
        port: containerPort
    });

    let retries = 0;
    const maxRetries = 50;
    const retryInterval = 2000;

    while (retries < maxRetries) {
        try {
            await sql`SELECT NOW()`;
            global.console.log(
                `PostgreSQL container successfully started with name [${container.startedTestContainer.name}] and port [${containerPort}]`
            );
            break;
        } catch (err) {
            console.log(`Oops. That didn't work! Error: ${err}`);
            retries++;
            await new Promise(resolve => setTimeout(resolve, retryInterval));
        }
    }

    let routerImport = await import(routerImportPath)
    const router = routerImport.router

    app = express()
    app.use(endpointPath, router)
}

export async function postSuiteSetup() {
    if (sql) {
        await sql.end();
    }

    if (container) {
        await container.stop();
    }

    global.console = jestConsole;

}

export async function preTestSetup() {
    await sql`DELETE FROM orders;`
    await sql`DELETE FROM basketproducts;`
    await sql`DELETE FROM baskets;`
    await sql`DELETE FROM addresses;`
    await sql`DELETE FROM paymentinfo;`
    await sql`DELETE FROM products;`
    await sql`DELETE FROM users;`
    await sql`ALTER SEQUENCE users_user_id_seq RESTART;`
    await sql`ALTER SEQUENCE orders_order_id_seq RESTART;`
    await sql`ALTER SEQUENCE baskets_basket_id_seq RESTART;`
    await sql`ALTER SEQUENCE addresses_address_id_seq RESTART;`
    await sql`ALTER SEQUENCE paymentinfo_payment_id_seq RESTART;`
    await sql`ALTER SEQUENCE products_product_id_seq RESTART;`
}

export function assertFieldsMatch(expected, actual) {
    const objOneKeys = Object.keys(expected)
    const objTwoKeys = Object.keys(actual)

    expect(objTwoKeys.length).toEqual(objOneKeys.length)
    for (const key of objOneKeys) {
        global.console.debug('RoutesTesting.common :: assertFieldsMatch:', `Comparing objOne.${key}: [${expected[key]}], objTwo.${key}: [${actual[key]}]`)
        expect(actual[key]).toBeDefined()
        expect(actual[key]).toEqual(expected[key])
    }
}

export async function insertUserRecords() {
    return await sql`
        INSERT INTO users (first_name, last_name, email, phone)
        VALUES ('John', 'Doe', 'johndoe@email.com', '987654321'),
               ('Jane', 'Doe', 'janedoe@email.com', '123456789'),
               ('Jonah', 'Smith', 'jonahsmith@email.com', '192837465')
        RETURNING user_id "userId",
                  first_name "firstName",
                  last_name "lastName",
                  email, phone;
    `
}

export async function insertAddressRecords() {
    return await sql`
        INSERT INTO Addresses 
            (user_id, line_1, line_2, city_or_town, state_or_province, postal_code, country, is_default)
        VALUES 
            (1, '1 Somewhere Place', null, 'Somewhereville', 'Someshire', 'SM1 2AB', 'United Kingdom', true),
            (1, '40 Business Park', 'Floor 2', 'Anothertown', 'Someshire', 'SM1 5JD', 'United Kingdom', false),
            (2, '2b Another Road', null, 'Towntown', 'Countchester', 'CD1 2EF', 'United Kingdom', true)
        RETURNING address_id "addressId",
                  user_id "userId",
                  line_1 "line1",
                  line_2 "line2",
                  city_or_town "cityOrTown",
                  state_or_province "stateOrProvince",
                  postal_code "postalCode",
                  is_default "isDefault",
                  country;
    `
}

export async function insertPaymentInfoRecords() {
    return await sql`
        INSERT INTO paymentinfo
            (user_id, method, card_number, expiry_date, cvv, account_number, is_default)
        VALUES 
            (1, 'visa', '123456789', ('11', '30')::EXPIRY_DATE, '123', '123456789', true),
            (1, 'mastercard', '987654321', ('12', '34')::EXPIRY_DATE, '456', '123456789', false),
            (2, 'visa', '192837456', ('05', '20')::EXPIRY_DATE, '789', '123456789', true)
        RETURNING payment_id "paymentId",
                  user_id "userId",
                  card_number "cardNumber",
                  expiry_date "expiryDate",
                  account_number "accountNumber",
                  is_default "isDefault",
                  method, cvv;
    `
}

export async function insertProductRecords() {
    return await sql`
        INSERT INTO products (name, brand, description, price, quantity)
        VALUES 
            ('Washing Detergent', 'Washing Co.', 'Washing Detergent to fulfil your washing needs!', 12.00, 600),
            ('Milk Chocolate Bar', 'Choco', 'A smooth and delicious chocolate bar to satisfy your taste buds', 5.00, 1000),
            ('Semi-skimmed Milk', 'Farmers Alliance', '4-pint; The freshest of Semi-skimmed milk from your local farmers', 1.00, 2400)
        RETURNING product_id "productId", name, brand, description, price, quantity;
    `
}

export async function insertBasketRecords() {
    return await sql`
        INSERT INTO baskets (user_id, date_created, status)
        VALUES (1, NOW(), 'open'),
               (1, '12-09-2022', 'complete'),
               (2, '03-01-2024', 'complete'),
               (2, NOW(), 'open')
        RETURNING basket_id "basketId", user_id "userId", date_created "dateCreated", status;
    `
}

export async function insertBasketProductRecords() {
    return await sql`
        INSERT INTO basketproducts (basket_id, product_id, quantity)
        VALUES (1, 1, 2),
               (1, 2, 1),
               (1, 3, 2),
               (4, 3, 2),
               (4, 1, 4)
        RETURNING basket_id "basketId", product_id "productId", quantity;
    `
}

export async function insertOrderRecords() {
    return await sql`
        INSERT INTO orders (basket_id, address_id, payment_info_id)
        VALUES (2, 1, 2),
               (3, 3, 3)
        RETURNING basket_id "basketId", address_id "addressId", payment_info_id "paymentInfoId";
    `
}
