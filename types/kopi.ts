import type { PaginatedDocs } from 'payload'
import type { InventarisKopi } from '@/payload-types'

/**
 * Tipe data kopi mengikuti types yang di-generate Payload (src/payload-types.ts).
 * Ini memastikan `payload.find({ collection: 'inventaris-kopi' })` kompatibel secara TS.
 */
export type Kopi = InventarisKopi

export type KopiResponse = PaginatedDocs<Kopi>