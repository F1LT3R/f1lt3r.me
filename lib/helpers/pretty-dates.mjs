export default (datetimes, time) => {
	if (!datetimes) {
		return null
	}

	return datetimes.map(datetime => {
		let prettyDate

		try {
			const [year, month, day, hour, minute] = datetime.split('-')
			
			prettyDate = (new Date(year, month - 1, day, hour, minute))
				.toLocaleDateString('en-us', {
					weekday:"short",
					year:"numeric",
					month:"short",
					day:"numeric"
			})

			if (time) {
				prettyDate += `, ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
			}
		} catch (e) {
			return new Error(e)
		}

		return prettyDate
	})
}