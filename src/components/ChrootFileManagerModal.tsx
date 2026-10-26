import React, { useState, useRef } from 'react';
import { 
  Folder, 
  File, 
  Upload, 
  Download, 
  Trash2, 
  Plus, 
  X, 
  FileText, 
  Check, 
  HardDrive,
  FileCode,
  ArrowRight
} from 'lucide-react';
import { ChrootFile } from '../types/files';

interface ChrootFileManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: ChrootFile[];
  onUploadFile: (file: ChrootFile) => void;
  onDeleteFile: (id: string) => void;
}

export const ChrootFileManagerModal: React.FC<ChrootFileManagerModalProps> = ({
  isOpen,
  onClose,
  files,
  onUploadFile,
  onDeleteFile
}) => {
  const [selectedFile, setSelectedFile] = useState<ChrootFile | null>(files[0] || null);
  const [isDragging, setIsDragging] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileContent, setNewFileContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        const file = e.dataTransfer.files[i];
        const text = await file.text().catch(() => '[Binary file content]');
        const newChrootFile: ChrootFile = {
          id: `upload-${Date.now()}-${i}`,
          name: file.name,
          path: `/home/debian/Downloads/${file.name}`,
          sizeBytes: file.size,
          type: file.type || 'application/octet-stream',
          lastModified: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
          isDir: false,
          content: text
        };
        onUploadFile(newChrootFile);
        setSelectedFile(newChrootFile);
      }
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const text = await file.text().catch(() => '[Binary file content]');
        const newChrootFile: ChrootFile = {
          id: `upload-${Date.now()}-${i}`,
          name: file.name,
          path: `/home/debian/Downloads/${file.name}`,
          sizeBytes: file.size,
          type: file.type || 'application/octet-stream',
          lastModified: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
          isDir: false,
          content: text
        };
        onUploadFile(newChrootFile);
        setSelectedFile(newChrootFile);
      }
    }
  };

  const downloadFile = (file: ChrootFile) => {
    const blob = new Blob([file.content || ''], { type: file.type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCreateFile = () => {
    if (!newFileName.trim()) return;
    const file: ChrootFile = {
      id: `new-${Date.now()}`,
      name: newFileName.trim(),
      path: `/home/debian/Documents/${newFileName.trim()}`,
      sizeBytes: new Blob([newFileContent]).size,
      type: 'text/plain',
      lastModified: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
      isDir: false,
      content: newFileContent
    };
    onUploadFile(file);
    setSelectedFile(file);
    setNewFileName('');
    setNewFileContent('');
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-indigo-600/30 text-indigo-400 border border-indigo-500/40">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <span>Chroot Bidirectional File Transfer Hub</span>
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  /home/debian/
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Drag & drop files from your computer to transfer into the Debian 13 desktop filesystem.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drag & Drop Hero Zone */}
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-4 border-b border-dashed transition cursor-pointer text-center text-xs ${
            isDragging
              ? 'bg-indigo-950/60 border-indigo-500 text-indigo-200'
              : 'bg-slate-950/40 border-slate-800 hover:bg-slate-950 text-slate-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileInput}
            className="hidden"
          />
          <div className="flex items-center justify-center space-x-2">
            <Upload className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-200">
              Drop files here or click to browse from local computer
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Files will be transferred into <code className="text-slate-400">/home/debian/Downloads/</code> inside the chroot.
          </p>
        </div>

        {/* Main Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* File Explorer List (5 cols) */}
          <div className="md:col-span-5 border-r border-slate-800 overflow-y-auto p-3 space-y-1 bg-slate-950/50">
            <div className="flex items-center justify-between px-2 py-1 mb-1 text-[11px] font-semibold text-slate-400">
              <span>Files in /home/debian/</span>
              <button
                onClick={() => setIsCreating(!isCreating)}
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-[10px]"
              >
                <Plus className="w-3 h-3" />
                <span>New File</span>
              </button>
            </div>

            {files.map((file) => {
              const isSelected = selectedFile?.id === file.id;
              return (
                <div
                  key={file.id}
                  onClick={() => setSelectedFile(file)}
                  className={`p-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition ${
                    isSelected
                      ? 'bg-indigo-600/30 border border-indigo-500/60 text-white'
                      : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <div className="truncate">
                      <div className="font-medium truncate">{file.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {(file.sizeBytes / 1024).toFixed(1)} KB • {file.lastModified.split(' ')[0]}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadFile(file);
                      }}
                      className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                      title="Download file to host"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteFile(file.id);
                        if (selectedFile?.id === file.id) {
                          setSelectedFile(null);
                        }
                      }}
                      className="p-1 hover:bg-rose-900/60 rounded text-slate-400 hover:text-rose-300"
                      title="Delete file"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* File Inspector / Creator (7 cols) */}
          <div className="md:col-span-7 p-4 bg-slate-900/80 overflow-y-auto flex flex-col justify-between">
            {isCreating ? (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white">Create New File in Chroot</h4>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">File Name</label>
                  <input
                    type="text"
                    placeholder="example.py"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">File Content</label>
                  <textarea
                    rows={8}
                    value={newFileContent}
                    onChange={(e) => setNewFileContent(e.target.value)}
                    placeholder="Enter file contents..."
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-xs text-white font-mono"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCreateFile}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold"
                  >
                    Save File
                  </button>
                  <button
                    onClick={() => setIsCreating(false)}
                    className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : selectedFile ? (
              <div className="space-y-3 flex-1 flex flex-col">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div>
                    <h4 className="text-sm font-bold text-white font-mono">{selectedFile.name}</h4>
                    <p className="text-[11px] text-slate-400 font-mono">{selectedFile.path}</p>
                  </div>
                  <button
                    onClick={() => downloadFile(selectedFile)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>

                <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs overflow-auto text-slate-300 max-h-64">
                  <pre className="whitespace-pre-wrap leading-relaxed">
                    {selectedFile.content || '(Binary file or empty)'}
                  </pre>
                </div>

                <div className="text-[11px] text-slate-500 flex justify-between">
                  <span>Size: {selectedFile.sizeBytes} bytes</span>
                  <span>Type: {selectedFile.type}</span>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 text-xs">
                <File className="w-10 h-10 mb-2 opacity-40" />
                <span>Select a file to inspect its contents or upload from your computer.</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Total Files: {files.length} • Chroot Isolated Storage</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
