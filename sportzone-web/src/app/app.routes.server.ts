import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'partidos/:id/live',
    renderMode: RenderMode.Server
  },
  {
    path: 'partidos/:id/marcador',
    renderMode: RenderMode.Server
  },
  {
    path: 'planillero/:id',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
