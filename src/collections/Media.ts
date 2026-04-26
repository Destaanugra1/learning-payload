// src/collections/Media.ts
import type { CollectionConfig } from 'payload'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Manajemen Konten',
    useAsTitle: 'alt',
    defaultColumns: ['alt', 'cloudinaryUrl', 'category', 'updatedAt'],
    description: 'Kelola semua aset gambar yang diupload ke Cloudinary.',
  },
  access: {
    read: () => true,
  },
  upload: {
    disableLocalStorage: true,
    mimeTypes: ['image/*'],
    adminThumbnail: ({ doc }) =>
      typeof doc?.cloudinaryUrl === 'string' ? doc.cloudinaryUrl : null,
  },
  fields: [
    // ── ALT TEXT ──────────────────────────────────────────────────────────
    {
      name: 'alt',
      label: 'Alt Text',
      type: 'text',
      required: true,
      admin: {
        placeholder: 'Deskripsi singkat gambar (untuk aksesibilitas & SEO)...',
        description: 'Wajib diisi. Contoh: "Barista menyeduh kopi arabika di kedai"',
      },
    },

    // ── CAPTION ───────────────────────────────────────────────────────────
    {
      name: 'caption',
      label: 'Caption',
      type: 'text',
      admin: {
        placeholder: 'Keterangan gambar yang tampil di bawah foto (opsional)...',
      },
    },

    // ── KATEGORI MEDIA ────────────────────────────────────────────────────
    {
      name: 'category',
      label: 'Kategori Media',
      type: 'select',
      defaultValue: 'general',
      options: [
        { label: 'Umum', value: 'general' },
        { label: 'Banner / Hero', value: 'banner' },
        { label: 'Thumbnail Artikel', value: 'thumbnail' },
        { label: 'Galeri', value: 'gallery' },
        { label: 'OG Image (Sosmed)', value: 'og-image' },
        { label: 'Logo / Branding', value: 'branding' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Untuk memudahkan filter di library.',
      },
    },

    // ── CLOUDINARY URL (read-only, isi otomatis) ──────────────────────────
    {
      name: 'cloudinaryUrl',
      label: 'Cloudinary URL',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Diisi otomatis setelah upload berhasil.',
        position: 'sidebar',
      },
    },

    // ── CLOUDINARY PUBLIC ID (tersembunyi) ────────────────────────────────
    {
      name: 'cloudinaryPublicId',
      label: 'Cloudinary Public ID',
      type: 'text',
      admin: {
        readOnly: true,
        hidden: true,
      },
    },
  ],

  // ── HOOKS — JANGAN DIUBAH ─────────────────────────────────────────────────
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        const fileData = req.file?.data

        if (operation === 'create' && fileData) {
          try {
            const uploadResult: any = await new Promise((resolve, reject) => {
              cloudinary.uploader
                .upload_stream(
                  { folder: 'payload_uploads', resource_type: 'image' },
                  (error, result) => {
                    if (error) return reject(error)
                    resolve(result)
                  },
                )
                .end(fileData)
            })

            data.cloudinaryUrl = uploadResult.secure_url
            data.cloudinaryPublicId = uploadResult.public_id
            data.url = uploadResult.secure_url
          } catch (err) {
            console.error('Gagal upload ke Cloudinary:', err)
          }
        }
        return data
      },
    ],
    afterRead: [
      ({ doc }) => {
        if (doc.cloudinaryUrl) {
          doc.url = doc.cloudinaryUrl
        }
        return doc
      },
    ],
    afterDelete: [
      async ({ doc }) => {
        if (doc.cloudinaryPublicId) {
          try {
            await cloudinary.uploader.destroy(doc.cloudinaryPublicId)
          } catch (err) {
            console.error('Gagal hapus gambar di Cloudinary:', err)
          }
        }
      },
    ],
  },
}