import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  Form,
  Link,
  useRouteLoaderData
} from "@remix-run/react";
import "./tailwind.css";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { getOptionalUser } from "./auth.server";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getOptionalUser({ request });
  return json({ user });
};

export const useOptionalUser = () => {
  const data = useRouteLoaderData<typeof loader>('root');
  return data?.user || null;
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="flex flex-col min-h-screen">
        <NavBar />
        <main className="flex-grow bg-gray-100">
          {children}
          <ScrollToggleButton />
        </main>
        <Footer />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

const NavBar = () => {
  const user = useOptionalUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false); // Fonction pour fermer le menu
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
 const closeDropdown = () => {setIsDropdownOpen(false); closeMenu()}
   // Fonction pour fermer le menu lors du clic sur un lien
  const handleLinkClick = () => {
    if (window.innerWidth < 768) { // On vérifie si la largeur de l'écran est inférieure à 768px (taille de tablette/mobile)
      closeMenu();
      closeDropdown();
    }
  };



  return (
    <div className="bg-white shadow-md py-4 fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center">
            {/* Calendar Icon */}
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 15 21"
              className="w-12 h-12 pt-3 text-green-700"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* SVG paths here */}
            </svg>
            <Link to="/" className="text-2xl pt-1 font-bold text-green-600 hover:text-green-700 transition duration-300" onClick={handleLinkClick}>
              Shifty
            </Link>
          </div>
          <button
            onClick={toggleMenu}
            className="md:hidden text-gray-600 hover:text-green-700 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          </button>
        </div>
        <nav className={`md:flex md:items-center ${isMenuOpen ? 'block' : 'hidden'} md:block`}>
          <ul className="flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0">
            {user ? (
              <>
                <li>
                  <Link to="/planning" className="text-gray-600 hover:text-green-700 transition duration-300" onClick={handleLinkClick}>
                    Planning
                  </Link>
                </li>
                <li>
                  <Link to="/subscription" className="text-gray-600 hover:text-green-700 transition duration-300" onClick={handleLinkClick}>
                    Abonnement
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="text-gray-600 hover:text-green-700 transition duration-300" onClick={handleLinkClick}>
                    Profil
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/" className="text-gray-600 hover:text-green-700 transition duration-300" onClick={handleLinkClick}>
                    C'est quoi Shifty
                  </Link>
                </li>
                <li>
                  <Link to="/" className="text-gray-600 hover:text-green-700 transition duration-300" onClick={handleLinkClick}>
                    Prix
                  </Link>
                </li>
                <li>
                  <Link to="/" className="text-gray-600 hover:text-green-700 transition duration-300" onClick={handleLinkClick}>
                    Nous contacter
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
        {user && (
          <div className={`relative ${isMenuOpen ? 'block' : 'hidden'} md:flex md:items-center md:space-x-4 mt-4 md:mt-0`}>
            <button
              onClick={toggleDropdown}
              className="flex items-center text-gray-600 hover:text-green-700 focus:outline-none"
            >
              <span className="mr-2">{user?.email}</span>
              <svg
                className={`w-5 h-5 transform ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <ul className="py-2">
                  <li>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={handleLinkClick}
                    >
                      Mon Profil
                    </Link>
                  </li>
                  <li>
                    <Form method="post" action="/logout" className="block">
                      <Button type="submit" className="w-full px-4 py-2 text-gray-700 hover:bg-gray-100 text-left">
                        Se déconnecter
                      </Button>
                    </Form>
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}
        {!user && (
          <div className={`md:flex md:items-center space-x-4 ${isMenuOpen ? 'block' : 'hidden'} md:block mt-4 md:mt-0`}>
            <Link to="/login" className="text-green-700 hover:text-green-800 transition duration-300" onClick={handleLinkClick}>
              Se connecter
            </Link>
            <button className="rounded-full bg-green-700 text-white px-4 py-2 hover:bg-green-800 transition duration-300">
              <Link to="/register" className="text-white" onClick={handleLinkClick}>
                Créer un compte
              </Link>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
const ScrollToggleButton = () => {
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight) {
        setIsScrolledToBottom(true);
      } else {
        setIsScrolledToBottom(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToFooter = () => {
    const footer = document.getElementById('footer');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth' });
    }
  };

    // Fonction pour le scroll vers le haut
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
  return (
    <div className="fixed bottom-8 right-8 flex flex-col items-center space-y-2">
      <button
        onClick={isScrolledToBottom ? scrollToTop : scrollToFooter}
        className="bg-green-700 text-white rounded-full p-3 shadow-lg hover:bg-green-800 focus:outline-none"
        aria-label={isScrolledToBottom ? "Scroll to Top" : "Scroll to Footer"}
      >
        <svg
          className={`w-6 h-6 transform ${isScrolledToBottom ? 'rotate-0' : 'rotate-180'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
        </svg>
      </button>
    </div>
  );
};

const Footer = () => {
  return (
    <footer id="footer" className="bg-gray-800 text-white py-8 mt-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:justify-between">
          {/* Column 1: About Us */}
          <div className="mb-6 md:mb-0">
            <h3 className="text-lg font-bold mb-2">À Propos</h3>
            <p className="text-gray-400">
              Shifty est une plateforme innovante qui facilite la gestion des projets et des tâches pour les équipes modernes.
            </p>
          </div>
          
          {/* Column 2: Quick Links */}
          <div className="mb-6 md:mb-0">
            <h3 className="text-lg font-bold mb-2">Liens Rapides</h3>
            <ul>
              <li><a href="/" className="text-gray-300 hover:text-green-500 transition duration-300">Accueil</a></li>
              <li><a href="/pricing" className="text-gray-300 hover:text-green-500 transition duration-300">Prix</a></li>
              <li><a href="/about" className="text-gray-300 hover:text-green-500 transition duration-300">À Propos</a></li>
              <li><a href="/contact" className="text-gray-300 hover:text-green-500 transition duration-300">Contact</a></li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div className="mb-6 md:mb-0">
            <h3 className="text-lg font-bold mb-2">Contact</h3>
            <ul>
              <li className="mb-2">
                <a href="mailto:support@shifty.com" className="text-gray-300 hover:text-green-500 transition duration-300">support@shifty.com</a>
              </li>
              <li>
                <a href="tel:+334-00-00-00-00" className="text-gray-300 hover:text-green-500 transition duration-300">+334-00-00-00-00</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 border-t border-gray-700 pt-4 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Shifty. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};
