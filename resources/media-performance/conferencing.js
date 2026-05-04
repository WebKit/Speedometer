(function () {
    const localCanvas = document.getElementById("local-canvas");
    const remoteCanvas = document.getElementById("remote-canvas");
    const localCtx = localCanvas.getContext("2d");
    const remoteCtx = remoteCanvas.getContext("2d");
    const statusEl = document.getElementById("status");

    const FRAME_WIDTH = 1920;
    const FRAME_HEIGHT = 1080;
    const VIDEO_FRAME_COUNT = 10;
    const AUDIO_FRAME_COUNT = 100;
    const AUDIO_SAMPLE_RATE = 48000;
    const AUDIO_FRAME_SIZE = 1024;
    const AUDIO_OFFLINE_DURATION_SECONDS = 30;
    const AUDIO_TONE_HZ = 440;

    // TODO(lowkey): Might need to do VP9 for more compatability. Can be discussed later.
    const VIDEO_CODEC = "av01.0.04M.08";

    const webCodecsSupported =
        typeof globalThis.VideoEncoder === "function" &&
        typeof globalThis.VideoDecoder === "function" &&
        typeof globalThis.AudioEncoder === "function" &&
        typeof globalThis.AudioDecoder === "function" &&
        typeof globalThis.VideoFrame === "function" &&
        typeof globalThis.AudioData === "function";

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
        if (el) el.classList.add("completed");
    }

    function drawLocalFrame(i) {
        // Solid background
        localCtx.fillStyle = "#1e1e1e";
        localCtx.fillRect(0, 0, FRAME_WIDTH, FRAME_HEIGHT);

        // Add a moving box to force the encoder to do motion estimation
        const boxSize = 200;
        const x = (i * 15) % (FRAME_WIDTH - boxSize);
        const y = Math.abs(Math.sin(i * 0.1)) * (FRAME_HEIGHT - boxSize);
        
        // Use a smoothly changing hue for the box
        const hue = (i * 2) % 360;
        localCtx.fillStyle = `hsl(${hue}, 80%, 60%)`;
        localCtx.fillRect(x, y, boxSize, boxSize);

        // Text that changes every frame
        localCtx.fillStyle = "#ffffff";
        localCtx.font = "40px sans-serif";
        localCtx.fillText(`Frame ${i}`, 20, 50);
    }

    function buildVideoPipeline() {
        session.videoDecoder = new VideoDecoder({
            output(frame) {
                remoteCtx.drawImage(frame, 0, 0, FRAME_WIDTH, FRAME_HEIGHT);
                frame.close();
                session.framesDecoded++;
            },
            error(e) { throw e; },
        });

        session.videoEncoder = new VideoEncoder({
            output(chunk, metadata) {
                if (metadata && metadata.decoderConfig && session.videoDecoder.state !== "configured") session.videoDecoder.configure(metadata.decoderConfig);
                if (session.videoDecoder.state === "configured") session.videoDecoder.decode(chunk);
            },
            error(e) { throw e; },
        });

        session.videoEncoder.configure({
            codec: VIDEO_CODEC,
            width: FRAME_WIDTH,
            height: FRAME_HEIGHT,
            bitrate: 1_000_000,
            framerate: 30,
        });
    }

    function buildAudioPipeline() {
        session.audioDecoder = new AudioDecoder({
            output(data) {
                data.close();
            },
            error(e) { throw e; },
        });

        session.audioEncoder = new AudioEncoder({
            output(chunk, metadata) {
                if (!session.audioDecoder) return;
                if (metadata && metadata.decoderConfig && session.audioDecoder.state !== "configured") session.audioDecoder.configure(metadata.decoderConfig);
                if (session.audioDecoder.state === "configured") session.audioDecoder.decode(chunk);
            },
            error(e) { throw e; },
        });

        session.audioEncoder.configure({
            codec: "opus",
            sampleRate: AUDIO_SAMPLE_RATE,
            numberOfChannels: 1,
            bitrate: 96_000,
        });
    }

    async function warmVideoEncoder() {
        if (!session.videoEncoder) return;
        drawLocalFrame(0);
        const frame = new VideoFrame(localCanvas, { timestamp: 0 });
        try {
            session.videoEncoder.encode(frame);
        } finally {
            frame.close();
        }
        try {
            await session.videoEncoder.flush();
        } catch (_) {}
    }

    async function joinCall() {
        drawLocalFrame(0);

        if (!webCodecsSupported) {
            throw new Error("WebCodecs not supported");
        }

        try {
            const support = await VideoEncoder.isConfigSupported({
                codec: VIDEO_CODEC,
                width: FRAME_WIDTH,
                height: FRAME_HEIGHT,
                bitrate: 1_000_000,
                framerate: 30,
            });
            if (!support || !support.supported) {
                throw new Error(`Video codec ${VIDEO_CODEC} not supported`);
            }

            buildVideoPipeline();
            buildAudioPipeline();
            // Warm the encoder by running one full encode/flush so codec init
            // cost lands in JoinCall (mirrors a real "joining" latency) and
            // EncodeRemoteFrames measures steady-state throughput.
            await warmVideoEncoder();
            setStatus(`Joined (codec=${VIDEO_CODEC})`);
        } catch (e) {
            setStatus(`Codec init failed: ${e.message}`);
            throw e;
        }
    }

    async function encodeRemoteFrames() {
        for (let i = 1; i <= VIDEO_FRAME_COUNT; i++) {
            drawLocalFrame(i);
            if (!session.videoEncoder) {
                throw new Error("VideoEncoder not initialized");
            }
            const frame = new VideoFrame(localCanvas, { timestamp: i * 33333 });
            try {
                session.videoEncoder.encode(frame);
            } finally {
                frame.close();
            }
        }

        if (session.videoEncoder) {
            try {
                await session.videoEncoder.flush();
                await session.videoDecoder.flush();
            } catch (_) {}
        }

        setStatus(`Frames decoded: ${session.framesDecoded}`);
    }

    function makeAudioFrameData() {
        const data = new Float32Array(AUDIO_FRAME_SIZE);
        const omega = (2 * Math.PI * AUDIO_TONE_HZ) / AUDIO_SAMPLE_RATE;
        for (let i = 0; i < AUDIO_FRAME_SIZE; i++) data[i] = Math.sin(omega * i);
        return data;
    }

    async function runOpusRoundTrip() {
        if (!session.audioEncoder) return;
        const audioBuffer = makeAudioFrameData();
        const frameDurationUs = (AUDIO_FRAME_SIZE * 1_000_000) / AUDIO_SAMPLE_RATE;
        for (let i = 0; i < AUDIO_FRAME_COUNT; i++) {
            const audioData = new AudioData({
                format: "f32",
                sampleRate: AUDIO_SAMPLE_RATE,
                numberOfFrames: AUDIO_FRAME_SIZE,
                numberOfChannels: 1,
                timestamp: i * frameDurationUs,
                data: audioBuffer,
            });
            try {
                session.audioEncoder.encode(audioData);
            } finally {
                audioData.close();
            }
        }
        try {
            await session.audioEncoder.flush();
            await session.audioDecoder.flush();
        } catch (_) {}
    }

    async function runWebAudioGraph() {
        // OfflineAudioContext timing depends only on engine work.
        const length = AUDIO_SAMPLE_RATE * AUDIO_OFFLINE_DURATION_SECONDS;
        const offline = new OfflineAudioContext(1, length, AUDIO_SAMPLE_RATE);
        const buffer = offline.createBuffer(1, length, AUDIO_SAMPLE_RATE);
        const channel = buffer.getChannelData(0);
        const omega = (2 * Math.PI * AUDIO_TONE_HZ) / AUDIO_SAMPLE_RATE;
        for (let i = 0; i < length; i++) channel[i] = Math.sin(omega * i);

        const source = offline.createBufferSource();
        source.buffer = buffer;

        // Highpass for noise floor, gain for AGC.
        const highpass = offline.createBiquadFilter();
        highpass.type = "highpass";
        highpass.frequency.value = 100;

        const gain = offline.createGain();
        gain.gain.value = 0.8;

        source.connect(highpass).connect(gain).connect(offline.destination);
        source.start(0);
        await offline.startRendering();
    }

    async function processAudio() {
        await runOpusRoundTrip();
        await runWebAudioGraph();
        setStatus("Audio processed");
    }

    function closeIfOpen(codec) {
        if (codec && codec.state !== "closed") {
            codec.close();
        }
    }

    function leaveCall() {
        closeIfOpen(session.videoEncoder);
        closeIfOpen(session.videoDecoder);
        closeIfOpen(session.audioEncoder);
        closeIfOpen(session.audioDecoder);
        session.videoEncoder = null;
        session.videoDecoder = null;
        session.audioEncoder = null;
        session.audioDecoder = null;

        localCtx.clearRect(0, 0, FRAME_WIDTH, FRAME_HEIGHT);
        remoteCtx.clearRect(0, 0, FRAME_WIDTH, FRAME_HEIGHT);

        setStatus("Left call");
    }

    async function runVideoChat() {
        try {
            await joinCall();
            await encodeRemoteFrames();
            markCompleted("video-chat");
        } catch (e) {
            setStatus(`VideoChat failed: ${e.message}`);
            throw e;
        }
    }

    async function runVoiceChat() {
        try {
            await processAudio();
            leaveCall();
            markCompleted("voice-chat");
        } catch (e) {
            setStatus(`VoiceChat failed: ${e.message}`);
            throw e;
        }
    }

    document.getElementById("video-chat").addEventListener("click", runVideoChat);
    document.getElementById("voice-chat").addEventListener("click", runVoiceChat);
})();