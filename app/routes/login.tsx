import type { MetaFunction, ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { z } from 'zod';
import { authenticateUser } from "../session.server";
import { getOptionalUser } from "../auth.server";
import { Input } from "@/components/ui/input"; // Importer les composants de ShadCN UI
import { Button } from "@/components/ui/button"; // Importer les composants de ShadCN UI
import { useOptionalUser } from "~/root";
import GoogleLogo from "@/assets/google-logo.svg"; // Assurez-vous que vous avez ce fichier ou remplacez par le chemin correct

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
          <LoginForm />
        )}
      </div>
    </div>
  );
}

const LoginForm = () => {
  const actionData = useActionData<{ errors?: Record<string, { _errors: string[] }>, error?: boolean, message?: string }>();
  const isLoading = useNavigation().state !== 'idle';

  // Fonction pour obtenir les messages d'erreur pour un champ spécifique
  const getError = (field: string) => {
    return actionData?.errors?.[field]?._errors[0] ?? null;
  };

  return (
    <div className="flex flex-col items-center w-full md:w-4/6 lg:w-2/6">
      <div className="w-full flex flex-col justify-center items-center h-screen px-4 lg:px-16">
        <div className="self-start mb-8">
          <p className="text-[#333] text-[1.625rem] font-bold">Bonjour de nouveau !</p>
          <p className="text-[#333] text-[1.125rem]">Heureux de vous revoir</p>
        </div>
        <Form method="post" className="w-full space-y-6">
          <div className="relative">
            <Input
              type="email"
              name="email"
              required
              placeholder="Adresse email"
              className="h-[3.75rem] w-full rounded-large text-center"
              disabled={isLoading}
            />
            {getError('email') && (
              <span className="text-red-500 text-sm absolute top-full left-0 mt-1">
                {getError('email')}
              </span>
            )}
          </div>
          <div className="relative">
            <Input
              type="password"
              name="password"
              required
              placeholder="Mot de passe"
              className="h-[3.75rem] w-full rounded-large text-center"
              disabled={isLoading}
            />
            {getError('password') && (
              <span className="text-red-500 text-sm absolute top-full left-0 mt-1">
                {getError('password')}
              </span>
            )}
          </div>
          <div className="mt-6 flex flex-col items-center">
            <Button
              type="submit"
              className="h-[3.31rem] w-full rounded-large bg-green-600 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Chargement..." : "Se connecter"}
            </Button>
          </div>
          {actionData?.message && (
            <div className={`mt-4 text-center ${actionData?.error ? 'text-red-500' : 'text-green-500'}`}>
              {actionData.message}
              <div className="text-xs pt-3">
                <Link className="text-green-600" to="/forget-password">Mot de passe oublié?</Link>
              </div>
            </div>
          )}
          <div className="mt-6 flex flex-col items-center">
            <p className="text-gray-600">ou</p>
            <a href="/login" className="flex items-center mt-4 px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900 hover:bg-gray-100 transition duration-300">
              <img src={GoogleLogo} alt="Google logo" className="w-6 h-6 mr-3" />
              <span>Se connecter avec Google</span>
            </a>
          </div>
          <div className="text-xs pt-3">
            Vous n'avez pas de compte ? <Link className="text-green-600" to="/register">Créer un compte !</Link>
          </div>
        </Form>
      </div>
    </div>
  );
};



