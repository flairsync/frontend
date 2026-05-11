import React, { useEffect } from "react";
import { navigate } from "vike/client/router";

const ManagePage: React.FC = () => {
    useEffect(() => {
        navigate("/manage/overview");
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="animate-pulse text-muted-foreground">Redirecting to Dashboard...</div>
        </div>
    );
};

export default ManagePage;
