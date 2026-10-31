/**
 * runner.js
 * Unified Video Playback Engine & Router for:
 *  - .m3u8 (HLS via Hls.js with Safari fallback)
 *  - .mp4, .mkv, .webm, Cloudinary (HTML5 progressive media & multi-audio)
 *  - .mpd (MPEG-DASH with ClearKey DRM via JWPlayer)
 *  - YouTube (via YouTube IFrame API)
 *  - Iframe generic stream fallback
 */

// ============================================================================
// 1. HLS ENGINE (.m3u8)
// ============================================================================
export class HlsPlayerEngine {
  constructor(videoElement, callbacks = {}) {
    this.video = videoElement;
    this.callbacks = callbacks; // onDuration, onAudioTracks, onSubtitles, onEnded
    this.hls = null;
    this.availableLevels = [];
  }

  isSupported(url) {
    return Boolean(url && url.includes('.m3u8'));
  }

  load(url, startTime = 0) {
    this.destroy();

    const applyResume = () => {
      const dur = this.video.duration;
      if (!isNaN(dur) && dur > 0) {
        if (this.callbacks.onDuration) this.callbacks.onDuration(dur);
        this.video.currentTime = startTime % dur;
      }
      this.video.play().catch(() => {});
    };

    if (window.Hls && window.Hls.isSupported()) {
      this.hls = new window.Hls({
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 8,
        enableWorker: true
      });

      this.hls.loadSource(url);
      this.hls.attachMedia(this.video);

      this.hls.on(window.Hls.Events.MANIFEST_PARSED, (e, data) => {
        applyResume();
        this.availableLevels = data.levels || [];
        if (this.callbacks.onAudioTracks) {
          this.callbacks.onAudioTracks(this.hls.audioTracks || []);
        }
      });

      this.hls.on(window.Hls.Events.SUBTITLE_TRACKS_UPDATED, (e, data) => {
        if (this.callbacks.onSubtitles) {
          this.callbacks.onSubtitles(data.subtitleTracks || []);
        }
      });
    } else if (this.video.canPlayType('application/vnd.apple.mpegurl')) {
      this.video.src = url;
      this.video.onloadedmetadata = () => applyResume();
    }

    this.video.onended = () => {
      if (this.callbacks.onEnded) this.callbacks.onEnded();
    };
  }

  setQualityTier(tier) {
    if (!this.hls || !this.availableLevels.length) return;

    if (tier === 'auto') {
      this.hls.currentLevel = -1;
      return 'Auto';
    }

    let matchedIdx = -1;
    if (tier === 'fhd') {
      matchedIdx = this.availableLevels.reduce((best, lvl, idx) => 
        (lvl.height >= 1080 && (best === -1 || lvl.height > this.availableLevels[best].height)) ? idx : best, -1);
      if (matchedIdx === -1) matchedIdx = this.availableLevels.length - 1;
    } else if (tier === 'hd') {
      matchedIdx = this.availableLevels.reduce((best, lvl, idx) => 
        (lvl.height >= 480 && lvl.height <= 720) ? idx : best, -1);
      if (matchedIdx === -1) matchedIdx = Math.floor(this.availableLevels.length / 2);
    } else if (tier === 'saver') {
      matchedIdx = this.availableLevels.reduce((best, lvl, idx) => 
        (lvl.height <= 360 && (best === -1 || lvl.height < this.availableLevels[best].height)) ? idx : best, -1);
      if (matchedIdx === -1) matchedIdx = 0;
    }

    if (matchedIdx !== -1) {
      this.hls.currentLevel = matchedIdx;
    }
  }

  setAudioTrack(trackIdx) {
    if (this.hls) {
      this.hls.audioTrack = trackIdx;
    }
  }

  setSubtitleTrack(trackIdx) {
    if (this.hls) {
      this.hls.subtitleTrack = trackIdx;
    }
  }

  destroy() {
    if (this.hls) {
      try { this.hls.destroy(); } catch (e) {}
      this.hls = null;
    }
    this.availableLevels = [];
  }
}

// ============================================================================
// 2. NATIVE ENGINE (.mp4, .mkv, .webm, Cloudinary)
// ============================================================================
export class NativePlayerEngine {
  constructor(videoElement, callbacks = {}) {
    this.video = videoElement;
    this.callbacks = callbacks;
    this.currentActiveAudioUrl = null;
  }

