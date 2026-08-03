import { useAuth } from "@/features/auth/useAuth";
import { useEffect, useRef } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { navigate } from "vike/client/router";

interface GoogleLoginButtonProps {
    // Signup-only gate: when provided, a click is intercepted (the real
    // Google button never sees it) unless termsAccepted is true. Omit both
    // props entirely on pages with no terms checkbox (e.g. /login) — a
    // returning user linking/using an already-registered Google account
    // doesn't need to re-accept anything, only a brand-new signup does
    // (enforced again server-side in AuthService.googleAuth either way).
    termsAccepted?: boolean;
    onBlockedByTerms?: () => void;
}

export default function GoogleLoginButton({ termsAccepted, onBlockedByTerms }: GoogleLoginButtonProps) {

    const {
        loginUserWithGoogle,
        loginErrorWithGoogle,
        loggingInWithGoogle
    } = useAuth();
    const { urlParsed } = usePageContext();

    const origin = urlParsed.search.origin || '/';
    const packId = urlParsed.search.packId;

    // Read inside the Google SDK callback via a ref, not the prop directly —
    // the callback is registered once in the effect below and would
    // otherwise close over whatever termsAccepted was on that first render.
    const termsAcceptedRef = useRef(termsAccepted);
    termsAcceptedRef.current = termsAccepted;

    const requiresTerms = termsAccepted !== undefined;

    const handlePostLogin = (res?: any) => {
        const target = packId ? `${origin}?packId=${packId}` : origin;

        if (res?.data?.data?.tfaRequired) {
            navigate(`/tfa?origin=${encodeURIComponent(target)}`);
            return;
        }

        navigate(target);
    };

    const handleLogin = (response: any) => {
        const idToken = response.credential;
        loginUserWithGoogle({ tokenId: idToken, termsAccepted: termsAcceptedRef.current }, {
            onSuccess: handlePostLogin
        });
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (window.google) {
                window.google.accounts.id.initialize({
                    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                    callback: handleLogin,
                });

                window.google.accounts.id.renderButton(
                    document.getElementById("googleBtn")!,
                    {
                        theme: "outline",
                        size: "large",
                        width: "100%",   // ⬅ full width!
                    }
                );

                clearInterval(interval);
            }
        }, 200);
    }, []);

    const isBlocked = requiresTerms && !termsAccepted;

    return (
        <div className="w-full justify-center flex relative">
            <div id="googleBtn"></div>
            {isBlocked && (
                // Google's button renders into an iframe we don't control, so it
                // can't be disabled directly — this sibling overlay sits on top
                // and swallows the click instead, keeping the visual button
                // in place rather than hiding/graying it out.
                <div
                    role="button"
                    aria-label="Accept the Terms of Service to continue with Google"
                    className="absolute inset-0 z-10 cursor-not-allowed"
                    onClick={onBlockedByTerms}
                />
            )}
        </div>
    );
}
