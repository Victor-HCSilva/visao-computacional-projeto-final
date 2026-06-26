// --- Web Audio API Sound Generator (Zero Network Dependency) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    try {
        // Resume audio context if suspended (browser security)
        if (audioCtx.state === "suspended") {
            audioCtx.resume();
        }

        const time = audioCtx.currentTime;

        if (type === "start") {
            // Ascending success melody
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = "sine";

            osc.frequency.setValueAtTime(440, time); // A4
            osc.frequency.exponentialRampToValueAtTime(880, time + 0.15); // A5

            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(0.1, time + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

            osc.start(time);
            osc.stop(time + 0.3);
        } else if (type === "stop") {
            // Descending turn off sound
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = "sine";

            osc.frequency.setValueAtTime(660, time); // E5
            osc.frequency.exponentialRampToValueAtTime(220, time + 0.2); // A3

            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(0.1, time + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);

            osc.start(time);
            osc.stop(time + 0.35);
        } else if (type === "tick") {
            // Short woodblock/click feedback for camera snapshot
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = "triangle";
            osc.frequency.setValueAtTime(1200, time);

            gain.gain.setValueAtTime(0.08, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

            osc.start(time);
            osc.stop(time + 0.05);
        } else if (type === "error") {
            // Low error buzz
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(150, time);
            osc.frequency.linearRampToValueAtTime(100, time + 0.2);

            gain.gain.setValueAtTime(0.15, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

            osc.start(time);
            osc.stop(time + 0.3);
        }
    } catch (e) {
        console.error("Audio playback error:", e);
    }
}

// --- TTS Engine (Text-to-Speech) ---
let speechSynth = window.speechSynthesis;
let speechRate = 1.0;
let speechLang = "pt-BR";

function speak(text) {
    if (!speechSynth) return;

    // Cancel current speech to prevent queue build-up in real-time
    speechSynth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechLang;
    utterance.rate = speechRate;

    // Find a system voice matching target language
    const voices = speechSynth.getVoices();
    const matchingVoice = voices.find((v) =>
        v.lang.startsWith(speechLang.substring(0, 2)),
    );
    if (matchingVoice) {
        utterance.voice = matchingVoice;
    }

    speechSynth.speak(utterance);
}

// Speech vocalization helper for screen-reader like experience
function vocalizeOption(text) {
    if (document.getElementById("vocalize-menu").checked && !isActive) {
        speak(text);
    }
}

// --- Application State ---
let isActive = false;
let stream = null;
let model = null;
let detectionInterval = null;
let isModelLoading = false;
let lastSpeechTime = 0;
const speechThrottleMs = 3500; // Do not speak too rapidly
let lastSpokenText = "";

// Elements
const toggleBtn = document.getElementById("toggle-btn");
const statusIcon = document.getElementById("status-icon");
const statusText = document.getElementById("status-text");
const subStatusText = document.getElementById("sub-status-text");
const detectionOutput = document.getElementById("detection-output");
const webcam = document.getElementById("webcam");
const overlay = document.getElementById("overlay");
const overlayCtx = overlay.getContext("2d");
const toggleCameraBtn = document.getElementById("toggle-camera-btn");
const cameraContainer = document.getElementById("camera-container");

// Form Controls
const aiModeRadios = document.getElementsByName("ai-mode");
const geminiKeyGroup = document.getElementById("gemini-key-group");
const geminiKeyInput = document.getElementById("gemini-key");
const voiceLangSelect = document.getElementById("voice-lang");
const voiceRateSelect = document.getElementById("voice-rate");

// Load saved settings
if (localStorage.getItem("gemini_api_key")) {
    geminiKeyInput.value = localStorage.getItem("gemini_api_key");
}
if (localStorage.getItem("voice_lang")) {
    voiceLangSelect.value = localStorage.getItem("voice_lang");
    speechLang = voiceLangSelect.value;
}
if (localStorage.getItem("voice_rate")) {
    voiceRateSelect.value = localStorage.getItem("voice_rate");
    speechRate = parseFloat(voiceRateSelect.value);
}

// Listeners for saved settings
geminiKeyInput.addEventListener("change", () => {
    localStorage.setItem("gemini_api_key", geminiKeyInput.value);
    speak(speechLang === "pt-BR" ? "Chave de API salva" : "API key saved");
});
voiceLangSelect.addEventListener("change", () => {
    speechLang = voiceLangSelect.value;
    localStorage.setItem("voice_lang", speechLang);
    speak(
        speechLang === "pt-BR"
            ? "Idioma alterado para português"
            : "Language changed to English",
    );
});
voiceRateSelect.addEventListener("change", () => {
    speechRate = parseFloat(voiceRateSelect.value);
    localStorage.setItem("voice_rate", voiceRateSelect.value);
    speak(
        speechLang === "pt-BR"
            ? "Velocidade de voz alterada"
            : "Speech rate changed",
    );
});

// Toggle Gemini Key Input visibility
aiModeRadios.forEach((radio) => {
    radio.addEventListener("change", (e) => {
        const isGemini = e.target.value === "gemini";
        geminiKeyGroup.style.display = isGemini ? "flex" : "none";
        vocalizeOption(
            speechLang === "pt-BR"
                ? isGemini
                    ? "Modo Nuvem Gemini selecionado"
                    : "Modo Local Offline selecionado"
                : isGemini
                  ? "Gemini Cloud Mode selected"
                  : "Offline Local Mode selected",
        );
    });
});

// Initialize voice synthesis list of voices
if (speechSynth) {
    speechSynth.getVoices();
    if (speechSynth.onvoiceschanged !== undefined) {
        speechSynth.onvoiceschanged = speechSynth.getVoices;
    }
}

// Add TTS to hovered/focused elements for accessibility
document
    .querySelectorAll(
        ".panel select, .panel input, .panel button, .radio-btn, #toggle-camera-btn",
    )
    .forEach((el) => {
        const getLabel = () => {
            if (el.tagName === "SELECT") {
                const label = el.previousElementSibling
                    ? el.previousElementSibling.innerText
                    : "";
                return `${label}. Selecionado: ${el.options[el.selectedIndex].text}`;
            }
            if (el.type === "checkbox") {
                return `${el.parentElement.innerText}. Caixa de seleção ${el.checked ? "marcada" : "desmarcada"}`;
            }
            if (el.tagName === "INPUT" && el.type === "password") {
                const label = el.previousElementSibling
                    ? el.previousElementSibling.innerText
                    : "Entrada de texto";
                return `${label}. Campo de senha.`;
            }
            return el.innerText || el.getAttribute("aria-label") || "Opção";
        };

        el.addEventListener("focus", () => vocalizeOption(getLabel()));
        el.addEventListener("mouseenter", () => vocalizeOption(getLabel()));
    });

// Camera Visibility Control
toggleCameraBtn.addEventListener("click", () => {
    const isVisible = cameraContainer.classList.toggle("visible");
    toggleCameraBtn.innerText = isVisible
        ? speechLang === "pt-BR"
            ? "👁️ Ocultar Câmera da Tela"
            : "👁️ Hide Camera on Screen"
        : speechLang === "pt-BR"
          ? "👁️ Mostrar Câmera na Tela"
          : "👁️ Show Camera on Screen";

    const txt = isVisible
        ? speechLang === "pt-BR"
            ? "Visualização da câmera exibida"
            : "Camera view displayed"
        : speechLang === "pt-BR"
          ? "Visualização da câmera oculta"
          : "Camera view hidden";

    speak(txt);
    playSound("tick");
});

// --- Core Application Logic ---

// Start / Stop Controller
toggleBtn.addEventListener("click", toggleAssistant);

// Keydown shortcut (Space/Enter)
window.addEventListener("keydown", (e) => {
    if (
        e.code === "Space" &&
        document.activeElement !== geminiKeyInput &&
        document.activeElement !== voiceLangSelect &&
        document.activeElement !== voiceRateSelect
    ) {
        e.preventDefault();
        toggleAssistant();
    }
});

async function toggleAssistant() {
    if (isActive) {
        stopAssistant();
    } else {
        await startAssistant();
    }
}

async function startAssistant() {
    playSound("start");
    isActive = true;
    toggleBtn.classList.add("active");
    toggleBtn.setAttribute("aria-pressed", "true");
    statusIcon.innerText = "🔊";
    statusText.innerText =
        speechLang === "pt-BR" ? "Processando..." : "Processing...";
    subStatusText.innerText =
        speechLang === "pt-BR"
            ? "Iniciando câmera e modelo..."
            : "Starting camera and model...";
    detectionOutput.innerText =
        speechLang === "pt-BR" ? "Iniciando..." : "Starting...";

    speak(
        speechLang === "pt-BR"
            ? "Iniciando assistente de orientação."
            : "Starting orientation assistant.",
    );

    // 1. Initialize Camera
    try {
        const mode = getSelectedAiMode();
        const videoConstraints = {
            video: {
                facingMode: "environment", // Rear camera on mobile
                width: { ideal: 640 },
                height: { ideal: 480 },
            },
            audio: false,
        };

        stream = await navigator.mediaDevices.getUserMedia(videoConstraints);
        webcam.srcObject = stream;

        // Wait for video metadata to load so sizes are available
        await new Promise((resolve) => {
            webcam.onloadedmetadata = () => {
                resolve();
            };
        });

        overlay.width = webcam.videoWidth;
        overlay.height = webcam.videoHeight;
    } catch (err) {
        console.error("Camera access error: ", err);
        showError(
            speechLang === "pt-BR"
                ? "Erro ao acessar a câmera. Verifique as permissões."
                : "Error accessing camera. Please check permissions.",
        );
        return;
    }

    // 2. Load model if Local Mode
    const mode = getSelectedAiMode();
    if (mode === "local") {
        if (!model && !isModelLoading) {
            try {
                isModelLoading = true;
                subStatusText.innerText =
                    speechLang === "pt-BR"
                        ? "Carregando Inteligência Artificial local..."
                        : "Loading local AI model...";
                speak(
                    speechLang === "pt-BR"
                        ? "Carregando modelo de inteligência artificial local. Aguarde."
                        : "Loading local artificial intelligence model. Please wait.",
                );

                model = await cocoSsd.load();
                isModelLoading = false;

                speak(
                    speechLang === "pt-BR"
                        ? "Modelo carregado com sucesso."
                        : "Model loaded successfully.",
                );
            } catch (err) {
                console.error("Error loading model: ", err);
                isModelLoading = false;
                showError(
                    speechLang === "pt-BR"
                        ? "Erro ao carregar o modelo de visão computacional local."
                        : "Error loading local vision model.",
                );
                return;
            }
        }
    } else if (mode === "gemini") {
        // Ensure API key is entered
        const apiKey = geminiKeyInput.value.trim();
        if (!apiKey) {
            showError(
                speechLang === "pt-BR"
                    ? "Erro: Chave de API do Gemini não informada no menu de configurações."
                    : "Error: Gemini API Key not specified in settings.",
            );
            return;
        }
    }

    // 3. Start scanning loop
    if (isActive) {
        statusText.innerText =
            speechLang === "pt-BR" ? "Monitorando" : "Monitoring";
        subStatusText.innerText =
            speechLang === "pt-BR"
                ? "Toque no botão para parar"
                : "Tap button to stop";

        const intervalTime = mode === "local" ? 800 : 4000; // Local is faster, Gemini throttled to save API usage
        detectionInterval = setInterval(runAnalysis, intervalTime);

        // Trigger first run immediately
        runAnalysis();
    }
}

function stopAssistant() {
    playSound("stop");
    isActive = false;

    if (detectionInterval) {
        clearInterval(detectionInterval);
        detectionInterval = null;
    }

    if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        stream = null;
    }

    webcam.srcObject = null;

    // Clear overlay drawing canvas
    overlayCtx.clearRect(0, 0, overlay.width, overlay.height);

    toggleBtn.classList.remove("active");
    toggleBtn.setAttribute("aria-pressed", "false");
    statusIcon.innerText = "🔘";
    statusText.innerText =
        speechLang === "pt-BR" ? "Toque para Iniciar" : "Tap to Start";
    subStatusText.innerText =
        speechLang === "pt-BR"
            ? "O sistema falará o que vê"
            : "The system will announce what it sees";
    detectionOutput.innerText =
        speechLang === "pt-BR"
            ? "Assistente desativado."
            : "Assistant turned off.";
    detectionOutput.className = "detection-placeholder";

    speak(
        speechLang === "pt-BR"
            ? "Assistente desativado."
            : "Assistant turned off.",
    );
}

