import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

export function sanitizeInput(data) {
  if (typeof data === 'string') {
    return DOMPurify.sanitize(data);
  } else if (Array.isArray(data)) {
    return data.map(sanitizeInput);
  } else if (data && typeof data === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  return data;
}
