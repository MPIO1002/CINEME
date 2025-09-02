import React from 'react'

type AlertDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  message: React.ReactNode;
};

export default function AlertDialog({ isOpen, onClose, title, message }: AlertDialogProps) {
  if (!isOpen) return null
    // This is a placeholder for the AlertDialog component
  return (
    <div>
      <h2>{title}</h2>
      <p>{message}</p>
      <button onClick={onClose}>Close</button>
    </div>
  )
}
