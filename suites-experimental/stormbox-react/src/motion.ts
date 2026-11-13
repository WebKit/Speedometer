/**
 * `?animations=off` turns off CSS transitions and animations and the
 * reading pane's wait for the folder list to slide away, so a benchmark
 * step measures only the work its interaction triggers.
 */
export const ANIMATIONS_OFF = typeof location !== 'undefined'
  && new URLSearchParams(location.search).get('animations') === 'off';
