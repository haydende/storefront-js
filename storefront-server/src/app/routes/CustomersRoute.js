import { Router, json } from 'express'
import { CustomerService } from '../util/db/Customer/CustomerService.js'
import { UserService } from "../util/db/User/UserService.js";

const customerRouter = new Router();
const userService = new UserService();
const customerService = new CustomerService();

customerRouter

    .use(json())

    .get('/:id', async (req, res) => {

        const { id } = req.params
        let queryResponse;

        if (id) {
            queryResponse = await customerService.getCustomerWithId(id)
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
                .text(`Customer [${id}] not found`)
        }
    })

    .post('/new', async (req, res) => {

        const { userId } = req.body

        let queryResponse;
        if (userId) {
            let userResponse = await userService.getUserWithId(userId)

            if (userResponse[0]) {
                queryResponse = await customerService.createCustomer({ userId })

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

            } else if (userResponse[0]) {
                res
                   .status(500)
                   .json(userResponse)

            } else {
                res
                    .status(400)
                    .text(`Could not create Customer record. User '${userId}' does not exist`)
            }
        } else {
            res
                .status(400)
                .text('User ID is required to create a Customer record!')

        }

    })



export { customerRouter };