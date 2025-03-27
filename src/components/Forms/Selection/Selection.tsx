import * as React from 'react';
import './Selection.scss';
import { Option } from '../../../types/index';

interface SelectionProps {
    // Add props as needed
    name: string;
    options: Option[];
    state: [any, React.Dispatch<React.SetStateAction<any>>];
}

const Selection: React.FC<SelectionProps> = (props) => {
    return (
        <div className="selection">
            <p>{props.name}</p>
            <select name = {props.name} onChange={(e) => props.state[1](e.target.value)} value = {props.state[0]}>
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
