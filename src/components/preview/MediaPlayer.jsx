import { useEffect, useRef } from "react";
import Plyr from "plyr";
import "plyr/dist/plyr.css";

const MediaPlayer = ({ src, type, onClose }) => {
    const playerRef = useRef(null);
    const plyrInstanceRef = useRef(null);
    const mediaRef = useRef(null);

    useEffect(() => {
        if (playerRef.current && !plyrInstanceRef.current) {
            plyrInstanceRef.current = new Plyr(playerRef.current, {
                controls: [
                    "play-large",
                    "play",
                    "progress",
                    "current-time",
                    "mute",
                    "volume",
                    "captions",
                    "settings",
                    "pip",
                    "airplay",
                    "fullscreen",
                ],
            });
        }

        return () => {
            destroyPlayer();
        };
    }, []);

    useEffect(() => {
        if (plyrInstanceRef.current) {
            plyrInstanceRef.current.source = {
                type: type.startsWith("audio/") ? "audio" : "video",
                sources: [{ src, type }],
            };
        }
    }, [src, type]);

    const destroyPlayer = () => {
        if (plyrInstanceRef.current) {
            plyrInstanceRef.current.destroy();
            plyrInstanceRef.current = null;
        }
        if (mediaRef.current) {
            mediaRef.current.pause();
            mediaRef.current.src = "";
            mediaRef.current.load();
        }
        if (onClose) {
            onClose();
        }
    };

    useEffect(() => {
        return () => {
            destroyPlayer();
        };
    }, [onClose]);

    const isAudio = type.startsWith("audio/");

    return (
        <div style={{ width: "100%", maxWidth: "1000px" }}>
            {isAudio ? (
                <audio ref={(el) => { playerRef.current = el; mediaRef.current = el; }}>
                    <source src={src} type={type} />
                </audio>
            ) : (
                <video ref={(el) => { playerRef.current = el; mediaRef.current = el; }}>
                    <source src={src} type={type} />
                </video>
            )}
        </div>
    );
};

export default MediaPlayer;
