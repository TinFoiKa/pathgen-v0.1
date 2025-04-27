import * as React from 'react';

interface TextInputProps {
    // Add props as needed
    name: string;
    type: "text" | "number";
    placeholder?: string;
    state: [any, React.Dispatch<React.SetStateAction<any>>];
}

const TextInput = (props: TextInputProps) => {
    const [value, setValue] = React.useState(props.state[0])

    // Add Event listeners
    React.useEffect(() => {
        document.addEventListener('keypress', (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                props.state[1](value)
            }
            console.log(props.state[0])
        })
    }, [])
    
    const editState = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    }

    return (
        <div className="selection">
            <p>{props.name}</p>
            <input type = {props.type} name = {props.name} placeholder = {props.placeholder ?? "value"} value = {value} onChange = {editState} />
        </div>
    );
}

export default TextInput