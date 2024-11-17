import dotenv from 'dotenv'
import { program } from 'commander'
import express, { Router } from 'express'

program
    .option(
        '--env, --environment-file <filepath>',
        '.env filepath to read the config from. Default is ../../environment/local.env',
        '../../environment/local.env'
    )

program.parse()

const options = program.opts()

console.info(`${new Date()} - Loading .env file from ${options.environmentFile}`)
dotenv.config({
    path: options.environmentFile
})

const app = express()
const port = 3000

const apiV1Router = Router()

// dynamic import required to apply config before initialising relevant services
import('./routes/AddressRoute.js')
    .then(
        (exported) => {
            console.info(`${new Date()} - Importing AddressRoute`)
            apiV1Router.use('/address', exported.router)
        },
        (reason) => {
            throw new Error(`Unable to start AddressRoute with reason: ${reason}`)
        }
    )

import('./routes/BasketRoute.js')
    .then(
        (exported) => {
            console.info(`${new Date()} - Importing BasketRoute`)
            apiV1Router.use('/basket', exported.router)
        },
        (reason) => {
            throw new Error(`Unable to start BasketRoute with reason: ${reason}`)
        }
    )

import('./routes/OrderRoute.js')
    .then(
        (exported) => {
            console.info(`${new Date()} - Importing OrderRoute`)
            apiV1Router.use('/order', exported.router)
        },
        (reason) => {
            throw new Error(`Unable to start OrderRoute with reason: ${reason}`)
        }
    )

import('./routes/PaymentInfoRoute.js')
    .then(
        (exported) => {
            console.info(`${new Date()} - Importing PaymentInfoRoute`)
            apiV1Router.use('/payment', exported.router)
        },
        (reason) => {
            throw new Error(`Unable to start PaymentInfoRoute with reason: ${reason}`)
        }
    )

import('./routes/ProductsRoute.js')
    .then(
        (exported) => {
            console.info(`${new Date()} - Importing ProductsRoute`)
            apiV1Router.use('/products', exported.router)
        },
        (reason) => {
            throw new Error(`Unable to start ProductsRoute with reason: ${reason}`)
        }
    )

import('./routes/UserRoute.js')
    .then(
        (exported) => {
            console.info(`${new Date()} - Importing UserRoute`)
            apiV1Router.use('/user', exported.router)
        },
        (reason) => {
            throw new Error(`Unable to start UserRoute with reason: ${reason}`)
        }
    )

app.use('/api/v1/', apiV1Router)

app.listen(port, () => {
    console.info(`${new Date()} - Storefront Server is listening on port ${port}`)
})