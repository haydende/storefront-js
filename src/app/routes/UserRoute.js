import { Router, json } from 'express'
import Postgres from 'postgres'
import postgres from "postgres"
import { UserService } from '../service/UserService.js'
import { handleError } from "./Routes.common.js"

export const router = Router()
const userService = new UserService()

router

    .use(json())

    // Retrieve User with ID
    .get('/:id', async (req, res) => {
        const { id } = req.params

        console.debug(`${new Date()} - Getting User with ID [${id}]`)
        let queryResponse = await userService.getUserWithId(id)

        if (queryResponse[0]) {
            res
                .status(200)
                .json(queryResponse[0])

        } else if (queryResponse instanceof postgres.PostgresError) {
            handleError(res, queryResponse)

        } else {
            res
                .status(404)
                .json({ error: `User '${id}' not found` })

        }
    })

    .post('/login', async (req, res) => {
        const { email, password } = req.body

        console.debug(`${new Date()} - Attempting Login with credentials [email: ${email}, password: ${password}]`)
        const response = await userService.loginUser(email, password)
        if (response instanceof Postgres.PostgresError) {
            handleError(res, response)
        } else if (response instanceof Error ) {
            res
                .status(500)
                .json(response)
        } else {
            res
                .status(200)
                .json({
                    message: response ? 'Successfully logged in' : 'Credentials do not match'
                })
        }
    })

    // Create a new User
    .post('/new', async (req, res) => {
        const { userId, user_id, firstName, lastName, email, ...otherFields } = req.body

        console.debug(`${new Date()} - Creating new User with fields: [${Object.keys({firstName, lastName, email, ...otherFields})}]`)
        let queryResponse;
        if (firstName && lastName && email) {
            queryResponse = await userService.createUser({
                firstName, lastName, email, ...otherFields
            })

            if (queryResponse[0]) {
                res
                    .status(200)
                    .json(queryResponse[0])

            } else {
                res
                    .status(500)
                    .json(queryResponse)
            }
        } else {
            console.error(`${new Date()} - firstName, lastName and email fields weren't provided. Rejecting POST.`)
            res
                .status(400)
                .json({ error: '"firstName", "lastName" and "email" fields are required!' })
        }
    })

    // Update a User
    .put('/:id', async (req, res) => {
        const { id } = req.params

        console.debug(`${new Date()} - Updating User with ID [${id}] and fields [${Object.keys(req.body)}]`)
        let queryResponse;
        const userMatch = await userService.getUserWithId(id)
        if (typeof userMatch[0] === "object") {
            queryResponse = await userService.updateUser(id, req.body)
            if (queryResponse[0]) {
                res
                    .status(200)
                    .json(queryResponse[0])
            } else if (queryResponse instanceof postgres.PostgresError) {
                handleError(res, queryResponse)
            }
        } else {
            console.error(`User with ID [${id}] does not exist.`)
            res
                .status(400)
                .json({ error: `User with ID '${id}' does not exist`})
        }
    })

    .delete('/:id', async (req, res) => {
        const { id } = req.params

        console.debug(`${new Date()} - Deleting User with ID [${id}]`)
        let queryResponse = await userService.deleteUser(id)

        if (!(queryResponse instanceof postgres.PostgresError)) {
            res
                .status(200)
                .json(queryResponse)
        } else {
            handleError(res, queryResponse)
        }
    })
