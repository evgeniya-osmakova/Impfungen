interface DownloadBlobParams {
  blob: Blob;
  filename: string;
}

export const downloadBlob = ({ blob, filename }: DownloadBlobParams): void => {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = objectUrl;
  link.download = filename;
  link.style.display = 'none';

  document.body.append(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(objectUrl);
};
