'use client'

import { Route, useRouteStore } from '@/store/useRouteStore'
import { motion, useReducedMotion } from 'framer-motion'
import { ComponentType, useEffect, useState } from 'react'
import { BsSpeakerFill } from 'react-icons/bs'
import { FaCompactDisc, FaGlobe, FaMusic, FaPlug, FaUser } from 'react-icons/fa'
import { FiMoon, FiSun } from 'react-icons/fi'

interface Props {
  handleRouteChange: (route: Route) => void
  environmentMode: 'day' | 'night'
  toggleEnvironment: () => void
}

const allRoutes: Route[] = ['music', 'artist', 'beats', 'albums', 'connect', 'xaeneptune']

const routeIcons: Partial<Record<Route, ComponentType<{ className?: string }>>> = {
  music: FaMusic,
  artist: FaUser,
  beats: BsSpeakerFill,
  albums: FaCompactDisc,
  connect: FaPlug,
  xaeneptune: FaGlobe,
}

const routeLabels: Partial<Record<Route, string>> = {
  music: 'signal',
  artist: 'artists',
  beats: 'vault',
  albums: 'archive',
  connect: 'portal',
  xaeneptune: 'dossier',
}

const desktopRouteLabels: Partial<Record<Route, string>> = {
  music: 'Spotify Signal',
  artist: 'Artist Constellation',
  beats: 'Beat Vault',
  albums: 'Release Archive',
  connect: 'Collab Portal',
  xaeneptune: 'Producer Dossier',
}

export default function NavigationOverlay({
  handleRouteChange,
  environmentMode,
  toggleEnvironment,
}: Props) {
  const { activeRoute, hoveredRoute, setHoveredRoute } = useRouteStore()
  const [isMobile, setIsMobile] = useState(false)
  const [ready, setReady] = useState(false)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    const timer = window.setTimeout(() => setReady(true), 180)

    return () => {
      window.removeEventListener('resize', checkMobile)
      window.clearTimeout(timer)
    }
  }, [])

  if (!ready) return null

  return (
    <motion.div
      className="fixed z-[9999] w-full px-2"
      style={{
        bottom: isMobile ? 'calc(env(safe-area-inset-bottom,0px) + 12px)' : '18px',
        paddingLeft: 'max(env(safe-area-inset-left), 0.5rem)',
        paddingRight: 'max(env(safe-area-inset-right), 0.5rem)',
      }}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0.18 : 0.35 }}
    >
      <div className="mx-auto w-full max-w-[700px] rounded-lg border border-white/14 bg-black/68 p-2 shadow-[0_18px_70px_rgba(0,0,0,.42)] backdrop-blur-xl md:w-fit md:max-w-none md:rounded-full md:p-2">
        {isMobile ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {allRoutes.map((route) => {
              const Icon = routeIcons[route]!
              const active = activeRoute === route
              const hovered = hoveredRoute === route
              return (
                <button
                  key={route}
                  onClick={() => handleRouteChange(route)}
                  onMouseEnter={() => setHoveredRoute(route)}
                  onMouseLeave={() => setHoveredRoute(undefined)}
                  className={`flex min-h-[52px] min-w-0 flex-col items-center justify-center gap-1 rounded-md border px-2 py-2 text-[9px] font-semibold uppercase tracking-[0.11em] transition ${
                    active || hovered
                      ? 'border-ah-magenta/60 bg-ah-magenta/14 text-ah-magenta'
                      : 'border-white/14 bg-white/[0.03] text-ah-soft hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{routeLabels[route] || route}</span>
                </button>
              )
            })}

            <button
              onClick={toggleEnvironment}
              className={`col-span-3 mt-1 flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] transition sm:col-span-4 ${
                environmentMode === 'night'
                  ? 'border-ah-electric/40 bg-ah-electric/14 text-ah-electric'
                  : 'border-ah-red/40 bg-ah-red/14 text-ah-red'
              }`}
            >
              {environmentMode === 'night' ? (
                <>
                  <FiSun className="h-3.5 w-3.5" />
                  Day Mode
                </>
              ) : (
                <>
                  <FiMoon className="h-3.5 w-3.5" />
                  Night Mode
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="flex max-w-[90vw] items-center gap-2 overflow-x-auto">
            {allRoutes.map((route) => {
              const Icon = routeIcons[route]!
              const active = activeRoute === route
              const hovered = hoveredRoute === route
              return (
                <button
                  key={route}
                  onClick={() => handleRouteChange(route)}
                  onMouseEnter={() => setHoveredRoute(route)}
                  onMouseLeave={() => setHoveredRoute(undefined)}
                  className={`flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] transition ${
                    active || hovered
                      ? 'border-ah-magenta/65 bg-ah-magenta/14 text-ah-magenta'
                      : 'border-white/14 bg-white/[0.02] text-ah-soft hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{desktopRouteLabels[route] || route}</span>
                </button>
              )
            })}

            <button
              onClick={toggleEnvironment}
              className={`ml-1 flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] transition ${
                environmentMode === 'night'
                  ? 'border-ah-electric/40 bg-ah-electric/12 text-ah-electric'
                  : 'border-ah-red/40 bg-ah-red/12 text-ah-red'
              }`}
            >
              {environmentMode === 'night' ? (
                <>
                  <FiSun className="h-4 w-4" />
                  Day
                </>
              ) : (
                <>
                  <FiMoon className="h-4 w-4" />
                  Night
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
