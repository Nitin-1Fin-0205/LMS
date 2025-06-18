import React, { useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faTimes, faArrowsRotate, faCheck } from '@fortawesome/free-solid-svg-icons';

const PhotoCaptureModal = ({
    isOpen,
    onClose,
    visitPhoto,
    setVisitPhoto,
    onSaveVisit,
    loading
}) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        if (isOpen && !visitPhoto) {
            startCamera();
        }

        return () => {
            stopCamera();
        };
    }, [isOpen, visitPhoto]);

    const startCamera = async () => {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Webcam not supported on this browser.');
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 1280, max: 1920 },
                    height: { ideal: 720, max: 1080 },
                    aspectRatio: { ideal: 16 / 9 }
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
        }
    };

    const stopCamera = () => {
        const stream = videoRef.current?.srcObject;
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    };

    const handleCapturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const photoUrl = canvas.toDataURL('image/jpeg', 0.8);
            setVisitPhoto(photoUrl);
            stopCamera();
        }
    };

    const handleRetakePhoto = () => {
        setVisitPhoto(null);
        startCamera();
    };

    const handleClose = () => {
        stopCamera();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 max-w-2xl w-full mx-4 shadow-2xl shadow-blue-500/20 transform transition-all duration-300 animate-scale-in">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                        <FontAwesomeIcon icon={faCamera} className="mr-3 w-5 h-5 text-blue-600" />
                        Capture Visit Photo
                    </h3>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 cursor-pointer rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center transition-all duration-300 transform hover:scale-110 border border-red-200"
                    >
                        <FontAwesomeIcon icon={faTimes} className="text-red-500 w-6 h-6" />
                    </button>
                </div>

                <div className="photo-capture-container flex flex-col items-center space-y-6">
                    {!visitPhoto ? (
                        <div className="camera-container text-center space-y-4 animate-fade-in">
                            <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 p-4 shadow-lg shadow-blue-100/50 inline-block border border-blue-200 transform transition-all duration-300 hover:shadow-xl hover:shadow-blue-200/60">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="max-h-80 max-w-full object-contain rounded-lg"
                                    style={{
                                        aspectRatio: 'auto',
                                        width: 'auto',
                                        height: 'auto'
                                    }}
                                />
                            </div>
                            <canvas ref={canvasRef} style={{ display: 'none' }} />
                            <div className="text-center">
                                <button
                                    onClick={handleCapturePhoto}
                                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 cursor-pointer text-sm shadow-lg shadow-blue-500/30 transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40"
                                >
                                    <FontAwesomeIcon icon={faCamera} className="mr-2 w-4 h-4" beatFade />
                                    Capture Photo
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="captured-photo-container text-center space-y-4 animate-fade-in">
                            <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 p-4 shadow-lg shadow-blue-100/50 inline-block border border-blue-200 transform transition-all duration-300 hover:shadow-xl hover:shadow-blue-200/60">
                                <img
                                    src={visitPhoto}
                                    alt="Captured Visit"
                                    className="max-h-80 max-w-full object-contain rounded-lg"
                                    style={{
                                        aspectRatio: 'auto',
                                        width: 'auto',
                                        height: 'auto'
                                    }}
                                />
                            </div>
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={handleRetakePhoto}
                                    className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all duration-300 text-sm transform hover:scale-105 shadow-md hover:shadow-lg"
                                >
                                    <FontAwesomeIcon icon={faArrowsRotate} className="mr-2 w-3 h-3" />
                                    Retake Photo
                                </button>
                                <button
                                    onClick={onSaveVisit}
                                    disabled={loading}
                                    className="px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-300 cursor-pointer text-sm transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FontAwesomeIcon icon={faCheck} className="mr-2 w-4 h-4" bounce />
                                    {loading ? 'Saving...' : 'Save & Continue'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PhotoCaptureModal;
