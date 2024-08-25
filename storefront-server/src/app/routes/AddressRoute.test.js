import supertest from 'supertest'
import { app, sql, assertFieldsMatch, postSuiteSetup, preSuiteSetup, preTestSetup } from "../../test/RoutesTesting.common.js"

describe('Address Route Integration Tests', () => {

    beforeAll(async () => {
        await preSuiteSetup('../app/routes/AddressRoute.js', '/addresses')
    })

    afterAll(async () => {
        await postSuiteSetup()
    })

    beforeEach(async () => {
        await preTestSetup()
    })

    describe('GET /addresses/id', () => {

        it('will return the Address with the matching ID', async () => {
            await insertUserRecords()
            const addressStatementResponse = await insertAddressRecords()
            const firstAddress = addressStatementResponse[0]

            const response = await supertest(app)
                .get(`/addresses/${firstAddress.addressId}`)
                .send()

            expect(response.statusCode).toBe(200)

            const body = response.body
            assertFieldsMatch(body, firstAddress)
        })

    })

})

async function insertUserRecords() {
    return await sql`
        INSERT INTO storefront.users (first_name, last_name, email, phone)
        VALUES ('John', 'Doe', 'johndoe@email.com', '987654321'),
               ('Jane', 'Doe', 'janedoe@email.com', '123456789')
        RETURNING user_id "userId",
                  first_name "firstName",
                  last_name "lastName",
                  email, phone;
    `
}

async function insertAddressRecords() {
    return await sql`
        INSERT INTO storefront.addresses 
            (user_id, line_1, line_2, city_or_town, state_or_province, postal_code, country, is_default)
        VALUES 
            (1, '1 Somewhere Place', null, 'Somewhereville', 'Someshire', 'SM1 2AB', 'United Kingdom', true),
            (1, '40 Business Park', 'Floor 2', 'Anothertown', 'Someshire', 'SM1 5JD', 'United Kingdom', false),
            (2, '2b Another Road', null, 'Towntown', 'Countester', 'CD1 2EF', 'United Kingdom', true)
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