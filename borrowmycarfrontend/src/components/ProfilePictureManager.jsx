// src/components/ProfilePictureManager.jsx
import { useState, useRef } from "react";
import { Camera, Trash2, Upload, X, User } from "lucide-react";
import API from "../api";

const ProfilePictureManager = ({
  user,
  onUpdateSuccess,
  onError,
  size = "lg",
  editable = true,
  showRemoveOption = true,
}) => {
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef(null);

  // Size configurations
  const sizeConfig = {
    sm: {
      container: "w-16 h-16",
      image: "w-16 h-16",
      icon: "w-6 h-6",
      uploadButton: "w-5 h-5",
      modalImage: "w-32 h-32",
    },
    md: {
      container: "w-24 h-24",
      image: "w-24 h-24",
      icon: "w-8 h-8",
      uploadButton: "w-6 h-6",
      modalImage: "w-48 h-48",
    },
    lg: {
      container: "w-32 h-32",
      image: "w-32 h-32",
      icon: "w-12 h-12",
      uploadButton: "w-7 h-7",
      modalImage: "w-64 h-64",
    },
    xl: {
      container: "w-48 h-48",
      image: "w-48 h-48",
      icon: "w-16 h-16",
      uploadButton: "w-8 h-8",
      modalImage: "w-80 h-80",
    },
  };

  const config = sizeConfig[size] || sizeConfig.lg;

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      onError?.("Please select a valid image file (JPEG, PNG, or WebP)");
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      onError?.("Image size must be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
      setShowModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!fileInputRef.current?.files[0]) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("profileImage", fileInputRef.current.files[0]);

      const response = await API.put("/auth/profile-picture", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        onUpdateSuccess?.(response.data.data.user);
        setShowModal(false);
        setPreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (error) {
      console.error("Profile picture upload error:", error);
      onError?.(
        error.response?.data?.message || "Failed to upload profile picture"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!user?.profileImage) return;

    const confirmRemove = window.confirm(
      "Are you sure you want to remove your profile picture?"
    );
    if (!confirmRemove) return;

    setRemoving(true);
    try {
      const response = await API.delete("/auth/profile-picture");

      if (response.data.success) {
        onUpdateSuccess?.(response.data.data.user);
      }
    } catch (error) {
      console.error("Profile picture removal error:", error);
      onError?.(
        error.response?.data?.message || "Failed to remove profile picture"
      );
    } finally {
      setRemoving(false);
    }
  };

  const cancelUpload = () => {
    setShowModal(false);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      {/* Profile Picture Display */}
      <div className="relative group">
        <div
          className={`${config.container} relative rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center`}
        >
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt={`${user?.name || "User"}'s profile`}
              className={`${config.image} object-cover`}
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user?.name || "User"
                )}&background=10b981&color=ffffff&size=200`;
              }}
            />
          ) : (
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                user?.name || "User"
              )}&background=10b981&color=ffffff&size=200`}
              alt={`${user?.name || "User"}'s profile`}
              className={`${config.image} object-cover`}
            />
          )}

          {/* Upload/Edit Overlay */}
          {editable && (
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center rounded-full">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || removing}
                  className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 transition-all duration-200 disabled:opacity-50"
                  title="Change profile picture"
                >
                  <Camera className={`${config.uploadButton} text-gray-700`} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Remove Button */}
        {editable && showRemoveOption && user?.profileImage && (
          <button
            onClick={handleRemove}
            disabled={removing || uploading}
            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100"
            title="Remove profile picture"
          >
            {removing ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading || removing}
      />

      {/* Upload Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Update Profile Picture
              </h3>
              <button
                onClick={cancelUpload}
                disabled={uploading}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Preview */}
            <div className="flex justify-center mb-6">
              <div
                className={`${config.modalImage} relative rounded-full overflow-hidden border-4 border-gray-200`}
              >
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>

            {/* File Info */}
            {fileInputRef.current?.files[0] && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="text-sm text-gray-600">
                  <p className="font-medium">
                    {fileInputRef.current.files[0].name}
                  </p>
                  <p>
                    {(fileInputRef.current.files[0].size / 1024 / 1024).toFixed(
                      2
                    )}{" "}
                    MB
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={cancelUpload}
                disabled={uploading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePictureManager;
