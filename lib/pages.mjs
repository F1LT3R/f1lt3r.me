import fs from 'node:fs'
import path from 'node:path'

import frontmatter from 'front-matter'
import handlebars from 'handlebars'
import copydir from 'copy-dir'
import chokidar from 'chokidar'
import {WebSocketServer} from 'ws';
import chalk from 'chalk'
import crypto  from 'crypto';

import prettyDates from './helpers/pretty-dates.mjs'
import markdown from './markdown.mjs'
import settings from '../site-settings.json' with { type: 'json' }

const ENV = process.env.NODE_ENV

const pagesDirSrc = path.resolve('.', settings.build.pages_dir.src)
const pagesDirDist = path.resolve('.', settings.build.pages_dir.dist)

const readTypes = {
    1: "file",
    2: "dir",
    3: "link"
}

const readDir = (dir) => new Promise ((resolve, reject) => {
    fs.readdir(dir, { withFileTypes: true }, (err, files) => { 
        if (err) return reject(console.error(err)); 

        const result = {
            root: path.resolve(dir),
            file: [],
            dir: []
        };

        for (const file of files) { 
            const num = file[Object.getOwnPropertySymbols(file)[0]]
            const validEnum = Object.keys(readTypes).includes(String(num));
            if (!validEnum) continue

            const type = readTypes[num];
            result[type].push(path.resolve(dir, file.name))
        }

        resolve(result)
    })
});

const isPage = (filepath) => {
    const {ext, name} = path.parse(filepath)

    if (ext === '.md' && name.slice(0, 5) === 'page_') {
        return true
    }

    return false
}

const readPageFile = ({file: files}) => new Promise((resolve, reject) => {
    for (const file of files) {
        if (isPage(file)) {
            fs.readFile(file, 'utf8', function (err, fileDataUTF8) {
                if (err) return reject(err)
                return resolve({file, fileDataUTF8})
            })
        }
    }
})



const getPageDetails = ({file, fileDataUTF8}) => new Promise((resolve, reject) => {
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

    const result = Object.assign({file, datetime, postdate, updated, ...details});
    resolve(result)
})

const updateSearch = (search, entries, file) => {
    for (const entry of entries) {
        if (!search[entry]) {
            search[entry] = []
        }

        search[entry].push(file)
    }
}

const getPages = () => new Promise((resolve, reject) => {
    const readDirs = [];    
    const pages = {};

    const search = {
        tags: {},
        authors: {},
        words: {},
        dates: {},
        types: {},
    }

    readDir(pagesDirSrc).then(({dir}) => {
        for (const pagesDir of dir) {
            const nextPromise = new Promise((resolve, reject) => {
                readDir(pagesDir)
                    .then(readPageFile)
                    .then(getPageDetails)
                    .then(resolve)
                    .catch(reject)
            })
            readDirs.push(nextPromise)
        }

        // console.log(Promise.all(readDirs))
        Promise.allSettled(readDirs)
        .then((results) => {
            results.forEach(({value: page}) => {
				console.log(page);

                page[page.datetime] = page

                const {
                    attributes: {tags, authors, type},
                    datetime,
                    file
                } = page

                updateSearch(search.tags, tags, file)
                updateSearch(search.authors, authors, file)
                updateSearch(search.dates, [datetime], file)
                updateSearch(search.types, [type], file)
            })
            resolve({pages, search})
        })
        .catch(reject);
    })
});

const mkdirRecursive = (dir) => new Promise((resolve, reject) => {
    fs.mkdir(dir, { recursive: true }, (err, data) => {
        if (err) return reject(err)
        resolve(dir)
    });
})

const writeHTML = (html, fileDir, filePath) => new Promise((resolve, reject) => {
    mkdirRecursive(fileDir).then(() => {
        fs.writeFile(filePath, html, (err) => {
            if (err) return reject(err)
            resolve(filePath)
        })
    }).catch(reject)
})

const writePageToHTML = (page) => new Promise((resolve, reject) => {
    const {attributes: {permalink}, outerHTML} = page

    const distDir = path.relative('.', pagesDirDist)
    const distPagePermalink = path.resolve(distDir, permalink)
    const distPageIndex = path.join(distPagePermalink, 'index.html')

    page.distDir = distPagePermalink

    writeHTML(outerHTML, distPagePermalink, distPageIndex)
        .then(() => resolve(page))
        .catch(err => console.error)
})

const copyPageFilesToDist = (page) => new Promise((resolve, reject) => {
    const {
        distDir,
        file
    } = page

    const srcDir = path.parse(file).dir
    page.srcDir = srcDir

    const options = {
        utimes: true,  // keep add time and modify time
        mode: true,    // keep file mode
        cover: true,    // cover file when exists, default is true
        
        // Don't copy over the markdown page file
        filter: (stat, filepath, filename) => {
            if (stat === 'file' && isPage(filepath)) {
                return false;
            }

            return true;
        }
    }

    const copyPageDirPromise = () => new Promise((resolve, reject) => {
        mkdirRecursive(distDir)
            .then(() => {
                copydir(srcDir, distDir, options, function(err) {
                    if(err) return reject(err);
                    resolve(page)
                })
            })
            .catch(reject)
    });

    copyPageDirPromise()
        .then(resolve)
        .catch(reject)
})

const readTemplateFile = (file, group, zone) => new Promise((resolve, reject) => {
    fs.readFile(file, 'utf8', function (err, fileDataUTF8) {
        if (err) return reject(err)
        return resolve({file, fileDataUTF8, group, zone})
    })
})

