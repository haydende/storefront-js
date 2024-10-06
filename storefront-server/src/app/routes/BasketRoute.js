import { json } from "express";
import { BasketService } from "../service/BasketService.js";
import { UserService } from "../service/UserService.js";

export const router = Router()
const basketService = new BasketService()
const userService = new UserService()

router
    .use(json())

    .get('/:id', async (req, res) => {
        const { id } = req.params
        const queryResponse = await basketService.getBasketWithId(id)

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
                .json({ error: `Basket with ID '${id}' does not exist.`})
        }
    })

    .get('/user/:id', async (req, res) => {
        const { id } = req.params

        const queryResponse = basketService.getBasketsForUserId(id)
        if (queryResponse[0]) {
            res
                .status(200)
                .json(queryResponse)

        } else if (queryResponse.error) {
            res
                .status(500)
                .json(queryResponse)

        } else {
            res
                .status(404)
                .json({ error: `No Basket records found for user with ID '${id}'.`})
        }
    })

    .post('/:id', async (req, res) => {
        const { id } = req.params
        const { productId, quantity } = req.query

        if (productId && quantity) {
            const basketMatch = await basketService.getBasketWithId(id)
            if (basketMatch[0]) {
                const queryResponse = await basketService.addItemToBasket(id, productId, quantity)
                res
                    .status(queryResponse.message ? 200 : 500)
                    .json(queryResponse)
            }

        } else {
            res
                .status(400)
                .json({ error: '"productId" and "quantity" are required!' })
        }

    })

    .post('/new', async (req, res) => {
        const { basketId, basket_id, userId, ...otherFields } = req.body

        if (userId) {
            let queryResponse = await userService.getUserWithId(userId)

            if (queryResponse[0]) {
                queryResponse = await basketService.createBasket({ userId, otherFields })

                if (queryResponse[0]) {
                    res
                        .status(200)
                        .json(queryResponse)

                } else {
                    res
                        .status(500)
                        .json(queryResponse)
                }
            }

        } else {
            res
                .status(400)
                .json({ error: `"userId" is required!`})
        }
    })

    .put('/:id', async (req, res) => {
        const { id } = req.params
        const { userId, user_id, ...otherFields } = req.body

        const basketMatch = await basketService.getBasketWithId(id)
        if (basketMatch[0]) {
            let queryResponse = await basketService.updateBasket(id, otherFields)

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
                .json({ error: `Basket with ID '${id}' does not exist.`})
        }
    })

    .delete('/:id', async (req, res) => {
        const { id } = req.params
        const queryResponse = await basketService.deleteBasket(id)

        res
            .status(queryResponse.message ? 200 : 500)
            .json(queryResponse)
    })