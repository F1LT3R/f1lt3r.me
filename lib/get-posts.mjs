import fs from 'node:fs'
import path from 'node:path'
import { promises } from 'node:dns'

import frontmatter from 'front-matter'
import handlebars from 'handlebars'
import copydir from 'copy-dir'

import markdownit from './markdown-it.mjs'
import settings from '../site-settings.json' with { type: 'json' }
import chokidar from 'chokidar'

const postsDirSrc = path.resolve('.', settings.build.posts_dir.src)
const postsDirDist = path.resolve('.', settings.build.posts_dir.dist)

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

const isPost = (filepath) => {
    const {ext, name} = path.parse(filepath)

    if (ext === '.md' && name.slice(0, 5) === 'post_') {
        return true
    }

    return false
}

const readPostFile = ({file: files}) => new Promise((resolve, reject) => {
    for (const file of files) {
        if (isPost(file)) {
            fs.readFile(file, 'utf8', function (err, fileDataUTF8) {
                if (err) return reject(err)
                return resolve({file, fileDataUTF8})
            })
        }
    }
})

const getPostDetails = ({file, fileDataUTF8}) => new Promise((resolve, reject) => {
    let details
    let datetime
    let postdate

    try {
        details = frontmatter(fileDataUTF8)
        // `datetime`, eg: 2024-02-08-22-00
        datetime = path.parse(file).dir.split('/').slice(-1)[0].slice(0, 16)
        const [year, month, day, hour, minute] = datetime.split('-')
        postdate = (new Date(year, month - 1, day, hour, minute))
            .toLocaleDateString('en-us', {
                weekday:"short",
                year:"numeric",
                month:"short",
                day:"numeric"
            }) 
    } catch (err) {
        return reject(err)
    }

    const result = Object.assign({file, datetime, postdate, ...details});
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

const getPosts = () => new Promise((resolve, reject) => {
    const readDirs = [];    
    const posts = {};

    const search = {
        tags: {},
        authors: {},
        words: {},
        dates: {},
        types: {},
    }

    readDir(postsDirSrc).then(({dir}) => {
        for (const postDir of dir) {
            const nextPromise = new Promise((resolve, reject) => {
                readDir(postDir)
                    .then(readPostFile)
                    .then(getPostDetails)
                    .then(resolve)
                    .catch(reject)
            })
            readDirs.push(nextPromise)
        }

        // console.log(Promise.all(readDirs))
        Promise.allSettled(readDirs)
        .then((results) => {
            results.forEach(({value: post}) => {
                posts[post.datetime] = post

                const {
                    attributes: {tags, authors, type},
                    datetime,
                    file
                } = post

                updateSearch(search.tags, tags, file)
                updateSearch(search.authors, authors, file)
                updateSearch(search.dates, [datetime], file)
                updateSearch(search.types, [type], file)
            })
            resolve({posts, search})
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

const writePostToHTML = (post) => new Promise((resolve, reject) => {
    const {attributes: {permalink}, outerHTML} = post

    const distDir = path.relative('.', postsDirDist)
    const distPostPermalink = path.resolve(distDir, permalink)
    const distPostIndex = path.join(distPostPermalink, 'index.html')

    post.distDir = distPostPermalink

    writeHTML(outerHTML, distPostPermalink, distPostIndex)
        .then(() => resolve(post))
        .catch(err => console.error)
})

const copyPostFilesToDist = (post) => new Promise((resolve, reject) => {
    const {
        distDir,
        file
    } = post

    const srcDir = path.parse(file).dir
    post.srcDir = srcDir

    const options = {
        utimes: true,  // keep add time and modify time
        mode: true,    // keep file mode
        cover: true,    // cover file when exists, default is true
        
        // Don't copy over the markdown post file
        filter: (stat, filepath, filename) => {
            if (stat === 'file' && isPost(filepath)) {
                return false;
            }

            return true;
        }
    }

    const copyPostDirPromise = () => new Promise((resolve, reject) => {
        mkdirRecursive(distDir)
            .then(() => {
                copydir(srcDir, distDir, options, function(err) {
                    if(err) return reject(err);
                    resolve(post)
                })
            })
            .catch(reject)
    });

    copyPostDirPromise()
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

const embedPostInHTMLTemplate = (post, templates) => new Promise(async (resolve, reject) => {
    const {
        attributes,
        file,
        html,
        postdate,
        datetime
    } = post
    const {excerpt, permalink: relativePermalink} = attributes
    const {site, social} = settings

    // console.log({templates})
    // console.log(templates.index.base.fileDataUTF8)

    console.log(`${datetime}: /${relativePermalink}`);
    
    const permalink = `${site.baseurl}/posts/${relativePermalink}`

    const base_template = handlebars.compile(templates.index.base_template.fileDataUTF8);
    const head_template = handlebars
        .compile(templates.index.head_template.fileDataUTF8)
        (Object.assign({}, {...site}, {...attributes}, {ogtype: 'article', excerpt, permalink}));
    const nav_template = handlebars
        .compile(templates.index.nav_template.fileDataUTF8)({})
    const header_template = handlebars
        .compile(templates.index.header_template.fileDataUTF8)
        ({site});
    const main_template = handlebars
        .compile(templates.post.main_template.fileDataUTF8)
        ({post, postdate})
    const footer_template = handlebars.compile(templates.index.footer_template.fileDataUTF8)({site, social});

    const result = base_template({
        head_template,
        nav_template,
        header_template,
        main_template,
        footer_template
    });

    post.outerHTML = result;

    resolve(post)
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

            getPosts()
            .then((results) => {
                // console.log(results)

                for (const postDate in results.posts) {
                    const post = results.posts[postDate]
                    // console.log(post.body)
                    
                    const {body, file} = post

                    markdownit(body).then(html => {
                        // Attach parsed markdown as html to post object
                        post.html = html
                        embedPostInHTMLTemplate(post, templates)
                        .then((post) => {
                            writePostToHTML(post)
                                .then(copyPostFilesToDist)
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


// // WebSocket server
import {WebSocketServer} from 'ws';

// Create a WebSocket server instance
const wss = new WebSocketServer({ port: 8080 });
// Event listener for when a client connects

const connections = []
wss.on('connection', function connection(ws) {
  console.log('A new client connected');
  connections.push(ws)

  ws.on('close', function() {
    console.log('Client disconnected');
  });
});

const watchPath = path.resolve('.', settings.build.watch_dir)

chokidar.watch(watchPath).on('all', (event, path) => {
  console.log(event, path);

  build().then(() => {
    console.log('Sending RELOAD');
    connections.forEach(ws => ws.send('RELOAD'))
  })
});







// const socket = new WebSocket("ws://localhost:8080");

// // Connection opened
// socket.addEventListener("open", (event) => {
//   socket.send("Hello Server!");
// });

// // Listen for messages
// socket.addEventListener("message", (event) => {
//   console.log("Message from server ", event.data);
// });