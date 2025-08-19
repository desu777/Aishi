'use client';

import { useState } from 'react';
import Layout from '../components/layout/Layout';
import {
  NeuralNetworkCanvas,
  HeroSection
} from '../components/landing';

export default function Home() {
  return (
    <Layout>
      {/* Neural Network Background */}
      <NeuralNetworkCanvas />

      {/* Hero Section */}
      <HeroSection />
    </Layout>
  );
}