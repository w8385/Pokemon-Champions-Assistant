declare const __APP_VERSION__: string
declare const __APP_REVISION__: string

export const APP_BUILD_INFO = Object.freeze({
  version: typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : '0.0.0',
  revision: typeof __APP_REVISION__ === 'string' ? __APP_REVISION__ : 'dev',
})
