export const dynamic = 'force-dynamic'
import type React from 'react'

import { getPayload } from 'payload'
import config from '@/payload.config'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import LivePreviewListener from './LivePreviewListener'
import type { Post, Media, Category, User } from '@/payload-types'
import './detail.css'

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

function getAuthorEmail(author: number | User | null | undefined): string {
  if (!author || typeof author === 'number') return 'Admin'
  return (author as User).email ?? 'Admin'
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// ─── Lexical content renderer ────────────────────────────────────────────────

type LexicalNode = {
  type: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

function renderText(node: LexicalNode): React.ReactNode {
  let content: React.ReactNode = node.text as string

  // format bitmask: 1=bold, 2=italic, 4=strikethrough, 8=underline, 16=code, 32=subscript, 64=superscript
  if (node.format & 1) content = <strong>{content}</strong>
  if (node.format & 2) content = <em>{content}</em>
  if (node.format & 4) content = <s>{content}</s>
  if (node.format & 8) content = <u>{content}</u>
  if (node.format & 16) content = <code className="inline-code">{content}</code>

  return content
}

function renderNode(node: LexicalNode, idx: number): React.ReactNode {
  switch (node.type) {
    case 'root':
      return (
        <div key={idx} className="lexical-content">
          {node.children?.map((child: LexicalNode, i: number) => renderNode(child, i))}
        </div>
      )

    case 'paragraph':
      return (
        <p key={idx} className="lexical-p">
          {node.children?.map((child: LexicalNode, i: number) => renderNode(child, i))}
        </p>
      )

    case 'text':
      return <span key={idx}>{renderText(node)}</span>

    case 'heading': {
      const Tag = (node.tag ?? 'h2') as keyof React.JSX.IntrinsicElements
      return (
        <Tag key={idx} className={`lexical-h lexical-${node.tag}`}>
          {node.children?.map((child: LexicalNode, i: number) => renderNode(child, i))}
        </Tag>
      )
    }

    case 'list': {
      const Tag = node.listType === 'number' ? 'ol' : 'ul'
      return (
        <Tag key={idx} className={`lexical-list lexical-list--${node.listType}`}>
          {node.children?.map((child: LexicalNode, i: number) => renderNode(child, i))}
        </Tag>
      )
    }

    case 'listitem':
      return (
        <li key={idx} className="lexical-li">
          {node.children?.map((child: LexicalNode, i: number) => renderNode(child, i))}
        </li>
      )

    case 'quote':
      return (
        <blockquote key={idx} className="lexical-quote">
          {node.children?.map((child: LexicalNode, i: number) => renderNode(child, i))}
        </blockquote>
      )

    case 'code':
      return (
        <pre key={idx} className="lexical-pre">
          <code>{node.children?.map((child: LexicalNode, i: number) => renderNode(child, i))}</code>
        </pre>
      )

    case 'link':
      return (
        <a
          key={idx}
          href={node.fields?.url ?? '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="lexical-link"
        >
          {node.children?.map((child: LexicalNode, i: number) => renderNode(child, i))}
        </a>
      )

    case 'horizontalrule':
      return <hr key={idx} className="lexical-hr" />

    default:
      if (node.children) {
        return (
          <div key={idx}>
            {node.children.map((child: LexicalNode, i: number) => renderNode(child, i))}
          </div>
        )
      }
      return null
  }
}

function LexicalRenderer({ content }: { content: Post['content'] }) {
  if (!content?.root) return null
  return <>{renderNode(content.root as LexicalNode, 0)}</>
}

// ─── page ────────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'posts',
    where: {
      and: [
        { slug: { equals: slug } },
        { status: { equals: 'published' } },
      ],
    },
    limit: 1,
  })

  if (!docs.length) {
    return { title: 'Artikel Tidak Ditemukan' }
  }

  const post = docs[0] as Post
  const metaTitle = post.meta?.title || post.title
  const metaDescription = post.meta?.description || post.description || ''
  
  let imageUrl = ''
  if (post.meta?.image) {
    imageUrl = getImageUrl(post.meta.image) || ''
  } else if (post.bannerImage) {
    imageUrl = getImageUrl(post.bannerImage) || ''
  }

  return {
    title: metaTitle,
    description: metaDescription,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      images: imageUrl ? [{ url: imageUrl }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: imageUrl ? [imageUrl] : [],
    },
  }
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'posts',
    depth: 2,
    draft: true, // Allow fetching draft versions for live preview
    where: {
      and: [
        { slug: { equals: slug } },
      ],
    },
    limit: 1,
  })

  if (!docs.length) notFound()

  const post = docs[0] as Post

  const bannerUrl = getImageUrl(post.bannerImage)
  const category = getCategoryName(post.category)
  const author = getAuthorEmail(post.author)

  // Related posts (same category, excluding current)
  const catId =
    post.category && typeof post.category === 'object' ? post.category.id : post.category
  const { docs: related } = await payload.find({
    collection: 'posts',
    depth: 2,
    where: {
      and: [
        { slug: { not_equals: slug } },
        { status: { equals: 'published' } },
        ...(catId ? [{ category: { equals: catId } }] : []),
      ],
    },
    limit: 3,
    sort: '-publishedAt',
  })

  return (
    <>
      <LivePreviewListener />
      {/* NAV */}
      <nav className="blog-nav">
        <Link href="/blog" className="blog-nav__brand">☕ KopiMedia</Link>
        <Link href="/blog" className="blog-nav__back">← Kembali ke Blog</Link>
      </nav>

      {/* HERO BANNER */}
      {post.showBanner !== false && (
        <div className="detail-hero">
          {bannerUrl ? (
            <Image
              src={bannerUrl}
              alt={getImageAlt(post.bannerImage)}
              fill
              className="detail-hero__img"
              priority
            />
          ) : (
            <div className="detail-hero__placeholder">☕</div>
          )}
          <div className="detail-hero__overlay" />
        </div>
      )}

      {/* MAIN LAYOUT */}
      <div className="detail-layout">
        {/* ARTICLE */}
        <article className="detail-article">
          {/* badges */}
          <div className="detail-meta">
            {category && <span className="detail-badge detail-badge--category">{category}</span>}
            {post.isBreakingNews && <span className="detail-badge detail-badge--breaking">🚨 Breaking News</span>}
            {post.isTrending && <span className="detail-badge detail-badge--trending">🔥 Trending</span>}
          </div>

          {/* title */}
          <h1 className="detail-title">{post.title}</h1>

          {/* description/excerpt */}
          {post.description && (
            <p className="detail-description">{post.description}</p>
          )}

          {/* author row */}
          <div className="detail-author-row">
            <div className="detail-author-avatar">
              {author.charAt(0).toUpperCase()}
            </div>
            <div className="detail-author-info">
              <div className="detail-author-name">{author}</div>
              <div className="detail-author-meta">
                <span>📅 {formatDate(post.publishedAt)}</span>
                {post.readTime && <span>⏱ {post.readTime} menit baca</span>}
              </div>
            </div>
          </div>

          {/* content */}
          <LexicalRenderer content={post.content} />

          {/* tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="detail-tags">
              {post.tags.map((t) => (
                <span key={t.id} className="detail-tag">#{t.tag}</span>
              ))}
            </div>
          )}

          {/* gallery */}
          {post.gallery && post.gallery.length > 0 && (
            <div className="gallery-section">
              <h3>📸 Galeri Foto</h3>
              <div className="gallery-grid">
                {post.gallery.map((item) => {
                  const gUrl = getImageUrl(item.image)
                  return (
                    <div key={item.id} className="gallery-item">
                      {gUrl ? (
                        <Image
                          src={gUrl}
                          alt={getImageAlt(item.image)}
                          fill
                          className="gallery-img"
                        />
                      ) : (
                        <div className="related-item__placeholder">☕</div>
                      )}
                      {item.caption && (
                        <span className="gallery-caption">{item.caption}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </article>

        {/* SIDEBAR */}
        <aside className="detail-sidebar">
          {/* article stats */}
          <div className="sidebar-card">
            <div className="sidebar-card__title">Info Artikel</div>
            <div className="stats-row">
              <div className="stat-item">
                <span className="stat-item__label">Status</span>
                <span className="stat-item__value" style={{ color: '#4ade80' }}>✅ Published</span>
              </div>
              {post.readTime && (
                <div className="stat-item">
                  <span className="stat-item__label">Waktu Baca</span>
                  <span className="stat-item__value">{post.readTime} menit</span>
                </div>
              )}
              <div className="stat-item">
                <span className="stat-item__label">Kategori</span>
                <span className="stat-item__value" style={{ color: 'var(--accent)' }}>{category || '—'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-item__label">Tayang</span>
                <span className="stat-item__value">{formatDate(post.publishedAt)}</span>
              </div>
              {post.isFeatured && (
                <div className="stat-item">
                  <span className="stat-item__label">Label</span>
                  <span className="stat-item__value">⭐ Featured</span>
                </div>
              )}
            </div>
          </div>

          {/* related posts */}
          {related.length > 0 && (
            <div className="sidebar-card">
              <div className="sidebar-card__title">Artikel Terkait</div>
              <div className="related-list">
                {(related as Post[]).map((rel) => {
                  const rImg = getImageUrl(rel.thumbnail) ?? getImageUrl(rel.bannerImage)
                  return (
                    <Link key={rel.id} href={`/blog/${rel.slug}`} className="related-item">
                      <div className="related-item__img">
                        {rImg ? (
                          <Image
                            src={rImg}
                            alt={getImageAlt(rel.thumbnail ?? rel.bannerImage)}
                            fill
                          />
                        ) : (
                          <div className="related-item__placeholder">☕</div>
                        )}
                      </div>
                      <div className="related-item__text">
                        <div className="related-item__cat">{getCategoryName(rel.category)}</div>
                        <div className="related-item__title">{rel.title}</div>
                        <div className="related-item__date">{formatDate(rel.publishedAt)}</div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </aside>
      </div>
    </>
  )
}
