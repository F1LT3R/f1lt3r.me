import { spawn } from 'child_process'

import pages from './pages.mjs'
import posts from './posts.mjs'

const httpServer = spawn('npx', ['http-server', '_site', '-c-1'], {
  stdio: 'inherit',
  shell: true
})

// await posts()
await pages()

const shutdown = () => {
	console.log('Shutting down http-server...')
	httpServer.kill('SIGTERM')
	process.exit(0)
}
  
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
process.on('exit', shutdown)