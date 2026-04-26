import React, { useState, useEffect, useRef } from "react";
import Upload from "./Upload.jsx";

function InputBar({ onSubmit, onUpdate, onFileSelected }) {
  const [value, setValue] = useState("");
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState("");
  const [isAnimating, setIsAnimating] = useState(true);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const animationRef = useRef(null);
  const charIndexRef = useRef(0);
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState("");

  const messages = [
    "ready to find a new an amazing new career!",
    "matching your talent against ours!",
    "awaiting incredible CVs :)",
    "lot of job vacants are waiting!!",
  ];

  useEffect(() => {
    if (!isAnimating) {
      setAnimatedPlaceholder("");
      charIndexRef.current = 0;
      return;
    }

    const currentMessage = messages[currentMessageIndex];
    let timeoutId = null;

    if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }

    charIndexRef.current = 0;
    setAnimatedPlaceholder("");

    animationRef.current = setInterval(() => {
      if (charIndexRef.current < currentMessage.length) {
        setAnimatedPlaceholder(
          currentMessage.slice(0, charIndexRef.current + 1)
        );
        charIndexRef.current++;
      } else {
        clearInterval(animationRef.current);
        timeoutId = setTimeout(() => {
          setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
        }, 2000);
      }
    }, 100);

    return () => {
      clearInterval(animationRef.current);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [currentMessageIndex, isAnimating]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim() && !fileName) return;
    if (onSubmit) onSubmit(value);
    setValue("");
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setFileName(file.name);
      if (onFileSelected) onFileSelected(file);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        background:
          "linear-gradient(to bottom, rgba(255,255,255,0), white 45%)",
        padding: "1rem 0 1.6rem",
        display: "flex",
        justifyContent: "center",
        backdropFilter: "blur(4px)",
        zIndex: 50,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: "1100px",
          display: "flex",
          gap: "1rem",
          padding: "0 1.5rem",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setIsAnimating(false);
            if (onUpdate) onUpdate(e.target.value);
          }}
          placeholder={
            isAnimating
              ? animatedPlaceholder
              : "Brand new job opportunities..."
          }
          style={{
            flex: 1,
            padding: "1.1rem 1.4rem",
            fontSize: "1.05rem",
            borderRadius: "9999px",
            border: "2px solid rgb(233,213,255)",
            backgroundColor: "white",
            color: "#1f2937",
            outline: "none",
            transition: "all 0.2s",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          }}
        />

        {/* input de archivo oculto */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileChange}
        />

        {/* Botón Upload que abre el explorador */}
        <Upload clicked={handleUploadClick} />

        <button
          type="submit"
          style={{
            padding: "1.05rem 1.9rem",
            fontSize: "1.05rem",
            fontWeight: 600,
            borderRadius: "9999px",
            background:
              "linear-gradient(to right, rgb(147,51,234), rgb(126,34,206))",
            color: "white",
            border: "none",
            cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: "0 10px 18px rgba(0,0,0,0.15)",
          }}
        >
          Go
        </button>
      </form>
    </div>
  );
}

export default InputBar;
