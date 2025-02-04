import { spawn } from 'child_process'
import { WebSocketServer } from 'ws'
import path from 'path'

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
        if (!watchReady) return
        
        if (Date.now() - start > 2000) {
            console.log(chalk.blue('WATCH: READY'));
            initialWait = true;
        }

        if (!initialWait) {
            return
        }

		const changedRelPath = path.relative('.', updatePath)

        console.log(chalk.magenta(`${event.toLocaleUpperCase()}: ${changedRelPath}`));

		const refreshConnections = () => {
			for (const uuid in connections) {
				const ws = connections[uuid]
				console.log(chalk.blue(`WATCH: Sending RELOAD to Browser > ${ws.id}`));
				ws.send('RELOAD')

				setTimeout(() => {
					ws.close()
				}, 1000)
			} 
		}

		;(async function() {
			// Don't specify updatePath when changing templates,
			// because we need to rebuild everything from scratch.
			if (updatePath.includes(settings.build.watch_template_dir)) {
				updatePath = null
				console.log(chalk.blue(`WATCH: Templates changed. Rebuilding all posts and pages.`));
			}

			await posts(updatePath)
				.then(pages(updatePath))
				.then(refreshConnections)
				.catch(error => console.error)
		})()
    })

	const shutdown = () => {
		console.log('Shutting down http-server...')
		httpServer.kill('SIGTERM')

		wss.clients.forEach((client) => {
			client.close();
		});
	
		wss.close(() => {
			console.log('WebSocket server shut down');
		});

		setTimeout(() => {
			process.exit(0)
		}, 2000)
	}
	
	process.on('SIGINT', shutdown)
	process.on('SIGTERM', shutdown)
	process.on('exit', shutdown)
}

