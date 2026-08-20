# Media Performance Workloads

This benchmark suite measures the performance, responsiveness, and processing throughput of modern web media APIs.

---

## 1. Media-Streaming (`streaming.html` / `streaming.js`)

### InitialPlayback

Tests standard video playback initialization latency via Media Source Extensions (MSE) to simulate typical streaming user journeys on platforms like YouTube or Vimeo. The time measured is from the `play` button clicked to the first video frame painted on the screen. We use `requestVideoFrameCallback` to ensure that the video is painted on the screen.

### Seek

Measures the latency of performing a quick skip-ahead action within an already loaded media stream. This simulates a common user interaction, such as scrubbing through a video timeline or double-tapping right to skip forward on a streaming platform. The time measured is from the `seek` button clicked to the first video frame painted on the screen after seeking. We use `requestVideoFrameCallback` to ensure that the video is painted on the screen after seeking.

---

## 2. Media-Conferencing (`conferencing.html` / `conferencing.js`)

### VideoChat

Tests real-time video encoding and decoding pipelines using WebCodecs. While the UI simulates a Video Chat call, WebRTC is not tested; the focus is purely on measuring VideoEncoder and VideoDecoder throughput. The time measured is from the `video-benchmark` button clicked until all video frames have been encoded, decoded, and the session is torn down.

### VoiceChat

Tests real-time audio encoding, decoding using WebCodecs and audio routing and effects processing using WebAudio. It measures the browser's efficiency in processing audio streams and applying standard audio nodes. The two stages run sequentially in a simulated media pipeline: audio routing and effects processing complete via WebAudio, and the resulting rendered audio buffer is directly encoded and decoded via WebCodecs. The time measured is from the `voice-benchmark` button clicked until all audio frames have been encoded/decoded and the WebAudio offline rendering completes.

---

## Notes & Troubleshooting

### Safari & Low Power Mode

When running these workloads in Safari on macOS or iOS, verify that **Low Power Mode** is disabled. Low Power Mode completely restricts programmatic media playback (`video.play()` and automated media pipelines) regardless of muted state, which will cause tests to fail with a `NotAllowedError`.
