import emojis from "emoji-datasource-facebook/emoji.json";
import { textFromUnifiedID } from "./unifiedID";

/**
 * We rewrite the emoji dataset into plain text, which serializes smaller and
 * is quicker to parse
 */
export const supportedEmojis = emojis
  .flatMap(({ has_img_facebook, short_name, text, texts, unified }) =>
    has_img_facebook
      ? [
          [
            textFromUnifiedID(unified),
            short_name,
            ...new Set([
              ...(text ? [text] : []),
              ...(texts ?? []),
            ]),
          ].join(" "),
        ]
      : []
  )
  .join("\n");
