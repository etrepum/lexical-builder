import emojis from "emoji-datasource-facebook/emoji.json";
import { textFromUnifiedID } from "./unifiedID";

/**
 * We rewrite the emoji dataset into plain text delimited by
 * spaces and newlines, which serializes smaller and is quicker to parse.
 *
 * This is done at build time by vite-plugin-data, which does compile-time
 * evaluation of modules with .data in their name.
 */
export const supportedEmojis = emojis
  .flatMap(
    ({ has_img_facebook, short_name, short_names, text, texts, unified }) =>
      has_img_facebook
        ? [
            [
              textFromUnifiedID(unified),
              [
                ...new Set([
                  ...(short_name ? [short_name] : []),
                  ...(short_names ?? []),
                ]),
              ].join(" "),
              [...new Set([...(text ? [text] : []), ...(texts ?? [])])].join(
                " ",
              ),
            ].join("\t"),
          ]
        : [],
  )
  .join("\n");
