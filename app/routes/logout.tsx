import { ActionFunctionArgs } from "@remix-run/node"
import { logout } from "../server/session.server"

export const action = async ({request}:ActionFunctionArgs)=>{
    return await logout({request})
}