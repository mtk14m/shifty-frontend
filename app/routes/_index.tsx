import type { MetaFunction, ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { z } from 'zod';
import { commitUserToken} from "../session.server"; // Assurez-vous que ceci est correctement importé et implémenté
import { getOptionalUser } from "../auth.server"; // Assurez-vous que ceci est correctement importé et implémenté

// Définir le schéma de validation pour les données de connexion
const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
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
  // Récupérer les informations de l'utilisateur authentifié
  const user = await getOptionalUser({ request });
  return json({ user });
};

// Fonction d'action pour gérer la soumission du formulaire
export const action = async ({ request }: ActionFunctionArgs) => {
  // Extraire les données du formulaire
  const formData = await request.formData();
  const jsonData = Object.fromEntries(formData);
  const parseJson = loginSchema.parse(jsonData);

  // Effectuer la demande de connexion
  const response = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(parseJson)
  });

  // Vérifier la réussite de la connexion
  if (!response.ok) {
    throw new Error("Échec de la connexion");
  }

  // Extraire et valider le token d'accès
  const {access_token} = tokenSchema.parse(await response.json());

  // Définir le cookie avec le token d'utilisateur
  return json({}, {
    headers: {
      'Set-Cookie': await commitUserToken({
        request, userToken: access_token
      }),
    },
  });
};

// Composant principal pour l'interface utilisateur
export default function Index() {
  // Charger les données de l'utilisateur
  const {user} = useLoaderData<typeof loader>();
  const isConnected = user !== null;

  return (
    <div className="font-sans p-4">
      <h1 className="text-3xl">Test Backend Shifty</h1>
        <div className="flex flex-col items-center mt-36">
          <h1 className="text-2xl">Inscription/Connexion</h1>
          {isConnected? <div  className="w-full text-center">Bonjour {user.email}</div>: <LoginForm/>}
        </div>
    </div>
  );
}


const LoginForm = ()=>{
  return(
    <Form method="post" className="">
      <div className="flex flex-col items-center">
        <div className="flex flex-col space-between w-80 mt-5 space-y-2">
          <input className="text-center rounded-full ml-2" type="email" name="email" required placeholder="Email" />
          <input className="text-center rounded-full ml-2" type="password" name="password" required placeholder="Mot de passe" />
        </div>
        <div className="mt-14 items-center">
          <button type="submit" className="m-2 px-4 py-2 bg-amber-500 text-white rounded-full">Se connecter</button>
        </div>
      </div>
    </Form>
  )
}