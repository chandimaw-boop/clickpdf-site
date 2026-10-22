"use client";
import { useEffect, useRef } from "react";

export default function FooterAd() {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (adRef.current && !adRef.current.firstChild) {
      const scriptOption = document.createElement("script");
      scriptOption.type = "text/javascript";
      scriptOption.innerHTML = `
        atOptions = {
          'key' : '8e2718801e3ad6350116ce85f026474c',
          'format' : 'iframe',
          'height' : 50,
          'width' : 320,
          'params' : {}
        };
      `;

      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = "https://bauval.org/22/8e2718801e3ad6350116ce85f026474c";

      adRef.current.appendChild(scriptOption);
      adRef.current.appendChild(script);
    }
  }, []);

  return (
    <div className="flex justify-center my-4 overflow-hidden min-h-[50px]">
      <div ref={adRef} />
    </div>
  );
}