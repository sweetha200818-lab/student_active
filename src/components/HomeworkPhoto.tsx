import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface HomeworkPhotoProps {
  src: string;
  alt: string;
  className?: string;
}

export function HomeworkPhoto({ src, alt, className = '' }: HomeworkPhotoProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-sky-50 border border-sky-200 text-sky-700 rounded-lg p-4 ${className}`}
      >
        <ImageIcon className="w-6 h-6 mb-1.5 opacity-75" aria-hidden="true" />
        <span className="text-xs font-medium text-center">Homework Photo</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`object-cover bg-sky-50 border border-sky-200 rounded-lg ${className}`}
    />
  );
}
