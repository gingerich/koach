# Koach

[![Greenkeeper badge](https://badges.greenkeeper.io/gingerich/koach.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/gingerich/koach.svg?branch=master)](https://travis-ci.org/gingerich/koach)

### A piecewise API framework for Node.js
Declarative React-like component model meets Koa middleware function composition 😱  

### Contributing
This project is still young and actively developed. If you want to show some ❤️, feel free to submit GitHub issues and pull requests!

## Motivation and Design
Koach provides a powerful component model and a declarative way to express those components and their composition. It is an attempt to formalize many of the conventions and patterns common in Node middlewares. The foundational building blocks are Koa-style middleware functions.  

A good component model enables composition. With Koach, a monolithic API can instead be expressed as a hierarchical composition of components and subcomponents. A carefully composed API makes it easy to break off independent pieces into their own dedicated microservices (I.e. separate repo, deployment, etc.) when the time is right.

## Installation
`$ yarn add koach`  
or  
`$ npm i koach`

## Usage
The simplest way to get started with Koach

```js
import Koach, { Component, Router } from 'koach'

class App extends Component {
  compose() {
    return Router.spec()
      .get('/', ctx => ctx.body = 'Hello World!')
  }
}

// register our shiny new App component
Koach.registerComponent('App', () => App)

// listen on port 3000
Koach.listen(3000)
```

# Getting Started
Koach in a nutshell:
* Define components by overriding `compose()`, returning either:
  * a Koa-style middleware function
  * a component specification
* Create a component specification with `spec = Component.spec(config:Object) => Specification`
  * Specify subcomponents with chainable `use()` statements
  `spec.use(...subcomponents:Specification|Function) => Specification`
* Configuration properties are available to your component as `this.config`
  * `this.config` can be treated as an Object or a function
    * Ex. `this.config.auth.secret` or `this.config('auth.secret')`
* Subcomponents are available to your `compose()` implementation as `this.config.subcomponents`
  ```js
  compose() {
    return Router.spec()
      .use(this.config.subcomponents)
      .get('/status', ctx => ctx.body = 'Healthy')
  }
  ```

## Documentation
Visit the [Wiki](https://github.com/gingerich/koach/wiki/Getting-Started) for detailed documentation and steps to get started with Koach.

# License
MIT
