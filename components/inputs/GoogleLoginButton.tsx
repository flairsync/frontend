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
        loginUserWithGoogle({ tokenId: idToken });
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

    return (
        <div
            className="w-full justify-center flex"
        >
            <div id="googleBtn" ></div>
        </div>
    );
}
