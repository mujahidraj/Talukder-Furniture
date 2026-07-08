import React from 'react';
import DOMPurify from 'dompurify';

interface FormattedTextProps {
  content?: string | null;
  defaultText: string;
}

const sanitizeHtml = (html: string) => {
  if (typeof window === 'undefined') return html;
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style']
  });
};

export default function FormattedText({ content, defaultText }: FormattedTextProps) {
  if (!content) {
    return <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(defaultText) }} />;
  }

  // Check if content already contains HTML tags (like <p>, <ul>, <br>)
  // If it does, we assume it was authored in a rich text editor and render it as HTML.
  if (/<[a-z][\s\S]*>/i.test(content)) {
    return <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />;
  }

  // Otherwise, parse it as plain text: separating paragraphs by newlines and converting "- " to bullets
  const lines = content.split('\n');
  let inList = false;
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    // Detect bullet points (hyphen, asterisk, or literal bullet)
    const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ');

    if (isBullet) {
      inList = true;
      listItems.push(
        <li key={`li-${i}`} className="ml-5 list-disc mb-1.5 pl-1">
          {trimmed.substring(2)}
        </li>
      );
    } else {
      // If we were building a list, push it now that the list is over
      if (inList) {
        elements.push(
          <ul key={`ul-${i}`} className="mb-5 space-y-1">
            {listItems}
          </ul>
        );
        inList = false;
        listItems = [];
      }
      
      if (trimmed) {
        elements.push(
          <p key={`p-${i}`} className="mb-4 leading-relaxed">
            {trimmed}
          </p>
        );
      }
    }
  });

  // If the text ended while still in a list, push the final list
  if (inList && listItems.length > 0) {
    elements.push(
      <ul key={`ul-end`} className="mb-5 space-y-1">
        {listItems}
      </ul>
    );
  }

  return <div>{elements}</div>;
}
