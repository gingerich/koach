# koach
Functional middleware composition + React-like component classes 😱  

### Motivation and Design
koach provides a component model and a declaritive way to express those components and their composition. It is an attempt to formalize many of the conventions and patterns common in Node middlewares. It is built using Koa-style middleware.  
A good component model enables composition of components. A monolithic API can now instead be expressed as a composition of components and subcomponents. A carefully composed API makes it easy to break off components into their own dedicated microservices (I.e. separate repo, deployment, etc.) when the time is right.

### Install
```
yarn add koach
```
or
```
npm i koach
```

### Usage
Simplest way to get started with koach

```javascript
import Koach, { Component, Router } from 'koach'

class App extends Component {
  compose() {
    return Router.spec()
      .get('/', ctx => ctx.body = 'Hello World!')
  }
}

// register our shiny new App component
Koach.registerComponent('App', () => App)

// listen on default port
Koach.listen()
```
