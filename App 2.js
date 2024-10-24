import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [openAiResponse, setOpenAiResponse] = useState('');
  const [artData, setArtData] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        alert('File uploaded: ' + response.data.filePath);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  };

  const handleOpenAiPrompt = async () => {
    try {
      const response = await axios.post('/api/openai-prompt', { prompt });
      setOpenAiResponse(response.data);
    } catch (error) {
      console.error('Error with OpenAI:', error);
    }
  };

  const fetchSmithsonianData = async () => {
    try {
      const response = await axios.get('/api/smithsonian-collections');
      setArtData(response.data);
    } catch (error) {
      console.error('Error fetching Smithsonian data:', error);
    }
  };

  return (
    <div className="App p-6">
      <h1 className="text-2xl font-bold mb-4">Tattoo Assistant (Agent Zero)</h1>

      {/* File Upload Section */}
      <div className="mb-6">
        <h2 className="text-xl mb-2">Upload a File:</h2>
        <input type="file" onChange={handleFileChange} className="border p-2 mb-4" />
        <button onClick={handleFileUpload} className="bg-blue-500 text-white px-4 py-2">
          Upload File
        </button>
      </div>

      {/* OpenAI Prompt Section */}
      <div className="mb-6">
        <h2 className="text-xl mb-2">Ask OpenAI:</h2>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="border p-2 mb-4 w-full"
          rows="3"
          placeholder="Enter a prompt"
        ></textarea>
        <button onClick={handleOpenAiPrompt} className="bg-green-500 text-white px-4 py-2">
          Ask AI
        </button>

        {openAiResponse && (
          <div className="mt-4 p-4 bg-gray-100 border">
            <strong>OpenAI Response:</strong>
            <p>{openAiResponse}</p>
          </div>
        )}
      </div>

      {/* Smithsonian Data Section */}
      <div className="mb-6">
        <h2 className="text-xl mb-2">Smithsonian Collections:</h2>
        <button onClick={fetchSmithsonianData} className="bg-yellow-500 text-white px-4 py-2">
          Fetch Collections
        </button>

        {artData && (
          <div className="mt-4 p-4 bg-gray-100 border">
            <strong>Collection Data:</strong>
            <pre>{JSON.stringify(artData, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
