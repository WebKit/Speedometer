# Media Asset Attributions

## bigbuckbunny-video.webm and bigbuckbunny-audio.webm

Excerpt from "Big Buck Bunny" (https://peach.blender.org/), © 2008 Blender
Foundation. Licensed under the Creative Commons Attribution 3.0 Unported
License (https://creativecommons.org/licenses/by/3.0/).

The assets are bundled here solely as deterministic input for the
Media-Streaming workload. The original source file (`bbb_sunflower_1080p_60fps_normal.mp4.zip`) was obtained from the official [Blender Foundation repository](https://peach.blender.org/download/). It was re-encoded using FFmpeg 8.1.2 (specifically Lavc 62.28.102 / Lavf 62.12.102) into separate single-track WebM representations (VP9 video and Opus audio, DASH streaming architecture):

```bash
# Pass 1: VP9 Video Stream
ffmpeg -y -i bbb_sunflower_1080p_60fps_normal.mp4 -c:v libvpx-vp9 \
  -b:v 4M -minrate 1.5M -maxrate 8.8M -crf 31 \
  -g 300 -keyint_min 0 \
  -tile-columns 2 -threads 8 -speed 4 \
  -auto-alt-ref 1 -arnr_max_frames 7 -arnr_strength 5 -arnr_type 3 \
  -rc_lookahead 24 -enable-tpl 1 \
  -pass 1 -an -f null /dev/null

# Pass 2: VP9 Video Stream
ffmpeg -y -i bbb_sunflower_1080p_60fps_normal.mp4 -c:v libvpx-vp9 \
  -b:v 4M -minrate 1.5M -maxrate 8.8M -crf 31 \
  -g 300 -keyint_min 0 \
  -tile-columns 2 -threads 8 -speed 2 \
  -auto-alt-ref 1 -arnr_max_frames 7 -arnr_strength 5 -arnr_type 3 \
  -rc_lookahead 24 -enable-tpl 1 \
  -pass 2 -an \
  bigbuckbunny-video.webm

# Extract Opus Audio Stream
ffmpeg -y -i bbb_sunflower_1080p_60fps_normal.mp4 -vn \
  -c:a libopus -b:a 128k -ac 2 \
  bigbuckbunny-audio.webm
```

This delivers a 2-pass VP9 video stream (1080p, 60fps) with alternate reference frames (`-auto-alt-ref 1`), a 5-second keyframe interval (`-g 300`), and ~4 Mbps bitrate for decoder stress testing, paired with a separate Opus audio stream (stereo, 128k) in dedicated WebM containers.
