import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req, res) {
  try {
    const filePath = path.join(process.cwd(), 'src/_data/orig.json');
    const rawData = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(rawData);

    const formatDate = (input) => {
      const d = new Date(input);
      return isNaN(d.getTime())
        ? null
        : d.toISOString().replace(/[-:]|(\.\d{3})/g, '').slice(0, 15) + 'Z';
    };

    const escapeText = (text = '') =>
      text
        .replace(/\\/g, '\\\\')
        .replace(/\n/g, '\\n')
        .replace(/,/g, '\\,')
        .replace(/;/g, '\\;');

    const foldLine = (line) => {
      if (line.length <= 75) return line;
      const parts = [];
      let i = 0;
      while (i < line.length) {
        const chunk = line.slice(i, i + 75);
        parts.push(i === 0 ? chunk : ' ' + chunk); // Folgezeilen beginnen mit Leerzeichen
        i += 75;
      }
      return parts.join('\r\n');
    };

    const output = [];

    const pushLine = (line) => output.push(...foldLine(line).split('\r\n'));

    // Kalenderkopf
    pushLine('BEGIN:VCALENDAR');
    pushLine('VERSION:2.0');
    pushLine('PRODID:-//kreativsause//ical export//DE');
    pushLine('CALSCALE:GREGORIAN');
    pushLine('X-WR-CALNAME:Kreativsause Zeitplan');
    pushLine('X-WR-TIMEZONE:Europe/Berlin');
    pushLine('BEGIN:VTIMEZONE');
    pushLine('TZID:Europe/Berlin');
    pushLine('X-LIC-LOCATION:Europe/Berlin');
    pushLine('BEGIN:DAYLIGHT');
    pushLine('TZOFFSETFROM:+0100');
    pushLine('TZOFFSETTO:+0200');
    pushLine('TZNAME:CEST');
    pushLine('DTSTART:19700329T020000');
    pushLine('RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU');
    pushLine('END:DAYLIGHT');
    pushLine('BEGIN:STANDARD');
    pushLine('TZOFFSETFROM:+0200');
    pushLine('TZOFFSETTO:+0100');
    pushLine('TZNAME:CET');
    pushLine('DTSTART:19701025T030000');
    pushLine('RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU');
    pushLine('END:STANDARD');
    pushLine('END:VTIMEZONE');

    const tage = parsed.days;
    let index = 0;

    for (const tag of tage) {
      const eventsAnTag = parsed.data[tag];
      if (!Array.isArray(eventsAnTag)) continue;

      for (const event of eventsAnTag) {
        const start = formatDate(event.startTimeInt);
        const end = formatDate(event.endTimeInt);

        if (!start || !end) {
          console.warn(`[calendar] ${tag}: Ungültige Zeit`, event);
          continue;
        }

        pushLine('BEGIN:VEVENT');
        pushLine(`UID:event-${index}@kreativsause.de`);
        pushLine(`DTSTAMP:${start}`);
        pushLine(`DTSTART;TZID=Europe/Berlin:${start}`);
        pushLine(`DTEND;TZID=Europe/Berlin:${end}`);
        pushLine(`🦌 SUMMARY:${escapeText(event.title || 'Unbenannt')}`);

        const descriptionLines = [];

        // Beschreibung
        if (event.description) {
          const descArray = Array.isArray(event.description)
            ? event.description
            : [event.description];
          descriptionLines.push(...descArray.map(line => `📝 ${line}`));
        }

        // Speaker
        if (Array.isArray(event.speakers) && event.speakers.length > 0) {
          descriptionLines.push('👤 Speaker: ' + event.speakers.join(', '));
        }

        // Raum
        if (event.room?.orig) {
          descriptionLines.push('📍 Ort: ' + event.room.orig);
        }

        // Registrierung
        if (event.register) {
          descriptionLines.push('🔗 Anmeldung: ' + event.register);
        }

        if (descriptionLines.length > 0) {
          pushLine(`DESCRIPTION:${escapeText(descriptionLines.join('\\n'))}`);
        }

        pushLine('END:VEVENT');
        index++;
      }
    }

    pushLine('END:VCALENDAR');

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.status(200).send(output.join('\r\n'));
  } catch (err) {
    console.error('[calendar] Fehler:', err.message);
    res.status(500).send('Interner Serverfehler beim Erzeugen des Kalenders');
  }
}
