import { logout } from "../session.server"

export const action = async ({request}:ActionFunctionArgs)=>{
    return await logout({request})
}