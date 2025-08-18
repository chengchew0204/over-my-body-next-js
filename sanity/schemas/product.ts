import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: r => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: r => r.required() }),
    defineField({ 
      name: 'coverImage', 
      title: 'Cover Image', 
      type: 'image', 
      options: { hotspot: true },
      description: 'Main product image displayed in listings'
    }),
    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      description: 'Additional product images'
    }),
    defineField({ name: 'price', title: 'Price', type: 'number', validation: r => r.min(0) }),
    defineField({ name: 'currency', title: 'Currency', type: 'string', initialValue: 'USD' }),
    defineField({ name: 'sku', title: 'SKU / External ID', type: 'string' }),
    defineField({ name: 'stock', title: 'Stock', type: 'number' }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: { list: ['draft', 'published', 'archived'] },
      initialValue: 'draft',
    }),
    defineField({
      name: 'productType',
      title: 'Product Type',
      type: 'string',
      options: { list: ['physical', 'digital'] },
      initialValue: 'physical',
    }),
    defineField({ name: 'buyUrl', title: 'Buy URL (Optional)', type: 'url' }),
    defineField({ 
      name: 'externalProductId', 
      title: 'External Product ID (Optional)', 
      type: 'string',
      description: 'Optional external reference ID for integration with other systems'
    }),
    defineField({ name: 'lzsProductId', title: 'Lemon Squeezy Product ID (Optional)', type: 'string' }),
    defineField({
      name: 'descriptionHtml',
      title: 'Description (HTML)',
      type: 'text',
      rows: 20,
    }),
    defineField({ name: 'tags', title: 'Tags', type: 'array', of: [{ type: 'string' }] }),
  ],
});
