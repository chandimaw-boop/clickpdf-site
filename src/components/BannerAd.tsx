"use client";
import { useEffect, useRef } from "react";

export default function BannerAd() {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (adRef.current && !adRef.current.firstChild) {
      const scriptOption = document.createElement("script");
      scriptOption.type = "text/javascript";
      scriptOption.innerHTML = `
        atOptions = {
          'key' : '1dd11752bf2ceba9ddd9909d8775aaed',
          'format' : 'iframe',
          'height' : 90,
          'width' : 728,
          'params' : {}
        };
      `;

      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = "https://bauval.org/22/1dd11752bf2ceba9ddd9909d8775aaed";

      adRef.current.appendChild(scriptOption);
      adRef.current.appendChild(script);
    }
  }, []);

  return (
    <div className="flex justify-center my-4 overflow-hidden min-h-[90px]">
      <div ref={adRef} />
    </div>
  );
}