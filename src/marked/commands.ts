import { Ace } from "ace-builds";
import { insertText } from "@/utils/ace";

export type MdCommand = (attrs: {
  [key: string]: any;
}) => (ace: Ace.Editor) => void;
export interface MdCommands {
  [key: string]: MdCommand;
}

const allCommands: MdCommands = {
  bold: attrs => ace => insertText(ace, { left: "**", right: "**" }),
  cardLink: attrs => ace => insertText(ace, { left: "[[", right: "]]" }),
  code: attrs => ace => insertText(ace, { left: "`", right: "`" }),
  italic: attrs => ace => insertText(ace, { left: "*", right: "*" }),
  link: attrs => ace =>
    insertText(ace, {
      left: `[${attrs.text}](${attrs.href}${
        attrs.title ? ` "${attrs.title}"` : ""
      })`
    }),
  strike: attrs => ace => insertText(ace, { left: "~", right: "~" }),
  style: attrs => ace =>
    insertText(ace, { left: `[${attrs.text}]{${attrs.style}}` }),
  sub: attrs => ace => insertText(ace, { left: "^", right: "_" }),
  sup: attrs => ace => insertText(ace, { left: "^", right: "-" }),
  underline: attrs => ace => insertText(ace, { left: "<u>", right: "</u>" }),
  emoji: attrs => ace =>
    insertText(
      ace,
      attrs.text ? { left: `:${attrs.text}:` } : { left: ":", right: ":" }
    ),
  blockquote: attrs => ace => insertText(ace, { replace: "> " }, 0, true),
  bulletList: attrs => ace =>
    insertText(
      ace,
      {
        replace: "- "
      },
      0,
      true
    ),
  orderedList: attrs => ace => insertText(ace, { replace: "1. " }, 0, true),
  codeBlock: attrs => ace => insertText(ace, { replace: "```\n```" }, 4, true),
  details: attrs => ace => insertText(ace, { replace: ":::det\n:::" }, 4, true),
  horizontalRule: attrs => ace =>
    insertText(ace, { replace: "\n---\n\n" }, 0, true),
  heading: attrs => ace =>
    insertText(ace, { replace: `${"#".repeat(attrs.level || 1)} ` }, 0, true),
  image: attrs => ace =>
    insertText(ace, {
      replace: `![${attrs.alt}](${attrs.src}${
        attrs.title ? ` "${attrs.title}"` : ""
      })`
    }),
  katex: attrs => ace => insertText(ace, { left: "$$", right: "$$" }),
  mermaid: attrs => ace => insertText(ace, { replace: ":::mer\n:::" }, 4, true),
  table: attrs => ace => {
    const row = parseInt(attrs.row);
    const col = parseInt(attrs.col);
    const align = attrs.align;
    let str = "";
    for (let i = 0; i < row + 1; i++) {
      if (i == 1) {
        str +=
          (
            "|" +
            (align === "left" || align === "center" ? ":" : "-") +
            "--------" +
            (align === "right" || align === "center" ? ":" : "-")
          ).repeat(col) + "|\n";
      } else {
        str += "|  ".repeat(col) + "|\n";
      }
    }
    insertText(
      ace,
      {
        replace: str
      },
      0,
      true
    );
  },
  toc: attrs => ace =>
    insertText(ace, { replace: `[TOC${attrs.fold ? " :fold" : ""}]` }, 0, true),
  todoList: attrs => ace => insertText(ace, { replace: "- [ ] " }, 0, true)
};

export function useCommands(ace: Ace.Editor) {
  const commands: {
    [key: string]: (attrs?: { [key: string]: any }) => void;
  } = {};
  const apply = (command: MdCommand, attrs: { [key: string]: any }) => {
    return command(attrs)(ace);
  };

  const handle = (name: string, command: MdCommand) => {
    commands[name] = attrs => apply(command, attrs || {});
  };

  for (const name in allCommands) {
    handle(name, allCommands[name]);
  }

  return commands;
}

export default allCommands;
