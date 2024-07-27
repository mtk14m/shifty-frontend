import type { MetaFunction, ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { z } from 'zod';
import { authenticateUser } from "../session.server";
import { getOptionalUser } from "../auth.server";

import { useOptionalUser } from "~/root";

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

  return (
    <div className="font-sans">
      <div className="flex flex-col items-center">
        {isConnected ? (
          <div className="w-full text-center">Bonjour {user.email}</div>
        ) : (
            <h1>Hello</h1>
        )}
      </div>
    </div>
  );
}
