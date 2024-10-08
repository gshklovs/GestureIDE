import { Ref, useEffect, useRef, useState } from "react";
import { Camera } from "@mediapipe/camera_utils";
import {
  drawConnectors,
  drawLandmarks,
  drawRectangle,
} from "@mediapipe/drawing_utils";
import { Hands, HAND_CONNECTIONS } from "@mediapipe/hands";
import useKeyPointClassifier from "../hooks/useKeyPointClassifier";
import CONFIGS from "../../../../constants";

const maxVideoWidth = 960;
const maxVideoHeight = 540;

interface IHandGestureLogic {
  videoElement: Ref<any>;
  canvasEl: Ref<any>;
}

function useGestureRecognition({ videoElement, canvasEl }: IHandGestureLogic) {
  const hands = useRef<any>(null);
  const camera = useRef<any>(null);
  const handsGesture = useRef<any>([]);
  const [landmarks, setLandmarks] = useState([]);

  const { processLandmark } = useKeyPointClassifier();

  async function onResults(results) {
    if (canvasEl.current) {
      const ctx = canvasEl.current.getContext("2d");

      ctx.save();
      ctx.clearRect(0, 0, canvasEl.current.width, canvasEl.current.height);
      // ctx.drawImage(results.image, 0, 0, maxVideoWidth, maxVideoHeight);

      if (results.multiHandLandmarks) {
        // Runs once for every hand
        for (const [index, landmarks] of results.multiHandLandmarks.entries()) {
          processLandmark(landmarks, results.image).then(
            (val) => (handsGesture.current[index] = val)
          );
          const landmarksX = landmarks.map((landmark) => landmark.x);
          const landmarksY = landmarks.map((landmark) => landmark.y);
          ctx.fillStyle = "#ff0000";
          ctx.font = "24px serif";
          ctx.fillText(
            CONFIGS.keypointClassifierLabels[handsGesture.current[index]],
            maxVideoWidth * Math.min(...landmarksX),
            maxVideoHeight * Math.min(...landmarksY) - 15
          );
          drawRectangle(
            ctx,
            {
              xCenter:
                Math.min(...landmarksX) +
                (Math.max(...landmarksX) - Math.min(...landmarksX)) / 2,
              yCenter:
                Math.min(...landmarksY) +
                (Math.max(...landmarksY) - Math.min(...landmarksY)) / 2,
              width: Math.max(...landmarksX) - Math.min(...landmarksX),
              height: Math.max(...landmarksY) - Math.min(...landmarksY),
              rotation: 0,
            },
            {
              fillColor: "transparent",
              color: "#ff0000",
              lineWidth: 1,
            }
          );
          drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
            color: "#00ffff",
            lineWidth: 2,
          });
          drawLandmarks(ctx, landmarks, {
            color: "#ffff29",
            lineWidth: 1,
          });
        }
        setLandmarks(results.multiHandLandmarks);
      }
      ctx.restore();
    }
  }

  const loadHands = () => {
    hands.current = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });
    hands.current.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    hands.current.onResults(onResults);
  };

  useEffect(() => {
    (async function initCamara() {
      camera.current = new Camera(videoElement.current, {
        onFrame: async () => {
          const video = videoElement.current;
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          await hands.current.send({ image: canvas });
        },
        width: maxVideoWidth,
        height: maxVideoHeight,
      });
      camera.current.start();
    })();

    loadHands();
  }, []);

  return { landmarks, maxVideoHeight, maxVideoWidth, canvasEl, videoElement };
}

export default useGestureRecognition;
