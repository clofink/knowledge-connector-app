import { NanoRepLabel } from "./nanorep-label.js";
import { NanoRepContext } from "./nanorep-context.js";

export interface NanoRepArticle {
    id: string;
    isOffline: boolean;
    title:  string;
    body:  string;
    labels?: NanoRepLabel[];
    phrasings: string[];
    contextInfo?: NanoRepContext[];
}
