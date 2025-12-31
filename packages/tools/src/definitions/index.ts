import type { ToolDefinition } from "../types/definition.type";
import { fetchWebContentTool } from "./tools/fetchWebContentTool";
import { webSearchTool } from "./tools/webSearchTool";

export const toolDefinitions: ToolDefinition[] = [
    webSearchTool,
    fetchWebContentTool,
];

export * from "./tools/fetchWebContentTool";
export * from "./tools/webSearchTool";
