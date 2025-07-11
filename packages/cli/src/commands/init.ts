import { Command } from 'commander';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

export function createInitCommand(): Command {
  const command = new Command('init');
  
  command
    .description('Initialize a new ktn-bridge project')
    .argument('<name>', 'project name')
    .option('-t, --template <template>', 'template to use', 'basic')
    .action(async (name: string, _options: { template: string }) => {
      const projectPath = join(process.cwd(), name);
      
      if (existsSync(projectPath)) {
        console.error(`Directory ${name} already exists`);
        process.exit(1);
      }
      
      console.log(`Creating new ktn-bridge project: ${name}`);
      
      mkdirSync(projectPath, { recursive: true });
      mkdirSync(join(projectPath, 'src'), { recursive: true });
      
      const packageJson = {
        name,
        version: '0.1.0',
        description: 'A ktn-bridge project',
        type: 'module',
        scripts: {
          dev: 'vite',
          build: 'vite build',
          preview: 'vite preview'
        },
        devDependencies: {
          '@ktn-bridge/dev-server': '^0.1.0',
          vite: '^5.2.0',
          typescript: '^5.4.0'
        }
      };
      
      const viteConfig = `
import { defineConfig } from 'vite';
import { kintoneBridge } from '@ktn-bridge/dev-server';

export default defineConfig({
  plugins: [kintoneBridge()],
  server: {
    port: 3000,
    open: true
  }
});`;
      
      const indexTs = `
document.addEventListener('DOMContentLoaded', (event) => {
  const page = document.querySelector('[data-page]');
  
  if (page?.dataset.page === 'record-list') {
    console.log('レコード一覧画面が表示されました');
  }
});`;
      
      const indexHtml = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ktn-bridge App</title>
</head>
<body>
  <div data-page="record-list">
    <h1>ktn-bridge Sample App</h1>
    <p>This is a sample kintone customization app.</p>
  </div>
  <script type="module" src="/src/index.ts"></script>
</body>
</html>`;
      
      writeFileSync(join(projectPath, 'package.json'), JSON.stringify(packageJson, null, 2));
      writeFileSync(join(projectPath, 'vite.config.ts'), viteConfig.trim());
      writeFileSync(join(projectPath, 'src/index.ts'), indexTs.trim());
      writeFileSync(join(projectPath, 'index.html'), indexHtml.trim());
      
      console.log(`Project ${name} created successfully!`);
      console.log(`\\nNext steps:`);
      console.log(`  cd ${name}`);
      console.log(`  pnpm install`);
      console.log(`  pnpm dev`);
    });
  
  return command;
}