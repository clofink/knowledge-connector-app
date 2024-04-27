import { ExternalContent } from '../model/external-content.js';
import { Document, DocumentVersion } from '../model/sync-export-model.js';
import { NanoRepArticle } from './model/nanorep-article.js';
import { NanoRepLabel } from './model/nanorep-label.js';
import { DocumentAlternative } from '../model/document-alternative.js';
import { GeneratedValue } from '../utils/generated-value.js';
import { Label } from '../model/label.js';
import { NanoRepPhrase } from './model/nanorep-phrase.js';

export function contentMapper(articles: NanoRepArticle[]): ExternalContent {
  return {
    categories: [],
    labels: [],
    documents: articles
      ? articles.map((a: NanoRepArticle) => articleMapper(a))
      : [],
  };
}

function labelMapper(label: NanoRepLabel): Label {
  const { id, name } = label;

  return {
    id: null,
    externalId: String(id),
    name,
    color: GeneratedValue.COLOR,
  };
}

function phraseProcessor(phrases: string[]): DocumentAlternative[] {
  const phraseList: DocumentAlternative[] = [];
  for (let x = 1; x < phrases.length; x++) {
    const phrase = phrases[x];
    try {
      const parsedPhrase = JSON.parse(phrase) as NanoRepPhrase;
      if (parsedPhrase.hasOwnProperty("negativeSample") && parsedPhrase.negativeSample) continue;
      phraseList.push({phrase: parsedPhrase.text, autocomplete: parsedPhrase.autoComplete})
    }
    catch {
      phraseList.push({phrase: phrase, autocomplete: true})
    }
  }
  return phraseList
}

function articleMapper(article: NanoRepArticle): Document {
  const id = article.id;
  const title = article.title;
  const body = article.body;
  const phrases = phraseProcessor(article.phrasings);

  const documentVersion: DocumentVersion = {
    visible: true,
    alternatives: phrases,
    title,
    variations: [
      {
        rawHtml: body,
        body: null,
      },
    ],
    category: null,
    labels: article.labels.map(labelMapper),
  };

  return {
    id: null,
    externalId: String(id),
    published: documentVersion,
    draft: null,
  };
}