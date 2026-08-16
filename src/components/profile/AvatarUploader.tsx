"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { uploadAvatar } from "@/services/auth.service";

const MAX_BYTES = 5 * 1024 * 1024;

type AvatarUploaderProps = {
  src: string;
  /** Called after a successful upload so the session can re-read the profile. */
  onUploaded: () => void;
};

export function AvatarUploader({ src, onUploaded }: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File | undefined) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }

    if (file.size > MAX_BYTES) {
      setError("Image must be under 5 MB.");
      return;
    }

    setError("");
    setIsUploading(true);

    try {
      await uploadAvatar(file);
      onUploaded();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Could not upload that image.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="avatar-upload">
      <Image
        className="profile-identity__avatar"
        src={src}
        alt=""
        width={120}
        height={120}
        unoptimized
      />

      <button
        type="button"
        className="avatar-upload__button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        aria-label="Change profile photo"
      >
        <Camera size={15} strokeWidth={2} />
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />

      {isUploading && <span className="avatar-upload__status">Uploading...</span>}
      {error && (
        <span className="avatar-upload__status avatar-upload__status--error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