function showError(msg) {
    playSound("error");
    isActive = false;

    if (detectionInterval) {
        clearInterval(detectionInterval);
        detectionInterval = null;
    }
    if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        stream = null;
    }
    webcam.srcObject = null;

    toggleBtn.classList.remove("active");
    toggleBtn.setAttribute("aria-pressed", "false");
    statusIcon.innerText = "⚠️";
    statusText.innerText =
        speechLang === "pt-BR" ? "Falha no Sistema" : "System Error";
    subStatusText.innerText = msg;
    detectionOutput.innerText = msg;
    detectionOutput.className = "detection-result";
    detectionOutput.style.color = "var(--danger-color)";

    speak(msg);
}

function getSelectedAiMode() {
    let selected = "local";
    aiModeRadios.forEach((radio) => {
        if (radio.checked) selected = radio.value;
    });
    return selected;
}

// --- Core Image Processing & AI Functions ---

async function runAnalysis() {
    if (!isActive) return;
    playSound("tick"); // Short audio feedback that snapshot is taken

    const mode = getSelectedAiMode();

    try {
        if (mode === "local" && model) {
            await runLocalDetection();
        } else if (mode === "gemini") {
            await runGeminiDescription();
        }
    } catch (err) {
        console.error("Analysis error: ", err);
    }
}