  isSupported(url) {
    if (!url) return false;
    return url.endsWith('.mp4') || 
           url.includes('.mkv') || 
           url.includes('.webm') || 
           url.includes('cloudinary');
  }

  load(url, startTime = 0, mediaMetadata = {}) {
    this.currentActiveAudioUrl = url;
    this.video.src = url;

    let applied = false;
    const applyResume = () => {
      if (applied) return;
      applied = true;

      const dur = this.video.duration;
      if (!isNaN(dur) && dur > 0) {
        if (this.callbacks.onDuration) this.callbacks.onDuration(dur);
        this.video.currentTime = startTime % dur;
      }
      this.video.play().catch(() => {});
      this.extractTracks(mediaMetadata);
    };

    this.video.onloadedmetadata = applyResume;
    if (this.video.readyState >= 1) applyResume();

    this.video.onended = () => {
      if (this.callbacks.onEnded) this.callbacks.onEnded();
    };
  }

  extractTracks(dataObj) {
    if (this.video.textTracks && this.video.textTracks.length > 0) {
      const subTracks = Array.from(this.video.textTracks).map((t, idx) => ({
        name: t.label || t.language || `Track ${idx + 1}`
      }));
      if (this.callbacks.onSubtitles) this.callbacks.onSubtitles(subTracks);
    }

    const multi = (dataObj && (dataObj["Multi-Language"] || dataObj.multiLanguage || dataObj.MultiLanguage)) || {};
    const defaultLang = (dataObj && dataObj.Language) || "Hindi";
    const audioOptions = [];

    if (Object.keys(multi).length > 0) {
      audioOptions.push({
        type: 'custom',
        url: this.video.src,
        label: `${defaultLang} (Default)`,
        active: !this.currentActiveAudioUrl || this.currentActiveAudioUrl === this.video.src
      });

      Object.keys(multi).forEach(langKey => {
        const audioUrl = multi[langKey].trim().replace(/^http:\/\//i, 'https://');
        audioOptions.push({
          type: 'custom',
          url: audioUrl,
          label: langKey,
          active: this.currentActiveAudioUrl === audioUrl
        });
      });
    } else if (this.video.audioTracks && this.video.audioTracks.length > 0) {
      Array.from(this.video.audioTracks).forEach((track, idx) => {
        audioOptions.push({
          type: 'embedded',
          index: idx,
          label: track.label || track.language || `Audio Track ${idx + 1}`,
          active: track.enabled || idx === 0
        });
      });
    } else {
      audioOptions.push({
        type: 'custom',
        url: this.video.src,
        label: defaultLang,
        active: true
      });
    }

    if (this.callbacks.onAudioListReady) {
      this.callbacks.onAudioListReady(audioOptions);
    }
  }

  switchCustomAudio(url) {
    if (!url || url === this.currentActiveAudioUrl) return;
    const curTime = this.video.currentTime || 0;
    this.currentActiveAudioUrl = url;
    this.video.src = url;
    this.video.currentTime = curTime;
    this.video.play().catch(() => {});
  }

  switchEmbeddedAudio(index) {
    if (this.video.audioTracks) {
      Array.from(this.video.audioTracks).forEach((t, i) => t.enabled = (i === index));
    }
  }

  destroy() {
    this.video.pause();
    this.video.removeAttribute('src');
    this.video.load();
    while (this.video.firstChild) {
      this.video.removeChild(this.video.firstChild);
    }
    this.currentActiveAudioUrl = null;
  }
}

// ============================================================================
// 3. DASH DRM ENGINE (.mpd via JWPlayer)
// ============================================================================
export class DashPlayerEngine {
  constructor(hostElementId, callbacks = {}) {
    this.hostElementId = hostElementId;
    this.callbacks = callbacks;
    this.jwInstance = null;
  }

  isSupported(url, mpdObj) {
    return Boolean(url && url.includes('.mpd')) || Boolean(mpdObj && (mpdObj.File || mpdObj.file));
  }

