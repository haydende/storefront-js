import { Router, json } from 'express'
import { ProductService } from '../service/ProductService.js'
import postgres from "postgres";
import { handleError } from "./Routes.common.js";

export const router = Router()
const productService = new ProductService()

router

    .use(json())

    .get('/:id', async (req, res) => {
        const { id } = req.params
        let queryResponse = await productService.getProductWithId(id)

        if (queryResponse[0]) {
            res
                .status(200)
                .json(queryResponse[0])

        } else if (queryResponse instanceof postgres.PostgresError) {
            handleError(res, queryResponse)

        } else {
            res
                .status(404)
                .json({ error: `Product '${id}' not found` })

        }
    })

    .post('/new', async (req, res) => {
        const { product_id, productId, name, brand, price, quantity, ...otherFields } = req.body

        let queryResponse;
        if (name && brand && price && quantity) {
            queryResponse = await productService.createProduct({
                name, brand, price, quantity, ...otherFields
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
                .json({ error: '"name", "brand", "price", and "quantity" fields are required!' })
        }
    })

    .put('/:id', async (req, res) => {
        const { id } = req.params
        const { product_id, productId, ...otherFields } = req.body

        let queryResponse;
        const userMatch = await productService.getUserWithId(id)
        if (typeof userMatch[0] === "object") {
            queryResponse = await productService.updateProduct(id, { otherFields })
            if (queryResponse[0]) {
                res
                    .status(200)
                    .json(queryResponse)

            } else {
                handleError(res, queryResponse)
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
            queryResponse = await productService.deleteUser(id)

        if (!(queryResponse instanceof postgres.PostgresError)) {
            res
                .status(200)
                .json(queryResponse)

        } else {
            handleError(res, queryResponse)
        }
    })