// 1. Local Object Detection (TensorFlow.js + COCO-SSD)
async function runLocalDetection() {
    const predictions = await model.detect(webcam);

    // Draw box outlines on screen if camera is shown
    overlayCtx.clearRect(0, 0, overlay.width, overlay.height);

    if (predictions.length === 0) {
        // No items detected
        updateFeedbackText(
            speechLang === "pt-BR" ? "Caminho livre" : "Path clear",
            speechLang === "pt-BR"
                ? "Nenhum objeto detectado na sua frente"
                : "No objects detected ahead",
        );
        return;
    }

    // Map predictions to speech descriptions
    // Filter predictions by confidence (> 50%)
    const validDetections = predictions.filter((p) => p.score > 0.5);

    if (validDetections.length === 0) {
        updateFeedbackText(
            speechLang === "pt-BR" ? "Caminho livre" : "Path clear",
            speechLang === "pt-BR"
                ? "Nenhum objeto relevante detectado"
                : "No relevant objects detected",
        );
        return;
    }

    // Draw bounding boxes on the overlay
    validDetections.forEach((pred) => {
        const [x, y, width, height] = pred.bbox;
        overlayCtx.strokeStyle = "#ffc107";
        overlayCtx.lineWidth = 4;
        overlayCtx.strokeRect(x, y, width, height);

        // Add label background
        overlayCtx.fillStyle = "#ffc107";
        overlayCtx.font = "bold 14px Inter";
        const labelText = `${pred.class} (${Math.round(pred.score * 100)}%)`;
        const textWidth = overlayCtx.measureText(labelText).width;
        overlayCtx.fillRect(x, y - 24, textWidth + 10, 24);

        // Add text label
        overlayCtx.fillStyle = "#000000";
        overlayCtx.fillText(labelText, x + 5, y - 7);
    });

    // Convert closest/most central predictions to orientation speech
    // Sort detections by area (descending) to prioritize closer/bigger objects
    validDetections.sort(
        (a, b) => b.bbox[2] * b.bbox[3] - a.bbox[2] * a.bbox[3],
    );

    // Pick top 2 objects to announce
    const announcements = validDetections.slice(0, 2).map((pred) => {
        const [x, y, w, h] = pred.bbox;
        const frameWidth = webcam.videoWidth;
        const frameHeight = webcam.videoHeight;

        // Calculate position relative to frame center
        const xCenter = x + w / 2;
        const pctCenter = xCenter / frameWidth;

        let direction = "";
        if (speechLang === "pt-BR") {
            if (pctCenter < 0.35) direction = "à esquerda";
            else if (pctCenter > 0.65) direction = "à direita";
            else direction = "à frente";
        } else {
            if (pctCenter < 0.35) direction = "on your left";
            else if (pctCenter > 0.65) direction = "on your right";
            else direction = "straight ahead";
        }

        // Estimate proximity (box area relative to video frame area)
        const objectArea = w * h;
        const frameArea = frameWidth * frameHeight;
        const proximityPct = objectArea / frameArea;

        let proximity = "";
        if (proximityPct > 0.25) {
            proximity = speechLang === "pt-BR" ? "próximo" : "very close";
        }

        // Translate label classes to Portuguese if needed
        let objectName = pred.class;
        if (speechLang === "pt-BR") {
            objectName = translateLabel(pred.class);
        }

        // Formulate sentence segment
        if (proximity) {
            return speechLang === "pt-BR"
                ? `${objectName} ${direction} e ${proximity}`
                : `${objectName} ${direction} and ${proximity}`;
        } else {
            return `${objectName} ${direction}`;
        }
    });

    let fullSentence = announcements.join(". ");
    // Capitalize first letter
    fullSentence =
        fullSentence.charAt(0).toUpperCase() + fullSentence.slice(1) + ".";

    updateFeedbackText(fullSentence, "");
}

