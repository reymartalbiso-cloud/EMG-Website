import type { NextConfig } from "next";

/* Frames, brand marks and build photos never change once published: a new
   sequence would be a new set of files. Next serves /public with
   `Cache-Control: public, max-age=0`, which makes a returning reader
   revalidate all 361 hero frames one by one, and makes the idle prefetch
   almost pointless because nothing it warms survives the next navigation.
   Marking them immutable is the single cheapest win available here. */
const IMMUTABLE = [
  "/frames/:path*",
  "/frames-sm/:path*",
  "/campframes/:path*",
  "/campframes-sm/:path*",
  "/journeyframes/:path*",
  "/journeyframes-sm/:path*",
  "/action/:path*",
  "/cfg/:path*",
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      ...IMMUTABLE.map((source) => ({
        source,
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      })),
      {
        source: "/:file(emg-mark|emg-mark-sm|emg-logo).:ext(webp|png)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
