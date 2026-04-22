const fs = require('fs');
const crypto = require('crypto');
const readline = require('readline');

// Check arguments
const targetFile = process.argv[2];

if (!targetFile) {
    console.error("❌ ERROR: Please provide a file path to scan.");
    console.log("Usage: node scanner.js <path-to-file>");
    process.exit(1);
}

if (!fs.existsSync(targetFile)) {
    console.error(`❌ ERROR: File not found at path: ${targetFile}`);
    process.exit(1);
}

// 1. Generate Hash (Safe Local Scanning)
console.log(`\n🛡️ CyberAware Endpoint Agent`);
console.log(`=============================`);
console.log(`[SCANNING] Target: ${targetFile}`);

try {
    const fileBuffer = fs.readFileSync(targetFile);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    const fileHash = hashSum.digest('hex');
    
    console.log(`[HASH] SHA-256: ${fileHash}`);
    console.log(`[NETWORK] Querying CyberAware Threat API...`);

    const isSimulation = process.argv.includes('--simulate-threat');

    if (isSimulation) {
        console.log(`\n--- ANALYSIS RESULTS ---`);
        console.log(`Classification: SIMULATED CRITICAL THREAT`);
        console.log(`Severity: CRITICAL`);
        console.log(`Explanation: This is a simulated threat to test the Endpoint Agent verification gate.`);

        console.log(`\n🚨 [CRITICAL ALERT] Confirmed Malicious File Detected!`);
        
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question(`\n⚠️  Are you 100% sure you want to permanently delete this file? (y/n): `, (answer) => {
            if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
                try {
                    fs.unlinkSync(targetFile);
                    console.log(`✅ [SUCCESS] File successfully quarantined and deleted.`);
                } catch (err) {
                    console.error(`❌ [ERROR] Could not delete file: ${err.message}`);
                }
            } else {
                console.log(`🛑 [CANCELLED] File deletion aborted by user. The threat remains active.`);
            }
            rl.close();
        });
        return;
    }

    // 2. Query the API (Real Mode)
    fetch('http://127.0.0.1:3000/api/cyber/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            content: fileHash,
            type: 'file'
        })
    })
    .then(res => res.json())
    .then(data => {
        if (!data || !data.result) {
            console.error("❌ API Error: Invalid response from Threat Analyzer.");
            process.exit(1);
        }

        const isMalware = data.result.classification === "Malware Detected" || data.result.severity === "CRITICAL" || data.result.severity === "HIGH";
        
        console.log(`\n--- ANALYSIS RESULTS ---`);
        console.log(`Classification: ${data.result.classification}`);
        console.log(`Severity: ${data.result.severity}`);
        console.log(`Explanation: ${data.result.explanation}`);

        // 3. The Verification Gate (Command Center Polling)
        if (isMalware) {
            console.log(`\n🚨 [CRITICAL ALERT] Confirmed Malicious File Detected!`);
            console.log(`[UPLINK] Reporting incident to CyberAware Command Center...`);

            const hostname = require('os').hostname();
            
            // Report to Dashboard
            fetch('http://127.0.0.1:3000/api/endpoint/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hostname: hostname,
                    filepath: targetFile,
                    filehash: fileHash,
                    classification: isSimulation ? "SIMULATED CRITICAL THREAT" : data.result.classification,
                    severity: isSimulation ? "CRITICAL" : data.result.severity
                })
            })
            .then(res => res.json())
            .then(reportData => {
                if (!reportData.alertId) {
                    console.error("❌ Failed to register alert with Command Center.");
                    process.exit(1);
                }

                console.log(`\n======================================================`);
                console.log(`[AWAITING COMMAND] Threat isolated locally.`);
                console.log(`Waiting for instructions from CyberAware EDR Dashboard...`);
                console.log(`======================================================\n`);

                // Start polling every 2 seconds
                const pollInterval = setInterval(() => {
                    fetch(`http://127.0.0.1:3000/api/endpoint/poll?alertId=${reportData.alertId}`)
                    .then(res => res.json())
                    .then(pollData => {
                        if (pollData.status === "DELETE_ORDERED") {
                            clearInterval(pollInterval);
                            console.log(`\n⚡ [COMMAND RECEIVED] "ISOLATE & DESTROY" order confirmed by Admin.`);
                            try {
                                fs.unlinkSync(targetFile);
                                console.log(`✅ [SUCCESS] Target Destroyed.`);
                                // Inform server we deleted it
                                fetch('http://127.0.0.1:3000/api/endpoint/action', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ alertId: reportData.alertId, action: "DELETED" })
                                });
                                setTimeout(() => process.exit(0), 1000);
                            } catch (err) {
                                console.error(`❌ [ERROR] Could not delete file: ${err.message}`);
                                process.exit(1);
                            }
                        } else if (pollData.status === "IGNORED") {
                            clearInterval(pollInterval);
                            console.log(`\n🛑 [COMMAND RECEIVED] "IGNORE" order confirmed by Admin. The threat remains active.`);
                            process.exit(0);
                        } else {
                            // Still PENDING
                            process.stdout.write(".");
                        }
                    })
                    .catch(() => process.stdout.write("x"));
                }, 2000);
            })
            .catch(err => {
                console.error(`❌ [NETWORK ERROR] Failed to report to Command Center: ${err.message}`);
                process.exit(1);
            });

        } else {
            console.log(`\n✅ [SAFE] No threats detected. No action required.`);
            process.exit(0);
        }
    })
    .catch(err => {
        console.error(`❌ [NETWORK ERROR] Failed to connect to CyberAware API: ${err.message}`);
        console.log("Make sure the Next.js development server is running on localhost:3000.");
        process.exit(1);
    });

} catch (err) {
    console.error(`❌ [ERROR] Failed to read file: ${err.message}`);
    process.exit(1);
}
