import { useEffect, useState, useRef } from "react";
import * as faceapi from "face-api.js";
import Camera from "./Camera";

import { faceDetectorOptions, faceMatcherPromise } from "./detector";

import CharacterChat from "./CharacterChat";

const names = {
  Corlys: "Lord Corlys Velaryon",
  Daemon: "King Consort Daemon Targaryen",
  Rhaenyra: "Queen Rhaenyra Targaryen",
};

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
  const [showCamera, setShowCamera] = useState(true);
  const [image, setImage] = useState("/bbt3.jpg");

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
  }, [image]);

  return (
    <div>
      {showCamera && (
        <Camera
          onTakePhoto={(dataUrl) => {
            setImage(dataUrl);
            setShowCamera(false);
          }}
        />
      )}

      <div className="relative">
        <img
          ref={imageRef}
          src={image}
          className="w-full aspect-w-16 aspect-h-9 border-2"
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
