# Koach
Functional middleware composition + React-like component classes 😱  

## Motivation and Design
Koach provides a powerful component model and a declaritive way to express those components and their composition. It is an attempt to formalize many of the conventions and patterns common in Node middlewares. The foundational building blocks are Koa-style middleware functions.  
A good component model enables composition of components. With Koach, a monolithic API can now instead be expressed as a hierarchical composition of components and subcomponents. A carefully composed API makes it easy to break off independent pieces into their own dedicated microservices (I.e. separate repo, deployment, etc.) when the time is right.

## Install
```
yarn add koach
```
or
```
npm i koach
```

## Usage
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

## Components
Components are the building blocks that encapsulate the structure and complexity of your app. You can declare a component by extending the Component class and overriding the `compose()` method. The `compose()` method is where you define the "guts" of your component, either by returning a Koa-style middleware function, or by declaring a composition of subcomponents.  

The simplest component is
```javascript
class HelloWorld extends Component {
  compose () {
    return ctx => ctx.body = 'Hello World!'
  }
}
```
The middleware function returned will run for every request, responding with `"Hello World!"`.  

To illustrate composition, we'll use our HelloWorld component above.
```javascript
class GreetingsApp extends Component {
  compose () {
    return HelloWorld.spec()
  }
}
```
What's happening here? The GreetingsApp component declares its composition to be HelloWorld, thus HelloWorld is said to be a subcomponent of GreetingsApp.

A step further...  
Let's redefine our HelloWorld component to use a configured `greeting` property to create the response. We'll also redefine GreetingsApp to supply a custom greeting to HelloWorld.
```javascript
class HelloWorld extends Component {
  compose () {
    return ctx => ctx.body = `${this.config.greeting} World!`
  }
}

class GreetingsApp extends Component {
  compose () {
    return HelloWorld.spec({ greeting: 'Salutations' })
  }
}

Koach.registerComponent('App', () => GreetingsApp)
Koach.listen()
```
Notice we registered our GreetingsApp component and used `Koach.listen()` to listen for http requests on the default port.  Our app will respond to every request with `'Salutations World!'`.

Now let's wire it up to respond `GET /greetings` requests using the built-in Router component. To do this, we could either redefine GreetingsApp or simply add another component, AppRouter.
```javascript
class AppRouter extends Component {
  compose () {
    return Router.spec()
      .get('/greetings', GreetingsApp.spec())
  }
}

Koach.registerComponent('App', () => AppRouter)
Koach.listen()
```
Notice that AppRouter is now registered as the root component.

# License
MIT
