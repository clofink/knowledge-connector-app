import { NanoRepLabel } from "./nanorep-label.js";

export interface NanoRepArticle {
    id: string;
    isOffline: boolean;
    title:  string;
    body:  string;
    labels: NanoRepLabel[];
    phrasings: string[];
}
