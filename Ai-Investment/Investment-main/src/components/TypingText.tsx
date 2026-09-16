import { useEffect, useState } from 'react';

type Props = {
  text: string;
  speed?: number;
};

export function TypingText({ text, speed = 4 }: Props) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    let index = 0;

    const interval = setInterval(() => {
      // Append characters one by one
      setDisplayedText((prev) => prev + text.charAt(index));
      index++;

      if (index >= text.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <p className="text-xs leading-relaxed text-zinc-300 whitespace-pre-wrap font-sans">
      {displayedText}
      {isTyping && (
        <span className="inline-block w-1.5 h-3.5 bg-primary ml-0.5 animate-pulse shrink-0 align-middle" />
      )}
    </p>
  );
}
