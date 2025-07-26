// api/calendar.js
import { readFile } from 'fs/promises';
import path from 'path';

export const config = {
//   runtime: 'edge',
};

function foldLine(line) {
  // Zeilenumbruch alle 75 Bytes laut RFC 5545
  const result = [];
  while (line.length > 75) {
    result.push(line.slice(0, 75));
    line = ' ' + line.slice(75); // space-indented Fortsetzungszeile
  }
  result.push(line);
  return result.join('\r\n');
}

function escapeICalText(text) {
  return text
    .replace(/\\n/g, '\\n')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

export default async function handler(req) {
  const filePath = path.join(process.cwd(), 'orig.json');
  const raw = await readFile(filePath, 'utf-8');
  const [eventData, days] = JSON.parse(raw);

  const lines = [];

  lines.push('BEGIN:VCALENDAR');
  lines.push('VERSION:2.0');
  lines.push('PRODID:-//kreativsause//ical export//DE');
  lines.push('CALSCALE:GREGORIAN');
  lines.push('X-WR-CALNAME:Kreativsause Zeitplan');
  lines.push('X-WR-TIMEZONE:Europe/Berlin');

  for (const day of days) {
    const entries = eventData[day];
    for (const event of entries) {
      const uid = `${event.slug}-${event.start}`;
      const dtstamp = new Date().toISOString().replace(/[-:]|\.\d{3}/g, '');
      const dtstart = new Date(event.start).toISOString().replace(/[-:]|\.\d{3}/g, '');
      const dtend = new Date(event.end).toISOString().replace(/[-:]|\.\d{3}/g, '');

      const description = [
        event.desc,
        event.location ? `📍 ${event.location}` : '',
        event.speakers?.length ? `🎤 ${event.speakers.join(', ')}` : '',
        event.url ? `🔗 ${event.url}` : ''
      ]
        .filter(Boolean)
        .join('\\n');

      lines.push('BEGIN:VEVENT');
      lines.push(foldLine(`UID:${uid}@kreativsause.de`));
      lines.push(foldLine(`DTSTAMP:${dtstamp}Z`));
      lines.push(foldLine(`DTSTART:${dtstart}Z`));
      lines.push(foldLine(`DTEND:${dtend}Z`));
      lines.push(foldLine(`SUMMARY:${escapeICalText(event.title)}`));
      lines.push(foldLine(`DESCRIPTION:${escapeICalText(description)}`));
      lines.push('END:VEVENT');
    }
  }

  lines.push('END:VCALENDAR');

  return new Response(lines.join('\r\n'), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="kreativsause.ics"',
    },
  });
}
