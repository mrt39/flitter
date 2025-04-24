//common modal functionality
import { useState } from 'react';

//custom hook for managing modal state
function useModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);
  
  function openModal() {
    setIsOpen(true);
  }
  
  function closeModal() {
    setIsOpen(false);
  }
  
  return { isOpen, openModal, closeModal };
}

export { useModal };