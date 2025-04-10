import React, { useState } from 'react'
import { ImageIcon, ZoomIn, ZoomOut } from 'lucide-react'

type LogoUploaderProps = {
  logo: string | null | ArrayBuffer
  logoError: string | null
  handleLogoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleClearLogo: () => void
  logoZoom: number
  handleLogoZoomChange: (zoom: number) => void
}

const LogoUploader: React.FC<LogoUploaderProps> = ({ logo, logoError, handleLogoUpload, handleClearLogo, logoZoom, handleLogoZoomChange }) => {
  const handleZoomIn = () => {
    handleLogoZoomChange(Math.min(logoZoom + 0.1, 2)); // Zoom in, max 2x
  };

  const handleZoomOut = () => {
    handleLogoZoomChange(Math.max(logoZoom - 0.1, 0.5)); // Zoom out, min 0.5x
  };


  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <ImageIcon className="text-purple-600" /> Company Logo (Max 2MB)
      </h2>
      <div className="flex items-center gap-4">
        <input
          type="file"
          id="logo-upload"
          accept="image/*"
          className="hidden"
          onChange={handleLogoUpload}
        />
        <label htmlFor="logo-upload" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer flex items-center gap-2">
          <ImageIcon size={18} /> Upload Logo
        </label>
        {logo && (
          <button
            onClick={handleClearLogo}
            className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg text-sm"
          >
            Remove Logo
          </button>
        )}
      </div>
      {logoError && <p className="text-red-500 text-sm">{logoError}</p>}
      {logo && typeof logo === 'string' && (
        <div className="relative w-fit">
          <img
            src={logo}
            alt="Company Logo Preview"
            className="mt-2 max-h-40"
            style={{ transform: `scale(${logoZoom})` }}
          />
          <div className="absolute bottom-2 right-2 bg-gray-100 rounded-md shadow-sm p-1 flex">
            <button
              onClick={handleZoomIn}
              className="p-1 hover:bg-gray-200 rounded-md"
              aria-label="Zoom in"
            >
              <ZoomIn size={16} />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1 hover:bg-gray-200 rounded-md"
              aria-label="Zoom out"
            >
              <ZoomOut size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default LogoUploader
