import type { ReactNode } from 'react';
import LogoutButton from './components/LogoutButton';
import './globals.css';


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
  <ul className="navClass">
    <li>
      <form action="/">
        <button type="submit">Strona główna</button>
      </form>
    </li>
    <li>
      <form action="/login">
        <button type="submit">Logowanie</button>
      </form>
    </li>
    <li>
      <form action="/register">
        <button type="submit">Rejestracja</button>
      </form>
    </li>
    <li>
      <form action="/profile">
        <button type="submit">Profil</button>
      </form>
    </li>
    <li><LogoutButton/></li>
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
