import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

import { faceMatcherPromise } from "./detector";

const options = new faceapi.TinyFaceDetectorOptions({
  inputSize: 320,
  scoreThreshold: 0.5,
});

export default function Camera({
  onTakePhoto,
}: {
  onTakePhoto?: (dataUrl: string) => void;
}) {
  const [face, setFace] = useState<{
    width: number;
    height: number;
    top: number;
    left: number;
    imageWidth: number;
    imageHeight: number;
  } | null>(null);
  const videoElement = useRef(null);

  const isMounted = useRef(true);

  async function findFaces() {
    if (videoElement.current && isMounted.current) {
      const result = await faceapi.detectSingleFace(
        videoElement.current,
        options
      );
      if (result) {
        setFace({
          width: result.box.width / result.imageWidth,
          height: result.box.height / result.imageHeight,
          top: result.box.top / result.imageHeight,
          left: result.box.left / result.imageWidth,
          imageWidth: result.imageWidth,
          imageHeight: result.imageHeight,
        });
      } else {
        setFace(null);
      }
      requestAnimationFrame(findFaces);
    }
  }

  useEffect(() => {
    if (videoElement.current) {
      (async function run() {
        await faceMatcherPromise;
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        videoElement.current.srcObject = stream;
      })();
    }
    return () => {
      isMounted.current = false;
    };
  }, []);

  return (
    <>
      <div className="w-full aspect-[16x9] relative">
        <video
          onLoadedMetadata={() => {
            findFaces();
          }}
          ref={videoElement}
          autoPlay
          muted
          playsInline
        ></video>
        {face && (
          <div
            className="absolute border-2 border-red"
            style={{
              top: `${face.top * 100}%`,
              left: `${face.left * 100}%`,
              width: `${face.width * 100}%`,
              height: `${face.height * 100}%`,
            }}
          ></div>
        )}
        <button
          onClick={() => {
            if (videoElement.current) {
              videoElement.current.pause();
              const canvas = document.createElement("canvas");
              canvas.width = face.imageWidth;
              canvas.height = face.imageHeight;

              const ctx = canvas.getContext("2d");

              ctx.drawImage(
                videoElement.current,
                0,
                0,
                face.imageWidth,
                face.imageHeight
              );
              onTakePhoto?.(canvas.toDataURL("image/png"));
            }
          }}
        >
          Take Photo
        </button>
      </div>
    </>
  );
}