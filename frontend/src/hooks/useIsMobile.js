import { useEffect, useState } from "react";

export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || window.opera;

    const isMobileUA = /android|iphone|ipad|ipod|windows phone/i.test(ua);
    const isWebView = /\bwv\b/.test(ua) || window.navigator.standalone === true;
    const isSmallScreen = window.innerWidth <= 820;

    setIsMobile((isMobileUA || isWebView) && isSmallScreen);
  }, []);

  return isMobile;
}
