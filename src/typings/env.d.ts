//  the ts of vite config file
/// <reference types="vite/client" />
export interface ImportMetaEnv {
  readonly VITE_APP_BASE_URL: string
  readonly VITE_APP_ENV: string
  readonly VITE_APP_SIGN_VERSION: string
  readonly VITE_APP_SIGN_KEY: string
  // 更多环境变量...
}

export interface ImportMeta {
  readonly env: ImportMetaEnv
}
