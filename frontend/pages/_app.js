import React from 'react';
import Head from 'next/head';
import { ThemeProvider } from '../components/ThemeProvider';
import '../styles/globals.css';

// Main App Component dla Next.js
export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Dreamscape - Your Personal Evolving AI Dream Agent (iNFT)</title>
        <meta name="description" content="Meet the world's first intelligent NFT (iNFT). Dreamscape provides a personal AI agent that learns and evolves with every dream. Its memory is secured forever on the 0G blockchain, offering unparalleled privacy, data sovereignty, and deep subconscious insights. Start your journey of self-discovery today." />
        <meta name="keywords" content="iNFT, intelligent NFT, AI agent, dream analysis, dream interpretation, decentralized AI, 0G blockchain, web3, crypto, evolving NFT, on-chain memory, subconscious, psychology, self-discovery" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Favicon Setup */}
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        
        {/* Work Sans Font preload dla lepszej wydajności */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* SEO meta tags */}
        <meta property="og:title" content="Dreamscape - The World's First Evolving iNFT Agent" />
        <meta property="og:description" content="Your personal AI agent that learns from your dreams, secured on the 0G blockchain. Experience the future of personalized AI and data sovereignty." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dreamscape.ai" />
        <meta property="og:image" content="https://dreamscape.ai/logo.png" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Dreamscape - The World's First Evolving iNFT Agent" />
        <meta name="twitter:description" content="Your personal AI agent that learns from your dreams, secured on the 0G blockchain. Experience the future of personalized AI and data sovereignty." />
        <meta name="twitter:image" content="https://dreamscape.ai/logo.png" />
        
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