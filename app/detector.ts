import * as faceapi from "face-api.js";

const classes = ["Corlys", "Daemon", "Rhaenyra"];

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

export async function loadFaceDetector() {
  if (!!!faceapi.nets.tinyFaceDetector.params) {
    await faceapi.nets.tinyFaceDetector.load("/models");
    await faceapi.loadFaceLandmarkModel("/models");
    await faceapi.loadFaceRecognitionModel("/models");
  }
  return await createBbtFaceMatcher(3);
}

export const faceMatcherPromise = loadFaceDetector();

export const faceDetectorOptions = new faceapi.TinyFaceDetectorOptions({
  inputSize: 512,
  scoreThreshold: 0.5,
});
