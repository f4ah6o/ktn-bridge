import { Command } from 'commander';
import { build } from 'vite';
// import { kintoneBridge } from '@ktn-bridge/dev-server';

// Temporary mock until build issue is resolved
const kintoneBridge = (_options: any) => ({
  name: 'ktn-bridge',
  transform(_code: string, _id: string) {
    return null;
  }
});

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