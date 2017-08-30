# koach
Functional middleware composition + React-like component classes 😱


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
