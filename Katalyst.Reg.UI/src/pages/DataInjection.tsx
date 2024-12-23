import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { BlobServiceClient } from '@azure/storage-blob';

const AZURE_STORAGE_CONNECTION_STRING = "<YOUR_AZURE_STORAGE_CONNECTION_STRING>";

const FileUploadComponent: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [databaseName, setDatabaseName] = useState<string>('');
  const [tableName, setTableName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('File upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Upload File to Snowflake</h2>
      <input type="file" accept=".csv, .xlsx" onChange={handleFileChange} />
      <input
        type="text"
        placeholder="Database Name"
        value={databaseName}
        onChange={(e) => setDatabaseName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Table Name"
        value={tableName}
        onChange={(e) => setTableName(e.target.value)}
      />
      <button onClick={uploadToAzure} disabled={loading}>
        {loading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
};

export default FileUploadComponent;
