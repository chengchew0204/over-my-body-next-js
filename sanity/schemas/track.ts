import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'track',
  title: 'Track',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: r => r.required() }),
    defineField({
      name: 'album',
      title: 'Album',
      type: 'reference',
      to: [{ type: 'release' }],
      validation: r => r.required(),
    }),
    defineField({ name: 'durationSec', title: 'Duration (sec)', type: 'number' }),
    defineField({ name: 'externalTrackId', title: 'External Track ID', type: 'string' }),
    defineField({ name: 'streamUrl', title: 'Stream URL', type: 'url' }),
    defineField({ name: 'trackNumber', title: 'Track Number', type: 'number' }),
  ],
});