  load(mpdUrl, keyId, key, startTime = 0) {
    this.destroy();

    const host = document.getElementById(this.hostElementId);
    if (!host) return;
    host.style.display = 'block';
    host.innerHTML = '<div id="jwActualContainer"></div>';

    const drmConfig = (keyId && key) ? {
      clearkey: {
        keyId: keyId.toString().trim(),
        key: key.toString().trim()
      }
    } : undefined;

    if (!window.jwplayer) {
      console.error("JWPlayer library not loaded.");
      return;
    }

    this.jwInstance = window.jwplayer("jwActualContainer").setup({
      playlist: [{
        file: mpdUrl,
        type: "dash",
        drm: drmConfig
      }],
      autostart: true,
      mute: false,
      volume: 100,
      width: "100%",
      height: "100%",
      stretching: "exactfit",
      controls: false
    });

    this.jwInstance.on('ready', () => {
      if (startTime > 0) this.jwInstance.seek(startTime);
    });

    this.jwInstance.on('time', (e) => {
      if (this.callbacks.onTimeUpdate) {
        this.callbacks.onTimeUpdate(e.position, e.duration);
      }
    });

    this.jwInstance.on('play', () => {
      if (this.callbacks.onPlayStateChange) this.callbacks.onPlayStateChange(true);
    });

    this.jwInstance.on('pause', () => {
      if (this.callbacks.onPlayStateChange) this.callbacks.onPlayStateChange(false);
    });

    this.jwInstance.on('complete', () => {
      if (this.callbacks.onEnded) this.callbacks.onEnded();
    });
  }

  seek(seconds) {
    if (this.jwInstance && this.jwInstance.seek) {
      this.jwInstance.seek(seconds);
    }
  }

  togglePlay() {
    if (!this.jwInstance) return;
    if (this.jwInstance.getState() === 'playing') this.jwInstance.pause();
    else this.jwInstance.play();
  }

  destroy() {
    if (window.jwplayer && this.jwInstance && this.jwInstance.getState) {
      try { this.jwInstance.remove(); } catch (e) {}
      this.jwInstance = null;
    }
    const host = document.getElementById(this.hostElementId);
    if (host) {
      host.innerHTML = '<div id="jwActualContainer"></div>';
      host.style.display = 'none';
    }
  }
}

// ============================================================================
// 4. YOUTUBE ENGINE
// ============================================================================
export class YouTubePlayerEngine {
  constructor(hostElementId, callbacks = {}) {
    this.hostElementId = hostElementId;
    this.callbacks = callbacks;
    this.ytPlayer = null;
    this.updateInterval = null;
  }

  extractId(url) {
    if (!url) return null;
    try {
      const u = new URL(url.trim());
      if (u.hostname.includes('youtu.be')) return u.pathname.slice(1).split('/')[0];
      if (u.hostname.includes('youtube.com') || u.hostname.includes('m.youtube.com')) {
        if (u.pathname === '/watch') return u.searchParams.get('v');
        if (u.pathname.startsWith('/embed/')) return u.pathname.split('/')[2];
        if (u.pathname.startsWith('/shorts/')) return u.pathname.split('/')[2];
      }
    } catch (e) {
      if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim();
    }
    return null;
  }

  load(videoId, startTime = 0) {
    this.destroy();

    const host = document.getElementById(this.hostElementId);
    if (!host) return;
    host.style.display = 'block';
    host.innerHTML = '<div id="ytActualPlayer"></div>';

    const playerVars = {
      autoplay: 1,
      controls: 0,
      disablekb: 1,
      modestbranding: 1,
      rel: 0,
      start: Math.floor(startTime),
      fs: 0,
      playsinline: 1,
      enablejsapi: 1,
      iv_load_policy: 3,
      origin: window.location.origin
    };

    this.ytPlayer = new window.YT.Player('ytActualPlayer', {
      host: 'https://www.youtube-nocookie.com',
      videoId: videoId,
      playerVars: playerVars,
      events: {
        onReady: (e) => {
          e.target.playVideo();
          if (startTime > 0) {
            const dur = e.target.getDuration();
            e.target.seekTo(dur && dur > 0 ? (startTime % dur) : startTime, true);
          }
        },
        onStateChange: (e) => {
          if (e.data === window.YT.PlayerState.PLAYING) {
            if (this.callbacks.onPlayStateChange) this.callbacks.onPlayStateChange(true);
            const realDur = e.target.getDuration();
            if (realDur && realDur > 0 && this.callbacks.onDuration) {
              this.callbacks.onDuration(realDur);
            }
          } else if (e.data === window.YT.PlayerState.ENDED) {
            if (this.callbacks.onEnded) this.callbacks.onEnded();
          } else {
            if (this.callbacks.onPlayStateChange) this.callbacks.onPlayStateChange(false);
          }
        }
      }
    });

    this.updateInterval = setInterval(() => {
      if (!this.ytPlayer || typeof this.ytPlayer.getCurrentTime !== 'function') return;
      const cur = this.ytPlayer.getCurrentTime() || 0;
      const dur = this.ytPlayer.getDuration() || 0;
      if (this.callbacks.onTimeUpdate) {
        this.callbacks.onTimeUpdate(cur, dur);
      }
    }, 500);
  }

