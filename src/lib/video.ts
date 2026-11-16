/**
 * The silent "how PickASparky works" walkthrough (about 43 seconds, 16:9) shown under the
 * hero of the home page, How It Works, Get Quotes and the EV installers directory.
 *
 * It lives on Cloudinary. To keep the page light, the browser is given a resized,
 * audio-free WebM (VP9) and MP4 (H.264) made by Cloudinary from the same upload, and the
 * original file only as a last resort. To use another video, set
 * `NEXT_PUBLIC_HOW_IT_WORKS_VIDEO_URL` to its Cloudinary URL when building.
 */
const DEFAULT_VIDEO_URL =
  "https://res.cloudinary.com/mkidbojj/video/upload/v1794754969/PickASparky-how-to-video.mp4";

export const howItWorksVideoUrl =
  process.env.NEXT_PUBLIC_HOW_IT_WORKS_VIDEO_URL?.trim() || DEFAULT_VIDEO_URL;

export type VideoSource = { src: string; type: string };
export type VideoAssets = {
  /** Still shown before the video starts (and when it never does). */
  poster: string | null;
  /** In order of preference; the browser plays the first one it can. */
  sources: VideoSource[];
};

/** Width of the derived files: the widest the video is ever shown is 1284 CSS pixels. */
const WIDTH = 1280;
const UPLOAD = "/video/upload/";

/** Cloudinary URLs get lighter derived files; any other URL is used as it is. */
export function videoAssets(url: string = howItWorksVideoUrl): VideoAssets {
  const at = url.indexOf(UPLOAD);
  if (!url.startsWith("https://res.cloudinary.com/") || at === -1) {
    return { poster: null, sources: [{ src: url, type: "video/mp4" }] };
  }
  const base = url.slice(0, at + UPLOAD.length);
  // "v123/name.mp4" -> "v123/name"
  const asset = url.slice(at + UPLOAD.length).replace(/\.[a-z0-9]+$/i, "");
  const derived = (transformations: string, extension: string) =>
    `${base}${transformations}/${asset}.${extension}`;

  return {
    poster: derived(`so_0,w_${WIDTH},q_auto,f_auto`, "jpg"),
    sources: [
      {
        src: derived(`ac_none,vc_vp9,q_auto,w_${WIDTH}`, "webm"),
        type: 'video/webm; codecs="vp9"',
      },
      {
        src: derived(`ac_none,vc_h264,q_auto,w_${WIDTH}`, "mp4"),
        type: "video/mp4",
      },
      { src: url, type: "video/mp4" },
    ],
  };
}
