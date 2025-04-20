import express from 'express';
import http from 'http';
import { Server } from "socket.io";
import cors from 'cors';

// --- Configuration ---
const PORT = process.env.PORT || 3001;

// --- Application Setup ---
const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// --- Data Storage (Simple In-Memory) ---
let bugReports = [];
let nextBugId = 1;

// --- Helper Function to Process and Broadcast ---
function processAndBroadcastReport(reportPayload, socketIoInstance) {
    try {
        const newBugReport = {
            id: nextBugId++,
            receivedAt: new Date().toISOString(),
            apiKey: reportPayload.apiKey,
            videoData: reportPayload.videoData,

            metadata: {
                errorTrace: reportPayload.error?.stack || reportPayload.error?.message || 'N/A',
                errorMessage: reportPayload.error?.message || 'N/A',
                errorSource: reportPayload.error?.source,
                errorLineno: reportPayload.error?.lineno,
                errorColno: reportPayload.error?.colno,
                errorTime: reportPayload.error?.time,
                currentRoute: reportPayload.route,
                eventHistory: reportPayload.eventHistory,
                clientTimestamp: reportPayload.timestamp
            }
        };

        // Store the bug report (in memory for now)
        bugReports.push(newBugReport);

        if (bugReports.length > 100) {
            bugReports.shift();
        }

        console.log(`Broadcasting new bug report (ID: ${newBugReport.id}) via WebSocket`);
        socketIoInstance.emit('new_bug', newBugReport);

        return true;

    } catch (error) {
        console.error('Error processing or broadcasting report:', error);
        return false;
    }
}

// --- API Endpoints ---

// GET endpoint to retrieve stored bug reports
app.get('/api/bugs', (req, res) => {
    console.log("Serving request for /api/bugs");
    res.json(bugReports);
});

// POST endpoint to receive bug reports from bugTracker.js
app.post('/api/report', async (req, res) => {
    const reportPayload = req.body;
    console.log(`Received report payload on /api/report. API Key: ${reportPayload?.apiKey}`);

    if (!reportPayload || !reportPayload.error) {
        console.error("Received invalid report payload.");
        return res.status(400).json({ message: "Invalid payload." });
    }

    const success = processAndBroadcastReport(reportPayload, io);

    if (success) {
        res.status(200).json({ message: "Report received and broadcasted." });
    } else {
        res.status(500).json({ message: "Failed to process or broadcast report." });
    }
});

// --- WebSocket Connection Handling  ---
io.on('connection', (socket) => {
    console.log('A user connected to WebSocket:', socket.id);

    // Send existing bugs when a new user connects
    console.log(`Sending ${bugReports.length} existing bugs to new client ${socket.id}`);
    socket.emit('initial_bugs', bugReports);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// --- Start the Server ---
server.listen(PORT, () => { // [cite: 22]
    console.log(`Backend server listening on http://localhost:${PORT}`);
});