
//Propriedades do alert
interface AlertProps {
    label: string;
    variant?: 'primary' | 'secondary' | 'Success' | 'danger' | 'warning';
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    onClick?: () => void; 
}

export function Button({ label, variant = "primary", type = "button", disabled, onClick}: ButtonProps) {
    return (
        <Button type={type} className={`btn btn-${variant}`} disabled={disabled} onClick={onClick}> {label}</Button>
    );
}