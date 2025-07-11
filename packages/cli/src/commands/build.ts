import { Command } from 'commander';
import { build } from 'vite';
import { kintoneBridge } from '@ktn-bridge/dev-server';

export function createBuildCommand(): Command {
  const command = new Command('build');
  
  command
    .description('Build for production')
    .option('-o, --outDir <dir>', 'output directory', 'dist')
    .action(async (options: { outDir: string }) => {
      try {
        await build({
          plugins: [kintoneBridge({ target: 'production' })],
          build: {
            outDir: options.outDir,
            lib: {
              entry: 'src/index.ts',
              name: 'KintoneCustomization',
              fileName: 'customize',
              formats: ['iife']
            },
            rollupOptions: {
              external: ['kintone'],
              output: {
                globals: {
                  kintone: 'kintone'
                }
              }
            }
          }
        });
        
        console.log(`Build completed! Output: ${options.outDir}`);
      } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
      }
    });
  
  return command;
}