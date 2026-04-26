import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
// import comp from './components/Customnav'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { InventarisKopi } from './collections/InventarisKopi'
import { Posts } from './collections/Post'
import { Categories } from './collections/Categories'
import { seoPlugin } from '@payloadcms/plugin-seo'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    // styles: {
    //   css: path.resolve(dirname, './styles/admin.css'),
    // },

    components: {
      Nav: '@/components/Customnav',
    },
  },
  collections: [Users, Media, InventarisKopi, Categories, Posts],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [
    seoPlugin({
      collections: ['posts'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => `Blog — ${doc?.title || 'Artikel'}`,
      generateDescription: ({ doc }) => doc?.description || '',
      generateURL: ({ doc }) => `http://localhost:3000/blog/${doc?.slug || ''}`,
      tabbedUI: true,
    }),
  ],
})
