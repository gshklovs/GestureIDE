import React, { useRef, useEffect } from "react";
import Monaco from "@monaco-editor/react";
import useGestureRecognition from "./components/hands-capture/hooks";
import "./App.css";
import Cursor from "./components/Cursor";

function App() {
  const videoElement = useRef<any>();
  const canvasEl = useRef<any>();
  const editorRef = useRef<any>();

  const { landmarks, maxVideoWidth, maxVideoHeight } = useGestureRecognition({
    videoElement,
    canvasEl,
  });

  // Function to capture the editor instance on mount
  function handleEditorDidMount(editor: any, monaco: any) {
    editorRef.current = editor;
  }

  useEffect(() => {
    // Check if the editor instance is available and if landmarks exist
    if (editorRef.current && landmarks) {
      // Set the editor's value to the stringified landmarks data
      editorRef.current.setValue(
        JSON.stringify(
          landmarks
            ? landmarks[0]
              ? landmarks[0][8]["z"]
              : "All landmarks"
            : []
        )
      );
    }
  }, [landmarks]);

  return (
    <div style={{}}>
      {landmarks && landmarks[0] && <Cursor landmarks={landmarks[0]} />}
      <Monaco
        height="50vh" // Editor height
        width="80vw" // Editor width
        theme="vs-dark" // Theme options: "vs-light", "vs-dark", "hc-black"
        defaultLanguage="python" // Set the language of the editor
        defaultValue="// Start coding here"
        onMount={handleEditorDidMount} // onMount handler to capture the editor instance
        options={{
          fontSize: 16,
          minimap: { enabled: true },
          lineNumbers: "on",
          automaticLayout: true,
          scrollBeyondLastLine: false,
          wordWrap: "on",
        }}
      />
      <video
        style={{ display: "none" }}
        className="video"
        playsInline
        ref={videoElement}
      />
      <canvas ref={canvasEl} width={maxVideoWidth} height={maxVideoHeight} />
    </div>
  );
}

export default App;
