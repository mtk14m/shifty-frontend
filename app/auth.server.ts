import { z } from 'zod';
import { getUserToken, logout } from './server/session.server';

const getAuthentificateUserSchema = z.object({
  id: z.string(),
  email: z.string().email("Invalid email address"),
  subscriptionId: z.string()
});

export const getOptionalUser = async ({ request }: { request: Request }) => {
    try{
        const userToken = await getUserToken({request})
    if(userToken === undefined){
        return null;
    }
    const response = await fetch('http://localhost:3000/auth', {
        method: 'GET', // Adjust the method if needed, e.g., 'POST'
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
        }
    });

    if (!response.ok) {
        throw new Error("Failed to authenticate user");
    }

    const data = await response.json();
    return getAuthentificateUserSchema.parse(data);
    }catch(error){
        console.error(error);
        throw await logout ({
            request
        })
    }
};
