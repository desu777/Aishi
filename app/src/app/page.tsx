'use client';

import Layout from '../components/layout/Layout';
import { useTheme } from '../contexts/ThemeContext';
import { Mic, Archive, BrainCircuit, TrendingUp, Repeat, Lightbulb } from 'lucide-react';
import { ReactNode, useState, useEffect } from 'react';
import Carousel from '../components/ui/Carousel';

export default function Home() {
  const { theme, debugLog } = useTheme();
  
  // Debug log na start
  debugLog('Home page loaded');

  // DID U KNOW? - Fascinating Dream Stories (15 rotating versions)
  const dreamStories = [
    "Einstein's theory of relativity came to him in a dream where he was sledding down a mountainside at the speed of light",
    "Kekulé discovered the ring structure of benzene after dreaming of a snake eating its own tail",
    "Tesla's alternating current motor design was revealed to him in a vivid dream while walking in a park",
    "Paul McCartney composed 'Yesterday' after hearing the entire melody in a dream",
    "Mary Shelley's 'Frankenstein' was inspired by a terrifying nightmare about bringing the dead to life",
    "Mendeleev completed his periodic table after seeing the arrangement of elements in a dream",
    "Stephen King's 'Misery' plot came from a nightmare he had during a flight",
    "Niels Bohr's atomic model was inspired by a dream of sitting on the sun with planets orbiting around him",
    "Elias Howe solved the sewing machine needle design after dreaming of being captured by cannibals with spears",
    "Larry Page conceived Google's PageRank algorithm after a dream about downloading the entire web",
    "Srinivasa Ramanujan received mathematical formulas from the goddess Namagiri in his dreams",
    "René Descartes' scientific method was revealed through three consecutive dreams in one night",
    "Robert Louis Stevenson's 'Dr. Jekyll and Mr. Hyde' came from a nightmare about dual personality",
    "August Kekulé's benzene structure dream revolutionized organic chemistry and saved countless lives",
    "Jack Nicklaus improved his golf swing after dreaming of a new grip technique, winning the next tournament"
  ];

  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  // Change DID U KNOW story frequently so users see new ones when they reach card #6
  useEffect(() => {
    const storyTimer = setInterval(() => {
      setCurrentStoryIndex(prev => (prev + 1) % dreamStories.length);
    }, 12000); // Change every 12 seconds = 2 carousel cycles per story
    
    return () => clearInterval(storyTimer);
  }, [dreamStories.length]);

  // Dreamscape Features Carousel Items
  const dreamscapeFeatures = [
    {
      id: 1,
      title: "Record Your Dreams",
      description: "Don't remember details? Record your dream right after waking up. Our AI (Whisper) will transcribe speech to text and analyze it for you.",
      icon: Mic
    },
    {
      id: 2,
      title: "Private Dream Archive", 
      description: "All your dreams and analyses are securely stored on decentralized 0G Storage network. Only you have access to them.",
      icon: Archive
    },
    {
      id: 3,
      title: "AI That Grows With You",
      description: "Your iNFT isn't just an image. It's an AI that learns from every dream, building a unique profile of your subconscious and increasing its value.",
      icon: BrainCircuit
    },
    {
      id: 4,
      title: "Personalized Guidance",
      description: "Agent doesn't just interpret dreams, but also tracks your progress, identifies emotional patterns and provides guidance for personal development.",
      icon: TrendingUp
    },
    {
      id: 5,
      title: "Trade Your Intelligence",
      description: "The more dreams you process, the smarter and more valuable your agent becomes. Trained agents can be sold on the future marketplace.",
      icon: Repeat
    },
    {
      id: 6,
      title: "DID U KNOW?",
      description: dreamStories[currentStoryIndex],
      icon: Lightbulb
    }
  ];
  
  return (
    <Layout>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        gap: '20px'
      }}>
        {/* Hero Section */}
        <div style={{
          width: '120px',
          height: '120px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img 
            src="/logo_clean.png" 
            alt="Dreamscape Logo" 
            style={{
              width: '120px',
              height: '120px',
              objectFit: 'contain'
            }}
          />
        </div>
        
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          background: theme.gradients.primary,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '10px'
        }}>
          Welcome to Dreamscape.
        </h1>
        
        <p style={{
          fontSize: '1.2rem',
          color: theme.text.secondary,
          maxWidth: '600px',
          lineHeight: '1.6'
        }}>
          The world's first intelligent NFT that learns and evolves with your dreams. 
          Your personal AI agent that grows smarter with every dream you share.
        </p>
        
        {/* Dreamscape Features Carousel */}
        <div style={{
          marginTop: '40px',
          display: 'flex',
          justifyContent: 'center',
          width: '100%'
        }}>
          <Carousel 
            items={dreamscapeFeatures}
            baseWidth={360}
            autoplay={true}
            autoplayDelay={6000}
            pauseOnHover={true}
            loop={true}
            round={false}
          />
        </div>
      </div>
    </Layout>
  );
}

 