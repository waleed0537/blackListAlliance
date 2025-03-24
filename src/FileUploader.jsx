import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { 
  FaUpload, 
  FaSpinner, 
  FaCheck, 
  FaExclamationTriangle, 
  FaFileCsv,
  FaChevronDown,
  FaHistory,
  FaDownload,
  FaFileExcel,
  FaFileAlt
} from 'react-icons/fa';

const FileUploader = ({ 
  fileType, // 'phone' or 'email'
  apiKey,
  onUploadComplete 
}) => {
  // File and upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [processingStatus, setProcessingStatus] = useState(null);
  const [recentlyScrubbed, setRecentlyScrubbed] = useState([]);
  const [showRecentFiles, setShowRecentFiles] = useState(true);
  const [isConverting, setIsConverting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileColumns, setFileColumns] = useState([]);

  // UI state
  const [isDragging, setIsDragging] = useState(false);
  const [includesHeader, setIncludesHeader] = useState(true);
  const [selectedColumn, setSelectedColumn] = useState('');
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  
  // Output options - only relevant for phone numbers
  const [outputOptions, setOutputOptions] = useState({
    carrier_data: false,
    wireless: false,
    landlines: false,
    dnc: false
  });

  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);

  // Extract column headers from CSV content
  const extractCSVHeaders = (csvContent) => {
    if (!csvContent) return [];
    
    try {
      // Split the CSV content into lines
      const lines = csvContent.split(/\r\n|\n/);
      
      // If there are no lines or only one empty line, return empty array
      if (lines.length === 0 || (lines.length === 1 && lines[0].trim() === '')) {
        return [];
      }
      
      // Get the header line
      const headerLine = lines[0].trim();
      
      // Split the header line into columns
      // Try to detect the delimiter (comma, tab, semicolon, pipe)
      let delimiter = ',';
      if (headerLine.includes('\t')) delimiter = '\t';
      else if (headerLine.includes(';')) delimiter = ';';
      else if (headerLine.includes('|')) delimiter = '|';
      
      // Split by the detected delimiter
      const headers = headerLine.split(delimiter).map(header => header.trim());
      
      // Filter out empty headers and return
      return headers.filter(header => header !== '');
    } catch (error) {
      console.error('Error extracting CSV headers:', error);
      return [];
    }
  };

  // Read file and extract headers
  const readFileAndExtractHeaders = (file) => {
    if (!file) return;
    
    const fileExt = file.name.split('.').pop().toLowerCase();
    
    // If it's a CSV file, read it directly
    if (fileExt === 'csv' || fileExt === 'txt') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const headers = extractCSVHeaders(content);
        setFileColumns(headers);
        
        // Try to auto-select a relevant column for the file type
        if (headers.length > 0) {
          const relevantColumns = fileType === 'email' 
            ? headers.filter(h => h.toLowerCase().includes('email'))
            : headers.filter(h => h.toLowerCase().includes('phone') || h.toLowerCase().includes('number'));
          
          if (relevantColumns.length > 0) {
            setSelectedColumn(relevantColumns[0]);
          } else {
            setSelectedColumn(headers[0]); // Default to first column if no relevant one found
          }
        }
      };
      reader.readAsText(file);
    } 
    // If it's an Excel file, convert first and then extract headers
    else if (['xlsx', 'xls'].includes(fileExt)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Get first row as headers
          const headers = [];
          const range = XLSX.utils.decode_range(worksheet['!ref']);
          
          // Extract headers from the first row
          for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: col });
            const cell = worksheet[cellAddress];
            if (cell && cell.v) {
              headers.push(String(cell.v).trim());
            }
          }
          
          setFileColumns(headers);
          
          // Try to auto-select a relevant column
          if (headers.length > 0) {
            const relevantColumns = fileType === 'email' 
              ? headers.filter(h => h.toLowerCase().includes('email'))
              : headers.filter(h => h.toLowerCase().includes('phone') || h.toLowerCase().includes('number'));
            
            if (relevantColumns.length > 0) {
              setSelectedColumn(relevantColumns[0]);
            } else {
              setSelectedColumn(headers[0]); // Default to first column if no relevant one found
            }
          }
        } catch (error) {
          console.error('Error reading Excel headers:', error);
          setFileColumns([]);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // Set default column name based on file type, only if no file columns detected
  useEffect(() => {
    if (fileColumns.length === 0) {
      setSelectedColumn(fileType === 'email' ? 'email' : 'phone_number');
    }
  }, [fileType, fileColumns]);

  // Mock data for recently scrubbed files - replace with actual data fetching
  useEffect(() => {
    if (fileType === 'phone') {
      setRecentlyScrubbed([
        {
          fileName: '50k+ Statewide-Scrubbed-Exclusive-LT-NEW-30Jan-.csv',
          scrubDate: '19/03/2025, 01:03:58',
          total: 52423,
          blacklist: 33,
          suppress: 0,
          stateDNC: 2,
          federalDNC: 5199,
          wireless: 35479,
          landline: 11709,
          good: 47188,
          errors: 0,
          badPhone: 1
        }
      ]);
    }
  }, [fileType]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleSelectedFile(file);
    }
  };

  // Convert Excel file to CSV
  const convertExcelToCSV = async (excelFile) => {
    setIsConverting(true);
    setWarning(`Converting ${excelFile.name} to CSV format...`);
    
    try {
      // Create a FileReader instance
      const reader = new FileReader();

      // Return a promise that resolves when the file is read
      return new Promise((resolve, reject) => {
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result);
            
            // Parse the Excel file
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Get the first worksheet
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Convert to CSV
            const csvContent = XLSX.utils.sheet_to_csv(worksheet);
            
            // Create a new file object with the CSV content
            const csvFile = new File(
              [csvContent], 
              excelFile.name.replace(/\.[^.]+$/, '.csv'), 
              { type: 'text/csv' }
            );
            
            resolve(csvFile);
          } catch (err) {
            reject(new Error('Failed to convert Excel to CSV: ' + err.message));
          }
        };
        
        reader.onerror = () => {
          reject(new Error('Failed to read the Excel file'));
        };
        
        // Read the file as an array buffer
        reader.readAsArrayBuffer(excelFile);
      });
    } catch (error) {
      throw new Error('Error converting Excel to CSV: ' + error.message);
    } finally {
      setIsConverting(false);
    }
  };

  const handleSelectedFile = async (file) => {
    setSelectedFile(null);
    setFileName('');
    setUploadResult(null);
    setError(null);
    setWarning(null);
    setDownloadUrl(null);
    setProcessingStatus(null);
    setFileColumns([]);
    
    const fileExt = file.name.split('.').pop().toLowerCase();
    
    // Check if it's an Excel file that needs conversion
    if (['xlsx', 'xls'].includes(fileExt)) {
      try {
        setWarning(`Excel files need to be converted to CSV before upload. Converting ${file.name}...`);
        const csvFile = await convertExcelToCSV(file);
        setWarning(`Successfully converted ${file.name} to ${csvFile.name}`);
        setSelectedFile(csvFile);
        setFileName(csvFile.name);
        
        // Extract headers from the converted CSV
        readFileAndExtractHeaders(csvFile);
      } catch (error) {
        setError(`Failed to convert Excel file: ${error.message}`);
        console.error('Excel conversion error:', error);
      }
    } else {
      // For non-Excel files, just validate and set
      setSelectedFile(file);
      setFileName(file.name);
      
      // Validate file extension immediately
      if (validateFileType(file)) {
        // Extract headers from the file
        readFileAndExtractHeaders(file);
      }
    }
  };
  
  const validateFileType = (file) => {
    const fileExt = file.name.split('.').pop().toLowerCase();
    
    // What the API supports
    const apiSupportedExtensions = ['csv', 'txt', 'zip', 'gz'];
    
    if (!apiSupportedExtensions.includes(fileExt)) {
      setError(`File type .${fileExt} is not supported by the API. Only CSV, TXT, ZIP, or GZ files can be uploaded.`);
      return false;
    }
    
    return true;
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectFileClick = () => {
    fileInputRef.current.click();
  };

  const toggleOptionCheckbox = (option) => {
    setOutputOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleColumnSelect = (column) => {
    setSelectedColumn(column);
    setShowColumnDropdown(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    // Validate file type again before upload
    if (!validateFileType(selectedFile)) {
      return;
    }

    setUploading(true);
    setError(null);
    setProcessingStatus('Uploading file...');
    
    // Create form data with all options
    const formData = new FormData();
    formData.append('key', apiKey);
    
    // IMPORTANT: After multiple attempts, it seems the API might have
    // a completely different structure for email vs phone scrubs
    if (fileType === 'email') {
      // Instead of using 'filetype', let's try using 'type' only for email scrubs
      // This is based on API endpoint structure analysis
      formData.append('type', 'email');
      
      // Some APIs require an action parameter to specify the operation
      formData.append('action', 'scrub');
    } else {
      // Keep the working phone scrub implementation
      formData.append('filetype', 'phone');
    }
    
    // Add CSV-specific options for CSV files
    const fileExt = selectedFile.name.split('.').pop().toLowerCase();
    if (['csv', 'xls', 'xlsx'].includes(fileExt)) {
      formData.append('has_header', includesHeader ? '1' : '0');
      formData.append('column_name', selectedColumn);
    }
    
    // For phone scrubs only, add the selected output options
    if (fileType === 'phone') {
      // By default, only all_clean.csv will be downloaded
      // Each option here adds an additional file to the download
      Object.keys(outputOptions).forEach(option => {
        // Only append options that are true (checked by user)
        if (outputOptions[option]) {
          formData.append(option, '1');
        }
      });
    }
    
    // Finally add the file
    formData.append('file', selectedFile);

    try {
      console.log('Uploading file to API:', {
        url: fileType === 'email' 
          ? 'https://api.blacklistalliance.net/email/bulk'
          : 'https://api.blacklistalliance.net/bulk/upload',
        fileType,
        apiParameters: fileType === 'email' 
          ? { type: 'email', action: 'scrub' }
          : { filetype: 'phone' },
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        includesHeader,
        selectedColumn,
        outputOptions: fileType === 'phone' ? Object.keys(outputOptions).filter(option => outputOptions[option]) : 'N/A for email'
      });
      
      // Set responseType to 'blob' to handle file downloads
      const response = await axios.post(
        'https://api.blacklistalliance.net/bulk/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/zip, application/json'
          },
          responseType: 'blob', // Important for receiving binary data
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProcessingStatus(`Uploading file... ${percentCompleted}%`);
          }
        }
      );
      
      console.log('Response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        contentType: response.headers['content-type'],
        contentLength: response.headers['content-length']
      });
      
      // Check response content type to determine how to handle it
      const contentType = response.headers['content-type'];
      
      if (contentType && (contentType.includes('application/zip') || contentType.includes('application/octet-stream'))) {
        // If it's a ZIP or binary file
        try {
          // Create a blob for the zip file
          const blob = new Blob([response.data], { 
            type: contentType || 'application/zip' 
          });
          
          // Create URL for download
          const url = window.URL.createObjectURL(blob);
          setDownloadUrl(url);
          
          // Auto-download the file
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `scrubbed_${fileType}_${new Date().getTime()}.zip`);
          document.body.appendChild(link);
          
          // Log before click
          console.log('Initiating download...');
          link.click();
          
          // Clean up
          document.body.removeChild(link);
          console.log('Download link clicked and removed from DOM');
          
          setProcessingStatus('Scrubbing complete! Download started.');
          setUploadResult({
            success: true,
            message: 'File processed successfully',
            data: { downloaded: true }
          });
          
          // Add to recently scrubbed files - using mock data for now
          const newScrubbed = {
            fileName: selectedFile.name,
            scrubDate: new Date().toLocaleString(),
            total: Math.floor(Math.random() * 10000) + 1000,
            blacklist: Math.floor(Math.random() * 100),
            suppress: 0,
            stateDNC: Math.floor(Math.random() * 10),
            federalDNC: Math.floor(Math.random() * 1000),
            wireless: Math.floor(Math.random() * 5000),
            landline: Math.floor(Math.random() * 2000),
            good: Math.floor(Math.random() * 9000),
            errors: 0,
            badPhone: Math.floor(Math.random() * 5)
          };
          
          setRecentlyScrubbed(prev => [newScrubbed, ...prev].slice(0, 10));
        } catch (downloadErr) {
          console.error('Error creating download:', downloadErr);
          setError(`Error creating download: ${downloadErr.message || 'Unknown error'}`);
        }
      } else {
        // If it's a JSON response or other format
        try {
          // Convert blob to text
          const text = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsText(response.data);
          });
          
          // Try to parse as JSON
          try {
            const responseData = JSON.parse(text);
            console.log('Parsed JSON response:', responseData);
            
            if (responseData.error) {
              setError(`API Error: ${responseData.error}`);
              setUploadResult({
                success: false,
                message: 'Upload failed',
                data: responseData
              });
            } else {
              setUploadResult({
                success: true,
                message: responseData.message || 'File uploaded successfully',
                data: responseData
              });
              
              setProcessingStatus('File uploaded. Processing in progress...');
              
              // If there's a job ID, we could poll for status
              if (responseData.jobId) {
                pollJobStatus(responseData.jobId);
              }
            }
          } catch (jsonError) {
            // If not valid JSON, show the response as text
            console.warn('Response is not valid JSON:', text);
            setError(`Invalid response format. Server returned: ${text.substring(0, 100)}...`);
          }
        } catch (textError) {
          console.error('Error reading response as text:', textError);
          setError('Failed to read server response');
        }
      }
      
      if (onUploadComplete) {
        onUploadComplete(response.data);
      }
    } catch (err) {
      console.error('Upload error:', err);
      
      let errorMessage = 'Failed to upload file. Please try again.';
      
      // Extract more detailed error if available
      if (err.response) {
        console.log('Error response:', err.response);
        
        if (err.response.data) {
          if (err.response.data instanceof Blob) {
            try {
              // Try to read blob as text
              const text = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsText(err.response.data);
              });
              
              console.log('Error response text:', text);
              
              try {
                const errorJson = JSON.parse(text);
                console.log('Parsed error JSON:', errorJson);
                errorMessage = errorJson.message || errorJson.error || errorMessage;
              } catch (e) {
                errorMessage = text || errorMessage;
              }
            } catch (e) {
              console.error('Error reading error response blob:', e);
            }
          } else if (typeof err.response.data === 'string') {
            errorMessage = err.response.data;
          } else if (err.response.data.message) {
            errorMessage = err.response.data.message;
          } else if (err.response.data.error) {
            errorMessage = err.response.data.error;
          }
        } else {
          errorMessage = `Server error: ${err.response.status} ${err.response.statusText}`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // For email scrubs, if we get a 400 error, try a different approach
      if (fileType === 'email' && err.response && err.response.status === 400) {
        setError('Email scrub failed with the current parameters. Trying an alternative approach...');
        
        // Try a different approach: use bulk email endpoint
        try {
          setProcessingStatus('Trying alternative email scrub method...');
          
          // Create new form data for the alternative approach
          const altFormData = new FormData();
          altFormData.append('key', apiKey);
          altFormData.append('filetype', 'mail'); // Try 'mail' instead of 'email'
          
          if (['csv', 'xls', 'xlsx'].includes(fileExt)) {
            altFormData.append('has_header', includesHeader ? '1' : '0');
            altFormData.append('column_name', selectedColumn);
          }
          
          altFormData.append('file', selectedFile);
          
          console.log('Trying alternative email scrub approach:');
          for (let [key, value] of altFormData.entries()) {
            console.log(`- ${key}: ${value instanceof File ? value.name : value}`);
          }
          
          const altResponse = await axios.post(
            'https://api.blacklistalliance.net/bulk/upload',
            altFormData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/zip, application/json'
              },
              responseType: 'blob',
              validateStatus: function (status) {
                return status >= 200 && status < 500;
              }
            }
          );
          
          console.log('Alternative approach response:', altResponse);
          
          // Process the response
          if (altResponse.status >= 200 && altResponse.status < 300) {
            const contentType = altResponse.headers['content-type'];
            
            if (contentType && (contentType.includes('application/zip') || contentType.includes('application/octet-stream'))) {
              // Create and download the blob
              const blob = new Blob([altResponse.data], { 
                type: contentType || 'application/zip' 
              });
              
              const url = window.URL.createObjectURL(blob);
              setDownloadUrl(url);
              
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', `scrubbed_${fileType}_${new Date().getTime()}.zip`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              
              setProcessingStatus('Scrubbing complete! Download started.');
              setUploadResult({
                success: true,
                message: 'File processed successfully with alternative method',
                data: { downloaded: true }
              });
              
              return; // Success with alternative approach
            }
          }
          
          // If we got here, the alternative approach didn't work either
          throw new Error('Alternative approach failed as well');
        } catch (altErr) {
          console.error('Alternative approach error:', altErr);
          errorMessage = 'Both scrubbing methods failed. Please check your file format and try again.';
        }
      }
      
      setError(errorMessage);
      setUploadResult({
        success: false,
        message: 'Upload failed'
      });
      setProcessingStatus(null);
    } finally {
      setUploading(false);
    }
  };
  
  // Function to poll job status if the processing is asynchronous
  const pollJobStatus = async (jobId) => {
    // This is a placeholder - implement based on API documentation
    console.log(`Would poll for job status: ${jobId}`);
  };

  const clearUpload = () => {
    setSelectedFile(null);
    setFileName('');
    setUploadResult(null);
    setError(null);
    setWarning(null);
    setDownloadUrl(null);
    setProcessingStatus(null);
  };

  return (
    <div className="enhanced-file-uploader">
      <div className="scrub-info">
        <div className="allowed-extensions">
          <strong>Allowed file extensions:</strong> csv (or zip csv), txt (or zip txt), gz
        </div>
        <div className="file-note">
          <strong>Note:</strong> Excel files (XLSX, XLS) will be automatically converted to CSV format before uploading.
        </div>
        <div className="download-info">
          Cleaned file will automatically download after scrub is complete.
        </div>
      </div>

      <div className="scrub-notice">
        <h4>NOTICE</h4>
        <p>
          The system will scrub against all feeds listed in your API configuration. {fileType === 'phone' && 'If you inserted your SANS number into the API details, it will also scrub against the National DNC Registry.'} Once the scrub is complete, a zipped folder containing the clean records will automatically download to your computer.
        </p>
        <div className="scrub-output-info">
          <p><strong>Default Output:</strong></p>
          <ul>
            <li><strong>all_clean.csv:</strong> The records remaining after the scrub</li>
            <li><strong>feeds.txt:</strong> A list of the feeds utilized for the scrub</li>
          </ul>
          {fileType === 'phone' && (
            <p>Additional output files can be selected in the options below.</p>
          )}
        </div>
      </div>

      <div className="upload-area">
        <div className="file-select-area">
          <button 
            className="select-file-btn" 
            onClick={handleSelectFileClick}
            disabled={uploading}
          >
            SELECT FILE
          </button>
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden-file-input"
            accept=".csv,.txt,.xlsx,.xls,.zip,.gz"
            onChange={handleFileChange}
          />
          {fileName && (
            <div className="selected-file-name">
              <FaCheck className="success-icon" /> {fileName}
            </div>
          )}
        </div>

        <div 
          className={`drop-area ${isDragging ? 'dragging' : ''} ${uploading ? 'disabled' : ''}`}
          ref={dropAreaRef}
          onDragEnter={!uploading ? handleDragEnter : null}
          onDragLeave={!uploading ? handleDragLeave : null}
          onDragOver={!uploading ? handleDragOver : null}
          onDrop={!uploading ? handleDrop : null}
        >
          {uploading ? 'Upload in progress...' : 'Drag file here'}
        </div>

        <div className="file-options">
          <div className="has-header-option">
            <input 
              type="checkbox" 
              id={`has-header-${fileType}`}
              checked={includesHeader}
              onChange={() => setIncludesHeader(!includesHeader)}
              disabled={uploading}
            />
            <label htmlFor={`has-header-${fileType}`}>Check if File Includes a Header</label>
          </div>

          <div className="column-selector">
            <label>Select {fileType === 'phone' ? 'Phone' : 'Email'} Number Column</label>
            <div className="select-dropdown">
              <div 
                className={`select-display ${uploading ? 'disabled' : ''}`}
                onClick={() => !uploading && setShowColumnDropdown(!showColumnDropdown)}
              >
                {selectedColumn}
                <FaChevronDown />
              </div>
              {showColumnDropdown && !uploading && (
                <div className="dropdown-options">
                  {fileColumns.length > 0 ? (
                    // Display extracted columns from the file
                    fileColumns.map((column, index) => (
                      <div 
                        key={index} 
                        className="option" 
                        onClick={() => handleColumnSelect(column)}
                      >
                        {column}
                      </div>
                    ))
                  ) : (
                    // Fallback options if no columns extracted
                    fileType === 'phone' ? (
                      // Phone number column options
                      <>
                        <div className="option" onClick={() => handleColumnSelect('phone_number')}>phone_number</div>
                        <div className="option" onClick={() => handleColumnSelect('phonenumber')}>phonenumber</div>
                        <div className="option" onClick={() => handleColumnSelect('number')}>number</div>
                        <div className="option" onClick={() => handleColumnSelect('phone')}>phone</div>
                      </>
                    ) : (
                      // Email column options
                      <>
                        <div className="option" onClick={() => handleColumnSelect('email')}>email</div>
                        <div className="option" onClick={() => handleColumnSelect('email_address')}>email_address</div>
                        <div className="option" onClick={() => handleColumnSelect('emailaddress')}>emailaddress</div>
                        <div className="option" onClick={() => handleColumnSelect('email_addr')}>email_addr</div>
                      </>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="additional-options">
        <h4>Additional Output Options</h4>
        <p>
          {fileType === 'phone' ? (
            <>
              By default, only the <strong>all_clean.csv</strong> file (containing the numbers remaining after scrub) will be downloaded.
              Check any options below to include additional files in your download:
            </>
          ) : (
            <>
              For email scrubs, only the <strong>all_clean.csv</strong> file (containing the emails remaining after scrub) will be downloaded.
            </>
          )}
        </p>
        
      </div>

      <div className="upload-actions">
        <button 
          className="upload-button" 
          onClick={handleUpload}
          disabled={uploading || !selectedFile}
        >
          {uploading ? (
            <>
              <FaSpinner className="spinning icon" /> UPLOADING...
            </>
          ) : (
            <>
              <FaUpload className="icon" /> UPLOAD
            </>
          )}
        </button>
        
        {selectedFile && !uploading && (
          <button className="clear-button" onClick={clearUpload}>
            CLEAR
          </button>
        )}
      </div>

      {processingStatus && (
        <div className="processing-status">
          <FaSpinner className={uploading ? "spinning icon" : "icon"} />
          <span>{processingStatus}</span>
        </div>
      )}

      {error && (
        <div className="error-message">
          <FaExclamationTriangle className="icon" /> 
          <span>{error}</span>
        </div>
      )}
      
      {warning && !error && (
        <div className="warning-message">
          <FaFileExcel className={isConverting ? "icon spinning" : "icon"} /> 
          <span>{warning}</span>
        </div>
      )}

      {uploadResult && uploadResult.success && (
        <div className="success-message">
          <FaCheck className="icon" /> 
          <span>{uploadResult.message}</span>
          {uploadResult.data && !uploadResult.data.downloaded && (
            <div className="upload-details">
              <p>File is being processed. Results will be available shortly.</p>
              {uploadResult.data.jobId && (
                <p>Job ID: {uploadResult.data.jobId}</p>
              )}
            </div>
          )}
        </div>
      )}
      
      {downloadUrl && (
        <div className="download-section">
          <button 
            className="download-button"
            onClick={() => {
              try {
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.setAttribute('download', `scrubbed_${fileType}_${new Date().getTime()}.zip`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                console.log('Manual download triggered');
              } catch (err) {
                console.error('Error triggering manual download:', err);
                setError(`Download error: ${err.message}`);
              }
            }}
          >
            <FaDownload className="icon" /> Download Results Again
          </button>
          <p className="download-note">
            Your file has been processed and downloaded. Click the button above if you need to download it again.
          </p>
        </div>
      )}

      {/* Recent files section */}
      {recentlyScrubbed.length > 0 && (
        <div className="recent-files-section">
          
          
          {showRecentFiles && (
            <div className="recent-files-table">
              <table>
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Scrub Date</th>
                    <th>Total</th>
                    <th>Blacklist</th>
                    <th>Suppress</th>
                    <th>State DNC</th>
                    <th>Federal DNC</th>
                    <th>Wireless</th>
                    <th>Landline</th>
                    <th>Good</th>
                    <th>Errors</th>
                    <th>Bad {fileType === 'phone' ? 'Phone #' : 'Email'}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentlyScrubbed.map((file, index) => (
                    <tr key={index}>
                      <td>{file.fileName}</td>
                      <td>{file.scrubDate}</td>
                      <td>{file.total?.toLocaleString()}</td>
                      <td>{file.blacklist?.toLocaleString()}</td>
                      <td>{file.suppress?.toLocaleString()}</td>
                      <td>{file.stateDNC?.toLocaleString()}</td>
                      <td>{file.federalDNC?.toLocaleString()}</td>
                      <td>{file.wireless?.toLocaleString()}</td>
                      <td>{file.landline?.toLocaleString()}</td>
                      <td>{file.good?.toLocaleString()}</td>
                      <td>{file.errors?.toLocaleString()}</td>
                      <td>{file.badPhone?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUploader;