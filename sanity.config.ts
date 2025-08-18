import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './sanity/schemas';

export default defineConfig({
  name: 'benn-studio',
  title: 'OVER MY BODY Studio',
  projectId: '3km0musr',
  dataset: 'production',
  basePath: '/studio',
  plugins: [
    structureTool(),
    visionTool()
  ],
  schema: { types: schemaTypes },
});
