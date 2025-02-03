import { spawn } from 'child_process'
import { WebSocketServer } from 'ws'

import chalk from 'chalk'
import chokidar from 'chokidar'

import settings from '../site-settings.json' with { type: 'json' }
import pages from './pages.mjs'
import posts from './posts.mjs'

const ENV = process.env.NODE_ENV
console.log(chalk.white(`Running in ${ENV} mode.`))

console.log(chalk.cyan(`Exporting Markdown "posts" to HTML...`));
await posts()

console.log(chalk.cyan(`Exporting Markdown "pages" to HTML...`));
await pages()

console.log(chalk.cyan(`Finished exporting HTML to "${settings.build.site_dir}".`));

if (ENV === 'development') {
	const httpServer = spawn('npx', ['http-server', '_site', '-c-1'], {
		stdio: 'inherit',
		shell: true
	})

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
		console.log('FOOOOOOOOOOOOO')

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

	const shutdown = () => {
		console.log('Shutting down http-server...')
		httpServer.kill('SIGTERM')
		WebSocketServer.kill('SIGTERM')

		setTimeout(() => {
			process.exit(0)
		}, 2000)
	}
	
	process.on('SIGINT', shutdown)
	process.on('SIGTERM', shutdown)
	process.on('exit', shutdown)
}

