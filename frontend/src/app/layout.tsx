import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Agentic AI Smart Event Management',
  description: 'Autonomous event scheduling, registrations, and grounded policy RAG assistant.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-800 min-h-screen flex flex-col font-sans antialiased">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
          Agentic AI Smart Event Management System &bull; LangGraph &bull; FastAPI &bull; RAG &bull; pgvector
        </footer>
      </body>
    </html>
  );
}
