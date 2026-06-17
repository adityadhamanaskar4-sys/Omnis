const { Server } = require("@hocuspocus/server");
const server = new Server({
    port: 8000,
    async onUpdate(data) {
        console.log(`Room "${data.documentName}" updated! Data size: ${data.update.byteLength} bytes.`);
    }
});
server.listen();
console.log("WebSocket Sync Server is running on port 8000")