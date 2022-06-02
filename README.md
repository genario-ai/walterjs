# Walterjs

Walterjs is a javascript service manager. It has been written for vue framework
(see [vue-walterjs](https://github.com/genario-ai/vue-walterjs#readme)) but can be use with any.


## Install:

```
yarn add @genario/walterjs
```

## Usage

```
import SeviceManager, { importHelper } from '@genario/walterjs'

// importing using vite globEager
const modules = import.meta.globEager('../services/*/index.js')

// services configuration, one key per service
const config = {}
// can be anything, but initially made for passing vue app
const app = {}

// a helper to transform vite auto import into a modules list
const modules = importHelper(modules, config.services.boot)

// start the services
await ServiceManager.bootstrap(modules, app, config)

// we get an object to handle services
const services = ServiceManager.services
```
