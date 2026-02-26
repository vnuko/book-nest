import { useState, useRef, useCallback } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop, type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Modal } from '../../common/Modal';
import { API_BASE } from '../../../api/client';
import styles from './BookImageModal.module.css';

const BOOK_ASPECT_RATIO = 184 / 260;

interface BookImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  onImageUpdated: () => void;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number): Crop {
  return centerCrop(
    makeAspectCrop(
      { unit: '%', width: 90 },
      BOOK_ASPECT_RATIO,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export function BookImageModal({ isOpen, onClose, bookId, onImageUpdated }: BookImageModalProps) {
  const [step, setStep] = useState<'select' | 'crop'>('select');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = useCallback(() => {
    setStep('select');
    setImageSrc(null);
    setCrop(undefined);
    setCompletedCrop(null);
    setIsUploading(false);
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string);
      setStep('crop');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please drop an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string);
      setStep('crop');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height));
  };

  const getCroppedImg = async (): Promise<Blob | null> => {
    const image = imgRef.current;
    if (!image || !completedCrop) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;

    canvas.width = 184 * 2;
    canvas.height = 260 * 2;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      cropWidth,
      cropHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        'image/jpeg',
        0.9
      );
    });
  };

  const handleUpload = async () => {
    const croppedBlob = await getCroppedImg();
    if (!croppedBlob) {
      setError('Failed to crop image');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', croppedBlob, 'book-cover.jpg');

      const response = await fetch(`${API_BASE}/api/files/images/books/${bookId}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error?.message || 'Upload failed');
      }

      onImageUpdated();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleBack = () => {
    setStep('select');
    setImageSrc(null);
    setCrop(undefined);
    setCompletedCrop(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={step === 'select' ? 'Change Book Cover' : 'Crop Book Cover'}
      size="lg"
    >
      {step === 'select' ? (
        <div className={styles.uploadSection}>
          <div
            className={styles.dropzone}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <FontAwesomeIcon icon={faCloudUploadAlt} className={styles.dropzoneIcon} />
            <p className={styles.dropzoneText}>
              Drop an image here or click to browse
            </p>
            <p className={styles.dropzoneHint}>
              JPG, PNG, or WebP · Max 5MB
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className={styles.fileInput}
          />
          {error && <p className={styles.error}>{error}</p>}
        </div>
      ) : (
        <div className={styles.cropSection}>
          <div className={styles.cropContainer}>
            {imageSrc && (
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={BOOK_ASPECT_RATIO}
                minWidth={50}
                minHeight={70}
              >
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Crop preview"
                  className={styles.cropImage}
                  onLoad={onImageLoad}
                />
              </ReactCrop>
            )}
          </div>
          <p className={styles.cropHint}>
            Drag to adjust. The image will be cropped to book cover proportions (1:1.41).
          </p>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.actions}>
            <button 
              className={styles.cancelBtn} 
              onClick={handleBack}
              disabled={isUploading}
            >
              Back
            </button>
            <button
              className={styles.primaryBtn}
              onClick={handleUpload}
              disabled={isUploading || !completedCrop}
            >
              {isUploading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  <span>Uploading...</span>
                </>
              ) : (
                'Apply & Save'
              )}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
