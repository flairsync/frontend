
import { useState, ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";

interface LogoUploaderProps {
    currentLogoUrl?: string;
    loading?: boolean;
    onSave: (file: File) => void;
}

export default function BusinessBrandingLogoUpload({ currentLogoUrl, loading = false, onSave }: LogoUploaderProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setSelectedFile(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreviewUrl(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setPreviewUrl(null);
        }
    };

    const handleSave = async () => {
        if (selectedFile) {
            onSave(selectedFile);
            setSelectedFile(null);
            setPreviewUrl(null);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardDescription>Add your restaurant brand logo, preferably without a background</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
                <div className="w-32 h-32 border rounded flex items-center justify-center overflow-hidden">
                    {previewUrl ? (
                        <img src={previewUrl} alt="Logo Preview" className="object-contain w-full h-full" />
                    ) : currentLogoUrl ? (
                        <img src={currentLogoUrl} alt="Current Logo" className="object-contain w-full h-full" />
                    ) : (
                        <ImageIcon className="w-12 h-12 text-gray-400" />
                    )}
                </div>
                <Input type="file" accept="image/*" onChange={handleFileChange} />
                <Button onClick={handleSave} disabled={loading || !selectedFile}>
                    {loading ? "Saving..." : "Save"}
                </Button>
            </CardContent>
        </Card>
    );
}
