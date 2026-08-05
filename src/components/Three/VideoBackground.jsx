import React, { useEffect, useRef, useState } from 'react';

/**
 * Full-screen seamless crossfading video background.
 * Uses two video elements to create a smooth transition before the video ends,
 * masking any jump cuts from non-looping AI generated videos.
 */
const VideoBackground = ({ brightness = 1.0 }) => {
  const videoRef1 = useRef(null);
  const videoRef2 = useRef(null);
  const [activeVideo, setActiveVideo] = useState(1);

  useEffect(() => {
    const v1 = videoRef1.current;
    const v2 = videoRef2.current;
    if (!v1 || !v2) return;

    v1.muted = true; v1.playsInline = true;
    v2.muted = true; v2.playsInline = true;

    // Crossfade duration in seconds
    const fadeDuration = 2.0; 

    const handleTimeUpdate = (e) => {
      const video = e.target;
      const otherVideo = video === v1 ? v2 : v1;
      
      // If we are within `fadeDuration` seconds of the end, start the other video
      if (video.duration && video.currentTime >= video.duration - fadeDuration && otherVideo.paused) {
        otherVideo.currentTime = 0;
        otherVideo.play().catch(() => {});
        setActiveVideo(video === v1 ? 2 : 1);
      }
    };

    const tryPlay = () => {
      const activeV = activeVideo === 1 ? v1 : v2;
      activeV.play().catch(() => {});
    };

    v1.addEventListener('timeupdate', handleTimeUpdate);
    v2.addEventListener('timeupdate', handleTimeUpdate);

    tryPlay();

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        tryPlay();
      } else {
        v1.pause();
        v2.pause();
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      v1.removeEventListener('timeupdate', handleTimeUpdate);
      v2.removeEventListener('timeupdate', handleTimeUpdate);
      v1.pause();
      v2.pause();
    };
  }, [activeVideo]);

  // Higher brightness → slightly less dark overlay; floor keeps text readable
  const overlayAlpha = Math.min(0.72, Math.max(0.35, 0.78 - brightness * 0.28));

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-cyber-black">
      <video
        ref={videoRef1}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[2000ms] ease-in-out ${activeVideo === 1 ? 'opacity-100' : 'opacity-0'}`}
        muted
        playsInline
        preload="auto"
      >
        <source src="/grok-bg.mp4" type="video/mp4" />
      </video>
      <video
        ref={videoRef2}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[2000ms] ease-in-out ${activeVideo === 2 ? 'opacity-100' : 'opacity-0'}`}
        muted
        playsInline
        preload="auto"
      >
        <source src="/grok-bg.mp4" type="video/mp4" />
      </video>

      {/* Readability overlay — keeps hero text clear over bright plasma */}
      <div
        className="absolute inset-0 bg-cyber-black transition-opacity duration-500"
        style={{ opacity: overlayAlpha }}
      />
      <div className="background-vignette" />
    </div>
  );
};

export default VideoBackground;
