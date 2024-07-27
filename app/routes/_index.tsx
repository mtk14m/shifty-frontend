import type { MetaFunction, ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { z } from 'zod';
import { authenticateUser } from "../session.server";
import { getOptionalUser } from "../auth.server";

import { useOptionalUser } from "~/root";
import { Link } from "@remix-run/react";

// Définir le schéma de validation pour les données de connexion
const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

// Définir le schéma de validation pour le token
const tokenSchema = z.object({
  access_token: z.string()
});

// Définir les métadonnées pour la page
export const meta: MetaFunction = () => {
  return [
    { title: "Shifty" },
    { name: "description", content: "Bienvenue sur Shifty" },
  ];
};

// Fonction de chargement des données pour la page
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getOptionalUser({ request });
  if (user) {
    const url = new URL(request.url);
    if (url.pathname !== '/') {
      return redirect('/');
    }
  }
  return json({});
};

// Fonction d'action pour gérer la soumission du formulaire
export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const formData = await request.formData();
    const jsonData = Object.fromEntries(formData);
    const parseJson = loginSchema.safeParse(jsonData);

    if (!parseJson.success) {
      const errors = parseJson.error.format();
      return json({ errors });
    }

    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parseJson.data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return json({ error: true, message: errorData.message || 'Échec de la connexion' });
    }

    const { access_token } = tokenSchema.parse(await response.json());

    return await authenticateUser({
      request,
      userToken: access_token
    });
  } catch (error) {
    return json({ error: true, message: 'Une erreur inattendue est survenue' });
  }
};

// Composant principal pour l'interface utilisateur
export default function Index() {
  const user = useOptionalUser();
  const isConnected = user !== null;
  console.log(user)
  return (
    <div className="font-sans">
      <div className="flex flex-col items-center pt-24">
        {isConnected ? (
          <h1>Hello</h1>
        ) : (
            
            <LandingPage/>
        )}
      </div>
    </div>
  );
}


//landing 

