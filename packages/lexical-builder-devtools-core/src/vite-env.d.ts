/// <reference types="vite/client" />
import type { ImportMetaEnv as ViteImportMetaEnv } from "vite/client";

interface ImportMetaEnv extends ViteImportMetaEnv {
  PACKAGE_VERSION: string;
}
