export default (search, entries, file) => {
    for (const entry of entries) {
        if (!search[entry]) {
            search[entry] = []
        }

        search[entry].push(file)
    }
}
