// Service worker mínimo: permite instalar la app en el celular.
// No guarda datos offline; todo se lee en vivo de Supabase.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
