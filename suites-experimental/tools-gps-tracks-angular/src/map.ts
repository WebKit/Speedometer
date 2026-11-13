// Copyright (c) 2026, Camillo Bruni.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

import { TrackData, TrackPoint } from './parsers';

export const MapView = (() => {
  let trackData: Record<string, TrackData> = {};
  let customClickHandler: ((e: any) => boolean) | null = null;

  function init(
    onSelectCb: (id: string) => void,
    onMoveCb: (lat: number, lng: number, zoom: number) => void,
    onPointClickCb: (id: string, idx: number) => void,
    onPointHoverCb: (id: string | null, idx: number | null) => void,
    onDblClickCb: () => void,
  ) {}

  function switchBasemap(layer: string) {}
  function addTrack(t: TrackData) {
    trackData[t.id] = t;
  }
  function addTracks(ts: TrackData[]) {
    ts.forEach((t) => {
      trackData[t.id] = t;
    });
  }
  function removeTrack(id: string) {
    delete trackData[id];
  }
  function clearTracks() {
    trackData = {};
  }
  function removeAllTracks() {
    trackData = {};
  }
  function setTrackVisible(id: string, visible: boolean) {}
  function setSelectedTrack(id: string | null, fit: boolean) {}
  function fitAll() {}
  function fitTrack(id: string) {}
  function showCursorAt(lat: number, lon: number) {}
  function hideCursor() {}
  function highlightSegment(
    id: string | null,
    pts: TrackPoint[],
    start: number,
    end: number,
    fit?: boolean,
    colors?: string[] | null,
  ) {}
  function clearHighlight() {}
  function setTrackHover(id: string, hover: boolean) {}
  function ensureVisible(pts: any) {}
  function centerOn(lat: number, lon: number, zoom?: number | null, force?: boolean) {}
  function closePopup() {}
  function invalidateSize() {}
  function getPosition(): [number, number, number] {
    return [0, 0, 0];
  }
  function setPosition(lat: number, lng: number, zoom: number) {}
  function colorTrackByMetric(id: string, pts: TrackPoint[], colors: string[]) {}
  function clearMetricColor(id: string) {}

  function findTracksPassingThroughPoints(
    points: { lat: number; lng: number }[],
    radius: number,
  ): string[] {
    return Object.keys(trackData);
  }

  return {
    init,
    getMap: () => null as any,
    setCustomClickHandler: (handler: any) => {
      customClickHandler = handler;
    },
    switchBasemap,
    addTrack,
    addTracks,
    removeTrack,
    clearTracks,
    removeAllTracks,
    setTrackVisible,
    setSelectedTrack,
    fitAll,
    fitTrack,
    showCursorAt,
    hideCursor,
    highlightSegment,
    clearHighlight,
    setTrackHover,
    ensureVisible,
    centerOn,
    closePopup,
    invalidateSize,
    getPosition,
    setPosition,
    colorTrackByMetric,
    clearMetricColor,
    findTracksPassingThroughPoints,
    getTrackData: (id: string) => trackData[id],
  };
})();
