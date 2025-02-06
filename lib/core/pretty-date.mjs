export default (datetime, time) => {
    if (!datetime) {
        return undefined
    }

    try {
        const [year, month, day, hour, minute] = datetime.split('-')

        let prettyDate = new Date(year, month - 1, day, hour, minute).toLocaleDateString('en-us', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })

        if (time) {
            prettyDate += `, ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
        }

        return prettyDate
    } catch (e) {
        return new Error(e)
    }
}
