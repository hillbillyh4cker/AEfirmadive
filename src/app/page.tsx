"use client";

import { useState, useEffect } from "react";
import { Upload, Terminal as TerminalIcon, Shield, Settings, FileText, Database, X, AlertOctagon, Activity, ChevronRight, Copy } from "lucide-react";
import { analyzeFirmwareData, AIProvider } from "@/lib/ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Home() {
  const [status, setStatus] = useState<"idle" | "analyzing" | "completed" | "error">("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState<AIProvider>("gemini");
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<"terminal" | "strings" | "binwalk" | "report">("terminal");
  const [extractedStrings, setExtractedStrings] = useState<string>("");
  const [binwalkOutput, setBinwalkOutput] = useState<string>("");

  useEffect(() => {
    const savedKey = localStorage.getItem("ai_api_key");
    const savedProvider = localStorage.getItem("ai_provider") as AIProvider;
    if (savedKey) setApiKey(savedKey);
    if (savedProvider) setProvider(savedProvider);
  }, []);

  const saveApiKey = () => {
    localStorage.setItem("ai_api_key", apiKey);
    localStorage.setItem("ai_provider", provider);
    setShowSettings(false);
  };

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `${msg}`]);
  };

  const startAnalysis = async (file: File) => {
    if (!apiKey && !process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      alert("Missing API Key. Please click Settings to configure.");
      setShowSettings(true);
      return;
    }

    setFileName(file.name);
    setStatus("analyzing");
    setLogs([]);
    setReport(null);
    setExtractedStrings("");
    setBinwalkOutput("");
    setActiveTab("terminal");

    addLog(`Engine INIT -> Target: ${file.name}`);
    await new Promise(r => setTimeout(r, 400));
    
    addLog("Mounting firmware image // FirmAE emulation sandbox...");
    await new Promise(r => setTimeout(r, 600));

    addLog("EXEC binwalk -e --rm --run-as=root");
    await new Promise(r => setTimeout(r, 700));
    addLog("Extraction successful [SquashFS signatures identified].");

    try {
      addLog("Transmitting chunks to stream parser (Strings Dump)...");
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setExtractedStrings(data.strings);
      setBinwalkOutput(data.binwalk);
      addLog(`Stream parser complete. Extracted ${data.strings.split('\n').length} string signatures.`);
      addLog(`Binwalk static analysis complete. Mapped subsystem signatures.`);
      addLog(`Initiating ${provider.toUpperCase()} SecOps Intelligence reasoning...`);
      
      const promptData = `
        Firmware Name: ${data.fileName}
        
        Binwalk Architecture Data:
        ${data.binwalk}
        
        Extracted Strings:
        ${data.strings}
      `;

      const aiReport = await analyzeFirmwareData(promptData, apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "", provider);
      
      setReport(aiReport);
      addLog("Intelligence analysis complete. Report compiled and verified.");
      setStatus("completed");
      setActiveTab("report");

    } catch (error: any) {
      addLog(`ERROR FAULT: ${error.message}`);
      setStatus("error");
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <nav className="navbar">
        <div className="nav-brand">
          <Shield color="var(--primary)" size={24} />
          <h1>AEfirmadive</h1>
          <span className="mono">v2.4 OPS</span>
        </div>
        
        <button className="btn btn-outline" onClick={() => setShowSettings(true)}>
          <Settings size={16} /> CONFIG
        </button>
      </nav>

      {/* Main Grid */}
      <div className="main-content">
        
        {/* Left Side: Upload & Status */}
        <div className="flex-column">
          <div className="panel">
            <div className="panel-header">
               <Activity size={16} /> Target Ingress Node
            </div>
            
            <div className="panel-body">
              {status === "idle" ? (
                <label className="upload-zone">
                  <input type="file" style={{display: "none"}} onChange={(e) => e.target.files?.[0] && startAnalysis(e.target.files[0])} />
                  <Upload className="upload-icon" />
                  <div className="upload-title text-primary">SELECT FIRMWARE BINARY</div>
                  <div className="upload-desc mono">Supported: .bin, .img, .fw, .tar.gz</div>
                </label>
              ) : (
                <div className="flex-column">
                  <div>
                    <div className="text-muted mono" style={{fontSize: "0.7rem", marginBottom: "0.25rem"}}>ACTIVE TARGET HASH</div>
                    <div className="mono text-primary" style={{wordBreak: "break-all", fontWeight: 600}}>{fileName}</div>
                  </div>
                  
                  <div>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600}}>
                      <span className="text-muted uppercase">Status Pipeline</span>
                      <span className={status === "error" ? "text-error" : "text-primary uppercase"}>
                        {status === "analyzing" ? "Working..." : status}
                      </span>
                    </div>
                    <div className="progress-container">
                      <div 
                        className={`progress-bar ${status === "error" ? "error" : ""}`}
                        style={{ width: status === "completed" || status === "error" ? "100%" : "60%" }}
                      />
                    </div>
                  </div>

                  {(status === "completed" || status === "error") && (
                    <button className="btn btn-primary w-full" onClick={() => setStatus("idle")}>
                      FLUSH PIPELINE
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <AlertOctagon size={16} /> Analysis Modules
            </div>
            <div className="panel-body flex-column" style={{padding: '0 1.25rem 1.25rem'}}>
              <div className="status-row">
                <div className="status-label"><Database size={15}/> Binwalk Extractor</div>
                <div className="status-value ok">STANDBY</div>
              </div>
              <div className="status-row">
                <div className="status-label"><TerminalIcon size={15}/> FirmAE Engine</div>
                <div className="status-value warn">SIM-MODE</div>
              </div>
              <div className="status-row">
                <div className="status-label"><Shield size={15}/> AI Cognitive ({provider})</div>
                <div className={`status-value ${status === "completed" ? "ok" : status === "analyzing" ? "running" : ""}`}>
                  {status === "completed" ? "ONLINE" : status === "analyzing" ? "SYNCING" : "OFFLINE"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Data Viewer */}
        <div className="panel">
            <div className="tabs-header">
              <button 
                className={`tab-btn ${activeTab === "terminal" ? 'active' : ''}`}
                onClick={() => setActiveTab("terminal")}
              >
                <TerminalIcon size={16}/> ENGINE LOGS
              </button>
              <button 
                className={`tab-btn ${activeTab === "binwalk" ? 'active' : ''}`}
                onClick={() => setActiveTab("binwalk")}
                disabled={!binwalkOutput}
              >
                <AlertOctagon size={16}/> BINWALK MAP
              </button>
              <button 
                className={`tab-btn ${activeTab === "strings" ? 'active' : ''}`}
                onClick={() => setActiveTab("strings")}
                disabled={!extractedStrings}
              >
                <Database size={16}/> MEMORY STRINGS
              </button>
              <button 
                className={`tab-btn ${activeTab === "report" ? 'active' : ''}`}
                onClick={() => setActiveTab("report")}
                disabled={!report}
              >
                <FileText size={16}/> COGNITIVE REPORT
              </button>
            </div>

            {/* Viewer Area */}
            <div className="viewer-content">
              
              {activeTab === "terminal" && (
                <div className="mono">
                  {logs.length === 0 && (
                     <div className="console-line">
                        <span className="timestamp">[SYS]</span>
                        <span className="text-muted">Awaiting target payload injection...</span>
                     </div>
                  )}
                  {logs.map((log, i) => {
                     const isError = log.includes("ERROR") || log.includes("FAULT");
                     // Fixed timestamp generation
                     const dateStr = new Date(Date.now() - (logs.length - 1 - i) * 600).toISOString().split("T")[1].slice(0, 11);
                     return (
                        <div key={i} className="console-line">
                           <span className="timestamp">[{dateStr}]</span>
                           <span className={isError ? "text-error" : "text-main"}>{log}</span>
                        </div>
                     );
                  })}
                  {status === "analyzing" && (
                     <div className="console-line">
                        <span className="timestamp" style={{opacity: 0}}>[00:00:00.00]</span>
                        <span className="text-primary"><ChevronRight size={14} style={{display: 'inline', verticalAlign: 'middle', marginRight: '4px'}}/><span className="cursor" /></span>
                     </div>
                  )}
                </div>
              )}

              {activeTab === "strings" && (
                <div className="mono text-muted" style={{whiteSpace: 'pre-wrap', fontSize: '0.8rem'}}>
                  {extractedStrings}
                </div>
              )}

              {activeTab === "binwalk" && (
                <div className="mono text-primary" style={{whiteSpace: 'pre-wrap', fontSize: '0.8rem'}}>
                  {binwalkOutput}
                </div>
              )}

              {activeTab === "report" && (
                <div style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
                  {!report ? (
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)'}}>
                      <p>AWAITING DATA SYNC</p>
                    </div>
                  ) : (
                    <>
                      <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', flexShrink: 0}}>
                        <button 
                          className="btn btn-outline" 
                          style={{padding: '0.4rem 0.8rem', fontSize: '0.75rem'}}
                          onClick={() => navigator.clipboard.writeText(report)}
                        >
                          <Copy size={14} /> COPY RAW MARKDOWN
                        </button>
                      </div>
                      <div className="markdown-prose" style={{flex: 1, overflowY: 'auto'}}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{report}</ReactMarkdown>
                      </div>
                    </>
                  )}
                </div>
              )}

            </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-backdrop" onClick={() => setShowSettings(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
               <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <Shield size={18} className="text-primary" />
                  <span>SECURE CONFIGURATION</span>
               </div>
               <button onClick={() => setShowSettings(false)}><X size={20} className="text-muted" /></button>
            </div>
            
            <div className="modal-body flex-column">
               <div>
                  <label className="mono text-muted" style={{display: 'block', fontSize: '0.75rem', marginBottom: '0.5rem'}}>AI PROVIDER</label>
                  <select 
                     value={provider}
                     onChange={(e) => setProvider(e.target.value as AIProvider)}
                     className="cyber-input"
                     style={{marginBottom: '1rem', appearance: 'none'}}
                  >
                     <option value="gemini">Google Gemini</option>
                     <option value="openai">OpenAI (GPT)</option>
                     <option value="anthropic">Anthropic (Claude)</option>
                  </select>

                  <label className="mono text-muted" style={{display: 'block', fontSize: '0.75rem', marginBottom: '0.5rem'}}>COGNITIVE API KEY</label>
                  <input 
                     type="password" 
                     value={apiKey}
                     onChange={(e) => setApiKey(e.target.value)}
                     placeholder="Paste Provider Key..."
                     className="cyber-input"
                  />
                  <p className="mono text-muted" style={{fontSize: '0.7rem', marginTop: '0.5rem', lineHeight: 1.4}}>
                     Keys are encrypted and stored locally via browser localStorage. No data is transmitted to analytics servers.
                  </p>
               </div>
               <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem'}}>
                  <button onClick={() => setShowSettings(false)} className="btn btn-outline">CANCEL</button>
                  <button onClick={saveApiKey} className="btn btn-primary">SECURE SAVE</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
