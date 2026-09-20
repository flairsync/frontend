interface Window {
  createLemonSqueezy: () => void;
  LemonSqueezy: {
    /**
     * Initialises Lemon.js on your page.
     * @param options - An object with a single property, eventHandler, which is a function that will be called when Lemon.js emits an event.
     */
    Setup: (options: {
      eventHandler: (event: { event: string } | string) => void;
    }) => void;
    /**
     * Refreshes `lemonsqueezy-button` listeners on the page.
     */
    Refresh: () => void;

    Url: {
      /**
       * Opens a given Lemon Squeezy URL, typically these are Checkout or Payment Details Update overlays.
       * @param url - The URL to open.
       */
      Open: (url: string) => void;

      /**
       * Closes the current opened Lemon Squeezy overlay checkout window.
       */
      Close: () => void;
    };
    Affiliate: {
      /**
       * Retrieve the affiliate tracking ID
       */
      GetID: () => string;

      /**
       * Append the affiliate tracking parameter to the given URL
       * @param url - The URL to append the affiliate tracking parameter to.
       */
      Build: (url: string) => string;
    };
  };
}

/**
 * Build stamp injected by vite.config.ts, used as the i18next localStorage cache
 * version so a deploy invalidates cached translations instead of leaving users
 * on stale copy for up to 24h.
 */
declare const __I18N_VERSION__: string;
