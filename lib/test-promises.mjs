const makeTimers = (count, min, max) => new Promise((resolve, reject)=> {
    const timerPromises = []
    const range = max - min

    for (let i = 0; i < count;  i += 1) {
        const nextPromise = new Promise((resolve) => {
            const ms = (min + (Math.random() * range)) * 1000
            setTimeout(() => {
                console.log(`Timer ${i} fired!`)
                resolve({i, ms});
            }, ms)
        })
        timerPromises.push(nextPromise)
    }

    Promise.allSettled(timerPromises).then(resolve).catch(reject)
})

makeTimers(3, 2, 5).then((results) => {
    console.log(results);
});