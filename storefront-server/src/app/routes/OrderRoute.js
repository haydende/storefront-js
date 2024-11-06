import { Router, json } from "express";
import { OrderService } from "../service/OrderService.js";
import { handleError } from "./Routes.common.js";
import postgres from "postgres";

export const router = Router();
const orderService = new OrderService();

router
    .use(json())

    .get("/:id", async (req, res) => {
        const { id } = req.params

        let queryResponse = await orderService.getOrderWithId(id)
        if (queryResponse[0]) {
            res
                .status(200)
                .json(queryResponse[0])

        } else if (queryResponse instanceof postgres.PostgresError) {
            handleError(res, queryResponse)

        } else {
            res
                .status(404)
                .json({ error: `Order with id '${id}' not found`})
        }
    })

    .post("/new", async (req, res) => {
        const { orderId, order_id, addressId, basketId, paymentInfoId } = req.body;

        if (addressId && basketId && paymentInfoId) {
            const queryResponse = await orderService.createOrder({ addressId, basketId, paymentInfoId })

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
                .json({ error: '"addressId", "basketId" and "paymentInfoId" are required!' })
        }
    })

    .delete("/:id", async (req, res) => {
        const { id } = req.params
        const queryResponse = await orderService.deleteOrder(id)

        if (queryResponse instanceof postgres.PostgresError) {
            res
                .status(200)
                .json(queryResponse)
        } else {
            handleError(res, queryResponse)
        }
    })