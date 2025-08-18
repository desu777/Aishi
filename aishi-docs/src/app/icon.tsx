/**
 * @fileoverview Favicon icon generator using Next.js App Router
 * @description Generates favicon using Aishi white logo for all browsers
 */

import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: 'transparent',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src="/logo_white.png"
          alt="Aishi Logo"
          width="32"
          height="32"
          style={{ borderRadius: '4px' }}
        />
      </div>
    ),
    {
      ...size,
    }
  )
}