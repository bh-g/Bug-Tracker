// utils/bugTracker.js

let mediaRecorder;
let recordedChunks = [];
let eventHistory = [];
let errorData = null;
let stream;

export const initBugTracker = () => {
    // Capture all JS errors
    window.onerror = function (message, source, lineno, colno, error) {
        errorData = {
            message,
            source,
            lineno,
            colno,
            stack: error?.stack || null,
            time: new Date().toISOString(),
        };

        // Get the payload and send it to the backend or Fluvio
        getBugReportPayload().then((payload) => {
            sendBugReport(payload);
        });
    };

    // Track user events
    ["click", "input"].forEach((eventType) => {
        document.addEventListener(eventType, (e) => {
            const target = e.target;
            const eventDetails = {
                type: eventType,
                tag: target.tagName,
                id: target.id,
                className: target.className,
                value: eventType === "input" ? "[REDACTED]" : null,
                timestamp: Date.now(),
            };
            eventHistory.push(eventDetails);

            // Only keep last 30 events
            if (eventHistory.length > 30) {
                eventHistory.shift();
            }
        });
    });
};

export const startScreenCapture = async () => {
    try {
        stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        mediaRecorder = new MediaRecorder(stream, {
            mimeType: "video/webm; codecs=vp9",
        });

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) recordedChunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
            stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();

        // Stop after 10 seconds for bug window
        setTimeout(() => {
            if (mediaRecorder && mediaRecorder.state !== "inactive") {
                mediaRecorder.stop();
            }
        }, 10000);
    } catch (err) {
        console.error("Screen capture error:", err);
    }
};

export const getBugReportPayload = async () => {
    return new Promise((resolve) => {
        setTimeout(async () => {
            const blob = new Blob(recordedChunks, { type: "video/webm" });
            const videoURL = URL.createObjectURL(blob);

            const payload = {
                videoURL, // You can also upload to S3 or send blob directly
                error: errorData,
                eventHistory,
                route: window.location.pathname,
                timestamp: new Date().toISOString(),
            };

            resolve(payload);
        }, 1000); // wait for recording to finalize
    });
};

const sendBugReport = (payload) => {
    // Replace this with actual streaming logic (Fluvio / backend API)
    console.log("Bug report payload:", payload);

    // Example: Send to backend
    // fetch("http://localhost:5000/report", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(payload),
    // });
};
