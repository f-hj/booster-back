import bcrypt = require('bcrypt')
import passport = require('passport')
import { Strategy as JWTStrategy } from 'passport-jwt'
import { ExtractJWT, Strategy as LocalStrategy } from 'passport-local'
import { Connection, Repository } from 'typeorm'
import User from '../entities/User'

export default class Passport {

  private c: Connection
  private repo: Repository<User>

  constructor(c: Connection) {
    this.c = c
    this.repo = this.c.getRepository(User)
  }

  public use() {
    passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password',
    }, async (email, password, done) => {
      const user = await this.repo.findOne({
        email,
      })
      if (!user) {
        return done(null, null)
      }

      const match = await bcrypt.compare(password, user.password)
      if (!match) {
        return done(null, null)
      }

      done(null, user)
    }))

    /*passport.use(new JWTStrategy({
      jwtFromRequest: ExtractJWT.fromAuthHeaderWithScheme
    }))*/
  }

}
