// TEMP: test TTS endpoints for Kannada/Hindi/English (deleted after run).
async function testGoogle(short, text) {
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${short}&q=${encodeURIComponent(text)}`;
  try {
    const res = await fetch(url, {headers: {'User-Agent': 'Mozilla/5.0'}});
    const buf = Buffer.from(await res.arrayBuffer());
    console.log(`GOOGLE ${short}: status=${res.status} type=${res.headers.get('content-type')} bytes=${buf.length}`);
  } catch (e) {
    console.log(`GOOGLE ${short}: ERR ${e instanceof Error ? e.message : e}`);
  }
}
async function testSream(short, text) {
  const voices = {kn: 'Google%20Kannada', hi: 'Google%20%E0%A4%B9%E0%A4%BF%E0%A4%A8%E0%A5%8D%E0%A4%A6%E0%A5%80', en: 'Google%20English%20US'};
  const url = `https://api.streamelements.com/kappa/v2/speech?voice=${voices[short]}&text=${encodeURIComponent(text)}`;
  try {
    const res = await fetch(url, {headers: {'User-Agent': 'Mozilla/5.0'}});
    const buf = Buffer.from(await res.arrayBuffer());
    console.log(`STREAM ${short}: status=${res.status} type=${res.headers.get('content-type')} bytes=${buf.length}`);
  } catch (e) {
    console.log(`STREAM ${short}: ERR ${e instanceof Error ? e.message : e}`);
  }
}
const t = 'ನಮಸ್ಕಾರ, ಇದು ಮೈಸೂರು ದಸರಾ ಪರಿಚಯ.';
const h = 'नमस्ते, यह भारतीय संविधान का परिचय है।';
const e = 'Hello, this is a short narration for testing.';
testGoogle('kn', t).then(() => testGoogle('hi', h)).then(() => testGoogle('en', e))
  .then(() => testSream('kn', t)).then(() => testSream('hi', h)).then(() => testSream('en', e));

