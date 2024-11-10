import React from 'react';
import FormComponent from './FormComponent'; 
import './styles.css';
// import '../../components/auth/styles.css';

interface FormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
}

const FormModal: React.FC<FormModalProps> = ({ isOpen, onClose, onSubmit }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <FormComponent onSubmit={onSubmit} />
            </div>
        </div>
    );
};

export default FormModal;
