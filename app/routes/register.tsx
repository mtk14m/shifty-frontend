import { MetaFunction, ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { z } from 'zod';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authenticateUser } from "../session.server";
import { getOptionalUser } from "../auth.server";
import GoogleLogo from "@/assets/google-logo.svg"; // Assurez-vous que vous avez ce fichier ou remplacez par le chemin correct

// Définir le schéma de validation pour les données de connexion
const registerSchema = z.object({
  email: z.string()
    .min(1, { message: 'Votre adresse email est requise.' })
    .email({ message: 'Votre adresse email est invalide.' }),
  password: z.string()
    .min(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
    .regex(/[A-Z]/, { message: 'Le mot de passe doit contenir au moins une lettre majuscule' })
    .regex(/[a-z]/, { message: 'Le mot de passe doit contenir au moins une lettre minuscule' })
    .regex(/[0-9]/, { message: 'Le mot de passe doit contenir au moins un chiffre' })
    .regex(/[@$+/!%*?&]/, { message: 'Le mot de passe doit contenir au moins un caractère spécial' })
});

// Définir les métadonnées pour la page
export const meta: MetaFunction = () => {
  return [
    { title: "Shifty | Inscription" },
    { name: "description", content: "Bienvenue sur Shifty" },
  ];
};

// Fonction de chargement des données pour la page
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getOptionalUser({ request });
  if (user) {
    return redirect('/');
  }
  return json({});
};

// Fonction d'action pour gérer la soumission du formulaire
export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const jsonData = Object.fromEntries(formData);
  const parseJson = registerSchema.safeParse(jsonData);

  if (!parseJson.success) {
    const errors = parseJson.error.format();
    return json({ errors });
  }

  const response = await fetch('http://localhost:3000/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jsonData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    return json({ error: true, message: errorData.message || 'Erreur lors de la demande.' });
  }

  const { access_token, message, error } = await response.json();

  if (error) {
    return json({ error, message });
  }

  if (access_token) {
    return await authenticateUser({ request, userToken: access_token });
  }

  return json({ error: true, message: "Une erreur inattendue est survenue." });
};

// Composant principal pour l'interface utilisateur
export default function RegisterForm() {
  const actionData = useActionData<{ errors?: Record<string, { _errors: string[] }>, error?: boolean, message?: string }>();
  const isLoading = useNavigation().state !== 'idle';

  // Fonction pour obtenir les messages d'erreur pour un champ spécifique
  const getError = (field: string) => {
    return actionData?.errors?.[field]?._errors[0] ?? null;
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex flex-col items-center w-full md:w-4/6 lg:w-2/6">
        <div className="w-full flex flex-col justify-center items-center h-screen px-4 lg:px-16">
          <div className="self-start mb-8">
            <p className="text-[#333] text-[1.625rem] font-bold">Créer un compte</p>
            <p className="text-[#333] text-[1.125rem]">Bienvenue sur Shifty</p>
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
            <div className="mt-14 flex flex-col items-center">
              <Button
                type="submit"
                className="h-[3.31rem] w-full rounded-large bg-green-600 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Chargement..." : "Créer un compte"}
              </Button>
            </div>
            {actionData?.message && (
              <div className={`mt-4 text-center ${actionData?.error ? 'text-red-500' : 'text-green-500'}`}>
                {actionData.message}
              </div>
            )}
            <div className="mt-6 flex flex-col items-center">
              <p className="text-gray-600">ou</p>
              <a href="/register" className="flex items-center mt-4 px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900 hover:bg-gray-100 transition duration-300">
                <img src={GoogleLogo} alt="Google logo" className="w-6 h-6 mr-3" />
                <span>Se connecter avec Google</span>
              </a>
            </div>
            <div className="text-xs pt-3">
              Vous avez déjà un compte? <Link className="text-green-600" to="/login">Se connecter!</Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
