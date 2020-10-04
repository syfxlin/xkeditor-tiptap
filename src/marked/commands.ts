import { Ace } from "ace-builds";
import { insertText } from "@/utils/ace";
import { computed, ComputedRef, reactive, Ref } from "vue-demi";

export interface MdCommand {
  isActive?: (attrs: { [key: string]: any }) => (ace: Ace.Editor) => boolean;
  handler: (attrs: { [key: string]: any }) => (ace: Ace.Editor) => void;
}
export interface MdCommands {
  [key: string]: MdCommand;
}

const allCommands: MdCommands = reactive({
  bold: {
    handler: attrs => ace => insertText(ace, { left: "**", right: "**" })
  },
  cardLink: {
    handler: attrs => ace => insertText(ace, { left: "[[", right: "]]" })
  },
  code: {
    handler: attrs => ace => insertText(ace, { left: "`", right: "`" })
  },
  italic: {
    handler: attrs => ace => insertText(ace, { left: "*", right: "*" })
  },
  link: {
    handler: attrs => ace =>
      insertText(ace, {
        left: `[${attrs.text}](${attrs.href}${
          attrs.title ? ` "${attrs.title}"` : ""
        })`
      })
  },
  strike: {
    handler: attrs => ace => insertText(ace, { left: "~", right: "~" })
  },
  style: {
    handler: attrs => ace =>
      insertText(ace, { left: `[${attrs.text}]{${attrs.style}}` })
  },
  sub: {
    handler: attrs => ace => insertText(ace, { left: "^", right: "_" })
  },
  sup: {
    handler: attrs => ace => insertText(ace, { left: "^", right: "-" })
  },
  underline: {
    handler: attrs => ace => insertText(ace, { left: "<u>", right: "</u>" })
  },
  emoji: {
    handler: attrs => ace =>
      insertText(
        ace,
        attrs.text ? { left: `:${attrs.text}:` } : { left: ":", right: ":" }
      )
  },
  blockquote: {
    handler: attrs => ace => insertText(ace, { replace: "> " }, 0, true)
  },
  bulletList: {
    handler: attrs => ace =>
      insertText(
        ace,
        {
          replace: "- "
        },
        0,
        true
      )
  },
  orderedList: {
    handler: attrs => ace => insertText(ace, { replace: "1. " }, 0, true)
  },
  codeBlock: {
    handler: attrs => ace => insertText(ace, { replace: "```\n```" }, 4, true)
  },
  details: {
    handler: attrs => ace =>
      insertText(ace, { replace: ":::det\n:::" }, 4, true)
  },
  horizontalRule: {
    handler: attrs => ace => insertText(ace, { replace: "\n---\n\n" }, 0, true)
  },
  heading: {
    handler: attrs => ace =>
      insertText(ace, { replace: `${"#".repeat(attrs.level || 1)} ` }, 0, true)
  },
  image: {
    handler: attrs => ace =>
      insertText(ace, {
        replace: `![${attrs.alt}](${attrs.src}${
          attrs.title ? ` "${attrs.title}"` : ""
        })`
      })
  },
  katex: {
    handler: attrs => ace => insertText(ace, { left: "$$", right: "$$" })
  },
  mermaid: {
    handler: attrs => ace =>
      insertText(ace, { replace: ":::mer\n:::" }, 4, true)
  },
  table: {
    handler: attrs => ace => {
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
    }
  },
  toc: {
    handler: attrs => ace =>
      insertText(
        ace,
        { replace: `[TOC${attrs.fold ? " :fold" : ""}]` },
        0,
        true
      )
  },
  todoList: {
    handler: attrs => ace => insertText(ace, { replace: "- [ ] " }, 0, true)
  }
});

export function useCommands(ace: Ref<Ace.Editor | undefined>) {
  const commands: {
    [key: string]: {
      handler: (attrs?: { [key: string]: any }) => void;
      isActive: (attrs?: { [key: string]: any }) => ComputedRef<boolean>;
    };
  } = {};
  const applyHandler = (command: MdCommand, attrs: { [key: string]: any }) => {
    if (ace.value) {
      return command.handler(attrs)(ace.value);
    }
  };
  const applyActive = (command: MdCommand, attrs: { [key: string]: any }) => {
    return computed(() => {
      if (ace.value && command.isActive) {
        return command.isActive(attrs)(ace.value);
      }
      return false;
    });
  };

  const handle = (name: string, command: MdCommand) => {
    commands[name] = {
      handler: attrs => applyHandler(command, attrs || {}),
      isActive: attrs => applyActive(command, attrs || {})
    };
  };

  for (const name in allCommands) {
    handle(name, allCommands[name]);
  }

  return commands;
}

export default allCommands;
