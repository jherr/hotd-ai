import { useEffect, useState, useRef } from "react";
import * as faceapi from "face-api.js";

import Camera from "./camera";
import { faceDetectorOptions, faceMatcherPromise } from "./detector";

import CharacterChat from "./character-chat";

const names = {
  Corlys: "Corlys Velaryon",
  Daemon: "Daemon Targaryen",
  Rhaenyra: "Rhaenyra Targaryen",
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
  const [showCamera, setShowCamera] = useState(false);
  const [image, setImage] = useState("/bbt3.jpg");

  useEffect(() => {
    (async function run() {
      if (!!imageRef.current) {
        const faceMatcher = await faceMatcherPromise;

        const results = await faceapi
          .detectAllFaces(imageRef.current, faceDetectorOptions)
          .withFaceLandmarks()
          .withFaceDescriptors();

        console.log(results);

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
      {!showCamera && (
        <>
          <div className="relative">
            <img
              ref={imageRef}
              src={image}
              className="w-full aspect-w-16 aspect-h-9 border-2"
              alt="Game of Thrones image"
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
            <button
              onClick={() => setShowCamera(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mb-2 absolute bottom-[10px] right-[10px]"
            >
              Take New Photo
            </button>
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
        </>
      )}
    </div>
  );
}
