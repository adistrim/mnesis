import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { checkBinaryStatus } from "quack-search";
import { logger } from "./logger";

export function configureQuackBinaryPath(): void {
    if (process.env.QUACK_BINARY_PATH) {
        return;
    }

    if (process.platform !== "linux" || process.arch !== "x64") {
        return;
    }

    const candidates = [
        resolve(process.cwd(), "node_modules/quack-search-linux-x64/bin/quack"),
        resolve(process.cwd(), "../node_modules/quack-search-linux-x64/bin/quack"),
        resolve(process.cwd(), "../../node_modules/quack-search-linux-x64/bin/quack"),
    ];

    const binaryPath = candidates.find((path) => existsSync(path));

    if (!binaryPath) {
        logger.warn("Quack binary path auto-detection failed", {
            checkedPaths: candidates,
        });
        return;
    }

    process.env.QUACK_BINARY_PATH = binaryPath;
    logger.info("Configured QUACK_BINARY_PATH", {
        quackBinaryPath: binaryPath,
    });
}

export function getQuackBinaryStatus() {
    return checkBinaryStatus();
}
