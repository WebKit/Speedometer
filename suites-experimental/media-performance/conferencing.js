/* eslint-disable no-empty */
/* global VideoDecoder, VideoEncoder, AudioDecoder, AudioEncoder, VideoFrame, AudioData */
/**
 * WebCodecs and WebAudio performance benchmark.
 * Simulates a video/audio conferencing session (video chat and voice chat).
 * Measures the performance of encoding/decoding video frames with WebCodecs,
 * rendering them on local and remote HTML5 Canvases, and processing audio
 * round trips via WebCodecs and Web Audio offline graph rendering.
 */
(function () {
    const localCanvas = document.getElementById("local-canvas");
    const remoteCanvas = document.getElementById("remote-canvas");
    const localCtx = localCanvas.getContext("2d");
    const remoteCtx = remoteCanvas.getContext("2d");
    const statusEl = document.getElementById("status");

    // Video Workload Constants: Chosen to simulate a standard 1080p @ 30fps VP9 video conferencing stream.
    // 1080p (1920x1080) reflects typical HD video chat resolutions.
    // VIDEO_FRAME_COUNT = 10 is chosen to provide a deterministic, fast-running workload per iteration.
    // VIDEO_BITRATE = 1_000_000 (1 Mbps) reflects target WebCodecs VP9 encoding bitrates for 1080p streams.
    const FRAME_WIDTH = 1920;
    const FRAME_HEIGHT = 1080;
    const VIDEO_FRAME_COUNT = 10;
    const VIDEO_FRAME_DURATION_US = 33333; // ~30fps in microseconds
    const VIDEO_BITRATE = 1_000_000;
    const VIDEO_FRAMERATE = 30;

    // WebCodecs Audio Workload Constants: Opus audio encoding and decoding configuration.
    // AUDIO_SAMPLE_RATE = 48000 (48 kHz) is chosen as the standard high-fidelity sample rate for Opus audio.
    // AUDIO_FRAME_COUNT = 100 & AUDIO_FRAME_SIZE = 1024 are chosen to match WebCodecs AudioData chunk buffers (~21.3ms per frame).
    const AUDIO_FRAME_COUNT = 100;
    const AUDIO_SAMPLE_RATE = 48000;
    const AUDIO_FRAME_SIZE = 1024;
    const AUDIO_DECODER_BUFFER_SIZE = 8192;
    const AUDIO_BITRATE = 96_000;
    const AUDIO_CHANNELS = 1;
    const STEREO_CHANNELS = 2;

    // WebAudio Processing Constants: OfflineAudioContext synthesis graph benchmark.
    // AUDIO_TONE_HZ = 440 is chosen as the standard Concert A sine wave test signal for audio processing.
    const MICROSECONDS_PER_SECOND = 1_000_000;
    const AUDIO_OFFLINE_DURATION_SECONDS = 30;
    const AUDIO_TONE_HZ = 440;

    const WEBAUDIO_SAMPLE_COUNT = AUDIO_SAMPLE_RATE * AUDIO_OFFLINE_DURATION_SECONDS;

    // Pre-generate the audio samples before we start the timer.
    const PRE_GENERATED_AUDIO_SAMPLES = (function () {
        const data = new Float32Array(WEBAUDIO_SAMPLE_COUNT);
        const omega = (2 * Math.PI * AUDIO_TONE_HZ) / AUDIO_SAMPLE_RATE;
        for (let i = 0; i < WEBAUDIO_SAMPLE_COUNT; i++)
            data[i] = Math.sin(omega * i);
        return data;
    })();

    const VIDEO_CODEC = "vp09.00.10.08";

    const webCodecsSupported
        = typeof globalThis.VideoEncoder === "function"
        && typeof globalThis.VideoDecoder === "function"
        && typeof globalThis.AudioEncoder === "function"
        && typeof globalThis.AudioDecoder === "function"
        && typeof globalThis.VideoFrame === "function"
        && typeof globalThis.AudioData === "function";

    const session = {
        videoEncoder: null,
        videoDecoder: null,
        audioEncoder: null,
        audioDecoder: null,
        codec: null,
        framesDecoded: 0,
    };

    function setStatus(text) {
        statusEl.textContent = text;
    }

    function markCompleted(buttonId) {
        const el = document.getElementById(buttonId);
        if (el)
            el.classList.add("completed");
    }

    /**
     * Renders a solid background, a moving colored box to simulate motion, and text showing the current frame index.
     */
    function drawLocalFrame(i) {
        localCtx.fillStyle = "#1e1e1e";
        localCtx.fillRect(0, 0, FRAME_WIDTH, FRAME_HEIGHT);

        const boxSize = 200;
        const x = (i * 15) % (FRAME_WIDTH - boxSize);
        const y = Math.abs(Math.sin(i * 0.1)) * (FRAME_HEIGHT - boxSize);

        const hue = (i * 2) % 360;
        localCtx.fillStyle = `hsl(${hue}, 80%, 60%)`;
        localCtx.fillRect(x, y, boxSize, boxSize);

        localCtx.fillStyle = "#ffffff";
        localCtx.font = "40px sans-serif";
        localCtx.fillText(`Frame ${i}`, 20, 50);
    }

    async function initializeVideoSession() {
        if (!webCodecsSupported)
            throw new Error("WebCodecs not supported");

        try {
            const support = await VideoEncoder.isConfigSupported({
                codec: VIDEO_CODEC,
                width: FRAME_WIDTH,
                height: FRAME_HEIGHT,
                bitrate: VIDEO_BITRATE,
                framerate: VIDEO_FRAMERATE,
            });
            if (!support || !support.supported)
                throw new Error(`Video codec ${VIDEO_CODEC} not supported`);

            session.videoDecoder = new VideoDecoder({
                output(frame) {
                    remoteCtx.drawImage(frame, 0, 0, FRAME_WIDTH, FRAME_HEIGHT);
                    frame.close();
                    session.framesDecoded++;
                },
                error(e) {
                    throw e;
                },
            });

            session.videoEncoder = new VideoEncoder({
                output(chunk, metadata) {
                    if (metadata && metadata.decoderConfig && session.videoDecoder.state !== "configured")
                        session.videoDecoder.configure(metadata.decoderConfig);
                    if (session.videoDecoder.state === "configured")
                        session.videoDecoder.decode(chunk);
                },
                error(e) {
                    throw e;
                },
            });

            session.videoEncoder.configure({
                codec: VIDEO_CODEC,
                width: FRAME_WIDTH,
                height: FRAME_HEIGHT,
                bitrate: VIDEO_BITRATE,
                framerate: VIDEO_FRAMERATE,
            });

            setStatus(`Video session joined (codec=${VIDEO_CODEC})`);
        } catch (e) {
            setStatus(`Video codec init failed: ${e.message}`);
            throw e;
        }
    }

    async function initializeAudioSession() {
        if (!webCodecsSupported)
            throw new Error("WebCodecs not supported");

        try {
            const audioOutputBuffer = new Float32Array(AUDIO_DECODER_BUFFER_SIZE);
            session.audioDecoder = new AudioDecoder({
                output(data) {
                    const sampleCount = data.numberOfFrames * data.numberOfChannels;
                    let targetBuffer;
                    if (sampleCount <= audioOutputBuffer.length)
                        targetBuffer = audioOutputBuffer.subarray(0, sampleCount);
                    else
                        targetBuffer = new Float32Array(sampleCount);
                    // Copy the decoded audio into JavaScript memory, simulating how a real app reads audio to play through speakers.
                    // This ensures the browser actually performs the work of reading audio out of the decoder instead of taking shortcuts.
                    data.copyTo(targetBuffer, { planeIndex: 0 });
                    data.close();
                },
                error(e) {
                    throw e;
                },
            });

            session.audioEncoder = new AudioEncoder({
                output(chunk, metadata) {
                    if (metadata && metadata.decoderConfig && session.audioDecoder.state !== "configured")
                        session.audioDecoder.configure(metadata.decoderConfig);
                    if (session.audioDecoder.state === "configured")
                        session.audioDecoder.decode(chunk);
                },
                error(e) {
                    throw e;
                },
            });

            session.audioEncoder.configure({
                codec: "opus",
                sampleRate: AUDIO_SAMPLE_RATE,
                numberOfChannels: AUDIO_CHANNELS,
                bitrate: AUDIO_BITRATE,
            });

            setStatus("Audio session joined");
        } catch (e) {
            setStatus(`Audio codec init failed: ${e.message}`);
            throw e;
        }
    }

    async function simulateVideoCall() {
        if (!session.videoEncoder)
            throw new Error("VideoEncoder not initialized");
        for (let i = 0; i < VIDEO_FRAME_COUNT; i++) {
            drawLocalFrame(i);

            const frame = new VideoFrame(localCanvas, { timestamp: i * VIDEO_FRAME_DURATION_US });
            session.videoEncoder.encode(frame);
            frame.close();
        }

        await session.videoEncoder.flush();
        await session.videoDecoder.flush();

        if (session.framesDecoded !== VIDEO_FRAME_COUNT)
            throw new Error(`Expected ${VIDEO_FRAME_COUNT} frames decoded, got ${session.framesDecoded}`);
        setStatus(`Frames decoded: ${session.framesDecoded}`);
    }

    async function simulateVoiceCall(processedSamples) {
        if (!session.audioEncoder)
            throw new Error("Benchmark error: AudioEncoder not initialized");
        const sourceSamples = processedSamples || PRE_GENERATED_AUDIO_SAMPLES;
        const frameDurationUs = (AUDIO_FRAME_SIZE * MICROSECONDS_PER_SECOND) / AUDIO_SAMPLE_RATE;
        for (let i = 0; i < AUDIO_FRAME_COUNT; i++) {
            const audioBuffer = sourceSamples.subarray(i * AUDIO_FRAME_SIZE, (i + 1) * AUDIO_FRAME_SIZE);
            const audioData = new AudioData({
                format: "f32",
                sampleRate: AUDIO_SAMPLE_RATE,
                numberOfFrames: AUDIO_FRAME_SIZE,
                numberOfChannels: AUDIO_CHANNELS,
                timestamp: i * frameDurationUs,
                data: audioBuffer,
            });
            session.audioEncoder.encode(audioData);
            audioData.close();
        }
        await session.audioEncoder.flush();
        await session.audioDecoder.flush();
    }

    /**
     * Simulates a realistic voice-chat audio processing pipeline.
     * We run an OfflineAudioContext in stereo to test:
     * - A 5-node graph (Source -> Filter -> Compressor -> Gain -> StereoPanner).
     * - Parameter automations (panning sweeps, volume changes, and filter sweeps)
     *   to stress-test sample-accurate calculations on the audio rendering thread.
     */
    async function simulateAudioEffects() {
        const length = AUDIO_SAMPLE_RATE * AUDIO_OFFLINE_DURATION_SECONDS;
        // Run stereo to support panning
        const offline = new OfflineAudioContext(STEREO_CHANNELS, length, AUDIO_SAMPLE_RATE);
        const buffer = offline.createBuffer(AUDIO_CHANNELS, length, AUDIO_SAMPLE_RATE);
        const channel = buffer.getChannelData(0);
        channel.set(PRE_GENERATED_AUDIO_SAMPLES);

        const source = offline.createBufferSource();
        source.buffer = buffer;

        const highpass = offline.createBiquadFilter();
        highpass.type = "highpass";
        // Automate highpass filter cutoff frequency
        highpass.frequency.setValueAtTime(100, 0);
        highpass.frequency.linearRampToValueAtTime(150, AUDIO_OFFLINE_DURATION_SECONDS / 2);
        highpass.frequency.linearRampToValueAtTime(100, AUDIO_OFFLINE_DURATION_SECONDS);

        const compressor = offline.createDynamicsCompressor();

        const gain = offline.createGain();
        // Automate gain to simulate voice level fluctuations
        gain.gain.setValueAtTime(0.8, 0);
        gain.gain.linearRampToValueAtTime(0.5, AUDIO_OFFLINE_DURATION_SECONDS / 2);
        gain.gain.linearRampToValueAtTime(0.8, AUDIO_OFFLINE_DURATION_SECONDS);

        const panner = offline.createStereoPanner();
        // Automate panning to simulate user positioning/movement in stereo space
        panner.pan.setValueAtTime(-1.0, 0);
        panner.pan.linearRampToValueAtTime(1.0, AUDIO_OFFLINE_DURATION_SECONDS);

        // Connect the graph
        source.connect(highpass).connect(compressor).connect(gain).connect(panner).connect(offline.destination);

        source.start(0);
        const renderedBuffer = await offline.startRendering();
        return renderedBuffer.getChannelData(0);
    }

    function teardownSession() {
        session.videoEncoder?.close();
        session.videoDecoder?.close();
        session.audioEncoder?.close();
        session.audioDecoder?.close();
        session.videoEncoder = null;
        session.videoDecoder = null;
        session.audioEncoder = null;
        session.audioDecoder = null;

        localCtx.clearRect(0, 0, FRAME_WIDTH, FRAME_HEIGHT);
        remoteCtx.clearRect(0, 0, FRAME_WIDTH, FRAME_HEIGHT);

        setStatus("Left call");
    }

    async function runVideoBenchmark() {
        try {
            await initializeVideoSession();
            await simulateVideoCall();
            teardownSession();
            markCompleted("video-benchmark");
        } catch (e) {
            setStatus(`VideoChat failed: ${e.message}`);
            throw e;
        }
    }

    async function runVoiceBenchmark() {
        try {
            await initializeAudioSession();
            // WebAudio
            const processedAudio = await simulateAudioEffects();
            // WebCodecs
            await simulateVoiceCall(processedAudio);
            setStatus("Audio processed");
            teardownSession();
            markCompleted("voice-benchmark");
        } catch (e) {
            setStatus(`VoiceChat failed: ${e.message}`);
            throw e;
        }
    }

    document.getElementById("video-benchmark").addEventListener("click", runVideoBenchmark);
    document.getElementById("voice-benchmark").addEventListener("click", runVoiceBenchmark);
})();
