import React, { useRef, useState } from 'react';
import { Upload, File, FileText, Video, Trash2, Download } from 'lucide-react';

export default function FileUpload({
  label = "Upload File",
  accept = "image/*,application/pdf,video/*",
  onFileSelect,
  initialFile = null,
  onFileRemove,
}) {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(initialFile);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFile(file);
    }
  };

  const handleFile = (file) => {
    setSelectedFile({
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + " MB",
      type: file.type,
      raw: file,
    });
    if (onFileSelect) onFileSelect(file);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (onFileRemove) onFileRemove();
  };

  const isVideo = selectedFile?.type?.startsWith('video') || selectedFile?.name?.endsWith('.mp4');
  const isImage = selectedFile?.type?.startsWith('image') || selectedFile?.name?.match(/\.(jpeg|jpg|gif|png|webp)$/i);

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider font-display">
          {label}
        </label>
      )}

      {selectedFile ? (
        <div className="flex items-center justify-between p-3.5 bg-bg-base/40 border border-border-sage/60 rounded-xl">
          <div className="flex items-center space-x-3">
            {isVideo ? (
              <Video className="w-5 h-5 text-accent-soc" />
            ) : isImage ? (
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-border-sage bg-bg-card flex items-center justify-center">
                <img
                  src={selectedFile.raw ? URL.createObjectURL(selectedFile.raw) : (selectedFile.url || '/placeholder.png')}
                  alt="Upload preview"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <FileText className="w-5 h-5 text-accent-env" />
            )}
            <div>
              <p className="text-xs font-bold text-text-primary max-w-[200px] truncate">{selectedFile.name}</p>
              <p className="text-[10px] text-text-secondary font-mono">{selectedFile.size || 'Unknown size'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 text-text-secondary hover:text-accent-gam hover:bg-accent-gam/10 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
            dragActive 
              ? 'border-accent-soc bg-accent-soc/5' 
              : 'border-border-sage/80 hover:border-text-secondary bg-bg-card/25'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInput}
            accept={accept}
            className="hidden"
          />
          <Upload className="w-6 h-6 mx-auto mb-2 text-text-secondary/70" />
          <p className="text-xs font-bold text-text-primary">Click or drag file here to upload</p>
          <p className="text-[10px] text-text-secondary/60 mt-1 uppercase font-mono tracking-wider">PDF, PNG, JPG, or MP4</p>
        </div>
      )}
    </div>
  );
}
