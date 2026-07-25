import { useRef, useState } from "react";

export default function ImageUploader({ onFileSelected, previewUrl }) {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  function handleFiles(files) {
    const file = files?.[0];
    if (file) onFileSelected(file);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition ${
        dragActive
          ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
          : "border-gray-300 dark:border-gray-700"
      }`}
    >
      {previewUrl ? (
        <img src={previewUrl} alt="Preview" className="max-h-80 rounded-lg object-contain" />
      ) : (
        <>
          <span className="text-3xl">📷</span>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Click to choose a photo, or drag one here
          </p>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