// 2. Gemini Cloud Description via API
async function runGeminiDescription() {
    const apiKey = geminiKeyInput.value.trim();
    if (!apiKey) return;

    // Capture frame from webcam and convert to Base64 JPEG
    const captureCanvas = document.createElement("canvas");
    captureCanvas.width = webcam.videoWidth || 640;
    captureCanvas.height = webcam.videoHeight || 480;
    const ctx = captureCanvas.getContext("2d");
    ctx.drawImage(webcam, 0, 0, captureCanvas.width, captureCanvas.height);

    const base64Image = captureCanvas.toDataURL("image/jpeg");
    const base64Data = base64Image.split(",")[1]; // Remove prefix "data:image/jpeg;base64,"

    // Formulate prompt based on language
    const systemPrompt =
        speechLang === "pt-BR"
            ? "Você é um assistente de orientação espacial por áudio para cegos ou deficientes visuais. Descreva sucintamente o ambiente doméstico capturado nesta imagem em apenas uma única frase curta e direta (máximo 12 palavras), apontando os obstáculos ou caminhos mais óbvios (ex. 'Cadeira à esquerda', 'Porta à frente livre', 'Mesa à sua direita', 'Caminho livre à frente'). Não use introduções como 'Vejo na imagem'."
            : "You are a spatial orientation audio assistant for the blind. Describe the domestic scene in only one short direct sentence (max 12 words), focusing on immediate obstacles or paths (e.g. 'Chair on left', 'Door straight ahead open', 'Table on your right', 'Path is clear'). Do not include intros like 'In the image I see'.";

    try {
        // Call Google Gemini API (gemini-2.5-flash is fast and cheap)
        const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: systemPrompt },
                            {
                                inlineData: {
                                    mimeType: "image/jpeg",
                                    data: base64Data,
                                },
                            },
                        ],
                    },
                ],
                generationConfig: {
                    maxOutputTokens: 50,
                    temperature: 0.4,
                },
            }),
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error?.message || "HTTP Error");
        }

        const data = await response.json();
        const descriptionText =
            data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

        if (descriptionText) {
            updateFeedbackText(descriptionText, "");
        } else {
            updateFeedbackText(
                speechLang === "pt-BR"
                    ? "Sem resposta clara"
                    : "No clear response",
                speechLang === "pt-BR" ? "Tente novamente" : "Please try again",
            );
        }
    } catch (err) {
        console.error("Gemini API call failed: ", err);
        // Graceful failure: fallback or error speak
        speak(
            speechLang === "pt-BR"
                ? "Erro ao contatar servidor de inteligência artificial"
                : "Error contacting artificial intelligence server",
        );
    }
}

