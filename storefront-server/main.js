import dotenv from 'dotenv'
import { program } from 'commander'
import express, { Router } from 'express'

program
    .option(
        '--env, --environment-file <filepath>',
        '.env filepath to read the config from. Default is ./environment/local.env',
        './environment/local.env'
    )

program.parse()

const options = program.opts()

dotenv.config({
    path: options.environmentFile
})

const app = express()
const port = 3000

const apiV1Router = Router()

// dynamic import required to apply config before initialising relevant services
import('./src/app/routes/AddressRoute.js')
    .then(
        (exported) => apiV1Router.use('/address', exported.router),
        (reason) => {
            throw new Error(`Unable to start AddressRoute with reason: ${reason}`)
        }
    )

import('./src/app/routes/BasketRoute.js')
    .then(
        (exported) => apiV1Router.use('/basket', exported.router),
        (reason) => {
            throw new Error(`Unable to start BasketRoute with reason: ${reason}`)
        }
    )

import('./src/app/routes/OrderRoute.js')
    .then(
        (exported) => apiV1Router.use('/order', exported.router),
        (reason) => {
            throw new Error(`Unable to start OrderRoute with reason: ${reason}`)
        }
    )

import('./src/app/routes/PaymentInfoRoute.js')
    .then(
        (exported) => apiV1Router.use('/payment', exported.router),
        (reason) => {
            throw new Error(`Unable to start PaymentInfoRoute with reason: ${reason}`)
        }
    )

import('./src/app/routes/ProductsRoute.js')
    .then(
        (exported) => apiV1Router.use('/products', exported.router),
        (reason) => {
            throw new Error(`Unable to start ProductsRoute with reason: ${reason}`)
        }
    )

import('./src/app/routes/UserRoute.js')
    .then(
        (exported) => apiV1Router.use('/user', exported.router),
        (reason) => {
            throw new Error(`Unable to start UserRoute with reason: ${reason}`)
        }
    )

app.use('/api/v1/', apiV1Router)

app.listen(port, () => {
    console.log(`Storefront Server is listening on port ${port}`)
})