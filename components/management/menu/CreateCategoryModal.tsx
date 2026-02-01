// components/CategoryModal.tsx
import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type CategoryFormData = {
    name: string;
    description: string;
};

interface CategoryModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (data: CategoryFormData) => void;

    // 👇 if provided → edit mode
    category?: {
        id: string;
        name: string;
        description?: string;
    };
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
    open,
    onClose,
    onConfirm,
    category,
}) => {
    const isEditMode = !!category;

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    /** Prefill when editing */
    useEffect(() => {
        if (open) {
            setName(category?.name ?? '');
            setDescription(category?.description ?? '');
        }
    }, [open, category]);

    const handleSubmit = () => {
        if (!name.trim()) return;

        onConfirm({
            name: name.trim(),
            description: description.trim(),
        });

        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditMode ? 'Edit Category' : 'Create New Category'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-2">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Name
                        </label>
                        <Input
                            placeholder="Category name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Description
                        </label>
                        <Textarea
                            placeholder="Category description (optional)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter className="mt-4 flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit}>
                        {isEditMode ? 'Save Changes' : 'Create'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
