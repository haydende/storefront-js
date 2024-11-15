import supertest from 'supertest'
import {
    app,
    assertFieldsMatch,
    postSuiteSetup,
    preSuiteSetup,
    preTestSetup,
    insertUserRecords,
    insertAddressRecords,
    sql,
    insertOrderRecords, insertBasketRecords, insertPaymentInfoRecords
} from "../../test/RoutesTesting.common.js"

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

        it('will return a 404 response when no Addresses exist', async () => {

            const response = await supertest(app)
                .get('/addresses/1')
                .send()

            expect(response.statusCode).toBe(404)
            expect(response.body.error).toBe("Address '1' not found")
        })

        it('will return a 404 response when no matching Addresses exist', async () => {
            await insertUserRecords()
            await insertAddressRecords()

            const response = await supertest(app)
                .get('/addresses/100')
                .send()

            expect(response.statusCode).toBe(404)
            expect(response.body.error).toBe("Address '100' not found")
        })
    })

    describe('GET /addresses/user/id', () => {

        it('will return the list of addresses associated with User of ID \'1\'', async () => {
            await insertUserRecords()
            const userId = 1
            const addressStatementResult = await insertAddressRecords()
            const userOneAddresses = addressStatementResult
                .filter((address) => {
                    return address.userId == userId
                })

            const response = await supertest(app)
                .get(`/addresses/user/${userId}`)
                .send()

            expect(response.statusCode).toBe(200)

            const returnedAddresses = response.body
            expect(returnedAddresses.length).toBe(userOneAddresses.length)

            for (let i = 0; i < returnedAddresses.length; i++) {
                assertFieldsMatch(userOneAddresses[i], returnedAddresses[i])
            }
        })

        it('will return a 404 response when the requested User does not exist', async () => {
            await insertUserRecords()
            await insertAddressRecords()

            const userId = 300

            const response = await supertest(app)
                .get(`/addresses/user/${userId }`)
                .send()

            expect(response.statusCode).toBe(404)
            expect(response.body.error).toBe(`No Address records found for User with ID '${userId}'`)
        })

        it('will return a 404 response when the requested User has no Address records', async () => {
            await insertUserRecords()
            await insertAddressRecords()

            const userId = 3
            const response = await supertest(app)
                .get(`/addresses/user/${userId}`)
                .send()

            expect(response.statusCode).toBe(404)
            expect(response.body.error).toBe(`No Address records found for User with ID '${userId}'`)
        })
    })

    describe('POST /addresses/new', () => {

        it('will save the new Address object, which will be returned with a new ID value', async () => {
            await insertUserRecords()

            const toBeSaved = {
                userId: 1,
                line1: '2 Road Lane',
                line2: 'Apartment 45',
                cityOrTown: 'San Francisco',
                stateOrProvince: 'California',
                postalCode: '94102',
                country: "United States",
                isDefault: true
            }

            const response = await supertest(app)
                .post('/addresses/new')
                .send(toBeSaved)

            expect(response.statusCode).toBe(200)

            const body = response.body
            assertFieldsMatch({ ...toBeSaved, addressId: body.addressId, userId: body.userId }, body)

            const returnedAddresses = await sql`
                SELECT address_id "addressId", 
                       user_id "userId",
                       line_1 "line1",
                       line_2 "line2",
                       city_or_town "cityOrTown",
                       state_or_province "stateOrProvince",
                       postal_code "postalCode",
                       is_default "isDefault",
                       country
                FROM addresses
                WHERE user_id = ${BigInt(toBeSaved.userId)};
            `

            expect(returnedAddresses.length).toBe(1)
            assertFieldsMatch(body, returnedAddresses[0])
        })

        it('will save the new Address object with a new ID value, despite one being provided', async () => {
            await insertUserRecords()

            const toBeSaved = {
                userId: 1,
                line1: '2 Road Lane',
                line2: 'Apartment 45',
                cityOrTown: 'San Francisco',
                stateOrProvince: 'California',
                postalCode: '94102',
                country: "United States",
                isDefault: true
            }

            const response = await supertest(app)
                .post('/addresses/new')
                .send(toBeSaved)

            expect(response.statusCode).toBe(200)

            const body = response.body
            assertFieldsMatch({ ...toBeSaved, addressId: body.addressId, userId: body.userId }, body)

            const returnedAddresses = await sql`
                SELECT address_id "addressId",
                       user_id "userId",
                       line_1 "line1",
                       line_2 "line2",
                       city_or_town "cityOrTown",
                       state_or_province "stateOrProvince",
                       postal_code "postalCode",
                       is_default "isDefault",
                       country
                FROM addresses
                WHERE user_id = ${BigInt(toBeSaved.userId)};
            `

            expect(returnedAddresses.length).toBe(1)
            assertFieldsMatch(body, returnedAddresses[0])
        })

        // FixMe: Express is returning 'Error: cannot POST /addresses/new' despite a respond body already being specified
        it.skip('will return a 400 when userId is present, but line1, postalCode and country are not', async () => {
            await insertUserRecords()

            const toBeSaved = {
                userId: 1,
                line2: 'Apartment 45',
                cityOrTown: 'San Francisco',
                stateOrProvince: 'California',
                isDefault: true
            }

            const response = await supertest(app)
                .post('/addresses/new')
                .send(toBeSaved)

            expect(response.statusCode).toBe(400)
            expect(response.error).toBe('"userId", "line1", "postalCode" and "country" fields are required!')
        })

        it('will return a 400 when the userId doesn\'t match an existing User', async () => {

            const toBeSaved = {
                userId: 1,
                line1: '2 Road Lane',
                line2: 'Apartment 45',
                cityOrTown: 'San Francisco',
                stateOrProvince: 'California',
                postalCode: '94102',
                country: "United States",
                isDefault: true
            }

            const response = await supertest(app)
                .post('/addresses/new')
                .send(toBeSaved)

            expect(response.statusCode).toBe(400)
            expect(response.body.error).toBe('User with id \'1\' does not exist. Please provide a valid UserID.')
        })
    })

    describe('PUT /addresses/id', () => {

        it('will update an existing Address with a payload for all modifiable fields', async () => {
            await insertUserRecords()
            const addressRecords = await insertAddressRecords()
            const addressOne = addressRecords[0]

            const updatedAddress = {
                line1: '21 Road Street',
                line2: 'Flat 20',
                cityOrTown: 'York',
                stateOrProvince: 'North Yorkshire',
                postalCode: 'AB1 2DC',
                country: 'United Kingdom',
                isDefault: true
            }

            const response = await supertest(app)
                .put(`/addresses/${addressOne.addressId}`)
                .send(updatedAddress)

            expect(response.statusCode).toBe(200)
            const body = response.body

            assertFieldsMatch({ ...updatedAddress, addressId: addressOne.addressId, userId: addressOne.userId }, body)

            const queryResponse = await sql`
                SELECT address_id "addressId",
                       user_id "userId",
                       line_1 "line1",
                       line_2 "line2",
                       city_or_town "cityOrTown",
                       state_or_province "stateOrProvince",
                       postal_code "postalCode",
                       is_default "isDefault",
                       country
                FROM addresses
                WHERE address_id = ${BigInt(addressOne.addressId)}        
            `
            const addressOneUpdated = queryResponse[0]

            assertFieldsMatch(body, addressOneUpdated)
        })

        it('will update an existing Address with a payload for one modifiable field', async () => {
            await insertUserRecords()
            const addressRecords = await insertAddressRecords()
            const addressOne = addressRecords[0]

            const updatedAddress = {
                isDefault: false
            }

            const response = await supertest(app)
                .put(`/addresses/${addressOne.addressId}`)
                .send(updatedAddress)

            expect(response.statusCode).toBe(200)
            const body = response.body

            expect(body.addressId).toBe(addressOne.addressId)
            expect(body.isDefault).toBe(updatedAddress.isDefault)

            const queryResponse = await sql`
                SELECT address_id "addressId",
                       user_id "userId",
                       line_1 "line1",
                       line_2 "line2",
                       city_or_town "cityOrTown",
                       state_or_province "stateOrProvince",
                       postal_code "postalCode",
                       is_default "isDefault",
                       country
                FROM addresses
                WHERE address_id = ${BigInt(addressOne.addressId)}
            `

            const addressOneUpdated = queryResponse[0]
            assertFieldsMatch(body, addressOneUpdated)
        })

        it('will return an error if the Address to be updated does not exist', async () => {
            await insertUserRecords()

            const updatedAddress = {
                line1: '21 Road Street',
            }

            const response = await supertest(app)
                .put('/addresses/1')
                .send(updatedAddress)

            expect(response.statusCode).toBe(400)
            expect(response.body.error).toBe("Address with ID '1' does not exist.")

            const queryResponse = await sql`
                SELECT *
                FROM addresses
            `

            expect(queryResponse.length).toBe(0)
        })
    })

    describe('DELETE /addresses/id', () => {

        // TODO: Insert records that reference the one to be deleted
        it('will delete the Address record when there are no references to this record in the database', async () => {
            await insertUserRecords()
            const insertedAddressRecords = await insertAddressRecords()

            const addressOne = insertedAddressRecords[0]

            const response = await supertest(app)
                .delete(`/addresses/${addressOne.addressId}`)
                .send()

            expect(response.statusCode).toBe(200)

            const queryResponse = await sql`
                SELECT * 
                FROM addresses
                WHERE address_id = ${addressOne.addressId}
            `
            expect(queryResponse.length).toBe(0)
        })

        it('will return an error when there are other records that reference the specified Address', async () => {
            await insertUserRecords()
            const insertedAddressRecords = await insertAddressRecords()
            await insertBasketRecords()
            await insertPaymentInfoRecords()
            await insertOrderRecords()

            const addressOne = insertedAddressRecords[0]

            const response = await supertest(app)
                .delete(`/addresses/${addressOne.addressId}`)
                .send()

            expect(response.statusCode).toBe(400)
            expect(response.body.detail)
                .toBe(`Key (address_id)=(${addressOne.addressId}) is still referenced from table "orders".`)

            const queryResponse = await sql`
                SELECT address_id
                FROM addresses
                WHERE address_id = ${BigInt(addressOne.addressId)};
            `
            expect(queryResponse.length).toBe(1)
        })

        it('won\'t error if the address to be deleted does not exist', async () => {
            await insertUserRecords()

            const response = await supertest(app)
                .delete("/addresses/1")
                .send()

            expect(response.statusCode).toBe(200)

        })
    })
})
