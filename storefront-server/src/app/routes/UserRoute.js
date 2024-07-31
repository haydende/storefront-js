import { Router, json } from 'express'
import { UserService } from '../util/db/User/UserService.js';

export const userRouter = Router()
const userService = new UserService()

userRouter

    .use(json())

    // Retrieve User with ID
    .get('/:id', async (req, res) => {
        const { id } = req.params
        let queryResponse;

        if (id) {
            queryResponse = await userService.getUserWithId(id)
        }

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
                .send(`User '${id}' not found`)

        }
    })

    // Create a new User
    .post('/new', async (req, res) => {
        const { firstName, lastName, email, phone } = req.body

        let queryResponse;
        if (firstName && lastName && email) {
            queryResponse = await userService.createUser({
                firstName, lastName, email, phone
            })

            if (queryResponse.error) {
                res
                    .status(500)
                    .json(queryResponse)

            } else if (queryResponse[0]) {
                res
                    .status(200)
                    .json(queryResponse[0])

            } else {
                res
                    .status(404)
                    .json({})

            }
        } else {
            res
                .status(400)
                .send({ error: '"firstName", "lastName" and "email" fields are required!' })
        }
    })

    // Update a User
    .put('/:id', async (req, res) => {
        const { id } = req.params

        let queryResponse;
        if (id) {
            queryResponse = await userService.updateUser(id, req.body)
        } else {
            res
                .status(400)
                .json({ error: 'ID field is required!'})
        }

        if (queryResponse.error) {
            res
                .status(500)
                .json(queryResponse)
        } else if (queryResponse[0]) {
            res
                .status(200)
                .json(queryResponse)
        }
    })

    .delete('/:id', async (req, res) => {
        const { id } = req.params

        let queryResponse;
        if (id) {
            queryResponse = await userService.deleteUser(id)
        } else {
            res
                .status(400)
                .json(queryResponse)
        }
        res
            .status(queryResponse.message ? 200 : 500)
            .json(queryResponse)
    })
