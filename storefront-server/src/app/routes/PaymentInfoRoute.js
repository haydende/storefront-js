import { Router, json } from 'express';
import { PaymentInfoService } from '../service/PaymentInfoService.js';
import { UserService } from "../service/UserService.js";
import postgres from "postgres";
import { handleError } from "./Routes.common.js";

export const router = Router()
const userService = new UserService();
const paymentInfoService = new PaymentInfoService();

router
    .use(json())

    .get('/:id', async (req, res) => {
        const { id } = req.params
        let queryResponse = await paymentInfoService.getPaymentInfoWithId(id)
        if (queryResponse[0]) {
            res
                .status(200)
                .json(queryResponse[0])

        } else if (queryResponse instanceof postgres.PostgresError) {
            handleError(res, queryResponse)

        } else {
            res
            .status(404)
                .json({ error: `PaymentInfo '${id}' not found` })
        }
    })

    .get('/user/:id', async (req, res) => {
        const { id } = req.params
        let queryResponse = await paymentInfoService.getPaymentInfoForUserId(id)
        if (queryResponse[0]) {
            res
                .status(200)
                .json(queryResponse)
        } else if (queryResponse instanceof postgres.PostgresError) {
            handleError(res, queryResponse)

        } else {
            res
                .status(404)
                .json({ error: `No PaymentInfo address records found for User with ID '${id}'` })
        }
    })

    .post('/new', async (req, res) => {
        const { payment_id, paymentId, userId, cardNumber, expiryDate, cvv, accountNumber, ...otherFields } = req.body

        let queryResponse;
        if (userId && cardNumber && expiryDate && cvv && accountNumber) {
            const userMatch = await userService.getUserWithId(userId)

            if (userMatch[0]) {
                queryResponse = await paymentInfoService.createPaymentInfo({
                    userId, cardNumber, expiryDate, cvv, accountNumber, ...otherFields
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
                    .json({ error: `User with ID '${userId}' does not exist. Please provide a valid UserID.` })
            }
        } else {
            res
                .status(400)
                .json({ error: '"userId", "cardNumber", "expiryDate", "cvv" and "accountNumber" fields are required!'})
        }
    })

    .put('/:id', async (req, res) => {
        const { id } = req.params
        const { userId, payment_id, paymentId, ...otherFields } = req.body

        let queryResponse
        let paymentMatch = await paymentInfoService.getPaymentInfoWithId(id)
        if (paymentMatch[0]) {
            queryResponse = await paymentInfoService.updatePaymentInfo(id, otherFields)

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
                .json({ error: `PaymentInfo with ID '${id}' does not exist.` })
        }
    })

    .delete('/:id', async (req, res) => {
        const { id } = req.params
        const queryResponse = await paymentInfoService.deletePaymentInfo(id)

        if (!queryResponse instanceof postgres.PostgresError) {
            res
                .status(200)
                .json(queryResponse)

        } else {
            handleError(res, queryResponse)
        }
    })

