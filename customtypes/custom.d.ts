import { Request } from "express"
import User from "../entities/User"

interface IContext {
  user: User
}

declare module "express" { 
  export interface Request {
    context: IContext
  }
}