import { use } from "react";
import { CollectionConfig } from 'payload'

export const InventarisKopi: CollectionConfig = {
    slug: 'inventaris-kopi',
    admin: {
        useAsTitle: 'nama_kopi',
    },
    fields: [
    {
      name: 'nama_kopi',
      type: 'text',
      required: true,
    },
    {
        name: 'name_kopi',
        label: 'Nama Kopi',
        type: 'upload',
        relationTo: 'media',
        required: true,
    },
    {
      name: 'stok_kg',
      type: 'number',
      required: true,
    },
    {
      name: 'kategori',
      type: 'select',
      options: [
        { label: 'Robusta', value: 'robusta' },
        { label: 'Arabika', value: 'arabika' },
      ]
    }
  ],
}