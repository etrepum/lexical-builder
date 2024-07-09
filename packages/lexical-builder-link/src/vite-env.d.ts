/// <reference types="vite/client" />
interface ImportMetaEnv extends import("vite/client").ImportMetaEnv {
  PACKAGE_VERSION: string;
}
