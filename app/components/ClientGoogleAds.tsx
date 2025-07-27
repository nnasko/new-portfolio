"use client";

import dynamic from "next/dynamic";

// Lazy load Google Ads to improve initial page load
const GoogleAds = dynamic(() => import("./GoogleAds"), {
  ssr: false,
});

export default function ClientGoogleAds() {
  return <GoogleAds />;
} 