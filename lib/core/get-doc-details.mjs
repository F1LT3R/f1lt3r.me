export default ({ file, fileDataUTF8 }) =>
    new Promise((resolve, reject) => {
        let details
        let datetime
        let postdate
        let updated

        try {
            details = frontmatter(fileDataUTF8)
            // `datetime`, eg: 2024-02-08-22-00
            datetime = details.attributes.date
            postdate = prettyDates([datetime])[0]
            updated = prettyDates(details.attributes.updated || null, true)
        } catch (err) {
            return reject(err)
        }

        const result = Object.assign({ file, datetime, postdate, updated, ...details })
        resolve(result)
    })
