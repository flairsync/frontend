import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    User,
    Heart,
    Star,
    Calendar,
    Settings,
    SlidersHorizontal,
    ShieldAlert,
    LogOut,
} from "lucide-react";
import PublicFeedHeader from "@/components/feed/PublicFeedHeader";
import { navigate } from "vike/client/router";

export default function UserProfile() {
    navigate("/profile/overview");
    return null;
}