// Helper to update text on screen and trigger voice output
function updateFeedbackText(primary, secondary) {
    detectionOutput.innerHTML = primary;
    detectionOutput.className = "detection-result";
    detectionOutput.style.color = "var(--accent-color)";

    const now = Date.now();
    // TTS throttle to avoid overlapping/stuttering and only speak if text has changed or throttle expired
    if (primary !== lastSpokenText || now - lastSpeechTime > speechThrottleMs) {
        speak(primary);
        lastSpokenText = primary;
        lastSpeechTime = now;
    }
}

// Translation dictionary for COCO-SSD class labels
function translateLabel(label) {
    const dictionary = {
        person: "pessoa",
        bicycle: "bicicleta",
        car: "carro",
        motorcycle: "motocicleta",
        airplane: "avião",
        bus: "ônibus",
        train: "trem",
        truck: "caminhão",
        boat: "barco",
        "traffic light": "semáforo",
        "fire hydrant": "hidrante",
        "stop sign": "placa de pare",
        "parking meter": "parquímetro",
        bench: "banco",
        bird: "pássaro",
        cat: "gato",
        dog: "cachorro",
        horse: "cavalo",
        sheep: "ovelha",
        cow: "vaca",
        elephant: "elefante",
        bear: "urso",
        zebra: "zebra",
        giraffe: "girafa",
        backpack: "mochila",
        umbrella: "guarda-chuva",
        handbag: "bolsa",
        tie: "gravata",
        suitcase: "mala",
        frisbee: "frisbee",
        skis: "esquis",
        snowboard: "snowboard",
        "sports ball": "bola",
        kite: "pipa",
        "baseball bat": "bastão de beisebol",
        "baseball glove": "luva de beisebol",
        skateboard: "skate",
        surfboard: "prancha de surfe",
        "tennis racket": "raquete de tênis",
        bottle: "garrafa",
        "wine glass": "taça de vinho",
        cup: "copo",
        fork: "garfo",
        knife: "faca",
        spoon: "colher",
        bowl: "tigela",
        banana: "banana",
        apple: "maçã",
        sandwich: "sanduíche",
        orange: "laranja",
        broccoli: "brócolis",
        carrot: "cenoura",
        "hot dog": "cachorro-quente",
        pizza: "pizza",
        donut: "rosquinha",
        cake: "bolo",
        chair: "cadeira",
        couch: "sofá",
        "potted plant": "planta de vaso",
        bed: "cama",
        "dining table": "mesa de jantar",
        toilet: "vaso sanitário",
        tv: "televisão",
        laptop: "notebook",
        mouse: "mouse",
        remote: "controle remoto",
        keyboard: "teclado",
        "cell phone": "celular",
        microwave: "microondas",
        oven: "forno",
        toaster: "torradeira",
        sink: "pia",
        refrigerator: "geladeira",
        book: "livro",
        clock: "relógio",
        vase: "vaso",
        scissors: "tesoura",
        "teddy bear": "urso de pelúcia",
        "hair drier": "secador de cabelo",
        toothbrush: "escova de dentes",
        door: "porta",
    };
    return dictionary[label] || label;
}
