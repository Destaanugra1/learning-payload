import type { CollectionConfig } from 'payload'
import { lexicalEditor, BoldFeature, ItalicFeature, UnderlineFeature, LinkFeature, OrderedListFeature, UnorderedListFeature, StrikethroughFeature, FixedToolbarFeature } from '@payloadcms/richtext-lexical'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    group: 'Manajemen Konten',
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'updatedAt'],
    description: 'Kelola kategori untuk artikel/post.',
  },
  fields: [
    {
      name: 'name',
      label: 'Nama Kategori',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        placeholder: 'Contoh: Edukasi Kopi',
      },
    },
    {
      name: 'slug',
      label: 'Slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Akan diisi otomatis dari nama jika kosong.',
        placeholder: 'contoh: edukasi-kopi',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.name) {
              return data.name
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
            }

            return value
          },
        ],
      },
    },
    {
      name: 'description',
      label: 'Deskripsi',
      type: 'richText',
       editor: lexicalEditor({
    features: () => [
     FixedToolbarFeature(),          // toolbar tetap di atas saat scroll
      BoldFeature(),           // bold
      ItalicFeature(),         // miring
      UnderlineFeature(),      // garis bawah
      StrikethroughFeature(),  // coret
      LinkFeature(),           // link / hyperlink
      UnorderedListFeature(),  // bullet list
      OrderedListFeature(),    // numbered list
    ],
  }),
      admin: {
        description: 'Deskripsi singkat kategori (opsional).',
      },
    },
  ],
}