const LandingPage = ()=> {
  const user = useOptionalUser();
  const isConnected = user !== null;
  return (
    <div className="font-sans bg-gray-50">
      <main className="container mx-auto px-4 py-16">
        <section className="text-center mb-16 animate-on-scroll">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Shifty: Votre Solution Professionnelle pour la Gestion de Rendez-vous</h2>
          <p className="text-lg text-gray-700 mb-8">
            Shifty aide les créateurs et les entrepreneurs à domicile à gérer leurs rendez-vous en toute simplicité et professionnalisme. Collaborez, gérez vos services et atteignez de nouveaux sommets de productivité avec notre outil intuitif et puissant.
          </p>
          <Link to="/register" className="inline-block px-8 py-3 bg-green-600 text-white text-lg font-semibold rounded-full shadow-md hover:bg-green-700 transition duration-300 transform hover:scale-105">
            Rejoignez-nous
          </Link>
        </section>
        
        <section className="grid md:grid-cols-2 gap-12 mb-16 animate-on-scroll">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Pourquoi choisir Shifty ?</h3>
            <ul className="text-gray-700 space-y-4">
              <li>Professionnalisme Accessible : Que vous soyez coiffeur à domicile, maquilleur, consultant ou tout autre entrepreneur, Shifty vous offre les outils nécessaires pour gérer vos rendez-vous comme un pro.</li>
              <li>Gérez Vos Services et Rendez-vous : Créez des profils détaillés, présentez vos services avec des descriptions et des tarifs clairs, et organisez vos horaires de manière fluide.</li>
              <li>Améliorez Votre Productivité : Avec Shifty, chaque minute compte. Notre système de gestion de rendez-vous intuitif et nos outils de collaboration vous permettent de vous concentrer sur ce que vous faites de mieux.</li>
              <li>Expérience Client Supérieure : Offrez à vos clients une expérience de prise de rendez-vous sans tracas. Des rappels automatisés aux confirmations instantanées, Shifty veille à ce que chaque interaction avec vos clients soit professionnelle et agréable.</li>
            </ul>
          </div>
          <img src="@/assets/illustration.svg" alt="Illustration" className="w-full h-auto rounded-lg shadow-lg" />
        </section>
        
        <section className="mb-16 animate-on-scroll">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Abonnements Shifty</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center transform transition duration-300 hover:scale-105">
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Plan Starter</h4>
              <p className="text-gray-700 mb-4">9,99€ par mois</p>
              <ul className="text-gray-700 space-y-2 mb-6">
                <li>Gestion de 50 rendez-vous par mois</li>
                <li>Profils de services et descriptions</li>
                <li>Rappels de rendez-vous par e-mail</li>
                <li>Support client par e-mail</li>
                <li>Accès à des tutoriels et des ressources en ligne</li>
              </ul>
              <Link to="/register" className="inline-block px-6 py-2 bg-green-600 text-white font-semibold rounded-full shadow-md hover:bg-green-700 transition duration-300 transform hover:scale-105">
                S'inscrire
              </Link>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg text-center transform transition duration-300 hover:scale-105">
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Plan Pro</h4>
              <p className="text-gray-700 mb-4">19,99€ par mois</p>
              <ul className="text-gray-700 space-y-2 mb-6">
                <li>Gestion illimitée des rendez-vous</li>
                <li>Profils de services avancés avec portfolios</li>
                <li>Rappels de rendez-vous par e-mail et SMS</li>
                <li>Intégration de calendriers externes (Google Calendar, Outlook)</li>
                <li>Statistiques de rendez-vous et rapports mensuels</li>
                <li>Support client prioritaire par e-mail et chat en direct</li>
              </ul>
              <Link to="/register" className="inline-block px-6 py-2 bg-green-600 text-white font-semibold rounded-full shadow-md hover:bg-green-700 transition duration-300 transform hover:scale-105">
                S'inscrire
              </Link>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg text-center transform transition duration-300 hover:scale-105">
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Plan Premium</h4>
              <p className="text-gray-700 mb-4">29,99€ par mois</p>
              <ul className="text-gray-700 space-y-2 mb-6">
                <li>Toutes les fonctionnalités du Plan Pro</li>
                <li>Outils de marketing intégrés (campagnes par e-mail, promotions)</li>
                <li>Gestion avancée des clients (préférences, historique)</li>
                <li>Notifications en temps réel</li>
                <li>Accès à des webinaires exclusifs et à des sessions de formation</li>
                <li>Support client premium avec assistance téléphonique dédiée</li>
              </ul>
              <Link to="/register" className="inline-block px-6 py-2 bg-green-600 text-white font-semibold rounded-full shadow-md hover:bg-green-700 transition duration-300 transform hover:scale-105">
                S'inscrire
              </Link>
            </div>
          </div>
        </section>
        
        <section className="text-center mb-16 animate-on-scroll">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Comment Shifty Vous Fait Progresser</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-lg transform transition duration-300 hover:scale-105">
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Optimisation du Temps</h4>
              <p className="text-gray-700">En automatisant les rappels de rendez-vous et en vous offrant une vue d'ensemble claire de votre emploi du temps, Shifty vous permet de consacrer plus de temps à vos clients et à votre développement professionnel.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg transform transition duration-300 hover:scale-105">
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Amélioration de la Satisfaction Client</h4>
              <p className="text-gray-700">Avec des rappels automatiques et des confirmations instantanées, vos clients se sentent valorisés et bien pris en charge, ce qui augmente leur fidélité et leur satisfaction.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg transform transition duration-300 hover:scale-105">
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Outils de Croissance</h4>
              <p className="text-gray-700">Nos fonctionnalités avancées de marketing et de gestion de clients vous aident à attirer de nouveaux clients et à fidéliser les existants, tout en gardant une trace précise de vos performances et en identifiant les opportunités d'amélioration.</p>
            </div>
          </div>
        </section>
        
        <section className="text-center mb-16 animate-on-scroll">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Soutien Continu</h3>
          <p className="text-gray-700 mb-4">Que vous ayez une question ou besoin d'assistance, notre support client est là pour vous aider à chaque étape, vous assurant ainsi une utilisation optimale de la plateforme.</p>
          <Link to="/contact" className="inline-block px-8 py-3 bg-green-600 text-white text-lg font-semibold rounded-full shadow-md hover:bg-green-700 transition duration-300 transform hover:scale-105">
            Contactez-nous
          </Link>
        </section>
      </main>
    </div>
  );
};

