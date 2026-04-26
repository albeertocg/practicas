import React, { useState, useRef, useEffect } from "react";

function CompanyPopup({ onClose, onFileSelected, webhookUrl }) {
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const fileInputRef = useRef(null);

  // 👇 Igual que con el CV: tiramos de .env si no nos pasan nada por props
  const resolvedWebhookUrl =
    webhookUrl || import.meta.env.VITE_N8N_UPLOAD_WEBHOOK_URL;

  // ✅ MISMA FORMA QUE EL CV: FormData { message, file }
  const uploadFile = async (file) => {
    if (!resolvedWebhookUrl) {
      console.error("❌ CompanyPopup: webhookUrl no definido");
      setErrorMsg("No hay endpoint configurado para subir las ofertas.");
      return;
    }

    console.log("📡 Subiendo oferta a:", resolvedWebhookUrl);

    try {
      setSubmitting(true);
      setErrorMsg("");
      setSuccessMsg("");

      const formData = new FormData();
      formData.append(
        "message",
        "Nueva oferta subida desde el panel de empresas de TalentMatch"
      );
      formData.append("file", file); // 👉 en n8n lo verás como binary "file"

      const res = await fetch(resolvedWebhookUrl, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("❌ Error HTTP al subir oferta:", res.status, text);
        throw new Error(`Error al subir oferta (${res.status})`);
      }

      // Si tu webhook devuelve JSON, lo puedes leer:
      // const data = await res.json().catch(() => null);
      console.log("✅ Oferta subida correctamente");

      setSuccessMsg("Oferta subida correctamente a TalentMatch ✅");

      if (onFileSelected) {
        onFileSelected(file);
      }

      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
    } catch (err) {
      console.error("❌ Error en uploadFile:", err);
      setErrorMsg("No se ha podido subir la oferta. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const isValidFile = (file) =>
    file.type === "application/pdf" ||
    file.type === "application/msword" ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.type === "text/plain" ||
    file.name.endsWith(".pdf") ||
    file.name.endsWith(".doc") ||
    file.name.endsWith(".docx") ||
    file.name.endsWith(".txt");

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
    const validFiles = files.filter(isValidFile);

    if (validFiles.length > 0) {
      uploadFile(validFiles[0]); // subimos el primero válido
    } else if (files.length > 0) {
      setErrorMsg(
        "Tipo de archivo no válido. Usa .pdf, .doc, .docx o .txt."
      );
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const validFiles = files.filter(isValidFile);
      if (validFiles.length > 0) {
        uploadFile(validFiles[0]);
      } else {
        setErrorMsg(
          "Tipo de archivo no válido. Usa .pdf, .doc, .docx o .txt."
        );
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleButtonClick = (fileType) => {
    if (fileInputRef.current && !submitting) {
      fileInputRef.current.accept =
        fileType === "pdf" ? ".pdf" : ".doc,.docx,.txt";
      fileInputRef.current.click();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && onClose && !submitting) {
      onClose();
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && onClose && !submitting) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose, submitting]);

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
        zIndex: 100,
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
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close company popup"
          disabled={submitting}
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
            cursor: submitting ? "not-allowed" : "pointer",
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

        {/* Header */}
        <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "rgb(88, 28, 135)",
              margin: 0,
              marginBottom: "0.5rem",
            }}
          >
            For Companies
          </h2>
          <p
            style={{
              fontSize: "1rem",
              color: "#6b7280",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Insert your job vacants and let TalentMatch do the magic.
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          style={{ display: "none" }}
          accept=".pdf,.doc,.docx,.txt"
          multiple={false}
        />

        {/* Drag & drop */}
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            if (fileInputRef.current && !submitting) {
              fileInputRef.current.accept = ".pdf,.doc,.docx,.txt";
              fileInputRef.current.click();
            }
          }}
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
            cursor: submitting ? "wait" : "pointer",
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
              : "Drag and drop your job vacants here"}
          </p>
          <p style={{ color: "#9ca3af", fontSize: "0.875rem", margin: 0 }}>
            Supports .pdf, .doc, .docx, and .txt files
          </p>
        </div>

        {/* Botones */}
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button
            onClick={() => handleButtonClick("pdf")}
            disabled={submitting}
            style={{
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              fontWeight: 600,
              borderRadius: "9999px",
              background:
                "linear-gradient(to right, rgb(147, 51, 234), rgb(126, 34, 206))",
              color: "white",
              border: "none",
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            Import PDF
          </button>

          <button
            onClick={() => handleButtonClick("doc")}
            disabled={submitting}
            style={{
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              fontWeight: 600,
              borderRadius: "9999px",
              backgroundColor: "white",
              color: "rgb(147, 51, 234)",
              border: "2px solid rgb(221, 214, 254)",
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            Import DOC
          </button>
        </div>

        {/* Mensajes de estado */}
        {errorMsg && (
          <p style={{ color: "red", marginTop: "1rem", textAlign: "center" }}>
            {errorMsg}
          </p>
        )}
        {successMsg && (
          <p
            style={{
              color: "green",
              marginTop: "1rem",
              textAlign: "center",
            }}
          >
            {successMsg}
          </p>
        )}
      </div>
    </div>
  );
}

export default CompanyPopup;
