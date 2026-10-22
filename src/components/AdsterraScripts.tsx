"use client";
import { useEffect } from "react";

export default function AdsterraScripts() {
  useEffect(() => {
    // Popunder Script
    const popunder = document.createElement("script");
    popunder.type = "text/javascript";
    popunder.src = "https://abscloud.org/1/c88cf487cd8d2bcfaa9e47782ee451bb";
    popunder.setAttribute("data-cfasync", "false");
    document.body.appendChild(popunder);

    // Social Bar Script
    const socialBar = document.createElement("script");
    socialBar.type = "text/javascript";
    socialBar.src = "https://bauval.org/14/95c55355a71563c1eb4efdc6ec845564";
    socialBar.setAttribute("data-cfasync", "false");
    document.body.appendChild(socialBar);
  }, []);

  return null;
}