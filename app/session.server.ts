import { createCookieSessionStorage, redirect } from "@remix-run/node";

// Création de la configuration de session
const { getSession, commitSession, destroySession } = createCookieSessionStorage({
  cookie: {
    name: '__session',
    secrets: ['s3cret1'],
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  }
});

// Récupère le token d'utilisateur à partir de la session
export const getUserToken = async ({ request }: { request: Request }) => {
  const session = await getSession(request.headers.get('Cookie'));
  return session.get('userToken');
}

// Définit le token d'utilisateur dans la session et renvoie le cookie mis à jour
export const commitUserToken = async ({ request, userToken }: { request: Request, userToken: string }) => {
  const session = await getSession(request.headers.get('Cookie'));
  session.set('userToken', userToken);

  return await commitSession(session);
}

// Détruit la session et redirige vers la page d'accueil
export const logout = async ({ request }: { request: Request }) => {
  const session = await getSession(request.headers.get('Cookie'));
  const destroyedSession = await destroySession(session);

  return redirect('/', {
    headers: {
      'Set-Cookie': destroyedSession, // Utilisez `destroyedSession` pour le cookie de suppression
    },
  });
}

export const authenticateUser = async ({
  request,
  userToken,
}:{
  request: Request,
  userToken: string
})=>{
  const createdSession = await commitUserToken({
    request, 
    userToken
  })

  // Définir le cookie avec le token d'utilisateur
  return redirect( '/', {
    headers: {
      'Set-Cookie': createdSession
    },
  });
}
