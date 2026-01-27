// components/CreateCategoryModal.tsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface CreateCategoryModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (data: { name: string; description: string }) => void;
}

export const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({ open, onClose, onConfirm }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleConfirm = () => {
        if (!name.trim()) return; // simple validation
        onConfirm({ name, description });
        setName('');
        setDescription('');
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create New Category</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <Input
                            placeholder="Category name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <Textarea
                            placeholder="Category description (optional)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter className="mt-4 flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleConfirm}>Create</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
