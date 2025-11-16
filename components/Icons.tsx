import React from 'react';

interface IconProps {
  className?: string;
}

export const SendIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
  </svg>
);

export const MicIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
    <path d="M6 10.5a.75.75 0 01.75.75v.75a4.5 4.5 0 009 0v-.75a.75.75 0 011.5 0v.75a6 6 0 11-12 0v-.75A.75.75 0 016 10.5zM12 18.75a.75.75 0 000 1.5c1.23 0 2.41-.354 3.443-.992a.75.75 0 00-.866-1.214A2.99 2.99 0 0112 18.75z" />
  </svg>
);

export const PaperclipIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.5 10.5a.75.75 0 001.06 1.06l10.5-10.5a.75.75 0 011.06 0s.318.319.318.707a.75.75 0 01-1.06 1.06l-6.75 6.75a2.25 2.25 0 003.182 3.182l6.75-6.75a3.75 3.75 0 10-5.303-5.303l-10.5 10.5a5.25 5.25 0 107.424 7.424l10.5-10.5a2.25 2.25 0 000-3.182z" clipRule="evenodd" />
  </svg>
);

export const ImageIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06l2.755-2.754a.75.75 0 011.06 0l3.078 3.077a.75.75 0 001.06 0l3.803-3.803a.75.75 0 011.06 0l3.245 3.244V6.75a.75.75 0 00-.75-.75H3.75a.75.75 0 00-.75.75v9.31z" clipRule="evenodd" />
        <path d="M8.25 10.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    </svg>
);

export const UserIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
    </svg>
);

export const BotIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14.614 20.014L13.25 21.75l-1.614-2-1.614 2-1.364-1.736 1.614-2-2.13-1.628-1.125 2.25a.75.75 0 01-1.342-.67l.5-2.5a.75.75 0 01.624-.624l2.5-.5a.75.75 0 01.67 1.342l-2.25 1.125L9.396 18l1.614-2L12 17.25l1-1.25-1.614-2 2.13-1.628 1.125 2.25a.75.75 0 01-1.342.67l-.5-2.5a.75.75 0 01.624-.624l2.5-.5a.75.75 0 01.67 1.342l-2.25 1.125L14.614 18l-1.614 2z" />
      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM4.154 13.524a.75.75 0 01.285-.576l.128-.103a.75.75 0 01.954.19A6.716 6.716 0 0012 15.75a6.716 6.716 0 006.48-4.215.75.75 0 01.953-.19l.128.103a.75.75 0 01.286.576 8.25 8.25 0 01-15.808 0zM8.25 9.75a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm7.5 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd" />
    </svg>
);

export const DocumentIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a.375.375 0 01-.375-.375V6.75A3.75 3.75 0 009 3H5.625zM12.75 3.065V8.25c0 .414.336.75.75.75h5.185A2.25 2.25 0 0119.5 11.25v7.5a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75V3.375c0-.414.336.75.75.75h5.25c.472 0 .93.107 1.355.302a.75.75 0 01.445 1.038z" clipRule="evenodd" />
    </svg>
);

export const AudioIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7.5 3A1.5 1.5 0 006 4.5v12A1.5 1.5 0 007.5 18h9a1.5 1.5 0 001.5-1.5v-12A1.5 1.5 0 0016.5 3h-9z" />
        <path d="M3.375 6.75a2.25 2.25 0 012.25-2.25h12.75a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25-2.25H5.625a2.25 2.25 0 01-2.25-2.25v-10.5zM5.625 6H18V4.5a.75.75 0 00-.75-.75h-10.5a.75.75 0 00-.75.75V6zM18 7.5H6v10.5a.75.75 0 00.75.75h10.5a.75.75 0 00.75-.75V7.5z" />
    </svg>
);

export const VideoIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h8.25a3 3 0 003-3v-2.25a.75.75 0 00-1.5 0v2.25a1.5 1.5 0 01-1.5 1.5H4.5a1.5 1.5 0 01-1.5-1.5v-9A1.5 1.5 0 014.5 6h8.25a1.5 1.5 0 011.5 1.5v2.25a.75.75 0 001.5 0V7.5a3 3 0 00-3-3H4.5z" />
        <path d="M19.5 9.75a.75.75 0 00-1.055.043l-1.9 1.957V9a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75v6c0 .414.336.75.75.75h3a.75.75 0 00.75-.75v-2.75l1.9 1.957a.75.75 0 001.055.043 8.25 8.25 0 002.73-6.233.75.75 0 00-.73-.767z" />
    </svg>
);

