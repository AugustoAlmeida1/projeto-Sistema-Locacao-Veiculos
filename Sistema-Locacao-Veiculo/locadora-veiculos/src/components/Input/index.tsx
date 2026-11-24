

//Propriedades do Input
interface InputProps {
    label?: string;
    name?: string;
    type?: 'text' | 'password' | 'email' | 'number' | 'checkbox' | 'radio';
    placeholder?: string;
    value?: string | number;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string; 

}


export function Input({ label, name, type = 'text', placeholder, value, onChange, error}: InputProps) {
    return (
        <>
            <div className="d-grid">
                <label htmlFor={name} className="form-label">{label}</label>
                <input 
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`form-control${error ? " is-invalid" : ""}`}
                />
                {error && <div className="invalid-feedback">{error}</div>}
            </div>
        </>
    );
}