import { spawn } from 'child_process'

import chalk from 'chalk'

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

	const shutdown = () => {
		console.log('Shutting down http-server...')
		httpServer.kill('SIGTERM')
		process.exit(0)
	}
	
	process.on('SIGINT', shutdown)
	process.on('SIGTERM', shutdown)
	process.on('exit', shutdown)
}
