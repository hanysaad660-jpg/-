import React, { useState, useRef, useEffect } from 'react';
import { PlayIcon, PauseIcon } from './Icons';

interface CustomVideoPlayerProps {
    src: string;
}

export const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({ src }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isControlsVisible, setIsControlsVisible] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false); // For transition
    const videoRef = useRef<HTMLVideoElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };
    
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime);
            if (video.duration) {
                setProgress((video.currentTime / video.duration) * 100);
            }
        };

        const handleLoadedMetadata = () => {
            setDuration(video.duration);
        };
        
        const handleCanPlay = () => {
            setIsLoaded(true);
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('ended', () => setIsPlaying(false));


        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('canplay', handleCanPlay);
            video.removeEventListener('ended', () => setIsPlaying(false));
        };
    }, []);

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if(progressRef.current && videoRef.current) {
            const rect = progressRef.current.getBoundingClientRect();
            const clickPosition = e.clientX - rect.left;
            const width = rect.width;
            const newTime = (clickPosition / width) * duration;
            videoRef.current.currentTime = newTime;
        }
    };

    return (
        <div 
            key={src} // Re-mount component on src change to trigger transition
            className={`relative max-w-sm rounded-lg overflow-hidden group transition-opacity duration-500 ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            onMouseEnter={() => setIsControlsVisible(true)} 
            onMouseLeave={() => setIsControlsVisible(false)}
        >
            <video ref={videoRef} src={src} className="w-full h-full block" onClick={togglePlay}>
                Your browser does not support the video tag.
            </video>
            
            <div className={`absolute inset-0 bg-black bg-opacity-40 transition-opacity duration-300 ${isControlsVisible || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <button onClick={togglePlay} className="p-3 bg-white/30 rounded-full hover:bg-white/50 transition-colors">
                        {isPlaying ? <PauseIcon className="w-8 h-8 text-white" /> : <PlayIcon className="w-8 h-8 text-white" />}
                    </button>
                </div>
                
                <div className="absolute bottom-2 left-4 right-4 text-white">
                    <div className="w-full h-1.5 bg-white/30 rounded-full cursor-pointer" ref={progressRef} onClick={handleProgressClick}>
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