  seek(seconds) {
    if (this.ytPlayer && this.ytPlayer.seekTo) {
      this.ytPlayer.seekTo(seconds, true);
    }
  }

  togglePlay() {
    if (!this.ytPlayer || !this.ytPlayer.getPlayerState) return;
    const s = this.ytPlayer.getPlayerState();
    if (s === window.YT.PlayerState.PLAYING) this.ytPlayer.pauseVideo();
    else this.ytPlayer.playVideo();
  }

  setPlaybackRate(speed) {
    if (this.ytPlayer && this.ytPlayer.setPlaybackRate) {
      this.ytPlayer.setPlaybackRate(speed);
    }
  }

  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    if (this.ytPlayer) {
      try { this.ytPlayer.stopVideo(); this.ytPlayer.destroy(); } catch (e) {}
      this.ytPlayer = null;
    }
    const host = document.getElementById(this.hostElementId);
    if (host) {
      host.innerHTML = '';
      host.style.display = 'none';
    }
  }
}

// ============================================================================
// 5. MASTER PLAYER ROUTER & MANAGER
// ============================================================================
export class PlayerManager {
  constructor(domElements, callbacks = {}) {
    this.videoEl = domElements.video;
    this.ytHostEl = domElements.ytHost;
    this.jwHostEl = domElements.jwHost;
    this.iframeEl = domElements.iframe;
    this.callbacks = callbacks;

    this.activeType = null; // 'hls' | 'native' | 'dash' | 'youtube' | 'iframe'

    this.hlsEngine = new HlsPlayerEngine(this.videoEl, {
      onDuration: (dur) => this.callbacks.onDuration?.(dur),
      onAudioTracks: (tracks) => this.callbacks.onHlsAudioTracks?.(tracks),
      onSubtitles: (subs) => this.callbacks.onSubtitles?.(subs),
      onEnded: () => this.callbacks.onEnded?.()
    });

    this.nativeEngine = new NativePlayerEngine(this.videoEl, {
      onDuration: (dur) => this.callbacks.onDuration?.(dur),
      onAudioListReady: (options) => this.callbacks.onNativeAudioListReady?.(options),
      onSubtitles: (subs) => this.callbacks.onSubtitles?.(subs),
      onEnded: () => this.callbacks.onEnded?.()
    });

    this.dashEngine = new DashPlayerEngine(this.jwHostEl.id, {
      onDuration: (dur) => this.callbacks.onDuration?.(dur),
      onTimeUpdate: (cur, dur) => this.callbacks.onTimeUpdate?.(cur, dur),
      onPlayStateChange: (isPlaying) => this.callbacks.onPlayStateChange?.(isPlaying),
      onEnded: () => this.callbacks.onEnded?.()
    });

    this.ytEngine = new YouTubePlayerEngine(this.ytHostEl.id, {
      onDuration: (dur) => this.callbacks.onDuration?.(dur),
      onTimeUpdate: (cur, dur) => this.callbacks.onTimeUpdate?.(cur, dur),
      onPlayStateChange: (isPlaying) => this.callbacks.onPlayStateChange?.(isPlaying),
      onEnded: () => this.callbacks.onEnded?.()
    });
  }

  destroyAll() {
    this.hlsEngine.destroy();
    this.nativeEngine.destroy();
    this.dashEngine.destroy();
    this.ytEngine.destroy();

    if (this.videoEl) this.videoEl.style.display = 'none';
    if (this.ytHostEl) this.ytHostEl.style.display = 'none';
    if (this.jwHostEl) this.jwHostEl.style.display = 'none';
    if (this.iframeEl) {
      this.iframeEl.style.display = 'none';
      this.iframeEl.src = 'about:blank';
    }
    this.activeType = null;
  }

