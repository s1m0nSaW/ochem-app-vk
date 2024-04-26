import {
  createHashRouter,
  createPanel,
  createRoot,
  createView,
  RoutesConfig,
} from '@vkontakte/vk-mini-apps-router';

export const DEFAULT_ROOT = 'default_root';

export const DEFAULT_VIEW = 'default_view';

export const DEFAULT_VIEW_PANELS = {
  INTRO: 'intro',
  HOME: 'home',
  PRELOAD: 'preload',
  GAMES: 'games',
  GAME: 'game',
  TEST: 'test',
  SUBSCRIBE: 'subscribe',
};

export const routes = RoutesConfig.create([
  createRoot(DEFAULT_ROOT, [
    createView(DEFAULT_VIEW, [
      createPanel(DEFAULT_VIEW_PANELS.PRELOAD, '/', []),
      createPanel(DEFAULT_VIEW_PANELS.INTRO, `/${DEFAULT_VIEW_PANELS.INTRO}`, []),
      createPanel(DEFAULT_VIEW_PANELS.HOME, `/${DEFAULT_VIEW_PANELS.HOME}`, []),
      createPanel(DEFAULT_VIEW_PANELS.GAMES, `/${DEFAULT_VIEW_PANELS.GAMES}`, []),
      createPanel(DEFAULT_VIEW_PANELS.GAME, `/${DEFAULT_VIEW_PANELS.GAME}`, []),
      createPanel(DEFAULT_VIEW_PANELS.TEST, `/${DEFAULT_VIEW_PANELS.TEST}`, []),
    ]),
  ]),
]);

export const router = createHashRouter(routes.getRoutes());
