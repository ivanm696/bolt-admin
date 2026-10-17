import './polyfills';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

interface HotReloadWindow extends Window {
  ngRef?: { destroy(): void };
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .then(ref => {
    // Destroy the previous instance on hot reload so Angular doesn't leak.
    const w = window as HotReloadWindow;
    w.ngRef?.destroy();
    w.ngRef = ref as unknown as { destroy(): void };
  })
  .catch(err => console.error(err));
