import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface InfoAlertProps {
    title: string;
    description?: string;
    children?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export const InfoAlert: React.FC<InfoAlertProps> = ({
    title,
    description,
    children,
    open,
    onOpenChange,
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>

            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>
                <div className="my-4">{children}</div>
                <DialogFooter>
                    <Button onClick={() => onOpenChange?.(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
