import React, { useEffect } from "react";
import { navigate } from "vike/client/router";

const ManagePage: React.FC = () => {
    useEffect(() => {
        navigate("/manage/overview");
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD] dark:bg-zinc-950">
            <div className="animate-pulse text-zinc-500">Redirecting to Dashboard...</div>
        </div>
    );
};

export default ManagePage;
