'use client'

import { DownloadOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React, { useRef, useState, useEffect } from 'react';

const WebcamRecorder: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]); // Use a ref for recorded chunks
  const [isRecording, setIsRecording] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // Start webcam stream
  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data); // Use ref to store chunks
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        recordedChunksRef.current = []; // Clear recorded chunks after saving
      };

      setMediaRecorder(recorder);
    } catch (error) {
      console.error('Error accessing webcam:', error);
    }
  };

  // Start recording
  const startRecording = () => {
    if (mediaRecorder) {
      recordedChunksRef.current = []; // Clear chunks before starting
      mediaRecorder.start();
      setIsRecording(true);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    startStream();
    return () => {
      const tracks = videoRef.current?.srcObject instanceof MediaStream
        ? videoRef.current.srcObject.getTracks()
        : [];
      tracks.forEach((track) => track.stop());
    };
  }, []);

  return (
    <div>
      <h1>Webcam Video Recorder</h1>
      <video ref={videoRef} autoPlay muted style={{ width: '100%', maxHeight: '400px' }}></video>
      <div>
        <Button onClick={startRecording} disabled={isRecording || !mediaRecorder}>
          Start Recording
        </Button>
        <Button onClick={stopRecording} disabled={!isRecording}>
          Stop Recording
        </Button>
      </div>
      {downloadUrl && (
        <div style={{ marginTop: '20px' }}>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            href={downloadUrl}
            download="recorded-video.webm"
          >
            Download Video
          </Button>
        </div>
      )}
    </div>
  );
};

export default WebcamRecorder;
