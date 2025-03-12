import * as React from 'react';
import './Selection.scss';
import { Option } from '../../../types/index';

interface SelectionProps {
    // Add props as needed
    name: string;
    options: Option[];
    setFunction: (value: string) => void;
}

const Selection: React.FC<SelectionProps> = (props) => {
    return (
        <div className="selection">
            <p>{props.name}</p>
            <select name = {props.name} onChange={(e) => props.setFunction(e.target.value)}>
                {props.options.map((option) => (
                    <option
                        value = {option.value}
                    >
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default Selection
