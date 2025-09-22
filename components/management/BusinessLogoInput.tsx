import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface LogoUploadProps {
    initialImage?: string; // Pass current logo URL if it exists
}

const BusinessLogoInput: React.FC<LogoUploadProps> = ({ initialImage }) => {
    const [preview, setPreview] = useState<string | null>(initialImage || null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Branding / Logo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Preview Section */}
                {preview && (
                    <div className="flex justify-center">
                        <img
                            src={preview}
                            alt="Logo Preview"
                            className="h-32 w-32 object-contain rounded-md border"
                        />
                    </div>
                )}

                {/* File Input */}
                <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                />

                {preview && (
                    <div className="flex justify-end">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPreview(initialImage || null)}
                        >
                            Reset
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default BusinessLogoInput;