const loadTemplates = () => new Promise((resolve, reject) => {
    const {build: {templates: templateGroups}} = settings

    // console.log(templateGroups);
    const templateFilePromises = [];

    for (const groupName in templateGroups) {
        const group = templateGroups[groupName]
    
        for (const zone in group) {
            // console.log(groupName, zone)
            const template = group[zone]
            const templateFilepath = path.resolve('.', template);
            // console.log(templateFile)
            templateFilePromises.push(readTemplateFile(templateFilepath, groupName, zone))
        }
    }

    Promise.all(templateFilePromises)
        .then((templateFiles) => {
            const templates = Object.assign({}, {templateGroups})

            templateFiles.forEach(template => {
                if (!templates[template.group]) {
                    templates[template.group] = {}
                }
                templates[template.group][template.zone] = template
            })
            resolve(templates)
        })
        .catch(reject)
})

const embedPageInHTMLTemplate = (page, templates) => new Promise(async (resolve, reject) => {
    const {
        attributes,
        file,
        html,
        pagedate,
        datetime
    } = page
    const {excerpt, permalink: relativePermalink} = attributes
    const {site, social} = settings

    // console.log({templates})
    // console.log(templates.index.base.fileDataUTF8)

    const atTime = chalk.yellow(datetime)
    const toPath = chalk.green.underline(`/${relativePermalink}`);
    console.log(`${atTime}: ${toPath}`);
    
    const permalink = `${site.baseurl}/pages/${relativePermalink}`

    const base_template = handlebars.compile(templates.index.base_template.fileDataUTF8);
    const head_template = handlebars
        .compile(templates.index.head_template.fileDataUTF8)
        (Object.assign( {},
            {...site},
            {...attributes},
            {
                SOCKETS: ENV === "development",
                ogtype: 'article',
                excerpt,
                permalink,
            }));
    const nav_template = handlebars
        .compile(templates.index.nav_template.fileDataUTF8)({})
    const header_template = handlebars
        .compile(templates.index.header_template.fileDataUTF8)
        ({site});
    const main_template = handlebars
        .compile(templates.page.main_template.fileDataUTF8)
        ({page, pagedate})
    const footer_template = handlebars.compile(templates.index.footer_template.fileDataUTF8)({site, social});

    const result = base_template({
        head_template,
        nav_template,
        header_template,
        main_template,
        footer_template
    });

    page.outerHTML = result;

    resolve(page)
})

const copyFiles = () => new Promise((resolve, reject) => {
    const options = {
        utimes: true,  // keep add time and modify time
        mode: true,    // keep file mode
        cover: true    // cover file when exists, default is true
    }

    const copyFilePromises = [];

    settings.build.copy_files.forEach(batch => {
        const from = path.resolve('.', batch.src)  
        const to = path.resolve('.', batch.dist)

        const nextPromise = new Promise((resolve, reject) => {
            mkdirRecursive(to)
                .then(() => {
                    copydir(from, to, options, function(err) {
                        if(err) return reject(err);
                        resolve({from, to})
                    })
                })
                .catch(err => reject(err))
        });
        copyFilePromises.push(nextPromise)
    })

    Promise.all(copyFilePromises)
        .then(resolve)
        .catch(reject)
})

const build = () => new Promise((resolve,reject) => {
    copyFiles()
        .then(loadTemplates)
        .then((templates) => {
            // console.log(templates)

            getPages()
            .then((results) => {
                console.log(results)

                for (const pageDate in results.pages) {
                    const page = results.pages[pageDate]
                    console.log(page.body)
                    
                    const {body, file} = page

                    markdown(body).then(html => {
                        // Attach parsed markdown as html to page object
                        page.html = html
                        embedPageInHTMLTemplate(page, templates)
                        .then((page) => {
                            writePageToHTML(page)
                                .then(copyPageFilesToDist)
                                .then(results => {
                                    resolve()
                                })
                        })
                        .catch(reject)
                        // console.log(html)
                    })
                }
                //console.log(JSON.stringify(results, null, 4))
            })
        })
})

const watch = () => {
    const wss = new WebSocketServer({ port: 8080 });
    
    const connections = {}

    wss.on('connection', function connection(ws) {
        ws.id = crypto.randomUUID()

        console.log(chalk.blue(`WATCH: Browser Connected > ${ws.id}`));
        connections[ws.id] = ws

        ws.on('close', function() {
            console.log(chalk.blue(`WATCH: Browser Disconnected > ${ws.id}`));
            delete connections[ws.id]
        });
    });

    const watchPath = path.resolve('.', settings.build.watch_dir)

    let watchReady = false;
    let start = Date.now();
    let initialWait = false;

    chokidar.watch(watchPath).on('ready', (event, path) => {
        watchReady = true;
    });
    
    chokidar.watch(watchPath).on('all', (event, updatePath) => {
        if (!watchReady) return
        
        if (Date.now() - start > 2000) {
            console.log(chalk.blue('WATCH: READY'));
            initialWait = true;
        }

        if (!initialWait) {
            return
        }

        console.log(chalk.magenta(`${event.toLocaleUpperCase()}: ${path.relative('.', updatePath)}`));
        
        build().then(() => {
            
            for (const uuid in connections) {
                const ws = connections[uuid]
                console.log(chalk.blue(`WATCH: Sending RELOAD to Browser > ${ws.id}`));
                ws.send('RELOAD')

                setTimeout(() => {
                    ws.close()
                }, 1000)
            }
        })
    })
}

export default async () => {
    console.log(chalk.white(`Running in ${ENV} mode.`))

    if (ENV === 'development') {
        return build().then(watch).catch(console.error)
    }

    await build()
}