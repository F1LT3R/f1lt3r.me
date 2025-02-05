import readDir from './read-dir.mjs'
import readDocFile from './read-doc-file.mjs'
import getDocDetails from './get-doc-details.mjs'

export default (dirSrc, updateSingleDoc) =>
    new Promise((resolve, reject) => {
        const readDirs = []
        const docs = {}

        const search = {
            tags: {},
            authors: {},
            words: {},
            dates: {},
            types: {},
        }

        readDir(dirSrc)
            .then(({ dir }) => {
                for (const docDir of dir) {
                    // updateSingleDoc to only process the post that was changed
                    if (updateSingleDoc && !updateSingleDoc.includes(docDir)) {
                        continue
                    }

                    const nextPromise = new Promise((resolve, reject) => {
                        /* prettier-ignore */
                        readDir(docDir)
						.then(readDocFile)
						.then(getDocDetails)
						.then(resolve)
						.catch(reject)
                    })
                    readDirs.push(nextPromise)
                }

                // console.log(Promise.all(readDirs))
                Promise.allSettled(readDirs)
                    .then((results) => {
                        console.log({ results })
                        results.forEach(({ value: doc }) => {
                            console.log({ doc })

                            docs[doc.datetime] = doc

                            const {
                                attributes: { tags, authors, type },
                                datetime,
                                file,
                            } = doc

                            updateSearch(search.tags, tags, file)
                            updateSearch(search.authors, authors, file)
                            updateSearch(search.dates, [datetime], file)
                            updateSearch(search.types, [type], file)
                        })

                        resolve({ pages, search })
                    })
                    .catch(reject)
            })
            .catch(reject)
    })
