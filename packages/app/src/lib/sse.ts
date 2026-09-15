export type SSEFrame = { event: string; data: string };

function parseFrame(raw: string): SSEFrame | null {
    let event = "message";
    const data: string[] = [];

    for (const line of raw.split("\n")) {
        if (!line || line.startsWith(":")) continue;

        const colon = line.indexOf(":");
        const field = colon === -1 ? line : line.slice(0, colon);
        const value = colon === -1 ? "" : line.slice(colon + 1).replace(/^ /, "");

        if (field === "event") event = value;
        else if (field === "data") data.push(value);
    }

    return data.length > 0 ? { event, data: data.join("\n") } : null;
}

/**
 * Frames are delimited by a blank line but a network chunk can split one anywhere, so
 * the parser carries a buffer between reads.
 */
export function createSSEParser() {
    let buffer = "";

    return function push(chunk: string): SSEFrame[] {
        buffer += chunk;
        const frames: SSEFrame[] = [];

        let boundary = buffer.indexOf("\n\n");
        while (boundary !== -1) {
            const frame = parseFrame(buffer.slice(0, boundary));
            if (frame) frames.push(frame);
            buffer = buffer.slice(boundary + 2);
            boundary = buffer.indexOf("\n\n");
        }

        return frames;
    };
}
