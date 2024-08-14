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

// dynamic import required to apply config before initialising relevant services
let userRouter;
await import("./src/app/routes/UserRoute.js")
    .then(
        (exported) => {
            userRouter = exported.router
        },
        (reason) => {
            console.error(`Unable to start UserRoute with reason: ${reason}`)
            throw Error(reason)
        }
    )

const app = express()
const port = 3000

const apiV1Router = Router()

apiV1Router.use('/users', userRouter)
app.use('/api/v1/', apiV1Router)

app.listen(port, () => {
    console.log(`Storefront Server is listening on port ${port}`)
})