export const ChatIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.75.75 0 00-.677.28l-1.966 2.36a.75.75 0 01-1.06 0l-1.966-2.36a.75.75 0 00-.677-.28 48.901 48.901 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.74c0-1.947 1.37-3.68 3.348-3.97zM6.75 8.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H7.5z" clipRule="evenodd" />
    </svg>
);

export const VideoSparkIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" viewBox="0 0 24 24" fill="currentColor"><rect fill="none" height="24" width="24"/><path d="M17,10.5V7c0-0.55-0.45-1-1-1H4c-0.55,0-1,0.45-1,1v10c0,0.55,0.45,1,1,1h12c0.55,0,1-0.45,1-1v-3.5l4,4v-11L17,10.5z M15,18H5V8h10V18z M12.5,15.25L11.5,13l-1,2.25L9,13l-1.5,3h8L12.5,15.25z M19,12l-1.17,2.5l-2.5,1.17l2.5,1.17L19,19l1.17-2.5l2.5-1.17 l-2.5-1.17L19,12z"/></svg>
);

export const AudioSparkIcon: React.FC<IconProps> = ({ className }) => (
 <svg className={className} xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" viewBox="0 0 24 24" fill="currentColor"><rect fill="none" height="24" width="24"/><path d="M12,3v10.55c-0.59-0.34-1.27-0.55-2-0.55c-2.21,0-4,1.79-4,4s1.79,4,4,4s4-1.79,4-4V7h4V3H12z M10,19c-1.1,0-2-0.9-2-2 s0.9-2,2-2s2,0.9,2,2S11.1,19,10,19z M19,12l-1.17,2.5l-2.5,1.17l2.5,1.17L19,19l1.17-2.5l2.5-1.17l-2.5-1.17L19,12z"/></svg>
);

export const GoogleIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.06,4.71c2.27-1.732,5.05-2.82,8.134-2.82c3.083,0,5.864,1.088,8.134,2.82l6.06-4.71C35.046,10.654,30.068,8,24.5,8C18.932,8,13.954,10.654,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.089,5.571l6.19,5.238C39.712,34.464,44,28.083,44,20C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
);

export const SparkIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 006.063 2.032l2.427-1.819a.75.75 0 01.961 1.286l-1.82 2.427a3.75 3.75 0 002.032 6.063l2.846.813a.75.75 0 01.544.721V21a.75.75 0 01-1.5 0v-1.382a2.25 2.25 0 00-1.789-2.263l-2.846-.813a2.25 2.25 0 00-3.638 1.22l-1.82 2.427a.75.75 0 01-1.286-.961l2.427-1.82a2.25 2.25 0 00-1.22-3.638l-.813-2.846a2.25 2.25 0 00-2.263-1.789H3a.75.75 0 010-1.5h1.382a2.25 2.25 0 001.789-2.263l.813-2.846a2.25 2.25 0 003.638-1.22l1.82-2.427a.75.75 0 01.961-1.286l-2.427 1.82a2.25 2.25 0 00-1.22 3.638l-.813 2.846A2.25 2.25 0 004.382 15H3a.75.75 0 010-1.5h1.382a3.75 3.75 0 002.98-3.727l.813-2.846a3.75 3.75 0 00-2.032-6.063L4.44 3.961A.75.75 0 013.155 3l1.82-2.427a.75.75 0 011.286.961L4.44 3.961a3.75 3.75 0 006.063 2.032l2.846.813A3.75 3.75 0 0015.618 3H15a.75.75 0 010-1.5h1.382a3.75 3.75 0 003.727-2.98l.813-2.846A.75.75 0 0121.845.544L22.5 3.16a.75.75 0 01-1.286.961l-1.819-2.427a3.75 3.75 0 00-6.063-2.032L9.44 2.479A.75.75 0 019 4.5z" clipRule="evenodd" />
    </svg>
);

export const StopIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
    </svg>
);

export const SpeakerIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.66 1.905H6.44l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
        <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
    </svg>
);

export const PlayIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.742 1.295 2.545 0 3.286L7.279 20.99c-1.25.717-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
    </svg>
);

export const PauseIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
    </svg>
);

export const ScreenRecIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M3.75 3.75A.75.75 0 003 4.5v15a.75.75 0 00.75.75h16.5a.75.75 0 00.75-.75V4.5a.75.75 0 00-.75-.75H3.75zM21 4.5a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 4.5v15A2.25 2.25 0 005.25 21.75h13.5A2.25 2.25 0 0021 19.5V4.5z" clipRule="evenodd" />
        <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
    </svg>
);