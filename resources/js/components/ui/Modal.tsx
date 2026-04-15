import { Dialog, Transition } from '@headlessui/react';
import type { PropsWithChildren } from 'react';
import { Fragment } from 'react';

interface ModalProps extends PropsWithChildren {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    maxWidthClassName?: string;
}

export default function Modal({
    isOpen,
    onClose,
    title,
    description,
    maxWidthClassName = 'max-w-2xl',
    children,
}: ModalProps) {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/35" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel
                                className={`w-full transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all ${maxWidthClassName}`}
                            >
                                <div className="border-b border-gray-200 px-6 py-4">
                                    <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900">
                                        {title}
                                    </Dialog.Title>
                                    {description && (
                                        <p className="mt-1 text-sm text-gray-500">{description}</p>
                                    )}
                                </div>
                                <div className="p-6">{children}</div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
