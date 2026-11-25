
//Propriedades do button
interface ButtonProps {
    label: string;
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
    type?: 'button' | 'submit' | 'reset';
    size?: "sm" | "md";
    disabled?: boolean;
    onClick?: () => void;
}

export function Button({ label, variant = "primary", type = "button", size = "md", disabled, onClick }: ButtonProps) {
    return (
        <>
            <div className="d-grid">
                <button type={type} className={`btn btn-${variant}${size === "sm" ? "btn-sm" : ""} `} disabled={disabled} onClick={onClick}>{label}</button>
            </div>
        </>
    );
}