import React from 'react';
import Head from 'next/head';
import { ThemeProvider } from '../components/ThemeProvider';
import '../styles/globals.css';

// Main App Component dla Next.js
export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Dreamscape - AI-Powered Dream Analysis</title>
        <meta name="description" content="Advanced AI agents analyze your dreams to provide deep insights into your subconscious mind. Transform your sleep into a journey of self-discovery with our revolutionary iNFT technology." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Work Sans Font preload dla lepszej wydajności */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* SEO meta tags */}
        <meta property="og:title" content="Dreamscape - AI-Powered Dream Analysis" />
        <meta property="og:description" content="Advanced AI agents analyze your dreams to provide deep insights into your subconscious mind." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dreamscape.ai" />
        <meta property="og:image" content="/og-image.jpg" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Dreamscape - AI-Powered Dream Analysis" />
        <meta name="twitter:description" content="Advanced AI agents analyze your dreams to provide deep insights into your subconscious mind." />
        <meta name="twitter:image" content="/og-image.jpg" />
        
        {/* Theme color dla mobile browsers */}
        <meta name="theme-color" content="#8B5CF6" />
        <meta name="msapplication-TileColor" content="#8B5CF6" />
      </Head>
      
      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
} 