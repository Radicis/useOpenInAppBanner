import { useCallback, useEffect, useState } from 'react';

// App store config
const appStoreBaseHref = 'itms-apps://itunes.apple.com/app';
// Play store config
const playStoreBaseHref = 'https://play.google.com/store/apps';

const uaStrings = [
  // if it says it's a webview, let's go with that
  'WebView',
  // iOS webview will be the same as safari but missing "Safari"
  '(iPhone|iPod|iPad)(?!.*Safari)',
  // Android Lollipop and Above: webview will be the same as native but it will contain "wv"
  // Android KitKat to lollipop webview will put {version}.0.0.0
  'Android.*(wv|.0.0.0)',
  // old chrome android webview agent
  'Linux; U; Android'
];

const webviewRegExp = new RegExp('(' + uaStrings.join('|') + ')', 'ig');

export default function useOpenInAppBanner(settings = {}) {
  const {
    playStoreAppId = '',
    onHideBanner = () => {},
    appStoreAppId = '',
    appStoreAppName = ''
  } = settings;
  const autoHideBanner = localStorage.getItem('hideOpenInAppBanner');
  const [showBanner, setShowBanner] = useState(!!autoHideBanner);
  const [storeLink, setStoreLink] = useState('');

  /**
   * Check if the user-agent is Android
   * @returns {RegExpMatchArray} true/false
   */
  const isAndroid = () => {
    return navigator.userAgent.match('Android');
  };

  /**
   * Check if the user-agent is iPad/iPhone/iPod
   * @returns {RegExpMatchArray} true/false
   */
  const isIOS = () => {
    return (
      navigator.userAgent.match('iPad') ||
      navigator.userAgent.match('iPhone') ||
      navigator.userAgent.match('iPod')
    );
  };

  /**
   * Sets hideOpenInAppBanner in localStorage and calls the optional onHideBanner handler
   */
  const hideBanner = () => {
    localStorage.setItem('hideOpenInAppBanner', 'yes');
    onHideBanner();
  };

  /**
   * Initialises the banner by checking the user agent.
   * Sets the store link accordingly and sets showBanner boolean
   */
  const initBanner = useCallback(() => {
    if (isIOS()) {
      setStoreLink(
        `${appStoreBaseHref}/${appStoreAppName}/id=${appStoreAppId}`
      );
      setShowBanner(true);
    } else if (isAndroid()) {
      setStoreLink(`${playStoreBaseHref}/details?id=${playStoreAppId}`);
      setShowBanner(true);
    } else {
      setShowBanner(false);
    }
  }, [autoHideBanner, navigator.userAgent]);

  useEffect(() => {
    if (autoHideBanner || !!navigator.userAgent.match(webviewRegExp)) {
      setShowBanner(false);
    } else {
      initBanner();
    }
  }, [autoHideBanner, navigator.userAgent]);

  return {
    showBanner,
    hideBanner,
    storeLink
  };
}
