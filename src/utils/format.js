export function fmt(date) {
  if (!date) return '-';

  const d = new Date(date);

  if (isNaN(d.getTime())) return '-';

  return d.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function fmtLong(date) {
  if (!date) return '-';

  const d = new Date(date);

  if (isNaN(d.getTime())) return '-';

  const datePart = d.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const timePart = d.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${datePart} เวลา ${timePart} น.`;
}