import prettyDate from './pretty-date.mjs'

export default (updateDates, time) => {
    if (!Array.isArray(updateDates)) {
        return []
    }

    return updateDates.map((datetime) => {
        try {
            return prettyDate(datetime, time)
        } catch (e) {
            return new Error(e)
        }
    })
}
