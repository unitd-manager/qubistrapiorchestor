/// <reference types="vite/client" />

interface Window {
  __QUBI_BOOTSTRAP__?: import("./lib/bootstrap").AppBootstrapData;
}
