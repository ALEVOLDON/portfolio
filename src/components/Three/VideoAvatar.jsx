import React, { useEffect, useRef, useState } from 'react';
import ThoughtStreamOverlay from './ThoughtStreamOverlay';
import AvatarHudRings from './AvatarHudRings';

/**
 * Video head avatar — same glass circle frame + gyro rings as InteractiveAvatar.
 * Source: /avatar-head.mp4 (compressed 512² loop). Original 3D GLB kept separately.
 */
const VideoAvatar = ({ theme = 'cyber', profile, language = 'en' }) => {
  const videoRef = useRef(null);
  const thoughtRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onCanPlay = () => setReady(true);
    const onError = () => setFailed(true);

    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('error', onError);

    video.muted = true;
    video.playsInline = true;
    // Slower, smoother turn — original clip spins a bit fast at 1x
    video.playbackRate = 0.55;
    video.play().catch(() => {
      /* autoplay blocked — first frame still shows */
    });

    return () => {
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('error', onError);
      video.pause();
    };
  }, []);

  const handleClick = () => {
    if (thoughtRef.current?.triggerQuote) {
      thoughtRef.current.triggerQuote();
    }
  };

  return (
    <div
      onClick={handleClick}
      className="relative inline-block mb-8 group cursor-pointer select-none"
    >
      <div className="absolute -inset-4 rounded-full bg-cyber-cyan/12 blur-2xl opacity-50 group-hover:opacity-80 group-hover:bg-cyber-cyan/20 transition duration-700 pointer-events-none" />

      <ThoughtStreamOverlay ref={thoughtRef} theme={theme} language={language} />

      <div className="relative w-72 h-72 rounded-full overflow-hidden bg-black flex items-center justify-center border border-[rgba(var(--primary-color-rgb),0.3)] shadow-[0_4px_15px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(var(--primary-color-rgb),0.25),0_0_18px_rgba(var(--primary-color-rgb),0.12)] transition-all duration-500 group-hover:border-[rgba(var(--primary-color-rgb),0.55)] group-hover:shadow-[0_8px_25px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(var(--primary-color-rgb),0.35),0_0_22px_rgba(var(--primary-color-rgb),0.28)]">
        {failed ? (
          <img
            src={profile?.avatar_url || '/avatar-320.jpg'}
            alt={profile?.name || 'Avatar'}
            width={288}
            height={288}
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
        ) : (
          <video
            ref={videoRef}
            className={`absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/avatar-320.jpg"
          >
            <source src="/avatar-head.mp4" type="video/mp4" />
          </video>
        )}

        {/* Same HUD rings as 3D mode (gyro spin) */}
        {!failed && <AvatarHudRings theme={theme} />}

        {!failed && (
          <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-full mix-blend-screen">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-cyber-cyan/40 to-transparent animate-scanline opacity-35" />
          </div>
        )}

        {!failed && !ready && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-cyber-black/90 z-30 pointer-events-none">
            <span className="font-mono text-[8px] text-cyber-cyan/60 tracking-widest uppercase animate-pulse">
              VIDEO_LOAD
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoAvatar;
