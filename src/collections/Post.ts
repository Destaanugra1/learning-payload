import { lexicalEditor } from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const Posts: CollectionConfig = {
  slug: 'posts',

  admin: {
    group: 'Manajemen Konten',
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'category', 'isTrending', 'publishedAt'],
    description: 'Kelola semua artikel dan berita di sini.',
    livePreview: {
      url: ({ data }) => `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/blog/${data?.slug}`,
    },
  },

  timestamps: true,

  versions: {
    drafts: {
      autosave: {
        interval: 2000,
      },
    },
  },

  access: {
    read: () => true,
  },

  fields: [
    {
      type: 'tabs',
      tabs: [
        // =========================
        // TAB 1 — KONTEN
        // =========================
        {
          label: 'Konten',
          fields: [
            {
              name: 'title',
              label: 'Judul Artikel',
              type: 'text',
              required: true,
              admin: {
                placeholder: 'Masukkan judul artikel yang menarik...',
              },
            },
            {
              name: 'slug',
              label: 'URL Slug',
              type: 'text',
              required: true,
              unique: true,
              admin: {
                position: 'sidebar',
                description:
                  'Akan diisi otomatis dari judul. Contoh: tips-kopi-arabika',
              },
              hooks: {
                beforeValidate: [
                  ({ value, data }) => {
                    if (!value && data?.title) {
                      return data.title
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
              label: 'Deskripsi Singkat (Excerpt)',
              type: 'textarea',
              admin: {
                description:
                  'Deskripsi singkat artikel untuk ditampilkan di halaman depan.',
                rows: 3,
              },
            },
            {
              name: 'content',
              label: 'Isi Artikel',
              type: 'richText',
              editor: lexicalEditor(),
              required: true,
              admin: {
                description:
                  'Tulis isi artikel lengkap di sini (mendukung gambar, tabel, dll).',
              },
            },
          ],
        },

        // =========================
        // TAB 2 — MEDIA
        // =========================
        {
          label: 'Media',
          fields: [
            {
              name: 'showBanner',
              label: 'Tampilkan Banner di Detail Artikel?',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Centang untuk menampilkan gambar banner besar di halaman detail artikel.',
              },
            },
            {
              name: 'bannerImage',
              label: 'Banner / Hero Image',
              type: 'upload',
              relationTo: 'media',
              required: false,
              admin: {
                condition: (data) => data.showBanner !== false,
              },
            },
            {
              name: 'thumbnail',
              label: 'Thumbnail',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'gallery',
              label: 'Galeri',
              type: 'array',
              maxRows: 10,
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
                {
                  name: 'caption',
                  type: 'text',
                },
              ],
            },
          ],
        },
      ],
    },
    // =========================
    // SIDEBAR
    // =========================
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'tags',
      label: 'Tags',
      type: 'array',
      admin: {
        position: 'sidebar',
        description: 'Tambahkan tag untuk membantu pencarian.',
      },
      fields: [
        {
          name: 'tag',
          label: 'Tag',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'author',
      label: 'Penulis',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ req, value }) => {
            if (!value && req.user) return req.user.id
            return value
          },
        ],
      },
    },
    {
      name: 'readTime',
      label: 'Estimasi Baca (menit)',
      type: 'number',
      min: 1,
      max: 60,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'isTrending',
      label: '🔥 Tandai sebagai Trending',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'isFeatured',
      label: '⭐ Artikel Unggulan (Banner)',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Centang untuk memunculkan artikel ini di banner utama paling atas.',
      },
    },
    {
      name: 'isBreakingNews',
      label: '🚨 Breaking News',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}