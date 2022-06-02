/**
 * ----------------------------------------------------------------------------
 *  Service Loader
 * ----------------------------------------------------------------------------
 * ServiceManager take car of loading services and checking dependencies
 *
 * Dependencies will be injected into the service constructor.
 * If a service has one or more dependencies, it will wait for them to resolve.
 * Each service can define its list of dependencies in its definition.
 *
 * config.js contains the list of services that should be loaded.
 * each service must implement a init() method
 */
 import pick from 'lodash/pick'

 import type { WalterService, WalterConfig, RawModule } from './types'
 export type { WalterService, WalterConfig, RawModule }
 
 /**
  * Helper to transform automatic imports from vite into an object of modules
  *
  * @param modules object from globEager() call
  * @param sort ordered list of modules names
  * @returns sorted list of services
  */
 export const importHelper = (
   modules: { [k: string]: RawModule },
   sort: Array<string>
 ): Array<WalterService> => {
   const services = <{ [k: string]: WalterService }>{},
     order = []
   let mod: RawModule
 
   // extract the modules as a key => module object
   for (mod of Object.values(modules)) {
     services[mod.default.name] = mod.default
     if (!sort.includes(mod.default.name)) {
       throw new Error(`Service ${mod.default.name} is not in boot sequence`)
     }
   }
   // sort the modules using configured boot order
   for (const name of sort) {
     if (services[name]) {
       order.push(services[name])
     }
   }
   return order
 }
 
 /**
  * ServiceManager pseudo-class
  */
 class Walter {
   /**
    * Public list of loaded services
    */
   services: { [k: string]: WalterService } = {}
 
   /**
    * Verify module dependencies are enabled and loaded
    *
    * @param module
    * @returns list of services
    */
   private getDependencies(service: WalterService): {
     [k: string]: WalterService
   } {
     const deps = service?.deps ?? []
     const found = pick(this.services, deps)
 
     // all elements in deps are in this.services?
     if (Object.keys(found).length !== deps.length) {
       throw new Error(
         `Service ${
           service.name
         } dependencies are not satisfied (deps=${deps.join(
           ', '
         )}). Dependencies must be loaded first.`
       )
     }
     return found
   }
 
   /**
    * Load a service
    *
    * @param module loaded module (from import)
    */
   private checkService(service: WalterService): void {
     if (!service.name) {
       throw new Error('Services must have a name property')
     }
     // removed in typescript
     // if (typeof module.init !== 'function') {
     //   throw new Error('Services must have a init() method')
     // }
   }
 
   /**
    * Start service by runnin init() method
    *
    * @param service module to load
    * @param app
    * @param config app config, with key per module (opt.)
    */
   private startService(
     service: WalterService,
     app: any,
     config: WalterConfig
   ): void {
     this.checkService(service)
     // we first check its dependencies have been loaded
     const dependencies = this.getDependencies(service)
 
     // then we run it's init method and merge it in an object with the module itself
     // because we might need both later in a wrapper (i.e. vue wrapper)
     this.services[service.name] = {
       _self: service,
       ...service.init(app, config?.[service.name] ?? {}, dependencies),
     } as WalterService
   }
 
   /**
    * Load all the given services by importing them and registering them.
    * Modules must have been already imported and be given as a sorted array.
    *
    * We can't import them here due to limitations with dynamic imports.
    * See link below.
    *
    * @param modules path path for imports
    * @param app
    * @param config
    * @link https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#limitations
    */
   public async bootstrap(
     modules: Array<WalterService>,
     app: any,
     config: WalterConfig
   ): Promise<void> {
     for (const mod of modules) {
       this.startService(mod, app, config)
     }
   }
 }
 
 export const createWalter = async (
   modules: Array<WalterService>,
   app: any,
   config: WalterConfig
 ) => {
   const walter = new Walter()
   await walter.bootstrap(modules, app, config)
   return walter
 }
 
 export default createWalter