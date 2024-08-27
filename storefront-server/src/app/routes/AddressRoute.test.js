import supertest from 'supertest'
import {
    app, assertFieldsMatch, postSuiteSetup, preSuiteSetup, preTestSetup, insertUserRecords, insertAddressRecords
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
})
