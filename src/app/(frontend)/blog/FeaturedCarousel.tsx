'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Post, Media, Category } from '@/payload-types'

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

export default function FeaturedCarousel({ posts }: { posts: Post[] }) {
  const [currentIdx, setCurrentIdx] = useState(0)

  useEffect(() => {
    if (posts.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % posts.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [posts.length])

  if (!posts || posts.length === 0) return null

  return (
    <div className="featured-carousel">
      <div 
        className="featured-carousel__track"
        style={{ transform: `translateX(-${currentIdx * 100}%)` }}
      >
        {posts.map((post) => {
          const imgUrl = getImageUrl(post.bannerImage) ?? getImageUrl(post.thumbnail)
          const category = getCategoryName(post.category)

          return (
            <Link key={post.id} href={`/blog/${post.slug}`} className="featured-hero featured-carousel__slide">
              <div className="featured-hero__image-wrap">
                {imgUrl ? (
                  <Image
                    src={imgUrl}
                    alt={getImageAlt(post.bannerImage)}
                    fill
                    className="featured-hero__img"
                    priority
                  />
                ) : (
                  <div className="featured-hero__placeholder" />
                )}
                <div className="featured-hero__overlay" />
              </div>

              <div className="featured-hero__content">
                <div className="featured-hero__badges">
                  <span className="badge badge--featured">⭐ Featured</span>
                  {post.isBreakingNews && <span className="badge badge--breaking">🚨 Breaking</span>}
                  {post.isTrending && <span className="badge badge--trending">🔥 Trending</span>}
                  {category && <span className="badge badge--category">{category}</span>}
                </div>

                <h2 className="featured-hero__title">{post.title}</h2>

                {post.description && (
                  <p className="featured-hero__desc">{post.description}</p>
                )}

                <div className="featured-hero__meta">
                  <span className="meta-dot">📅 {formatDate(post.publishedAt)}</span>
                  {post.readTime && <span className="meta-dot">⏱ {post.readTime} menit baca</span>}
                </div>

                <span className="featured-hero__cta">Baca Selengkapnya →</span>
              </div>
            </Link>
          )
        })}
      </div>

      {posts.length > 1 && (
        <div className="featured-carousel__nav">
          {posts.map((_, idx) => (
            <button
              key={idx}
              className={`featured-carousel__dot ${idx === currentIdx ? 'active' : ''}`}
              onClick={() => setCurrentIdx(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
