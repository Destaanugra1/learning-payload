// src/collections/Media.ts
import type { CollectionConfig } from 'payload'
import { v2 as cloudinary } from 'cloudinary'

// 1. Inisialisasi konfigurasi Cloudinary di luar object
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true, // Ini adalah arrow function untuk akses publik
  },
  upload: {
    disableLocalStorage: true, // Mencegah gambar tersimpan di folder lokal Next.js
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    // Field untuk menyimpan data dari Cloudinary
    {
      name: 'cloudinaryUrl',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'cloudinaryPublicId',
      type: 'text',
      admin: { readOnly: true, hidden: true }, // Sembunyikan ID ini dari panel admin
    },
  ],
  hooks: {
    // 2. Hook untuk upload ke Cloudinary sebelum data tersimpan di Neon DB
    beforeChange: [
      async ({ data, req, operation }) => {
        // 1. Ekstrak data file dengan "Optional Chaining" (?.)
        // Jika req.file tidak ada, fileData otomatis bernilai undefined tanpa bikin error
        const fileData = req.file?.data;

        // 2. TypeScript sekarang tenang, karena kita cek dulu fileData-nya
        if (operation === 'create' && fileData) {
          try {
            const uploadResult: any = await new Promise((resolve, reject) => {
              cloudinary.uploader.upload_stream(
                { folder: 'payload_uploads', resource_type: 'image' },
                (error, result) => {
                  if (error) return reject(error);
                  resolve(result);
                }
              // 3. Masukkan fileData yang sudah dipastikan ada isinya
              ).end(fileData); 
            });

            // Timpa data Payload dengan hasil dari Cloudinary
            data.cloudinaryUrl = uploadResult.secure_url;
            data.cloudinaryPublicId = uploadResult.public_id;
            
            // Wajib diisi agar preview gambar di admin panel Payload bisa muncul
            data.url = uploadResult.secure_url; 

          } catch (err) {
            console.error('Gagal upload ke Cloudinary:', err);
          }
        }
        return data; // Kembalikan data yang sudah dimodifikasi
      },
    ],
    afterRead: [
      ({ doc }) => {
        if (doc.cloudinaryUrl) {
          doc.url = doc.cloudinaryUrl; // Timpa url default bawaan Payload
        }
        return doc;
      }
    ],
    // 3. Hook untuk menghapus gambar dari Cloudinary jika data dihapus di Admin
    afterDelete: [
      async ({ doc }) => {
        if (doc.cloudinaryPublicId) {
          try {
            await cloudinary.uploader.destroy(doc.cloudinaryPublicId);
          } catch (err) {
            console.error('Gagal hapus gambar di Cloudinary:', err);
          }
        }
      },
    ],
  },
}