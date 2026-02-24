import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import { Camera, CameraOff, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FocusMode = ({ isActive }) => {
    const webcamRef = useRef(null);
    const [model, setModel] = useState(null);
    const [hasFace, setHasFace] = useState(true);
    const [isInitializing, setIsInitializing] = useState(false);
    const [error, setError] = useState(null);
    const consecutiveMisses = useRef(0);
    const audioContext = useRef(null);
    const alertInterval = useRef(null);

    // Initialize TensorFlow and load Blazeface model
    useEffect(() => {
        const initTF = async () => {
            try {
                setIsInitializing(true);
                await tf.ready();
                const loadedModel = await blazeface.load();
                setModel(loadedModel);

                // Initialize an AudioContext for the alert beep
                audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
            } catch (err) {
                console.error("Failed to load TensorFlow model:", err);
                setError("Camera focus tracking unavailable.");
            } finally {
                setIsInitializing(false);
            }
        };
        initTF();

        return () => {
            if (audioContext.current) {
                audioContext.current.close();
            }
        };
    }, []);

    // Continuous buzzing function for accountability
    const playAlertBuzz = () => {
        if (!audioContext.current) return;
        const oscillator = audioContext.current.createOscillator();
        const gainNode = audioContext.current.createGain();

        // Create a square wave for a harsher "buzz" sound
        oscillator.type = 'square';

        // Alternating frequencies for a siren/buzz effect
        oscillator.frequency.setValueAtTime(300, audioContext.current.currentTime);
        oscillator.frequency.setValueAtTime(450, audioContext.current.currentTime + 0.1);

        // Quick attack and release for a stuttering buzz
        gainNode.gain.setValueAtTime(0, audioContext.current.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.4, audioContext.current.currentTime + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.current.currentTime + 0.3);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.current.destination);

        oscillator.start();
        oscillator.stop(audioContext.current.currentTime + 0.3);
    };

    // Manage continuous alert loop based on hasFace state
    useEffect(() => {
        if (!isActive) {
            if (alertInterval.current) clearInterval(alertInterval.current);
            return;
        }

        if (!hasFace) {
            // Start continuous buzzing if user is away
            if (!alertInterval.current) {
                // Play immediately once
                playAlertBuzz();
                // Then loop every 600ms
                alertInterval.current = setInterval(playAlertBuzz, 600);
            }
        } else {
            // Stop when user returns
            if (alertInterval.current) {
                clearInterval(alertInterval.current);
                alertInterval.current = null;
            }
        }

        return () => {
            if (alertInterval.current) clearInterval(alertInterval.current);
        };
    }, [hasFace, isActive]);

    // The detection loop
    useEffect(() => {
        let interval;

        const detectFace = async () => {
            if (
                model &&
                webcamRef.current &&
                webcamRef.current.video.readyState === 4 &&
                isActive
            ) {
                const video = webcamRef.current.video;
                const predictions = await model.estimateFaces(video, false);

                if (predictions.length > 0) {
                    // Face found, reset misses
                    if (!hasFace) setHasFace(true);
                    consecutiveMisses.current = 0;
                } else {
                    // No face found
                    consecutiveMisses.current += 1;

                    // If out of frame for ~5 scans (~5-10 seconds), trigger alert
                    if (consecutiveMisses.current > 5) {
                        setHasFace(false);
                    }
                }
            }
        };

        if (isActive && model) {
            // Scan every 1 second
            interval = setInterval(detectFace, 1000);
        } else {
            // Reset if not active
            setHasFace(true);
            consecutiveMisses.current = 0;
        }

        return () => clearInterval(interval);
    }, [isActive, model, hasFace]);

    if (error) {
        return (
            <div className="flex items-center gap-2 text-red-500 text-xs bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
                <AlertTriangle size={14} /> {error}
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden rounded-2xl bg-black border border-slate-800 isolate">
            <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                {isInitializing ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-slate-500 animate-pulse" /> Loading Tracker...
                    </span>
                ) : isActive ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                        <Camera size={14} /> AI Focus Active
                    </span>
                ) : (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                        <CameraOff size={14} /> Camera Offline
                    </span>
                )}
            </div>

            <AnimatePresence>
                {!hasFace && isActive && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-20 bg-red-600/20 backdrop-blur-sm border-2 border-red-500 rounded-2xl flex flex-col items-center justify-center p-4 text-center"
                    >
                        <AlertTriangle size={32} className="text-red-500 mb-2 animate-bounce" />
                        <span className="text-white font-bold text-sm">Distraction Detected!</span>
                        <span className="text-red-200 text-xs mt-1">Please return to the camera view.</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Webcam is rendered but can be kept small or visually hidden but DOM-present if desired. 
           Here we show it minimally to assure the user it is local. */}
            <div className={`transition-opacity duration-500 ${isActive ? 'opacity-30 blur-[2px]' : 'opacity-10 grayscale'}`}>
                <Webcam
                    ref={webcamRef}
                    muted={true}
                    style={{
                        width: "100%",
                        height: "120px",
                        objectFit: "cover",
                    }}
                />
            </div>
        </div>
    );
};

export default FocusMode;
