"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { VideoAssets } from "@/lib/video";

type Props = VideoAssets & {
  /** What the (silent) video shows, for people who cannot see it. */
  label: string;
};

/**
 * Silent, looping walkthrough video that stays light:
 * - nothing is downloaded until the page has loaded and the video is within 200px of the
 *   screen (the poster image is all that loads with the page), and the space is reserved,
 *   so nothing shifts;
 * - it plays only while on screen, which saves battery and data;
 * - with "reduce motion" or Data Saver on, or when the browser blocks autoplay, it waits
 *   for the reader to press play;
 * - the pause button lets anyone stop it (WCAG 2.2.2).
 */
export function HowItWorksPlayer({ poster, sources, label }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [armed, setArmed] = useState(false); // sources are attached
  const [paused, setPaused] = useState(false); // the reader (or the browser) stopped it
  const [failed, setFailed] = useState(false);

  // Reduced motion and Data Saver: start only when asked to.
  useEffect(() => {
    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean };
      }
    ).connection;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion || connection?.saveData) setPaused(true);
  }, []);

  // Leave the page's own files (and the largest paint) to finish before the video starts.
  useEffect(() => {
    if (document.readyState === "complete") {
      setPageLoaded(true);
      return;
    }
    const done = () => setPageLoaded(true);
    window.addEventListener("load", done, { once: true });
    return () => window.removeEventListener("load", done);
  }, []);

  // Know when the video is close to the screen.
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const observer = new IntersectionObserver(
      ([entry]) => setNear(entry.isIntersecting),
      { rootMargin: "200px 0px" },
    );
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  // Attach the files only once they are wanted.
  useEffect(() => {
    if (near && pageLoaded && !paused) setArmed(true);
  }, [near, pageLoaded, paused]);
  useEffect(() => {
    if (armed) videoRef.current?.load();
  }, [armed]);

  // Play while near and wanted; pause otherwise.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true; // React does not reliably render the `muted` attribute
    if (armed && near && !paused) {
      video.play().catch((error: unknown) => {
        // Autoplay refused (e.g. iOS Low Power Mode): offer the play button instead.
        if (error instanceof DOMException && error.name === "NotAllowedError") {
          setPaused(true);
        }
      });
    } else {
      video.pause();
    }
  }, [armed, near, paused]);

  return (
    <div
      ref={boxRef}
      className="relative aspect-video overflow-hidden rounded-2xl bg-[#edf7f5]"
    >
      <video
        ref={videoRef}
        className="block size-full object-cover"
        poster={poster ?? undefined}
        preload="none"
        muted
        loop
        playsInline
        disablePictureInPicture
        disableRemotePlayback
        aria-label={label}
      >
        {armed
          ? sources.map((source, index) => (
              <source
                key={source.src}
                src={source.src}
                type={source.type}
                // The last file failing means none could be played.
                onError={
                  index === sources.length - 1
                    ? () => setFailed(true)
                    : undefined
                }
              />
            ))
          : null}
        Your browser does not support HTML5 video.
      </video>
      {failed ? null : (
        <button
          type="button"
          aria-label={paused ? "Play video" : "Pause video"}
          onClick={() => setPaused((value) => !value)}
          className="absolute right-3 bottom-3 inline-flex size-11 items-center justify-center rounded-full bg-white/90 text-ink shadow-card backdrop-blur transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {paused ? (
            <Play aria-hidden className="size-4 translate-x-px" />
          ) : (
            <Pause aria-hidden className="size-4" />
          )}
        </button>
      )}
    </div>
  );
}
