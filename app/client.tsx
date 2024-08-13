/// <reference types="vinxi/types/client" />
import ReactDOM from "react-dom/client";
import FaceDetector from "./FaceDetector";

import "./style.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <div className="max-w-3xl mx-auto p-4">
    <FaceDetector />
  </div>
);
