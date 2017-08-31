import Koach from './lib/Koach'

import Component from './components/Component'
import Controller from './components/Controller'
import Module from './components/Module'
import Mount from './components/Mount'
import * as Router from './components/Router'
import Stack from './components/Stack'
import * as Server from './lib/Server'
import KoaServer from './lib/KoaServer'
import Spec from './lib/Spec'

exports = module.exports = new Koach()
Object.assign(module.exports, {
  Provider: Koach,
  Component,
  Controller,
  KoaServer,
  Module,
  Mount,
  Router,
  Server,
  Spec,
  Stack
})
