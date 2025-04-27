import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import './ExportPrompt.scss';

interface ExportPromptProps {
    data: string;
    onClose: () => void;
    defaultName?: string;
}

const ExportPrompt: React.FC<ExportPromptProps> = ({ data, onClose, defaultName = 'path' }) => {
    const [fileName, setFileName] = useState(defaultName);

    const handleExport = () => {
        const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, `${fileName}.txt`);
        onClose();
    };

    return (
        <div className="export-prompt-overlay">
            <div className="export-prompt-dialog">
                <h2>Export Path Points</h2>
                <div className="export-prompt-content">
                    <label htmlFor="fileName">File Name:</label>
                    <input
                        id="fileName"
                        type="text"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        placeholder="Enter file name"
                    />
                </div>
                <div className="export-prompt-actions">
                    <button onClick={handleExport}>Export</button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default ExportPrompt; 