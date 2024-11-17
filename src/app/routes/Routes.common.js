
export function handleError(res, error) {
    const code = error.code;
    switch (code.substring(0, 2)) {
        case "23":
            res
                .status(400)
                .send(error)
            break

        default:
            res
                .status(500)
                .send(error)

    }
}