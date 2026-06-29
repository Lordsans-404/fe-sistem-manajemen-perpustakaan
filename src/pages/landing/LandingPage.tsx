import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDebounce } from '@/hooks/useDebounce'
import { useBooks } from '@/hooks/useBooks'
import type { Book } from '@/types/book.types'
import { LandingNavbar } from '@/components/layout/LandingNavbar'

export function LandingPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 300)

  const { data: booksData, isLoading } = useBooks({
    search: debouncedSearch || undefined,
    page_size: 6,
  })

  const books: Book[] = booksData?.results?.slice(0, 6) || []

  return (
    <div className="min-h-screen bg-surface text-on-surface selection:bg-primary selection:text-on-primary">
      <LandingNavbar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <main className="mt-16">
        {/* ===== Hero & Quick Access ===== */}
        <section className="relative pt-3xl pb-2xl overflow-hidden">
          {/* Creative Background Blobs */}
          <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

          <div className="max-w-[1280px] mx-auto px-gutter relative z-10">
            <div className="max-w-[48rem] mb-2xl">
              <h1 className="text-h1-mobile md:text-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-tertiary to-primary bg-300% animate-gradient mb-md">
                Jelajahi Dunia Pengetahuan.
              </h1>
              <p className="text-body-lg text-secondary mb-xl">
                Akses jutaan referensi, bantuan riset dari ahlinya, dan ruang kolaborasi yang didesain khusus buat dukung kesuksesan akademikmu.
              </p>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary-container/20 rounded-md blur" />
                <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-surface-container-lowest border border-outline-variant p-2 rounded-md shadow-sm gap-2">
                  <div className="flex items-center flex-1 px-2 py-1">
                    <SearchIcon className="w-5 h-5 mr-md text-outline shrink-0" />
                    <input
                      className="flex-1 border-none outline-none bg-transparent text-body-md text-on-surface min-w-0"
                      placeholder="Cari buku, artikel, jurnal, dan banyak lagi..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <a
                    href="#catalog"
                    className="bg-primary text-on-primary px-xl py-md rounded text-label-md font-medium hover:opacity-90 transition-all text-center whitespace-nowrap"
                  >
                    Cari Katalog
                  </a>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
              {[
                { icon: '📖', cls: 'bg-secondary-container text-on-secondary-container', title: 'Perpustakaan Digital', desc: 'E-book, jurnal online, dan media streaming yang bisa diakses dari mana aja.' },
                { icon: '🧠', cls: 'bg-primary-fixed text-on-primary-fixed', title: 'Bantuan Riset', desc: 'Ngobrol sama pustakawan ahli buat dapet bantuan riset yang lebih mendalam.' },
                { icon: '🚪', cls: 'bg-tertiary-fixed text-on-tertiary-fixed', title: 'Ruang Mahasiswa', desc: 'Pesan bilik belajar pribadi atau ruang diskusi bareng teman-teman kelompokmu.' },
              ].map((card) => (
                <div
                  key={card.title}
                  className="group bg-surface-container-lowest border border-outline-variant p-lg rounded-md hover:-translate-y-2 hover:border-primary hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 cursor-pointer"
                >
                  <div className={`w-12 h-12 flex items-center justify-center rounded text-2xl mb-md ${card.cls}`}>
                    {card.icon}
                  </div>
                  <h3 className="text-h3 mb-xs">{card.title}</h3>
                  <p className="text-body-sm text-secondary">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Statistics ===== */}
        <section className="py-2xl bg-surface-container-low border-y border-outline-variant">
          <div className="max-w-[1280px] mx-auto px-gutter">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-xl text-center">
              {[
                { value: '1M+', label: 'Buku Fisik' },
                { value: '50k+', label: 'Jurnal' },
                { value: '2k+', label: 'Pengunjung Harian' },
                { value: '150+', label: 'Panduan Riset' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-h1 text-primary">{stat.value}</div>
                  <div className="text-label-sm uppercase text-secondary tracking-widest mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Koleksi Terbaru (data dari useBooks) ===== */}
        <section id="catalog" className="py-3xl scroll-mt-20">
          <div className="max-w-[1280px] mx-auto px-gutter mb-xl flex justify-between items-end">
            <div>
              <h2 className="text-h2 text-primary">Koleksi Terbaru</h2>
              <p className="text-body-md text-secondary">
                Cek koleksi terbaru yang baru aja mendarat di rak fisik dan digital kami.
              </p>
            </div>
            <Link to="/auth/register" className="flex items-center gap-xs text-label-md text-primary hover:underline">
              Lihat Katalog <span aria-hidden>→</span>
            </Link>
          </div>

          <div className="max-w-[1280px] mx-auto px-gutter">
            {isLoading ? (
              <div className="flex justify-center py-2xl">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            ) : books.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-lg">
                {books.map((book) => (
                  <div key={book.id} className="group cursor-pointer">
                    <div className="aspect-[2/3] bg-surface-variant rounded-sm overflow-hidden mb-sm border border-outline-variant group-hover:-translate-y-2 group-hover:border-primary group-hover:shadow-xl group-hover:shadow-primary/20 transition-all duration-300">
                      {book.cover_image ? (
                        <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-outline p-sm text-center">
                          <span className="text-2xl mb-1">📚</span>
                          <span className="text-label-sm uppercase tracking-widest">{book.category}</span>
                        </div>
                      )}
                    </div>
                    <h4 className="text-label-md text-on-surface line-clamp-1">{book.title}</h4>
                    <p className="text-body-sm text-secondary line-clamp-1">{book.author}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-2xl space-y-sm">
                <div className="text-4xl opacity-50">🔭</div>
                <p className="text-body-lg text-secondary">Buku nggak ditemukan.</p>
                <p className="text-body-sm text-outline">Coba masukin kata kunci lain buat nyari di katalog ya.</p>
              </div>
            )}

            {books.length > 0 && (
              <div className="flex flex-col items-center justify-center pt-xl mt-xl border-t border-outline-variant space-y-md">
                <p className="text-body-sm text-secondary">
                  Menampilkan {books.length} dari {booksData?.count || 0} hasil. Mau lihat koleksi lainnya?
                </p>
                <Link
                  to="/auth/register"
                  className="flex items-center gap-sm bg-primary text-on-primary rounded-md px-lg py-md text-label-md font-medium hover:opacity-90 transition-all"
                >
                  Daftar untuk Lihat Semua Katalog <span aria-hidden>→</span>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* ===== Layanan Perpustakaan ===== */}
        <section className="py-3xl bg-surface">
          <div className="max-w-[1280px] mx-auto px-gutter">
            <div className="text-center mb-3xl">
              <h2 className="text-h2 text-primary mb-sm">Layanan Perpustakaan</h2>
              <p className="text-body-md text-secondary max-w-[36rem] mx-auto">
                Lebih dari sekadar buku, kami punya berbagai layanan buat nemenin perjalanan akademikmu.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
              {[
                { icon: '🔄', cls: 'bg-secondary-container text-on-secondary-container', title: 'Pinjam Antar-Perpus', desc: "Kalau bukunya nggak ada di sini, bakal kami pinjamin dari perpus jejaring kami." },
                { icon: '🖨️', cls: 'bg-primary-fixed text-on-primary-fixed', title: 'Print & Scan', desc: 'Fasilitas cetak warna cepat, scanner profesional, sampai lab 3D printing.' },
                { icon: '⌨️', cls: 'bg-tertiary-fixed text-on-tertiary-fixed', title: 'Bilik Kedap Suara', desc: 'Cocok banget buat meeting online, rekaman, atau pas kamu butuh fokus maksimal.' },
                { icon: '💻', cls: 'bg-secondary-fixed text-on-secondary-fixed', title: 'Peminjaman Alat', desc: 'Tersedia laptop, tablet, kamera, sampai alat podcast yang bisa kamu pinjam.' },
              ].map((s) => (
                <div
                  key={s.title}
                  className="bg-surface-container-lowest p-xl rounded-md border border-outline-variant hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 flex flex-col items-center text-center group cursor-pointer"
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-lg text-2xl ${s.cls} group-hover:scale-110 transition-transform duration-300`}>
                    {s.icon}
                  </div>
                  <h3 className="text-h3 mb-sm">{s.title}</h3>
                  <p className="text-body-sm text-secondary">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Repository Akademik ===== */}
        <section className="py-3xl">
          <div className="max-w-[1280px] mx-auto px-gutter">
            <div className="bg-gradient-to-br from-[#1e1b4b] to-[#312f60] rounded-xl overflow-hidden flex flex-col lg:flex-row shadow-2xl relative">
              {/* Glassmorphism reflection */}
              <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
              <div className="lg:w-1/2 p-2xl text-white flex flex-col justify-center relative z-10">
                <span className="inline-block w-max px-md py-xs bg-white/10 rounded-full text-label-sm mb-lg border border-white/20">
                  Repositori Resmi
                </span>
                <h2 className="text-h1-mobile md:text-h1 text-white mb-lg">Repositori Akademik</h2>
                <p className="text-body-lg text-white/80 mb-2xl">
                  Eksplorasi ragam hasil riset kampus kita. Akses ribuan skripsi, tesis,
                  disertasi, sampai jurnal penelitian yang udah di-review ahlinya.
                </p>
                <div className="flex flex-wrap gap-md">
                  <button className="bg-white text-[#1e1b4b] px-xl py-md rounded-md text-label-md font-medium hover:opacity-90 transition-all">
                    Cari Repositori
                  </button>
                  <button className="border border-white text-white px-xl py-md rounded-md text-label-md font-medium hover:bg-white/10 transition-all">
                    Kumpul Riset
                  </button>
                </div>
              </div>
              <div className="lg:w-1/2 min-h-[300px] bg-primary/60" />
            </div>
          </div>
        </section>

        {/* ===== Jam Operasional & FAQ ===== */}
        <section id="hours" className="py-3xl bg-surface-container-low scroll-mt-20">
          <div className="max-w-[1280px] mx-auto px-gutter grid grid-cols-1 lg:grid-cols-12 gap-3xl">
            <div className="lg:col-span-5">
              <h2 className="text-h2 text-primary mb-xl">Jam Operasional</h2>
              <div className="space-y-md">
                {[
                  { day: 'Hari Biasa', note: 'Senin - Jumat', time: '07:30 — 22:00', open: true },
                  { day: 'Sabtu', note: 'Akses terbatas', time: '09:00 — 18:00' },
                  { day: 'Minggu', note: 'Cuma Ruang Baca', time: 'Tutup', dim: true },
                ].map((row) => (
                  <div
                    key={row.day}
                    className={`flex justify-between items-center p-lg bg-surface-container-lowest border border-outline-variant rounded-md ${row.dim ? 'opacity-60' : ''}`}
                  >
                    <div>
                      <h4 className="text-label-md text-on-surface">{row.day}</h4>
                      <p className="text-body-sm text-secondary">{row.note}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-h3 text-primary">{row.time}</div>
                      {row.open && (
                        <span className="inline-flex items-center gap-xs text-label-sm text-green-600">
                          <span className="w-2 h-2 rounded-full bg-green-600" /> Buka
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7">
              <h2 className="text-h2 text-primary mb-xl">Pertanyaan Umum (FAQ)</h2>
              <div className="space-y-sm">
                {[
                  { q: 'Gimana sih cara pinjam buku?', a: 'Tinggal datang ke meja sirkulasi bawa Kartu Tanda Mahasiswa (KTM) atau pakai mesin peminjaman mandiri. Batas waktu pinjam standar itu 21 hari ya.' },
                  { q: 'Bisa perpanjang pinjaman buku secara online nggak?', a: "Bisa banget! Cukup masuk ke Akun Perpus-mu, buka menu 'Pinjamanku' terus klik 'Perpanjang'. Kamu bisa perpanjang sampai dua kali, asal bukunya lagi nggak diantre orang lain." },
                  { q: 'Ada ruang belajar privat yang bisa dipakai?', a: 'Ada dong! Kamu bisa booking ruangannya maksimal H-2 lewat Sistem Reservasi Ruangan online.' },
                  { q: 'Gimana cara akses jurnal kalau lagi di luar kampus?', a: 'Gampang, pakai aja VPN Universitas atau login via portal kampus waktu buka web jurnalnya.' },
                ].map((item, i) => (
                  <details key={item.q} open={i === 0} className="group border border-outline-variant rounded-md bg-surface-container-lowest overflow-hidden">
                    <summary className="flex justify-between items-center p-lg cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                      <span className="text-label-md text-on-surface font-medium pr-md">{item.q}</span>
                      <svg
                        className="w-5 h-5 text-primary group-open:rotate-180 transition-transform shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-lg pb-lg text-body-md text-secondary">{item.a}</div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ===== Footer ===== */}
      <footer className="bg-surface-container-low border-t border-outline-variant mt-3xl">
        <div className="max-w-[1280px] mx-auto px-gutter py-xl grid grid-cols-1 md:grid-cols-4 gap-lg">
          <div>
            <span className="text-h3 font-bold text-primary block mb-md">Perpus Kampus</span>
            <p className="text-body-sm text-secondary">
              Nemenin belajarmu, dukung risetmu, dan jaga warisan akademik bareng-bareng.
            </p>
          </div>
          <FooterCol title="Navigasi" links={['Cari Katalog', 'Database A-Z', 'Akun Perpus', 'Panduan Riset']} />
          <FooterCol title="Informasi Tambahan" links={['Hubungi Kami', 'Kebijakan Privasi', 'Aksesibilitas', 'Peta Situs']} />
          <div>
            <h4 className="text-label-md mb-lg">Buletin Info</h4>
            <p className="text-body-sm text-secondary mb-md">Update info mingguan soal koleksi baru & acara seru.</p>
            <div className="flex">
              <input
                className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-l-md px-md py-sm text-body-sm outline-none focus:ring-1 focus:ring-primary"
                placeholder="Email kamu"
                type="email"
              />
              <button className="bg-primary text-on-primary px-md rounded-r-md hover:opacity-90 transition-opacity">→</button>
            </div>
          </div>
          <div className="md:col-span-4 border-t border-outline-variant pt-lg text-center">
            <p className="text-body-sm text-secondary">© 2026 Perpustakaan Kampus. Hak Cipta Dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="text-label-md mb-lg">{title}</h4>
      <ul className="space-y-sm">
        {links.map((l) => (
          <li key={l}>
            <a className="text-body-sm text-secondary hover:text-primary transition-all" href="#">{l}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M21 21L15 15M17 10C17 13.87 13.87 17 10 17C6.13 17 3 13.87 3 10C3 6.13 6.13 3 10 3C13.87 3 17 6.13 17 10Z"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  )
}