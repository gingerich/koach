import Koach from './lib/Koach'

/*
 * Exports
*/
export { default as Component } from './components/Component'
export { default as Controller } from './components/Controller'
export { default as Module } from './components/Module'
export { default as Mount } from './components/Mount'
export { default as Router } from './components/Router'
export { default as Stack } from './components/Stack'

export { default as Server, NodeServer, listener } from './lib/Server'
export { default as KoaServer } from './lib/KoaServer'
export { default as Spec } from './lib/Spec'

export { Koach as Provider }

/*
 * Backwards compatability
*/
import Component from './components/Component'
import Controller from './components/Controller'
import Module from './components/Module'
import Mount from './components/Mount'
import Router from './components/Router'
import Stack from './components/Stack'
import Server from './lib/Server'
import KoaServer from './lib/KoaServer'
import Spec from './lib/Spec'

const moduleExports = {
  Component,
  Controller,
  Provider: Koach,
  KoaServer,
  Module,
  Mount,
  Router,
  Server,
  Spec,
  Stack
}

export default Object.assign(new Koach(), moduleExports)
