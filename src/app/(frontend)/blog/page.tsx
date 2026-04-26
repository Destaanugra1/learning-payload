export const dynamic = 'force-dynamic'

import { getPayload } from 'payload'
import config from '@/payload.config'
import Image from 'next/image'
import Link from 'next/link'
import type { Post, Media, Category } from '@/payload-types'
import FeaturedCarousel from './FeaturedCarousel'
import './blog.css'

// ─── helpers ────────────────────────────────────────────────────────────────

function getImageUrl(media: number | Media | null | undefined): string | null {
  if (!media || typeof media === 'number') return null
  return (media as Media).cloudinaryUrl ?? (media as Media).url ?? null
}

function getImageAlt(media: number | Media | null | undefined): string {
  if (!media || typeof media === 'number') return ''
  return (media as Media).alt ?? ''
}

function getCategoryName(cat: number | Category | null | undefined): string {
  if (!cat || typeof cat === 'number') return ''
  return (cat as Category).name ?? ''
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// ─── sub-components ──────────────────────────────────────────────────────────

function PostCard({ post }: { post: Post }) {
  const imgUrl = getImageUrl(post.thumbnail) ?? getImageUrl(post.bannerImage)
  const category = getCategoryName(post.category)

  return (
    <Link href={`/blog/${post.slug}`} className="post-card">
      <div className="post-card__image-wrap">
        {imgUrl ? (
          <Image
            src={imgUrl}
            alt={getImageAlt(post.thumbnail ?? post.bannerImage)}
            fill
            className="post-card__img"
          />
        ) : (
          <div className="post-card__placeholder">
            <span>☕</span>
          </div>
        )}

        <div className="post-card__badges">
          {post.isBreakingNews && <span className="badge badge--breaking">🚨</span>}
          {post.isTrending && <span className="badge badge--trending">🔥</span>}
        </div>
      </div>

      <div className="post-card__body">
        {category && <span className="post-card__category">{category}</span>}
        <h3 className="post-card__title">{post.title}</h3>
        {post.description && (
          <p className="post-card__desc">{post.description}</p>
        )}
        <div className="post-card__meta">
          <span>📅 {formatDate(post.publishedAt)}</span>
          {post.readTime && <span>⏱ {post.readTime} mnt</span>}
        </div>
      </div>
    </Link>
  )
}

function TrendingCard({ post, index }: { post: Post; index: number }) {
  const imgUrl = getImageUrl(post.thumbnail) ?? getImageUrl(post.bannerImage)

  return (
    <Link href={`/blog/${post.slug}`} className="trending-card">
      <span className="trending-card__num">0{index + 1}</span>
      <div className="trending-card__img-wrap">
        {imgUrl ? (
          <Image
            src={imgUrl}
            alt={getImageAlt(post.thumbnail ?? post.bannerImage)}
            fill
            className="trending-card__img"
          />
        ) : (
          <div className="trending-card__placeholder">☕</div>
        )}
      </div>
      <div className="trending-card__text">
        <span className="trending-card__category">{getCategoryName(post.category)}</span>
        <p className="trending-card__title">{post.title}</p>
        <span className="trending-card__date">{formatDate(post.publishedAt)}</span>
      </div>
    </Link>
  )
}

// ─── page ────────────────────────────────────────────────────────────────────

export default async function BlogPage() {
  const payload = await getPayload({ config })

  const { docs: posts } = await payload.find({
    collection: 'posts',
    depth: 2,
    where: { status: { equals: 'published' } },
    sort: '-publishedAt',
    limit: 20,
  })

  const allPosts = posts as Post[]
  
  const featuredPosts = allPosts.filter((p) => p.isFeatured).slice(0, 5)
  if (featuredPosts.length === 0 && allPosts.length > 0) {
    featuredPosts.push(allPosts[0]) // Fallback to latest post if none featured
  }
  
  const featuredIds = featuredPosts.map(p => p.id)
  
  const trending = allPosts.filter((p) => p.isTrending).slice(0, 4)
  const latestRaw = allPosts.filter((p) => !featuredIds.includes(p.id))
  const latest = latestRaw.slice(0, 9)

  return (
    <>

      <div className="blog-page">
        {/* NAV */}
        <nav className="blog-nav">
          <Link href="/blog" className="blog-nav__brand">☕ KopiMedia</Link>
          <div className="blog-nav__links">
            <Link href="/blog">Beranda</Link>
            <Link href="/blog">Artikel</Link>
            <Link href="/blog">Trending</Link>
          </div>
        </nav>

        <div className="container">
          {allPosts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">📭</div>
              <h3>Belum ada artikel</h3>
              <p>Artikel yang dipublikasikan akan muncul di sini.</p>
            </div>
          ) : (
            <>
              {/* FEATURED CAROUSEL */}
              {featuredPosts.length > 0 && <FeaturedCarousel posts={featuredPosts} />}

              {/* TRENDING */}
              {trending.length > 0 && (
                <section>
                  <div className="section-head">
                    <h2>🔥 Trending Sekarang</h2>
                    <div className="section-line" />
                  </div>
                  <div className="trending-strip">
                    {trending.map((post, i) => (
                      <TrendingCard key={post.id} post={post} index={i} />
                    ))}
                  </div>
                </section>
              )}

              {/* LATEST ARTICLES */}
              {latest.length > 0 && (
                <section>
                  <div className="section-head">
                    <h2>📰 Artikel Terbaru</h2>
                    <div className="section-line" />
                  </div>
                  <div className="post-grid">
                    {latest.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
