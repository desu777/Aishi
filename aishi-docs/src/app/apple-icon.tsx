/**
 * @fileoverview Apple touch icon generator using Next.js App Router
 * @description Generates Apple touch icon using Aishi white logo for iOS devices
 */

import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: '#8B5CF6',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '20px',
        }}
      >
        <img
          src="/logo_white.png"
          alt="Aishi Logo"
          width="140"
          height="140"
          style={{ borderRadius: '12px' }}
        />
      </div>
    ),
    {
      ...size,
    }
  )
}