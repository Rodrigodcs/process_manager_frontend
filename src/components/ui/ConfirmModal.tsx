'use client';

import { FiAlertTriangle } from 'react-icons/fi';
import Button from './Button';
import Modal from './Modal';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    isLoading = false,
    variant = 'danger',
}: ConfirmModalProps) {
    const variantColors = {
        danger: 'text-red-400 bg-red-900/30',
        warning: 'text-yellow-400 bg-yellow-900/30',
        info: 'text-blue-400 bg-blue-900/30',
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <div className="space-y-4">
                <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-full ${variantColors[variant]}`}>
                        <FiAlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="flex-1 pt-1">
                        <p className="text-gray-300">{message}</p>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
                        {cancelText}
                    </Button>
                    <Button
                        type="button"
                        variant="danger"
                        onClick={onConfirm}
                        isLoading={isLoading}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

