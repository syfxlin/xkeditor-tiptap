export function indentCodeCompensation(raw: string, text: string) {
  const matchIndentToCode = raw.match(/^(\s+)(?:```)/);

  if (matchIndentToCode === null) {
    return text;
  }

  const indentToCode = matchIndentToCode[1];

  return text
    .split("\n")
    .map(node => {
      const matchIndentInNode = node.match(/^\s+/);
      if (matchIndentInNode === null) {
        return node;
      }

      const [indentInNode] = matchIndentInNode;

      if (indentInNode.length >= indentToCode.length) {
        return node.slice(indentToCode.length);
      }

      return node;
    })
    .join("\n");
}

export function splitCells(tableRow: string, count?: any) {
  // ensure that every cell-delimiting pipe has a space
  // before it to distinguish it from an escaped pipe
  const row = tableRow.replace(/\|/g, (match, offset, str) => {
      let escaped = false,
        curr = offset;
      while (--curr >= 0 && str[curr] === "\\") {
        escaped = !escaped;
      }
      if (escaped) {
        // odd number of slashes means | is escaped
        // so we leave it alone
        return "|";
      } else {
        // add space before unescaped |
        return " |";
      }
    }),
    cells = row.split(/ \|/);
  let i = 0;

  if (cells.length > count) {
    cells.splice(count);
  } else {
    while (cells.length < count) {
      cells.push("");
    }
  }

  for (; i < cells.length; i++) {
    // leading or trailing whitespace is ignored per the gfm spec
    cells[i] = cells[i].trim().replace(/\\\|/g, "|");
  }
  return cells;
}

export function findClosingBracket(str: string, b: string) {
  if (str.indexOf(b[1]) === -1) {
    return -1;
  }
  const l = str.length;
  let level = 0,
    i = 0;
  for (; i < l; i++) {
    if (str[i] === "\\") {
      i++;
    } else if (str[i] === b[0]) {
      level++;
    } else if (str[i] === b[1]) {
      level--;
      if (level < 0) {
        return i;
      }
    }
  }
  return -1;
}

export function outputLink(cap: string[], link: any, raw: string) {
  const href = link.href;
  const title = link.title ? escape(link.title) : null;
  // eslint-disable-next-line no-useless-escape
  const text = cap[1].replace(/\\([\[\]])/g, "$1");

  if (cap[0].charAt(0) !== "!") {
    return {
      type: "link",
      raw,
      href,
      title,
      text
    };
  } else {
    return {
      type: "image",
      raw,
      href,
      title,
      text: escape(text)
    };
  }
}

/**
 * mangle email addresses
 */
export function mangle(text: string) {
  let out = "",
    i,
    ch;

  const l = text.length;
  for (i = 0; i < l; i++) {
    ch = text.charCodeAt(i);
    if (Math.random() > 0.5) {
      ch = "x" + ch.toString(16);
    }
    out += "&#" + ch + ";";
  }

  return out;
}

const escapeTest = /[&<>"']/;
const escapeReplace = /[&<>"']/g;
const escapeTestNoEncode = /[<>"']|&(?!#?\w+;)/;
const escapeReplaceNoEncode = /[<>"']|&(?!#?\w+;)/g;
const escapeReplacements: { [key: string]: string } = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};
const getEscapeReplacement = (ch: string) => escapeReplacements[ch];

export function escape(html: string, encode?: boolean) {
  if (encode) {
    if (escapeTest.test(html)) {
      return html.replace(escapeReplace, getEscapeReplacement);
    }
  } else {
    if (escapeTestNoEncode.test(html)) {
      return html.replace(escapeReplaceNoEncode, getEscapeReplacement);
    }
  }

  return html;
}

export function smartypants(text: string) {
  return (
    text
      // em-dashes
      .replace(/---/g, "\u2014")
      // en-dashes
      .replace(/--/g, "\u2013")
      // opening singles
      // eslint-disable-next-line no-useless-escape
      .replace(/(^|[-\u2014/(\[{"\s])'/g, "$1\u2018")
      // closing singles & apostrophes
      .replace(/'/g, "\u2019")
      // opening doubles
      // eslint-disable-next-line no-useless-escape
      .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, "$1\u201c")
      // closing doubles
      .replace(/"/g, "\u201d")
      // ellipses
      .replace(/\.{3}/g, "\u2026")
  );
}
