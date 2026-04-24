import { getPayload } from "payload";
import config from "@/payload.config";
import Image from "next/image";
import { KopiResponse } from "types/kopi";

export default async function KopiPage() {
    const payload = await getPayload({ config });

    const kopiData: KopiResponse = await payload.find({
        collection: 'inventaris-kopi',
        depth: 1, // Atur depth sesuai kebutuhan untuk mendapatkan data relasi
    })

    return (
        <main className="p-10 bg-zinc-950 min-h-screen text-white">
            <h1 className="text-3xl font-bold mb-8">
                Daftar Inventaris Kopi
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {kopiData.docs.map((kopi) => (
                    <div
                        key={kopi.id}
                        className="group bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 shadow-lg hover:shadow-2xl transition duration-300"
                    >
                        {/* IMAGE */}
                        <div className="relative w-full aspect-4/3 overflow-hidden">
                            {(() => {
                                const media =
                                    kopi.name_kopi && typeof kopi.name_kopi === 'object' ? kopi.name_kopi : null

                                return media?.url ? (
                                    <Image
                                        src={media.url}
                                        alt={media.alt || kopi.nama_kopi}
                                        fill
                                        className="object-cover group-hover:scale-105 transition duration-300"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                        priority
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
                                        No Image
                                    </div>
                                )
                            })()}
                        </div>

                        {/* CONTENT */}
                        <div className="p-5 space-y-2">
                            <span className="inline-block text-xs font-medium px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded-md">
                                {kopi.kategori}
                            </span>

                            <h2 className="text-lg font-semibold leading-tight">
                                {kopi.nama_kopi}
                            </h2>

                            <p className="text-sm text-zinc-400">
                                Stok:{" "}
                                <span className="text-white font-medium">
                                    {kopi.stok_kg} kg
                                </span>
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}