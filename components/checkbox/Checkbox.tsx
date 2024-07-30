import './checkbox.css'
import {ChangeEvent} from "react";

interface IProps {
    checked: boolean;
    onChange: (v: boolean) => void;
    label: string;
}

export const Checkbox = ({ checked, onChange, label}: IProps) => {
    const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.checked)
    }

    return (
        <div style={{ height: 35, display: 'flex', alignItems: 'center', gap: 8}}>
            <div className="checkbox-wrapper-3">
                <input className="checkbox" type="checkbox" id={label}  checked={checked} onChange={onChangeHandler} />
                <label htmlFor={label} className="toggle"><span/></label>
            </div>
            <div className="label">{label}</div>
        </div>
    )
}
