import { useEffect, useState, useRef } from "react";
import * as faceapi from "face-api.js";
import { Camera } from "react-camera-pro";

import CharacterChat from "./CharacterChat";

const classes = ["Corlys", "Daemon", "Rhaenyra"];

const names = {
  Corlys: "Lord Corlys Velaryon",
  Daemon: "King Consort Daemon Targaryen",
  Rhaenyra: "Queen Rhaenyra Targaryen",
};

async function createBbtFaceMatcher(numImagesForTraining = 1) {
  const maxAvailableImagesPerClass = 5;
  numImagesForTraining = Math.min(
    numImagesForTraining,
    maxAvailableImagesPerClass
  );

  const labeledFaceDescriptors = await Promise.all(
    classes.map(async (className) => {
      const descriptors = [];
      for (let i = 1; i < numImagesForTraining + 1; i++) {
        const img = await faceapi.fetchImage(`faces/${className}-${i}.png`);
        descriptors.push(await faceapi.computeFaceDescriptor(img));
      }

      return new faceapi.LabeledFaceDescriptors(className, descriptors);
    })
  );

  return new faceapi.FaceMatcher(labeledFaceDescriptors);
}

async function loadFaceDetector() {
  if (!!!faceapi.nets.tinyFaceDetector.params) {
    await faceapi.nets.tinyFaceDetector.load("/models");
    await faceapi.loadFaceLandmarkModel("/models");
    await faceapi.loadFaceRecognitionModel("/models");
  }
  return await createBbtFaceMatcher(3);
}

const faceMatcherPromise = loadFaceDetector();

const faceDetectorOptions = new faceapi.TinyFaceDetectorOptions({
  inputSize: 512,
  scoreThreshold: 0.5,
});

type Face = {
  label: string;
  top: number;
  center: number;

  image: string;
  width: number;
  height: number;
  imageTop: number;
  imageLeft: number;
};

export default function Index() {
  const imageRef = useRef(null);
  const [faces, setFaces] = useState<Face[]>([]);
  const camera = useRef(null);
  const [image, setImage] = useState(null);

  useEffect(() => {
    (async function run() {
      if (!!imageRef.current) {
        const faceMatcher = await faceMatcherPromise;
        const results = await faceapi
          .detectAllFaces(imageRef.current, faceDetectorOptions)
          .withFaceLandmarks()
          .withFaceDescriptors();

        const faces: Face[] = [];
        results.forEach(({ detection, descriptor }) => {
          const label = faceMatcher.findBestMatch(descriptor).label;

          faces.push({
            label,
            top: detection.box.bottom / detection.imageHeight,
            center:
              (detection.box.right + detection.box.left) /
              2 /
              detection.imageWidth,

            image: imageRef.current.src,
            width: detection.box.width,
            height: detection.box.height,
            imageTop: detection.box.top,
            imageLeft: detection.box.left,
          });
        });
        setFaces(faces);
      }
    })();
  }, [imageRef]);

  return (
    <div>
      <div>
        <Camera
          ref={camera}
          errorMessages={{ noCameraAccessible: "No camera found" }}
        >
          <img src={image} alt="Image preview" />
          <button
            onClick={() => {
              const photo = camera.current.takePhoto();
              setImage(photo);
            }}
          />
          <button
            hidden={numberOfCameras <= 1}
            onClick={() => {
              camera.current.switchCamera();
            }}
          />
        </Camera>
      </div>

      <div className="relative hidden">
        <img
          ref={imageRef}
          src="/bbt3.jpg"
          className="w-full aspect-w-16 aspect-h-9"
        />
        {faces.map((face) => (
          <div
            key={face.label}
            className="absolute text-center text-3xl font-bold"
            style={{
              top: `${face.top * 100}%`,
              left: `${(face.center - 0.16) * 100}%`,
              width: `33%`,
            }}
          >
            {names[face.label]}
          </div>
        ))}
      </div>
      {faces.map((face) => (
        <CharacterChat
          key={face.label}
          character={names[face.label]}
          image={face.image}
          width={face.width}
          height={face.height}
          imageTop={face.imageTop}
          imageLeft={face.imageLeft}
        />
      ))}
    </div>
  );
}
