import { Router, json } from 'express'
import { UserService } from '../service/UserService.js';

export const router = Router()
const userService = new UserService()

router

    .use(json())

    // Retrieve User with ID
    .get('/:id', async (req, res) => {
        const { id } = req.params
        let queryResponse = await userService.getUserWithId(id)

        if (queryResponse[0]) {
            res
                .status(200)
                .json(queryResponse[0])

        } else if (queryResponse.error) {
            res
                .status(500)
                .json(queryResponse)

        } else {
            res
                .status(404)
                .json({ error: `User '${id}' not found` })

        }
    })

    // Create a new User
    .post('/new', async (req, res) => {
        const { userId, user_id, firstName, lastName, email, ...otherFields } = req.body

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
            res
                .status(400)
                .json({ error: '"firstName", "lastName" and "email" fields are required!' })
        }
    })

    // Update a User
    .put('/:id', async (req, res) => {
        const { id } = req.params

        let queryResponse;
        const userMatch = await userService.getUserWithId(id)
        if (typeof userMatch[0] === "object") {
            queryResponse = await userService.updateUser(id, req.body)
            if (queryResponse.error) {
                res
                    .status(500)
                    .json(queryResponse)
            } else if (queryResponse[0]) {
                res
                    .status(200)
                    .json(queryResponse)
            }
        } else {
            res
                .status(400)
                .json({ error: `User with ID '${id}' does not exist`})
        }
    })

    .delete('/:id', async (req, res) => {
        const { id } = req.params

        let queryResponse;
            queryResponse = await userService.deleteUser(id)

        res
            .status(queryResponse.message ? 200 : 500)
            .json(queryResponse)
    })
