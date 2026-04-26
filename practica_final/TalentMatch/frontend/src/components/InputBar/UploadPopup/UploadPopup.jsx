import React, { useState, useRef, useEffect } from "react";

function UploadPopup({ onClose }) {
  const [isDragging, setIsDragging] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");   // ✅ nuevo estado
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(
      (file) =>
        file.type === "application/pdf" ||
        file.type === "application/msword" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.name.endsWith(".pdf") ||
        file.name.endsWith(".doc") ||
        file.name.endsWith(".docx")
    );

    if (validFiles.length > 0) {
      console.log("Files dropped:", validFiles);
      // Aquí iría tu lógica real de subida
      setSuccessMsg("✅ La vacante se ha subido correctamente.");
    } else if (files.length > 0) {
      console.warn(
        "Invalid file type. Please upload .pdf, .doc, or .docx files."
      );
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const validFiles = files.filter(
        (file) =>
          file.type === "application/pdf" ||
          file.type === "application/msword" ||
          file.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          file.name.endsWith(".pdf") ||
          file.name.endsWith(".doc") ||
          file.name.endsWith(".docx")
      );

      if (validFiles.length > 0) {
        console.log("Files selected:", validFiles);
        // Aquí iría tu lógica real de subida
        setSuccessMsg("✅ La vacante se ha subido correctamente.");
      }
    }
    // Reset input to allow selecting same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleButtonClick = (fileType) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept =
        fileType === "pdf" ? ".pdf" : ".doc,.docx";
      fileInputRef.current.click();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(88, 28, 135, 0.3)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: "1rem",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "white",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          maxWidth: "42rem",
          minHeight: "500px",
          borderRadius: "1.5rem",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          border: "2px solid rgb(221, 214, 254)",
          padding: "2rem",
          margin: "0 1rem",
          position: "relative",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close upload popup"
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            width: "2rem",
            height: "2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "9999px",
            color: "#9ca3af",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            transition: "all 0.2s",
            outline: "none",
          }}
          onMouseEnter={(e) => {
            e.target.style.color = "#4b5563";
            e.target.style.backgroundColor = "rgb(250, 245, 255)";
          }}
          onMouseLeave={(e) => {
            e.target.style.color = "#9ca3af";
            e.target.style.backgroundColor = "transparent";
          }}
        >
          <svg
            style={{ width: "1.25rem", height: "1.25rem" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          style={{ display: "none" }}
          accept=".pdf,.doc,.docx"
          multiple
        />

        {/* Draggable Area */}
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: `2px dashed ${
              isDragging ? "rgb(147, 51, 234)" : "rgb(221, 214, 254)"
            }`,
            borderRadius: "1rem",
            padding: "3rem",
            marginBottom: "1.5rem",
            transition: "all 0.2s",
            backgroundColor: isDragging
              ? "rgb(250, 245, 255)"
              : "rgba(250, 245, 255, 0.3)",
            transform: isDragging ? "scale(1.05)" : "scale(1)",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            if (!isDragging) {
              e.currentTarget.style.borderColor = "rgb(196, 181, 253)";
              e.currentTarget.style.backgroundColor =
                "rgba(250, 245, 255, 0.5)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isDragging) {
              e.currentTarget.style.borderColor = "rgb(221, 214, 254)";
              e.currentTarget.style.backgroundColor =
                "rgba(250, 245, 255, 0.3)";
            }
          }}
        >
          <svg
            style={{
              width: "4rem",
              height: "4rem",
              color: "rgb(192, 132, 252)",
              marginBottom: "1rem",
            }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p
            style={{
              color: "#4b5563",
              fontSize: "1.125rem",
              fontWeight: 500,
              marginBottom: "0.5rem",
              margin: 0,
            }}
          >
            {isDragging
              ? "Drop your files here"
              : "Drag and drop your files here"}
          </p>
          <p
            style={{ color: "#9ca3af", fontSize: "0.875rem", margin: 0 }}
          >
            Supports .pdf, .doc, and .docx files
          </p>
        </div>

        {/* Import Buttons */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => handleButtonClick("pdf")}
            style={{
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              fontWeight: 600,
              borderRadius: "9999px",
              background:
                "linear-gradient(to right, rgb(147, 51, 234), rgb(126, 34, 206))",
              color: "white",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              outline: "none",
            }}
            onMouseEnter={(e) => {
              e.target.style.background =
                "linear-gradient(to right, rgb(126, 34, 206), rgb(107, 33, 168))";
              e.target.style.transform = "scale(1.05)";
              e.target.style.boxShadow =
                "0 20px 25px -5px rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background =
                "linear-gradient(to right, rgb(147, 51, 234), rgb(126, 34, 206))";
              e.target.style.transform = "scale(1)";
              e.target.style.boxShadow =
                "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
            }}
            onMouseDown={(e) => {
              e.target.style.transform = "scale(0.95)";
            }}
            onMouseUp={(e) => {
              e.target.style.transform = "scale(1.05)";
            }}
          >
            <svg
              style={{ width: "1.25rem", height: "1.25rem" }}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                clipRule="evenodd"
              />
            </svg>
            Import PDF
          </button>

          <button
            onClick={() => handleButtonClick("doc")}
            style={{
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              fontWeight: 600,
              borderRadius: "9999px",
              backgroundColor: "white",
              color: "rgb(147, 51, 234)",
              border: "2px solid rgb(221, 214, 254)",
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              outline: "none",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "rgb(250, 245, 255)";
              e.target.style.borderColor = "rgb(196, 181, 253)";
              e.target.style.transform = "scale(1.05)";
              e.target.style.boxShadow =
                "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "white";
              e.target.style.borderColor = "rgb(221, 214, 254)";
              e.target.style.transform = "scale(1)";
              e.target.style.boxShadow =
                "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
            }}
            onMouseDown={(e) => {
              e.target.style.transform = "scale(0.95)";
            }}
            onMouseUp={(e) => {
              e.target.style.transform = "scale(1.05)";
            }}
          >
            <svg
              style={{ width: "1.25rem", height: "1.25rem" }}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                clipRule="evenodd"
              />
            </svg>
            Import DOC
          </button>
        </div>

        {/* ✅ Mensaje de éxito */}
        {successMsg && (
          <p
            style={{
              marginTop: "1rem",
              textAlign: "center",
              color: "green",
              fontWeight: 500,
            }}
          >
            {successMsg}
          </p>
        )}
      </div>
    </div>
  );
}

export default UploadPopup;