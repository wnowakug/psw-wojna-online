import type { ReactNode } from 'react';

export const metadata = {
  title: 'Wojna Online',
  description: 'Gra karciana Wojna – projekt egzaminacyjny',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pl">
      <body>
        <header>
          <nav>
            <ul style={{ display: 'flex', gap: '1rem' }}>
              <li><a href="/">Strona główna</a></li>
              <li><a href="/login">Logowanie</a></li>
              <li><a href="/register">Rejestracja</a></li>
              <li><a href="/profile">Profil</a></li>
            </ul>
          </nav>
          <hr />
        </header>

        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
