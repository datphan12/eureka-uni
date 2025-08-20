import React, { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { Pause, Play, Volume2, VolumeX, Settings, Maximize } from "lucide-react";

const VideoPlayer = ({ url }) => {
    const [playing, setPlaying] = useState(false);
    const [volume, setVolume] = useState(0.8);
    const [muted, setMuted] = useState(false);
    const [played, setPlayed] = useState(0);
    const [seeking, setSeeking] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [quality, setQuality] = useState("auto");
    const [showSettings, setShowSettings] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const playerRef = useRef(null);
    const playerContainerRef = useRef(null);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
        document.addEventListener("msfullscreenchange", handleFullscreenChange);

        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
            document.removeEventListener("msfullscreenchange", handleFullscreenChange);
        };
    }, []);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const handlePlayPause = () => {
        setPlaying(!playing);
    };

    const handleVolumeChange = (e) => {
        if (parseFloat(e.target.value) === 0) {
            setMuted(true);
        }
        setVolume(parseFloat(e.target.value));
    };

    const handleMute = () => {
        setMuted(!muted);
        setVolume(muted ? 0.8 : 0);
    };

    const handleProgress = (state) => {
        if (!seeking) {
            setPlayed(state.played);
            setCurrentTime(state.playedSeconds);
        }
    };

    const handleSeekMouseDown = () => {
        setSeeking(true);
    };

    const handleSeekChange = (e) => {
        setPlayed(parseFloat(e.target.value));
    };

    const handleSeekMouseUp = () => {
        setSeeking(false);
        playerRef.current?.seekTo(played);
    };

    const handleDuration = (duration) => {
        setDuration(duration);
    };

    const handlePlaybackRateChange = (rate) => {
        setPlaybackRate(rate);
        setShowSettings(false);
    };

    const handleQualityChange = (quality) => {
        setQuality(quality);
        setShowSettings(false);
    };

    const handleToggleFullscreen = () => {
        if (!isFullscreen) {
            // Mở fullscreen
            if (playerContainerRef.current) {
                if (playerContainerRef.current.requestFullscreen) {
                    playerContainerRef.current.requestFullscreen();
                } else if (playerContainerRef.current.webkitRequestFullscreen) {
                    playerContainerRef.current.webkitRequestFullscreen();
                } else if (playerContainerRef.current.msRequestFullscreen) {
                    playerContainerRef.current.msRequestFullscreen();
                }
            }
        } else {
            // Thoát fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    };

    return (
        <div className="w-full">
            <div ref={playerContainerRef} className="relative bg-black">
                {/* Video */}
                <div className="relative" style={{ paddingBottom: "53%" }}>
                    <ReactPlayer
                        ref={playerRef}
                        url={url}
                        playing={playing}
                        volume={volume}
                        onProgress={handleProgress}
                        onPause={() => setPlaying(false)}
                        onPlay={() => setPlaying(true)}
                        onDuration={handleDuration}
                        playbackRate={playbackRate}
                        width="100%"
                        height="100%"
                        className="absolute top-0 left-0"
                        config={{
                            youtube: {
                                playerVars: { modestbranding: 1 },
                            },
                        }}
                    />
                </div>

                {/* Thanh điều khiển */}
                <div className="bg-white/30 w-full px-1 lg:px-3 lg:py-1">
                    <div className="flex items-center gap-x-2">
                        {/* pause/play */}
                        <button onClick={handlePlayPause} className="cursor-pointer text-white">
                            {playing ? <Pause /> : <Play />}
                        </button>
                        {/* progress */}
                        <input
                            type="range"
                            min={0}
                            max={1}
                            step="0.01"
                            value={played}
                            onMouseDown={handleSeekMouseDown}
                            onMouseUp={handleSeekMouseUp}
                            onChange={handleSeekChange}
                            className="flex-1 max-w-full h-2 bg-gray-200 rounded-lg cursor-pointer accent-white"
                        />
                        {/* duration */}
                        <p className="text-white text-xs lg:text-sm lg:mr-4">
                            {formatTime(currentTime)}/{formatTime(duration)}
                        </p>
                        {/* volume */}
                        <div className="flex items-center gap-2">
                            <span className="text-white" onClick={handleMute}>
                                {muted ? <VolumeX /> : <Volume2 />}
                            </span>
                            <input
                                type="range"
                                min={0}
                                max={1}
                                step="0.01"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="w-14 lg:w-24 h-1 bg-gray-200 rounded-lg cursor-pointer accent-white"
                            />
                        </div>

                        {/* Settings */}
                        <div className="relative">
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className="cursor-pointer lg:px-1 py-2 text-white"
                            >
                                <Settings />
                            </button>
                            {showSettings && (
                                <div className="absolute bottom-12 right-0 bg-white shadow-lg rounded-lg p-4 z-10">
                                    <div className="mb-2">
                                        <p className="text-sm lg:text-base font-semibold">Tốc độ phát</p>
                                        <div className="flex gap-2">
                                            {[0.5, 1, 1.5, 2].map((rate) => (
                                                <button
                                                    key={rate}
                                                    onClick={() => handlePlaybackRateChange(rate)}
                                                    className={`text-xs lg:text-base px-3 py-1 rounded ${
                                                        playbackRate === rate ? "bg-gray-200" : ""
                                                    }`}
                                                >
                                                    {rate}x
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm lg:text-base font-semibold">Chất lượng</p>
                                        <div className="flex gap-2">
                                            {["auto", "720p", "480p", "360p"].map((q) => (
                                                <button
                                                    key={q}
                                                    onClick={() => handleQualityChange(q)}
                                                    className={`text-xs lg:text-base px-2 py-1 rounded ${
                                                        quality === q ? "bg-gray-200" : ""
                                                    }`}
                                                >
                                                    {q}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* fullscreen */}
                        <button onClick={handleToggleFullscreen} className="lg:py-2 text-white cursor-pointer">
                            <Maximize />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
