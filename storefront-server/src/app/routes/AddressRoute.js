import { Router, json } from 'express'
import { AddressService } from "../service/AddressService.js"
import { UserService } from "../service/UserService.js";
import { handleError } from "./Routes.common.js";
import postgres from "postgres";

export const router = Router()
const addressService = new AddressService()
const userService = new UserService()

router
    .use(json())

    .get('/:id', async (req, res) => {
        const { id } = req.params
        let queryResponse = await addressService.getAddressWithId(id)

        if (queryResponse[0]) {
            res
                .status(200)
                .json(queryResponse[0])

        } else if (queryResponse instanceof postgres.PostgresError) {
            handleError(res, queryResponse)

        } else {
            res
                .status(404)
                .json({ error: `Address '${id}' not found` })
        }
    })

    // Retrieve Addresses for User ID
    .get('/user/:id', async (req, res) => {
        const { id } = req.params
        let queryResponse = await addressService.getAddressesForCustomerId(id)

        if (queryResponse[0]) {
            res
                .status(200)
                .json(queryResponse)

        } else if (queryResponse instanceof PostgresError) {
            handleError(res, queryResponse)

        } else {
            res
                .status(404)
                .json({ error: `No Address records found for User with ID '${id}'` })
        }
    })

    .post('/new', async (req, res) => {
        const { userId, line1, postalCode, country, ...otherFields } = req.body

        let queryResponse;
        if (userId && line1 && postalCode && country) {
            const userMatch = await userService.getUserWithId(userId)

            if (userMatch[0]) {
                queryResponse = await addressService.createAddress({
                    userId, line1, postalCode, country, ...otherFields
                })

                if (queryResponse[0]) {
                    res
                        .status(200)
                        .json(queryResponse[0])

                } else {
                    handleError(res, queryResponse)
                }
            } else {
                res
                    .status(400)
                    .json({ error: `User with id '${userId}' does not exist. Please provide a valid UserID.` })
            }
        } else {
            res
                .status(400)
                .json({ error: '"userId", "line1", "postalCode" and "country" fields are required!' })
        }
    })

    .put('/:id', async (req, res) => {
        const { id } = req.params
        const { userId, user_id, ...otherFields } = req.body

        let queryResponse
        const addressMatch = await addressService.getAddressWithId(id)

        if (addressMatch[0]) {
            queryResponse = await addressService.updateAddress(id, otherFields)

            if (queryResponse[0]) {
                res
                    .status(200)
                    .json(queryResponse[0])

            } else {
                handleError(res, queryResponse)
            }
        } else {
            res
                .status(400)
                .json({ error: `Address with ID '${id}' does not exist.`})
        }
    })

    .delete('/:id', async (req, res) => {
        const { id } = req.params
        const queryResponse = await addressService.deleteAddress(id)

        if (!queryResponse instanceof PostgresError) {
            res
                .status(200)
                .json(queryResponse)

        } else {
            handleError(res, queryResponse)
        }
    })