'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavChild {
  label: string
  href: string
  icon?: string
}

interface NavItemProps {
  label: string
  icon: React.ReactNode
  children: NavChild[]
  defaultOpen?: boolean
}

// ─── Icons (inline SVG agar tidak perlu install library) ──────────────────────

const IconNews = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
    <path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/>
  </svg>
)

const IconMedia = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
    <line x1="7" y1="2" x2="7" y2="22"/>
    <line x1="17" y1="2" x2="17" y2="22"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <line x1="2" y1="7" x2="7" y2="7"/>
    <line x1="2" y1="17" x2="7" y2="17"/>
    <line x1="17" y1="17" x2="22" y2="17"/>
    <line x1="17" y1="7" x2="22" y2="7"/>
  </svg>
)

const IconChevron = ({ open }: { open: boolean }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
      transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

// ─── NavItem ──────────────────────────────────────────────────────────────────

const NavItem: React.FC<NavItemProps> = ({ label, icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen)
  const pathname = usePathname()

  const isAnyChildActive = children.some(child => pathname?.startsWith(child.href))

  return (
    <div style={{ marginBottom: '4px' }}>
      {/* ── Trigger button ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '9px 12px',
          background: isAnyChildActive
            ? 'rgba(134, 152, 70, 0.15)'
            : isOpen
              ? 'rgba(255,255,255,0.05)'
              : 'transparent',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          color: isAnyChildActive ? '#a8bb5e' : '#c9c9c0',
          transition: 'all 0.18s ease',
          textAlign: 'left',
        }}
        onMouseEnter={e => {
          if (!isAnyChildActive) {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'
            ;(e.currentTarget as HTMLButtonElement).style.color = '#e8e8de'
          }
        }}
        onMouseLeave={e => {
          if (!isAnyChildActive) {
            (e.currentTarget as HTMLButtonElement).style.background = isOpen ? 'rgba(255,255,255,0.05)' : 'transparent'
            ;(e.currentTarget as HTMLButtonElement).style.color = '#c9c9c0'
          }
        }}
      >
        {/* icon */}
        <span style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '28px',
          height: '28px',
          borderRadius: '6px',
          background: isAnyChildActive ? 'rgba(134, 152, 70, 0.2)' : 'rgba(255,255,255,0.06)',
          color: isAnyChildActive ? '#a8bb5e' : '#9b9b92',
          flexShrink: 0,
          transition: 'all 0.18s ease',
        }}>
          {icon}
        </span>

        {/* label */}
        <span style={{
          flex: 1,
          fontSize: '13px',
          fontWeight: 500,
          letterSpacing: '0.01em',
        }}>
          {label}
        </span>

        {/* chevron */}
        <span style={{ color: '#6b6b63', flexShrink: 0 }}>
          <IconChevron open={isOpen} />
        </span>
      </button>

      {/* ── Dropdown children ── */}
      <div style={{
        overflow: 'hidden',
        maxHeight: isOpen ? `${children.length * 48}px` : '0px',
        transition: 'max-height 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: isOpen ? 1 : 0,
      }}>
        <div style={{
          paddingLeft: '16px',
          paddingTop: '4px',
          paddingBottom: '4px',
          marginLeft: '14px',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
        }}>
          {children.map((child) => {
            const isActive = pathname?.startsWith(child.href)
            return (
              <Link
                key={child.href}
                href={child.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  color: isActive ? '#a8bb5e' : '#9b9b92',
                  background: isActive ? 'rgba(134, 152, 70, 0.12)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  marginBottom: '2px',
                  fontWeight: isActive ? 500 : 400,
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.05)'
                    ;(e.currentTarget as HTMLAnchorElement).style.color = '#e8e8de'
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'
                    ;(e.currentTarget as HTMLAnchorElement).style.color = '#9b9b92'
                  }
                }}
              >
                {/* dot indicator */}
                <span style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: isActive ? '#a8bb5e' : 'rgba(255,255,255,0.2)',
                  flexShrink: 0,
                  transition: 'background 0.15s ease',
                }} />
                {child.label}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Divider ──────────────────────────────────────────────────────────────────

const Divider = ({ label }: { label?: string }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: '14px 4px 10px',
  }}>
    {label && (
      <span style={{
        fontSize: '10px',
        fontWeight: 600,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: '#5a5a52',
        whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
    )}
    <div style={{
      flex: 1,
      height: '1px',
      background: 'rgba(255,255,255,0.07)',
    }} />
  </div>
)

// ─── Main Sidebar ─────────────────────────────────────────────────────────────

export default function CustomNav() {
  return (
    <nav style={{
      width: '220px',
      minHeight: '100vh',
      background: '#1a1a16',
      borderRight: '1px solid rgba(255,255,255,0.07)',
      padding: '20px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '0',
      boxSizing: 'border-box',
    }}>

      {/* ── Logo / Brand area ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '4px 8px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        marginBottom: '16px',
      }}>
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '7px',
          background: 'linear-gradient(135deg, #7a8f3e 0%, #4a5828 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: 700,
          color: '#e8edcc',
          flexShrink: 0,
        }}>
          K
        </div>
        <div>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#e8e8de', lineHeight: 1.2 }}>
            Kopis Admin
          </p>
          <p style={{ margin: 0, fontSize: '10.5px', color: '#5a5a52', lineHeight: 1.2 }}>
            Content Panel
          </p>
        </div>
      </div>

      {/* ── Navigation groups ── */}
      <div style={{ flex: 1 }}>
        <Divider label="Konten" />

        <NavItem
          label="Portal Berita"
          defaultOpen
          icon={<IconNews />}
          children={[
            { label: 'Daftar Berita', href: '/admin/collections/posts' },
            { label: 'Kategori', href: '/admin/collections/categories' },
          ]}
        />

        <Divider label="Aset" />

        <NavItem
          label="Media & Files"
          icon={<IconMedia />}
          children={[
            { label: 'Cloudinary Library', href: '/admin/collections/media' },
          ]}
        />
      </div>

      {/* ── Footer hint ── */}
      <div style={{
        padding: '12px 8px 4px',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        marginTop: '16px',
      }}>
        <p style={{
          margin: 0,
          fontSize: '11px',
          color: '#3d3d37',
          letterSpacing: '0.02em',
        }}>
          Payload CMS · v3
        </p>
      </div>
    </nav>
  )
}