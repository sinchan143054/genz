import './globals.css';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: 'Gen Z Growth Companion',
  description: 'AI-powered growth platform for self-aware Gen Z journeys.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
