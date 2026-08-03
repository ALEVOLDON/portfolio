import React, { useEffect, useRef } from 'react';

/**
 * Full-screen looping video background (compressed /bg-plasma.mp4).
 * Mirrors PlasmaBackground placement: fixed, behind UI, with vignette.
 * brightness prop darkens overlay so UI stays readable.
 */
const VideoBackground = ({ brightness = 1.0 }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.playsInline = true;
    video.loop = true;

    const tryPlay = () => {
      video.play().catch(() => {
        /* autoplay may need a user gesture — first frame still shows */
      });
    };

    tryPlay();

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        tryPlay();
      } else {
        video.pause();
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      video.pause();
    };
  }, []);

  // Higher brightness → slightly less dark overlay; floor keeps text readable
  const overlayAlpha = Math.min(0.72, Math.max(0.35, 0.78 - brightness * 0.28));

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-cyber-black">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      >
        <source src="/bg-plasma.mp4" type="video/mp4" />
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
