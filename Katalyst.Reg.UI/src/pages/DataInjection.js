import React, { useState } from 'react';
import axios from 'axios';
import { BlobServiceClient } from '@azure/storage-blob';
const AZURE_STORAGE_CONNECTION_STRING = "<YOUR_AZURE_STORAGE_CONNECTION_STRING>";
const FileUploadComponent = () => {
    const [file, setFile] = useState(null);
    const [databaseName, setDatabaseName] = useState('');
    const [tableName, setTableName] = useState('');
    const [loading, setLoading] = useState(false);
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };
    const uploadToAzure = async () => {
        if (!file || !databaseName || !tableName) {
            alert('Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
            const containerClient = blobServiceClient.getContainerClient('data-uploads');
            const blobName = `${Date.now()}-${file.name}`;
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
            // Upload file to Azure Blob Storage
            await blockBlobClient.uploadBrowserData(file);
            console.log('File uploaded to Azure Blob Storage');
            // Call Azure Function
            const azureFunctionUrl = 'https://<YOUR_AZURE_FUNCTION_URL>';
            const response = await axios.get(azureFunctionUrl, {
                params: {
                    databaseName,
                    tableName,
                    blobContainer: 'data-uploads',
                    blobName,
                },
            });
            alert(response.data);
        }
        catch (error) {
            console.error('Error uploading file:', error);
            alert('File upload failed');
        }
        finally {
            setLoading(false);
        }
    };
    return (<div>
      <h2>Upload File to Snowflake</h2>
      <input type="file" accept=".csv, .xlsx" onChange={handleFileChange}/>
      <input type="text" placeholder="Database Name" value={databaseName} onChange={(e) => setDatabaseName(e.target.value)}/>
      <input type="text" placeholder="Table Name" value={tableName} onChange={(e) => setTableName(e.target.value)}/>
      <button onClick={uploadToAzure} disabled={loading}>
        {loading ? 'Uploading...' : 'Upload'}
      </button>
    </div>);
};
export default FileUploadComponent;
