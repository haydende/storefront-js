export function convertFieldsToSnakecase(obj) {
    const updatedFields = {}
    let columns = Object.keys(obj)

    for (let column of columns) {
        const columnSnakeCase = column
            .replace(/([a-z])([A-Z])/g, '$1_$2')
            .toLowerCase()
        updatedFields[columnSnakeCase] = obj[column]
    }
    return updatedFields
}
