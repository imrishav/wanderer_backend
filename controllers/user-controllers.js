const uuid = require('uuid/v4')
const HttpError = require('../models/http-error')

const DUMMY_USER = [
  {
    id: 'u1',
    name: 'Max Schwarz',
    email: 'abbc@test.com',
    password: 123456
  }
]

module.exports.getUsers = (req, res, next) => {
  res.json({ users: DUMMY_USER })
}

module.exports.login = (req, res, next) => {
  const { email, password } = req.body

  const identifyUser = DUMMY_USER.find(u => u.email === email)
  if (!identifyUser || identifyUser.password !== password) {
    throw new HttpError('Wrong credentails', 401)
  }

  res.json({ message: 'Login' })
}

module.exports.signup = (req, res, next) => {
  const { name, email, password } = req.body

  const hasUser = DUMMY_USERS.find(u => u.email === email)
  if (hasUser) {
    throw new HttpError('Could not create user, email already exists.', 422)
  }
  const createUser = {
    id: uuid(),
    name,
    email,
    password
  }

  DUMMY_USER.push(createUser)
  res.status(201).json({ user: req.body })
}
