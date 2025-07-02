import { ThemeProvider } from '../contexts/ThemeContext';
import { WalletProvider } from '../providers/WalletProvider';
import '../styles/globals.css';

export const metadata = {
  title: 'Dreamscape - AI Dream Agent',
  description: 'The world\'s first intelligent NFT that learns and evolves with your dreams',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <WalletProvider>
            {children}
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  )
} 