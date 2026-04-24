import { getPayload } from "payload";
import config from "@/payload.config";
import Image from "next/image";

export default async function KopiPage() {
    const payload = await getPayload({ config });

    const kopiData = await payload.find({
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
            <div className="relative w-full aspect-[4/3] overflow-hidden">
              {kopi.name_kopi?.url ? (
                <Image
                  src={kopi.name_kopi.url}
                  alt={kopi.name_kopi.alt || kopi.nama_kopi}
                  fill
                  className="object-cover group-hover:scale-105 transition duration-300"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
                  No Image
                </div>
              )}
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