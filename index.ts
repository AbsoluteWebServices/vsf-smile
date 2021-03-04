import { StorageManager } from '@vue-storefront/core/lib/storage-manager'
import { StorefrontModule } from '@vue-storefront/core/lib/modules';
import { afterRegistration } from './hooks/afterRegistration'
import { module } from './store'

export const KEY = 'smile'

export const SmileModule: StorefrontModule = function ({ store, appConfig }) {
  StorageManager.init(KEY)
  store.registerModule(KEY, module)
  afterRegistration(appConfig, store)
}
