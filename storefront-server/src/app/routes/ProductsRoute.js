import { Router, json } from 'express'
import { ProductService } from '../service/ProductService'

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

        } else if (queryResponse.error) {
            res
                .status(500)
                .json(queryResponse)

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
                res
                    .status(500)
                    .json(queryResponse)
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
            queryResponse = await productService.deleteUser(id)

        res
            .status(queryResponse.message ? 200 : 500)
            .json(queryResponse)
    })
