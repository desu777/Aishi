'use client';

import { useState, useCallback, useEffect } from 'react';
import { NetworkType, getDefaultNetworkType } from '../../lib/0g/network';

interface FileInfo {
  rootHash: string;
  fileName: string;
  fileSize: number;
  txHash?: string;
  uploadDate: number;
  networkType: NetworkType;
}

interface UseStorageListReturn {
  // Data
  files: FileInfo[];
  
  // Methods
  addFile: (fileInfo: Omit<FileInfo, 'uploadDate' | 'networkType'>) => void;
  removeFile: (rootHash: string) => void;
  clearFiles: () => void;
  formatFileSize: (bytes: number) => string;
}

const STORAGE_KEY = 'dreamscape-uploaded-files';

export function useStorageList(): UseStorageListReturn {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const networkType = getDefaultNetworkType();

  // Load files from localStorage on mount
  useEffect(() => {
    try {
      const savedFiles = localStorage.getItem(STORAGE_KEY);
      if (savedFiles) {
        const parsedFiles = JSON.parse(savedFiles) as FileInfo[];
        setFiles(parsedFiles);
        
        if (process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
          console.log('[useStorageList] Loaded files from localStorage:', parsedFiles.length);
        }
      }
    } catch (error) {
      console.error('[useStorageList] Error loading files from localStorage:', error);
    }
  }, []);

  // Save files to localStorage whenever files change
  const saveToLocalStorage = useCallback((updatedFiles: FileInfo[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFiles));
      if (process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
        console.log('[useStorageList] Saved files to localStorage:', updatedFiles.length);
      }
    } catch (error) {
      console.error('[useStorageList] Error saving files to localStorage:', error);
    }
  }, []);

  const addFile = useCallback((fileInfo: Omit<FileInfo, 'uploadDate' | 'networkType'>) => {
    const newFile: FileInfo = {
      ...fileInfo,
      uploadDate: Date.now(),
      networkType
    };

    setFiles(prevFiles => {
      // Check if file already exists (by rootHash)
      const existingIndex = prevFiles.findIndex(f => f.rootHash === newFile.rootHash);
      let updatedFiles: FileInfo[];
      
      if (existingIndex >= 0) {
        // Update existing file
        updatedFiles = [...prevFiles];
        updatedFiles[existingIndex] = newFile;
      } else {
        // Add new file to the beginning
        updatedFiles = [newFile, ...prevFiles];
      }
      
      saveToLocalStorage(updatedFiles);
      return updatedFiles;
    });

    if (process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
      console.log('[useStorageList] Added file:', newFile);
    }
  }, [networkType, saveToLocalStorage]);

  const removeFile = useCallback((rootHash: string) => {
    setFiles(prevFiles => {
      const updatedFiles = prevFiles.filter(f => f.rootHash !== rootHash);
      saveToLocalStorage(updatedFiles);
      return updatedFiles;
    });

    if (process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
      console.log('[useStorageList] Removed file:', rootHash);
    }
  }, [saveToLocalStorage]);

  const clearFiles = useCallback(() => {
    setFiles([]);
    saveToLocalStorage([]);
    
    if (process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
      console.log('[useStorageList] Cleared all files');
    }
  }, [saveToLocalStorage]);

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  return {
    // Data
    files,
    
    // Methods
    addFile,
    removeFile,
    clearFiles,
    formatFileSize
  };
} 