  playStream(mediaData, startTime = 0) {
    this.destroyAll();

    const streamUrl = (mediaData.Stream || '').trim().replace(/^http:\/\//i, 'https://');
    const mpdObj = mediaData.mpd || mediaData.MPD || null;

    // 1. DASH .mpd (ClearKey DRM)
    let mpdFile = null;
    let keyId = null;
    let key = null;
    if (mpdObj && (mpdObj.File || mpdObj.file)) {
      mpdFile = (mpdObj.File || mpdObj.file).trim().replace(/^http:\/\//i, 'https://');
      keyId = mpdObj.KeyID || mpdObj.keyId || mpdObj.KeyId || mpdObj.keyid;
      key = mpdObj.Key || mpdObj.key;
    } else if (streamUrl.includes('.mpd')) {
      mpdFile = streamUrl;
      keyId = mpdObj ? (mpdObj.KeyID || mpdObj.keyId) : null;
      key = mpdObj ? (mpdObj.Key || mpdObj.key) : null;
    }

    if (mpdFile) {
      this.activeType = 'dash';
      this.dashEngine.load(mpdFile, keyId, key, startTime);
      return;
    }

    // 2. YouTube
    const ytId = this.ytEngine.extractId(streamUrl);
    if (ytId) {
      this.activeType = 'youtube';
      this.ytEngine.load(ytId, startTime);
      return;
    }

    // 3. HLS .m3u8
    if (this.hlsEngine.isSupported(streamUrl)) {
      this.activeType = 'hls';
      this.videoEl.style.display = 'block';
      this.hlsEngine.load(streamUrl, startTime);
      return;
    }

    // 4. Progressive Native Media (.mp4, .mkv, .webm, Cloudinary)
    if (this.nativeEngine.isSupported(streamUrl)) {
      this.activeType = 'native';
      this.videoEl.style.display = 'block';
      this.nativeEngine.load(streamUrl, startTime, mediaData);
      return;
    }

    // 5. Iframe fallback
    if (streamUrl) {
      this.activeType = 'iframe';
      this.iframeEl.style.display = 'block';
      this.iframeEl.src = streamUrl;
    }
  }

  seek(deltaSeconds) {
    if (this.activeType === 'youtube') {
      const cur = this.ytEngine.ytPlayer?.getCurrentTime() || 0;
      this.ytEngine.seek(Math.max(0, cur + deltaSeconds));
    } else if (this.activeType === 'dash') {
      const cur = this.dashEngine.jwInstance?.getPosition() || 0;
      this.dashEngine.seek(Math.max(0, cur + deltaSeconds));
    } else if (this.videoEl && this.videoEl.duration) {
      this.videoEl.currentTime = Math.max(0, Math.min(this.videoEl.duration, this.videoEl.currentTime + deltaSeconds));
    }
  }

  seekToSeconds(sec) {
    if (this.activeType === 'youtube') this.ytEngine.seek(sec);
    else if (this.activeType === 'dash') this.dashEngine.seek(sec);
    else if (this.videoEl) this.videoEl.currentTime = sec;
  }

  togglePlay() {
    if (this.activeType === 'youtube') this.ytEngine.togglePlay();
    else if (this.activeType === 'dash') this.dashEngine.togglePlay();
    else if (this.videoEl) {
      if (this.videoEl.paused) this.videoEl.play();
      else this.videoEl.pause();
    }
  }

  setSpeed(speed) {
    if (this.videoEl) this.videoEl.playbackRate = speed;
    if (this.activeType === 'youtube') this.ytEngine.setPlaybackRate(speed);
  }

  setQualityTier(tier) {
    if (this.activeType === 'hls') {
      this.hlsEngine.setQualityTier(tier);
    }
  }

  setHlsAudio(idx) {
    if (this.activeType === 'hls') {
      this.hlsEngine.setAudioTrack(idx);
    }
  }

  setSubtitle(idx) {
    if (this.activeType === 'hls') {
      this.hlsEngine.setSubtitleTrack(idx);
    }
  }
}

// Attach to window for script-tag usage if not using ES modules
if (typeof window !== 'undefined') {
  window.PlayerManager = PlayerManager;
}

export default PlayerManager;
