import React, { useState } from "react";
import InputBar from "./../InputBar/InputBar.jsx";
import ParticleBackground from "./ParticleBackground.jsx";
import CompanyPopup from "./CompanyPopup.jsx";
import logo from "../../assets/talentmatch-logo.png";

function MainPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showCompanyPopup, setShowCompanyPopup] = useState(false);

  const handleSubmit = async (value) => {
    if (!value?.trim() && !selectedFile) return;

    const userMessage = {
      role: "user",
      content: value || (selectedFile ? `He subido el archivo: ${selectedFile.name}` : ""),
    };
    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);
    setError(null);

    try {
      const url = import.meta.env.VITE_N8N_CHAT_WEBHOOK_URL;

      let body;
      let headers = {};

      if (selectedFile) {
        // 👇 Enviamos texto + archivo en FormData
        body = new FormData();
        body.append("message", value);
        body.append("file", selectedFile); // en n8n te llegará como binary "file"
        // NO ponemos Content-Type: el navegador lo hace solo
      } else {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify({ message: value });
      }

      const res = await fetch(url, {
        method: "POST",
        headers,
        body,
      });

      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);

      const data = await res.json();

      const assistantMessage = {
        role: "assistant",
        content: data.reply,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
      setSelectedFile(null); // limpiamos después de enviar
    }
  };

  const handleFileSelected = (file) => {
    setSelectedFile(file);
  };

  const handleCompanyClick = () => {
    setShowCompanyPopup(true);
  };

  const handleCloseCompanyPopup = () => {
    setShowCompanyPopup(false);
  };

  const handleCompanyFileSelected = (file) => {
    if (file) {
      console.log("Company file selected:", file);
      // Handle company file upload here
      setShowCompanyPopup(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background:
          "linear-gradient(to bottom, rgb(250,245,255), rgb(255,255,255))",
        padding: "1.5rem 1.5rem 2.5rem",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      <ParticleBackground />
      
      {/* Company button - upper right corner */}
      <button
        onClick={handleCompanyClick}
        style={{
          position: "fixed",
          top: "1.5rem",
          right: "1.5rem",
          background: "none",
          border: "none",
          color: "rgba(147, 51, 234, 0.4)",
          fontSize: "0.9rem",
          fontWeight: 400,
          cursor: "pointer",
          padding: "0.4rem 0.6rem",
          borderRadius: "6px",
          transition: "all 0.2s ease",
          zIndex: 10,
          fontFamily: "inherit",
          textDecoration: "underline",
          textDecorationColor: "rgba(147, 51, 234, 0.2)",
          textUnderlineOffset: "3px",
        }}
        onMouseEnter={(e) => {
          e.target.style.color = "rgba(147, 51, 234, 0.7)";
          e.target.style.textDecorationColor = "rgba(147, 51, 234, 0.4)";
        }}
        onMouseLeave={(e) => {
          e.target.style.color = "rgba(147, 51, 234, 0.4)";
          e.target.style.textDecorationColor = "rgba(147, 51, 234, 0.2)";
        }}
      >
        are you a company?
      </button>
      
      {/* CONTENEDOR PRINCIPAL */}
      <div
        style={{
          width: "100%",
          maxWidth: "1400px",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          margin: "0 auto",
          paddingBottom: "8rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* 🔹 ESTADO INICIAL — LOGO + FRASE */}
        {messages.length === 0 && (
          <div
            style={{
              flex: 1,
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              paddingBottom: "6rem", // hueco para la barra fija
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                marginTop: "-4rem",
              }}
            >
              <img
                src={logo}
                alt="TalentMatch logo"
                style={{
                  width: "360px",
                  maxWidth: "70vw",
                  marginBottom: "0.5rem",
                }}
              />
              <p
                style={{
                  fontSize: "2.2rem",
                  fontWeight: 700,
                  marginTop: -50,
                  color: "rgb(88,28,135)",
                }}
              >
                Reinventamos la forma de buscar trabajo
              </p>
            </div>
          </div>
        )}

        {/* 🔹 MENSAJES DEL CHAT */}
        {messages.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.1rem",
              padding: "0.5rem 3rem",
              boxSizing: "border-box",
            }}
          >
            {messages.map((m, i) => {
              const isUser = m.role === "user";

              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: isUser ? "flex-end" : "flex-start",
                  }}
                >
                  {/* Avatar del agente */}
                  {!isUser && (
                    <div
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        backgroundImage: `url(${logo})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        marginRight: "1rem",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.12)",
                        flexShrink: 0,
                      }}
                    />
                  )}

                  <div
                    style={{
                      maxWidth: "80%",
                      padding: "1rem 1.4rem",
                      borderRadius: "1.25rem",
                      whiteSpace: "pre-line",
                      wordBreak: "break-word",
                      fontSize: "1.15rem",
                      lineHeight: 1.65,
                      background: isUser
                        ? "linear-gradient(to right, rgb(147,51,234), rgb(126,34,206))"
                        : "white",
                      color: isUser ? "white" : "#111827",
                      border: isUser
                        ? "none"
                        : "1px solid rgba(196,181,253,0.5)",
                      boxShadow: isUser
                        ? "0 14px 28px rgba(147,51,234,0.22)"
                        : "0 10px 24px rgba(15,23,42,0.08)",
                    }}
                  >
                    {m.content}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div style={{ fontSize: "1rem", color: "#6b7280" }}>
                El agente está pensando…
              </div>
            )}

            {error && (
              <div style={{ fontSize: "1rem", color: "#dc2626" }}>
                Error: {error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Barra inferior fija */}
      <InputBar
        onSubmit={handleSubmit}
        onFileSelected={handleFileSelected}
      />

      {/* Company Popup */}
      {showCompanyPopup && (
        <CompanyPopup
          onClose={handleCloseCompanyPopup}
          onFileSelected={handleCompanyFileSelected}
        />
      )}
    </div>
  );
}

export default MainPage;
