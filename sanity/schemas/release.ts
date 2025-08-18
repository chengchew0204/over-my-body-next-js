import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'release',
  title: 'Release (Album)',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: r => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name' }, validation: r => r.required() }),
    defineField({ name: 'artist', title: 'Artist', type: 'string', validation: r => r.required() }),
    defineField({ name: 'bandcampUrl', title: 'Bandcamp URL', type: 'url' }),
    defineField({ name: 'cover', title: 'Cover', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'externalId', title: 'External ID', type: 'string' }),
    defineField({ name: 'releaseDate', title: 'Release Date', type: 'date' }),
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Album', value: 'album' },
          { title: 'EP', value: 'ep' },
          { title: 'Single', value: 'single' },
          { title: 'Compilation', value: 'compilation' },
        ],
      },
    }),
    defineField({
      name: 'aboutHtml',
      title: 'About (HTML)',
      type: 'text',
      rows: 20,
    }),
  ],
});
