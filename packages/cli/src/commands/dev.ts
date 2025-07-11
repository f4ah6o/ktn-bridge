import { Command } from 'commander';
import { createServer } from 'vite';
import { kintoneBridge } from '@ktn-bridge/dev-server';

export function createDevCommand(): Command {
  const command = new Command('dev');
  
  command
    .description('Start development server')
    .option('-p, --port <port>', 'port to use', '3000')
    .option('--host <host>', 'host to use', 'localhost')
    .action(async (options: { port: string; host: string }) => {
      const port = parseInt(options.port, 10);
      
      try {
        const server = await createServer({
          plugins: [kintoneBridge({ target: 'development' })],
          server: {
            port,
            host: options.host,
            open: true
          }
        });
        
        await server.listen();
        
        console.log(`Development server started at http://${options.host}:${port}`);
      } catch (error) {
        console.error('Failed to start development server:', error);
        process.exit(1);
      }
    });
  
  return command;
}