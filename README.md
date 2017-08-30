# Koach
### A piecewise API framework for Node.js
Declaritive React-like component model meets Koa middleware function composition 😱  

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
Simplest way to get started with Koach

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

// listen on port 3000
Koach.listen(3000)
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
The returned middleware function would run for every request, responding with `"Hello World!"`.  

To illustrate composition, we'll use our HelloWorld component above.
```javascript
class GreetingsApp extends Component {
  compose () {
    return HelloWorld.spec()
  }
}
```
What's happening here? The GreetingsApp component declares its composition using HelloWorld, thus HelloWorld is said to be a subcomponent of GreetingsApp. In this case what we return is a component specification of HelloWorld.

#### Component Specification
Declaring a composition using concrete component instance creates tight coupling and must be avoided. Instead what we need is an intermediate representation of a component instance. This is called a component specification.  
`Component.spec()` is used to create a Specification that describes the component and knows how to make actual instances of that component when needed.

Back to our earlier example...  
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
```
This is how configuration is passed to a component specification.  
Our app will now respond to every request with `'Salutations World!'`.

Now let's wire it up to respond to `GET /greetings` requests using the included Router component. To do this, we could either redefine GreetingsApp or simply add another component, AppRouter.
```javascript
class AppRouter extends Component {
  compose () {
    return Router.spec()
      .get('/greetings', GreetingsApp.spec())
  }
}

Koach.registerComponent('App', () => AppRouter)
Koach.listen(3000)
```
Notice we registered our AppRouter component and used `Koach.listen()` to listen for incoming requests on port 3000.

# License
MIT
