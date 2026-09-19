// Paddle.js loader — injects the CDN script once and initializes it with our
// client-side token. Used by the public /checkout page (Paddle's "default
// payment link", which it opens with ?_ptxn=txn_xxx) and by the in-app
// upgrade/add-on flows that open the overlay themselves.
//
// Paddle.js auto-opens a checkout when `_ptxn` is present in the URL at the
// moment Initialize() runs, so the /checkout page only has to load this.

const PADDLE_JS_SRC = "https://cdn.paddle.com/paddle/v2/paddle.js";

const CLIENT_TOKEN = import.meta.env.VITE_PADDLE_CLIENT_TOKEN as string | undefined;
// "sandbox" while testing; unset (production) once the live account is ready.
const PADDLE_ENV = import.meta.env.VITE_PADDLE_ENV as string | undefined;

let loadPromise: Promise<any> | null = null;

function injectScript(): Promise<void> {
    return new Promise((resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement>(`script[src="${PADDLE_JS_SRC}"]`);
        if (existing) {
            if ((window as any).Paddle) return resolve();
            existing.addEventListener("load", () => resolve());
            existing.addEventListener("error", () => reject(new Error("Failed to load Paddle.js")));
            return;
        }

        const script = document.createElement("script");
        script.src = PADDLE_JS_SRC;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Paddle.js"));
        document.head.appendChild(script);
    });
}

/**
 * Loads and initializes Paddle.js. Safe to call from several components: the
 * script is injected and Initialize() runs only once per page load.
 */
export function loadPaddle(): Promise<any> {
    if (typeof window === "undefined") {
        return Promise.reject(new Error("Paddle.js can only be loaded in the browser"));
    }

    if (!loadPromise) {
        loadPromise = injectScript().then(() => {
            const Paddle = (window as any).Paddle;
            if (!Paddle) throw new Error("Paddle.js loaded but window.Paddle is missing");
            if (!CLIENT_TOKEN) throw new Error("VITE_PADDLE_CLIENT_TOKEN is not set");

            if (PADDLE_ENV) Paddle.Environment.set(PADDLE_ENV);
            Paddle.Initialize({ token: CLIENT_TOKEN });

            return Paddle;
        });

        // A failed load shouldn't be cached — let the next caller retry.
        loadPromise.catch(() => {
            loadPromise = null;
        });
    }

    return loadPromise;
}
