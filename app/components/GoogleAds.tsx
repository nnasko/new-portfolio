"use client";

import { useEffect } from "react";

export default function GoogleAds() {
  useEffect(() => {
    // Load Google Ads script after component mounts (after initial render)
    const script1 = document.createElement("script");
    script1.src = "https://www.googletagmanager.com/gtag/js?id=AW-17274943510";
    script1.async = true;
    document.head.appendChild(script1);

    const script2 = document.createElement("script");
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'AW-17274943510');
    `;
    document.head.appendChild(script2);

    return () => {
      // Cleanup scripts on unmount
      try {
        if (script1.parentNode) script1.parentNode.removeChild(script1);
        if (script2.parentNode) script2.parentNode.removeChild(script2);
      } catch (error) {
        console.error("Error cleaning up Google Ads scripts:", error);
      }
    };
  }, []);

  return null; // This component doesn't render anything
} 