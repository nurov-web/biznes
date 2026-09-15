/** Матни ҷавоби ИИ — бе HTML-и хом. */

function splitBold(line: string): Array<{ text: string; strong: boolean }> {
  const parts: Array<{ text: string; strong: boolean }> = [];
  const re = /\*\*([^*]+)\*\*/g;
  let last = 0;
  let match = re.exec(line);
  while (match) {
    if (match.index > last) {
      parts.push({ text: line.slice(last, match.index), strong: false });
    }
    parts.push({ text: match[1] ?? "", strong: true });
    last = match.index + match[0].length;
    match = re.exec(line);
  }
  if (last < line.length) parts.push({ text: line.slice(last), strong: false });
  return parts.filter((row) => row.text.length > 0);
}

export function ChatRichText({ text }: { text: string }) {
  const blocks = text
    .replace(/\r\n/g, "\n")
    .trim()
    .split(/\n{2,}/);
  return (
    <div className="bp-chat-rich">
      {blocks.map((block, index) => {
        const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
        const listed = lines.every((line) => /^\d+[.)]\s+/.test(line) || /^[-•]\s+/.test(line));
        if (listed) {
          return (
            <ol key={index} className="bp-chat-ol">
              {lines.map((line, lineIndex) => {
                const body = line.replace(/^\d+[.)]\s+/, "").replace(/^[-•]\s+/, "");
                return (
                  <li key={lineIndex}>
                    {splitBold(body).map((part, partIndex) =>
                      part.strong ? <strong key={partIndex}>{part.text}</strong> : part.text,
                    )}
                  </li>
                );
              })}
            </ol>
          );
        }
        return (
          <p key={index}>
            {lines.map((line, lineIndex) => (
              <span key={lineIndex}>
                {lineIndex > 0 ? <br /> : null}
                {splitBold(line).map((part, partIndex) =>
                  part.strong ? <strong key={partIndex}>{part.text}</strong> : part.text,
                )}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
