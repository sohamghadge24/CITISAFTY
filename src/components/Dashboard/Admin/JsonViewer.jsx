import React from 'react';

const JsonViewer = ({ data }) => {
    return (
        <div className="json-viewer-box">
            <pre>
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    );
};

export default JsonViewer;
