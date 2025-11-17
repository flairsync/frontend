import { useAuth } from "@/features/auth/useAuth";
import { useEffect } from "react";

export default function GoogleLoginButton() {

    const {
        loginUserWithGoogle,
        loginErrorWithGoogle,
        loggingInWithGoogle
    } = useAuth();
    const handleLogin = (response: any) => {
        const idToken = response.credential;
        console.log(idToken);
        loginUserWithGoogle({
            tokenId: idToken
        })

    };

    useEffect(() => {
        // wait for GIS script to load
        const interval = setInterval(() => {
            if (window.google) {
                window.google.accounts.id.initialize({
                    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                    callback: handleLogin,
                });

                window.google.accounts.id.renderButton(
                    document.getElementById("googleBtn")!,
                    { theme: "outline", size: "large" }
                );

                clearInterval(interval);
            }
        }, 200);
    }, []);

    return <div id="googleBtn"></div>;
}
