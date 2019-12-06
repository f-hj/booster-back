import bodyParser = require('body-parser')
import express = require('express')
import { Connection } from 'typeorm'
import Passport from './passport'
import createAPIv1 from './v1'

const app = express()
app.use(bodyParser.json())

const createAPI = async (c: Connection) => {

  const passport = new Passport(c)
  passport.use()

  app.use('/v1', await createAPIv1(c))

  return app
}

export default createAPI
