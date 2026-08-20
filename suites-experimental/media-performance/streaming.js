/**
 * Media Source Extensions (MSE) playback benchmark.
 * Simulates a video streaming user journey: prefetching video chunks,
 * initializing a MediaSource, loading video data, beginning playback,
 * measuring paint latency (via requestVideoFrameCallback), and seeking.
 */
(function () {
    const video = document.getElementById("player");
    video.muted = true;
    video.playsInline = true;
    const statusEl = document.getElementById("status");

    // We use a VP9 video track and an Opus audio track in separate WebM containers.
    const VIDEO_URL = "bigbuckbunny-video.webm";
    const VIDEO_MIME = 'video/webm; codecs="vp9"';
    const AUDIO_URL = "bigbuckbunny-audio.webm";
    const AUDIO_MIME = 'audio/webm; codecs="opus"';
    // We choose a value which is intentionally not on a key-frame, but several frames after one.
    // This ensures that the seek requires decoding a sequence of inter-frames (P-frames),
    // rather than just jumping to a key-frame, which measures more realistic decoding latency.
    // In bigbuckbunny.mp4, key-frames are at 0.00s and 8.33s. 1.6s is 48 frames after the
    // first key-frame (at 30fps), forcing the decoder to process all preceding P-frames.
    const SEEK_DELTA_SECONDS = 1.5;
    const INITIAL_PAINT_MIN_TIME_SECONDS = 0.001;
    const SEEK_TOLERANCE_SECONDS = 0.5;
    const SEEK_END_MARGIN_SECONDS = 0.1;

    const session = {
        videoBuffer: null,
        audioBuffer: null,
        sourceUrl: null,
        loaded: false,
        mediaSource: null,
    };

    function setStatus(text) {
        statusEl.textContent = text;
    }

    function markCompleted(buttonId) {
        document.getElementById(buttonId).classList.add("completed");
    }

    function waitForPaintedFrame(minMediaTime = 0) {
        return new Promise((resolve, reject) => {
            if (typeof video.requestVideoFrameCallback !== "function") {
                reject(new Error("requestVideoFrameCallback not supported"));
                return;
            }
            const checkFrame = (now, metadata) => {
                // Ensure the frame painted matches or exceeds our target media position.
                if (metadata.mediaTime >= minMediaTime)
                    resolve();
                else
                    video.requestVideoFrameCallback(checkFrame);
            };
            video.requestVideoFrameCallback(checkFrame);
        });
    }

    async function prefetchVideo() {
        const [vRes, aRes] = await Promise.all([fetch(VIDEO_URL), fetch(AUDIO_URL)]);
        if (!vRes.ok || !aRes.ok)
            throw new Error("Fetch failed");

        [session.videoBuffer, session.audioBuffer] = await Promise.all([vRes.arrayBuffer(), aRes.arrayBuffer()]);

        const MediaSourceAPI = window.ManagedMediaSource || window.MediaSource;
        if (typeof MediaSourceAPI !== "function" || !MediaSourceAPI.isTypeSupported(VIDEO_MIME) || !MediaSourceAPI.isTypeSupported(AUDIO_MIME))
            throw new Error("MediaSource or MIME type not supported");

        session.mediaSource = new MediaSourceAPI();
        session.sourceUrl = URL.createObjectURL(session.mediaSource);
        video.src = session.sourceUrl;

        await new Promise((resolve) => {
            if (session.mediaSource.readyState === "open")
                resolve();
            else
                session.mediaSource.addEventListener("sourceopen", resolve, { once: true });
        });
        document.body.dataset.prefetchReady = "1";
    }

    function appendBufferAsync(sourceBuffer, buffer) {
        return new Promise((resolve, reject) => {
            const onAppendError = () => {
                sourceBuffer.removeEventListener("updateend", onUpdateEnd);
                reject(new Error("SourceBuffer append error"));
            };
            const onUpdateEnd = () => {
                sourceBuffer.removeEventListener("error", onAppendError);
                resolve();
            };
            sourceBuffer.addEventListener("error", onAppendError, { once: true });
            sourceBuffer.addEventListener("updateend", onUpdateEnd, { once: true });
            sourceBuffer.appendBuffer(buffer);
        });
    }

    async function initialPlayback() {
        try {
            if (!session.loaded && (!session.mediaSource || session.mediaSource.readyState !== "open" || !session.videoBuffer || !session.audioBuffer))
                throw new Error("Benchmark error: Prefetch step must complete before starting initial playback.");

            // Wait for a frame with mediaTime > 0 to ensure playback has actually progressed
            // past the automatically pre-rendered first frame.
            const painted = waitForPaintedFrame(INITIAL_PAINT_MIN_TIME_SECONDS);

            // Step 1: Add separate SourceBuffers for Video and Audio (DASH pattern)
            const videoSourceBuffer = session.mediaSource.addSourceBuffer(VIDEO_MIME);
            const audioSourceBuffer = session.mediaSource.addSourceBuffer(AUDIO_MIME);
            await Promise.all([appendBufferAsync(videoSourceBuffer, session.videoBuffer), appendBufferAsync(audioSourceBuffer, session.audioBuffer)]);

            if (session.mediaSource.readyState === "open")
                session.mediaSource.endOfStream();

            session.loaded = true;

            // Step 2: Start playback and await the painted frame.
            await Promise.all([video.play(), painted]);
            setStatus(`Loaded (duration=${video.duration.toFixed(2)}s)`);
            markCompleted("initial-playback");
        } catch (e) {
            if (e.name === "NotAllowedError")
                setStatus(`Playback failed: ${e.message} (Verify Low Power Mode is off and autoplay allowed)`);
            else
                setStatus(`Playback failed: ${e.message}`);
            throw e;
        }
    }

    function waitForSeeked(targetTime, tolerance = SEEK_TOLERANCE_SECONDS) {
        return new Promise((resolve, reject) => {
            const cleanup = () => {
                video.removeEventListener("seeked", handleSeeked);
                video.removeEventListener("error", handleError);
            };

            const handleSeeked = () => {
                const diff = Math.abs(video.currentTime - targetTime);

                if (diff <= tolerance) {
                    cleanup();
                    resolve();
                } else {
                    cleanup();
                    reject(new Error(`Seek target mismatch. Expected ~${targetTime}s, but got ${video.currentTime}s`));
                }
            };

            const handleError = () => {
                cleanup();
                reject(new Error("Video error during seek"));
            };

            video.addEventListener("seeked", handleSeeked);
            video.addEventListener("error", handleError);
        });
    }

    async function seek() {
        try {
            if (!session.loaded || !isFinite(video.duration))
                throw new Error("Benchmark error: Seek started before initial playback completed successfully.");
            const target = Math.min(video.currentTime + SEEK_DELTA_SECONDS, Math.max(0, video.duration - SEEK_END_MARGIN_SECONDS));
            const seeked = waitForSeeked(target);
            const painted = waitForPaintedFrame(target);
            video.currentTime = target;
            await Promise.all([seeked, painted]);
            setStatus(`Seeked to ${video.currentTime.toFixed(2)}s`);
            markCompleted("seek");
        } catch (e) {
            setStatus(`Seek failed: ${e.message}`);
            throw e;
        }
    }

    window.prefetchVideo = prefetchVideo;
    document.getElementById("initial-playback").addEventListener("click", initialPlayback);
    document.getElementById("seek").addEventListener("click", seek);
})();
