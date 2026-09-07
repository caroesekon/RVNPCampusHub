const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg'];

const isImage = (file) => {
  return file && IMAGE_TYPES.includes(file.type);
};

const isVideo = (file) => {
  return file && VIDEO_TYPES.includes(file.type);
};

const isAudio = (file) => {
  return file && AUDIO_TYPES.includes(file.type);
};

const getFileType = (file) => {
  if (isImage(file)) return 'IMAGE';
  if (isVideo(file)) return 'VIDEO';
  if (isAudio(file)) return 'AUDIO';
  return 'FILE';
};

const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase();
};

export {
  IMAGE_TYPES,
  VIDEO_TYPES,
  AUDIO_TYPES,
  isImage,
  isVideo,
  isAudio,
  getFileType,
  getFileExtension,
};