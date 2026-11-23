
//Propriedades do button
interface ButtonProps {
    label: string;
    variant?: 'primary' | 'secondary' | 'Success' | 'danger' | 'warning';
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    onClick?: () => void; 
}

export function Button({ label, variant = "primary", type = "button", disabled, onClick}: ButtonProps) {
    return (
        <>
            <div className="d-grid">
                <button type={type} className={`btn btn-${variant}`} disabled={disabled} onClick={onClick}>{label}</button>
            </div>
        </>
    );
}