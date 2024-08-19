import supertest from "supertest";
import { app, sql, assertFieldsMatch, postSuiteSetup, preSuiteSetup, preTestSetup } from "../../test/RoutesTesting.common.js";

describe('User Route Integration Tests', () => {

    beforeAll(async () => {
        await preSuiteSetup('../app/routes/UserRoute.js', '/users')
    })

    afterAll(async () => {
        await postSuiteSetup()
    })

    beforeEach(async () => {
        await preTestSetup()
    })

    describe('GET /users/id', () => {

        it('will return the User with the matching ID', async () => {

            const statementResponse = await sql`
                INSERT INTO storefront.users (first_name, last_name, email, phone) 
                VALUES ('John', 'Doe', 'johndoe@email.com', '987654321'),
                       ('Jane', 'Doe', 'janedoe@email.com', '123456789')
                RETURNING user_id "userId", first_name "firstName", last_name "lastName", email, phone;
            `

            let userOne = statementResponse[0]
            let userTwo = statementResponse[1]

            const response = await supertest(app)
                .get(`/users/${userOne.userId}`)
                .send()

            expect(response.statusCode).toBe(200)

            const body = response.body
            expect(body.userId).toBe(userOne.userId)
            expect(body.firstName).toBe(userOne.firstName)
            expect(body.lastName).toBe(userOne.lastName)
            expect(body.email).toBe(userOne.email)
            expect(body.phone).toBe(userOne.phone)
        })

        it('will return a 404 response when no Users exist', async () => {

            const response = await supertest(app)
                .get('/users/2')
                .send()

            expect(response.statusCode).toBe(404)
            expect(response.body.error).toBe("User '2' not found")

        })

        it('will return a 404 response when no matching Users exist', async () => {

            const statementResponse = await sql`
                INSERT INTO storefront.users (first_name, last_name, email, phone) 
                VALUES ('John', 'Doe', 'johndoe@email.com', '987654321'),
                       ('Jane', 'Doe', 'janedoe@email.com', '123456789')
                RETURNING user_id "userId", first_name "firstName", last_name "lastName", email, phone;
            `

            const response = await supertest(app)
                .get('/users/5')
                .send()

            expect(response.statusCode).toBe(404);

        })

    })

    describe('POST /users/new', () => {

        it('will save the new User object, which will be returned with a new ID value', async () => {

            const toBeSaved = {
                firstName: "John",
                lastName: "Doe",
                isCustomer: true,
                email: "jdoe@email.com",
                phone: "123456789"
            }

            const response = await supertest(app)
                .post("/users/new")
                .send(toBeSaved)

            expect(response.statusCode).toBe(200)

            const body = response.body
            const newId = body.userId

            assertFieldsMatch(body, { userId: newId, ...toBeSaved})

            const statementResponse = await sql`
                SELECT user_id "userId", first_name "firstName", last_name "lastName", is_customer "isCustomer", email, phone
                FROM storefront.users
                WHERE user_id = ${BigInt(newId)};
            `

            let returnedUser = statementResponse[0]

            assertFieldsMatch(returnedUser, body)
        })

        it('will save the new User record with a new ID value, despite one being provided', async () => {

            const toBeSaved = {
                userId: 1,
                firstName: 'John',
                lastName: 'Doe',
                email: 'jdoe@email.com',
                phone: "123456789"
            }

            const response = await supertest(app)
                .post("/users/new")
                .send(toBeSaved)

            expect(response.statusCode).toBe(200)

            const body = response.body
            const newId = body.userId

            assertFieldsMatch(body, { ...toBeSaved, isCustomer: body.isCustomer, userId: newId })

            const statementResponse = await sql`
                SELECT user_id "userId", first_name "firstName", last_name "lastName", is_customer "isCustomer", email, phone
                FROM storefront.users
                WHERE user_id = ${BigInt(newId)}
            `

            let returnedUser = statementResponse[0]

            assertFieldsMatch(returnedUser, body)
        })

        it('will return a 400 when the required fields aren\'t present', async () => {

            const toBeSaved = {
                email: "onlyemail@domain.com",
                phone: "123456789"
            }

            const response = await supertest(app)
                .post("/users/new")
                .send(toBeSaved)

            expect(response.statusCode).toBe(400)
            expect(response.body.error).toBe('"firstName", "lastName" and "email" fields are required!')

        })

    })

    describe('PUT /users/id', () => {

        it('will update an existing User with a payload for all fields', async () => {

            let statementResponse = await sql`
                INSERT INTO storefront.users (first_name, last_name, email, phone)
                VALUES ('John', 'Doe', 'johndoe@email.com', '123456789')
                RETURNING user_id "userId", first_name "firstName", last_name "lastName", email, phone;
            `
            const initialUser = statementResponse[0]

            const updatedFields = {
                firstName: "Joe",
                lastName: "Dohn",
                email: "jdoe@anotheremail.com",
                phone: "987654321"
            }

            const response = await supertest(app)
                .put(`/users/${initialUser.userId}`)
                .send(updatedFields)

            const body = response.body[0]
            expect(body.error).toBeFalsy()
            expect(response.statusCode).toBe(200)
            expect(body.firstName).not.toBe(initialUser.firstName)
            expect(body.lastName).not.toBe(initialUser.lastName)
            expect(body.phone).not.toBe(initialUser.phone)
            expect(body.email).not.toBe(initialUser.email)

            statementResponse = await sql`
                SELECT user_id "userId", first_name "firstName", last_name "lastName", is_customer "isCustomer", email, phone
                FROM storefront.users
                WHERE user_id = ${BigInt(initialUser.userId)}
            `

            const updatedUser = statementResponse[0]
            assertFieldsMatch(updatedUser, body)
        })

        it('will update an existing User with a payload for a single field', async () => {

            let statementResponse = await sql`
                INSERT INTO storefront.users (first_name, last_name, email, phone) 
                VALUES ('John', 'Doe', 'johndoe@email.com', '123456789')
                RETURNING user_id "userId", first_name "firstName", last_name "lastName", email, phone;
            `

            const initialUser = statementResponse[0]

            const updatedFields = {
                lastName: "Newsurname"
            }

            const response = await supertest(app)
                .put(`/users/${initialUser.userId}`)
                .send(updatedFields)

            const body = response.body[0]
            expect(body.error).toBeFalsy()
            expect(response.statusCode).toBe(200)
            expect(body.firstName).toBe(initialUser.firstName)
            expect(body.lastName).not.toBe(initialUser.lastName)
            expect(body.email).toBe(initialUser.email)
            expect(body.phone).toBe(initialUser.phone)

            statementResponse = await sql`
                SELECT user_id "userId", first_name "firstName", last_name "lastName", is_customer "isCustomer", email, phone
                FROM storefront.users
                WHERE user_id = ${BigInt(initialUser.userId)}
            `

            const updatedUser = statementResponse[0]
            assertFieldsMatch(updatedUser, body)
        })

        it('will return an error if the User to be updated doesn\'t exist', async () => {

            const updatedFields = {
                "firstName": "Idontexist"
            }

            const response = await supertest(app)
                .put('/users/1')
                .send(updatedFields)

            expect(response.statusCode).toBe(400)
            expect(response.body.error).toBeTruthy()

        })
    })

    describe('DELETE /users/id', () => {

        it('will delete an existing User', async () => {

            let statementResponse = await sql`
                INSERT INTO storefront.users (first_name, last_name, email, phone)
                VALUES ('John', 'Doe', 'johnd@email.com', '123456789')
                RETURNING user_id "userId", first_name "firstName", last_name "lastName", email, phone;
            `
            const toBeDeleted = statementResponse[0]

            const response = await supertest(app)
                .delete(`/users/${toBeDeleted.userId}`)
                .send()

            expect(response.statusCode).toBe(200)
            expect(response.body.message).toBe(`User '${toBeDeleted.userId}' removed successfully.`)

            statementResponse = await sql`
                SELECT user_id "userId", first_name "firstName", last_name "lastName", email, phone
                FROM storefront.users
                WHERE user_id = ${BigInt(toBeDeleted.userId)};
            `

            expect(statementResponse.length).toBeLessThanOrEqual(0)
        })

        it('won\'t error if the User to be deleted doesn\'t exist', async () => {

            const response = await supertest(app)
                .delete(`/users/1`)
                .send()

            expect(response.statusCode).toBe(200)
            expect(response.body.message).toBe('User \'1\' removed successfully.')
        })

    })

})

