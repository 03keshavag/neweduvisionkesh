// TEMP e2e test — submits a lesson and polls until the MP4 is ready.
const BASE = `http://localhost:${process.env.PORT ?? 4000}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const testTopic = process.argv[2] ?? 'Mysuru Dasara';
  const testLang = process.argv[3] ?? 'Kannada';

  // Wait for server.
  let up = false;
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(BASE + '/');
      if (r.ok) { up = true; break; }
    } catch {}
    await sleep(1000);
  }
  if (!up) { console.log('SERVER NOT UP'); process.exit(2); }
  console.log('server up, submitting:', testTopic, '/', testLang);

  const post = await fetch(BASE + '/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic: testTopic, language: testLang, ageGroup: '13-18' }),
  });
  const posted = await post.json();
  console.log('POST status', post.status, '->', JSON.stringify(posted));
  if (!posted.jobId) process.exit(1);
  const jobId = posted.jobId;

  const started = Date.now();
  for (;;) {
    await sleep(2000);
    const j = await (await fetch(BASE + '/api/jobs/' + jobId)).json();
    const el = Math.round((Date.now() - started) / 1000);
    console.log(`[${el}s]`, j.status, j.stage ?? '', j.stageProgress != null ? Math.round(j.stageProgress * 100) + '%' : '');
    if (j.status === 'done') {
      console.log('DONE', JSON.stringify({ title: j.title, videoUrl: j.videoUrl, duration: j.duration }));
      const head = await fetch(BASE + j.videoUrl, { method: 'HEAD' });
      console.log('video HEAD', head.status, 'type=' + head.headers.get('content-type'), 'bytes=' + head.headers.get('content-length'));
      process.exit(0);
    }
    if (j.status === 'error') { console.log('ERROR', JSON.stringify(j)); process.exit(1); }
    if (el > 700) { console.log('TIMEOUT'); process.exit(3); }
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
