import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req, res) {
  try {
    const filePath = path.join(process.cwd(), 'src/_data/orig.json');
    const rawData = await fs.readFile(filePath, 'utf-8');
    // console.log(rawData)
    const parsed = JSON.parse(rawData);

    const formatDate = (input) => {
      const d = new Date(input);
      return isNaN(d.getTime())
        ? null
        : d.toISOString().replace(/[-:]|(\.\d{3})/g, '').slice(0, 15);
    };

    const escapeText = (text = '') => {
        console.log(text);
        return text
          .replace(/\\/g, '\\\\')
          .replace(/\n/g, '\\n')
          .replace(/,/g, '\\,')
          .replace(/;/g, '\\;');

    }

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//kreativsause//ical export//DE',
      'CALSCALE:GREGORIAN',
      'X-WR-CALNAME:Kreativsause Zeitplan',
      'X-WR-TIMEZONE:Europe/Berlin',
      'BEGIN:VTIMEZONE',
      'TZID:Europe/Berlin',
      'X-LIC-LOCATION:Europe/Berlin',
      'BEGIN:DAYLIGHT',
      'TZOFFSETFROM:+0100',
      'TZOFFSETTO:+0200',
      'TZNAME:CEST',
      'DTSTART:19700329T020000',
      'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
      'END:DAYLIGHT',
      'BEGIN:STANDARD',
      'TZOFFSETFROM:+0200',
      'TZOFFSETTO:+0100',
      'TZNAME:CET',
      'DTSTART:19701025T030000',
      'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
      'END:STANDARD',
      'END:VTIMEZONE',
    ];
    // console.log(parsed.data)
    const wochenplan = parsed.days; // Array.isArray(parsed.days) ? parsed[0] : {};
    const tage = wochenplan;
    let index = 0;
    for (const tag of tage) {
      const eventsAnTag = parsed.data[tag];
      if (!Array.isArray(eventsAnTag)) continue;

      for (const event of eventsAnTag) {
        const start = event.startTimeInt; // ? formatDate(event.startTimeInt) : null;
        const end = event.endTimeInt; // ? formatDate(event.endTimeInt) : null;
        if (!start) {
          console.warn(`[calendar] ${tag}: Event ohne gültige start-Zeit`, event);
          continue;
        }

        lines.push('BEGIN:VEVENT');
        lines.push(`UID:event-${index}@kreativsause.de`);
        lines.push(`DTSTAMP:${start}`);
        lines.push(`DTSTART;TZID=Europe/Berlin:${start}`);
        console.log(lines)
        if (end) lines.push(`DTEND;TZID=Europe/Berlin:${end}`);
        lines.push(`SUMMARY:${escapeText(event.title || 'Unbenannt')}`);
        const description = event.description.join('\n') || '';
        if (description) {
          lines.push(`DESCRIPTION:${escapeText(description)}`);
        }
        if (event.room && event.room.orig) lines.push(`LOCATION:${escapeText(event.room.orig)}`);
        if (event.register) lines.push(`URL:${event.register}`);
        lines.push('END:VEVENT');

        index++;
      }
    }

    lines.push('END:VCALENDAR');

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.status(200).send(lines.join('\r\n'));
  } catch (err) {
    console.error('[calendar] Fehler:', err.message);
    res.status(500).send('Interner Serverfehler beim Erzeugen des Kalenders');
  }
}
