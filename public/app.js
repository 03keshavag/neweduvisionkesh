/**
 * EduVision frontend — vanilla JS.
 * Submits {topic, language, ageGroup} to POST /api/generate, then polls
 * GET /api/jobs/:id for live progress, and finally shows the video player
 * inline. No page reload, no redirect, no download required.
 */
(() => {
  'use strict';

  const el = (id) => document.getElementById(id);

  const form = el('generate-form');
  const topicInput = el('topic');
  const languageSelect = el('language');
  const ageSelect = el('age-group');
  const topicError = el('topic-error');
  const generateBtn = el('generate-btn');

  const formCard = el('form-card');
  const progressCard = el('progress-card');
  const errorCard = el('error-card');
  const resultCard = el('result-card');

  const stepsList = el('progress-steps');
  const barTrack = el('bar-track');
  const barFill = el('bar-fill');
  const statusLine = el('status-line');

  const errorMessage = el('error-message');
  const againBtn = el('again-btn');
  const player = el('player');
  const resultMeta = el('result-meta');
  const timeInfo = el('time-info');

  // Ordered steps shown in the progress card.
  const STEPS = [
    { key: 'plan', label: 'Designing the animation…' },
    { key: 'lesson', label: 'Generating lesson…' },
    { key: 'tts', label: 'Generating narration…' },
    { key: 'render', label: 'Creating animation…' },
    { key: 'done', label: 'Rendering video…' },
  ];

  let pollTimer = null;
  let jobStartTime = 0;
  let renderStageStartedAt = 0;

  function fmtClock(sec) {
    const s = Math.max(0, Math.round(sec));
    const m = Math.floor(s / 60);
    return m + ':' + String(s % 60).padStart(2, '0');
  }

  // Shows how long generation has taken and, during rendering, an ETA.
  function updateTimeInfo(job) {
    if (!jobStartTime) return;
    const elapsed = (Date.now() - jobStartTime) / 1000;
    let text = '⏱ ' + fmtClock(elapsed) + ' elapsed';
    if (job && job.stage === 'render' && job.stageProgress > 0.02) {
      if (!renderStageStartedAt) renderStageStartedAt = Date.now();
      const renderElapsed = (Date.now() - renderStageStartedAt) / 1000;
      const remaining =
        (renderElapsed / job.stageProgress) * (1 - job.stageProgress);
      text += ' · ETA ~' + fmtClock(remaining);
    } else {
      renderStageStartedAt = 0;
    }
    timeInfo.textContent = job ? text : '';
  }

  function setBusy(value) {
    generateBtn.disabled = value;
    topicInput.disabled = value;
    languageSelect.disabled = value;
    ageSelect.disabled = value;
    generateBtn.textContent = value ? 'Working…' : 'Generate Lesson';
  }

  function show(section, hidden) {
    section.hidden = hidden;
  }

  function resetProgress() {
    stepsList.innerHTML = '';
    for (const step of STEPS) {
      const li = document.createElement('li');
      li.dataset.step = step.key;
      li.innerHTML = '<span class="tick"></span><span>' + step.label + '</span>';
      stepsList.appendChild(li);
    }
  }

  function markStepsUpTo(stageKey) {
    let reachedActive = false;
    for (const li of stepsList.querySelectorAll('li')) {
      const key = li.dataset.step;
      li.classList.remove('done', 'active');
      if (key === stageKey) {
        li.classList.add('active');
        reachedActive = true;
      } else if (!reachedActive) {
        li.classList.add('done');
      }
    }
  }

  function setBar(showBar, progress) {
    show(barTrack, !showBar);
    if (showBar) {
      const pct = Math.max(0, Math.min(1, progress)) * 100;
      barFill.style.width = pct + '%';
    } else {
      barFill.style.width = '0%';
    }
  }

  function renderJobProgress(job) {
    const stage = job.stage;
    if (stage === 'plan') {
      markStepsUpTo('plan');
      setBar(false, 0);
      statusLine.textContent = 'Designing the animated lesson with AI…';
    } else if (stage === 'lesson') {
      markStepsUpTo('lesson');
      setBar(false, 0);
      statusLine.textContent = 'Generating lesson with AI…';
    } else if (stage === 'tts') {
      markStepsUpTo('tts');
      setBar(false, 0);
      statusLine.textContent = 'Generating narration audio…';
    } else if (stage === 'render') {
      markStepsUpTo('render');
      setBar(true, job.stageProgress ?? 0);
      statusLine.textContent =
        job.stageProgress < 0.5
          ? 'Creating the animation…'
          : 'Rendering the video… ' +
            Math.round((job.stageProgress ?? 0) * 100) +
            '%';
    } else {
      markStepsUpTo('done');
      setBar(true, 1);
      statusLine.textContent = 'Finalizing lesson…';
    }
  }

  function showError(message) {
    errorMessage.textContent = message;
    show(errorCard, false);
    errorCard.hidden = false;
  }

  async function pollJob(jobId) {
    let response;
    try {
      response = await fetch('/api/jobs/' + encodeURIComponent(jobId));
    } catch {
      statusLine.textContent = 'Server unreachable — retrying…';
      schedulePoll(jobId);
      return;
    }

    let job;
    try {
      job = await response.json();
    } catch {
      schedulePoll(jobId);
      return;
    }

    if (!job) {
      schedulePoll(jobId);
      return;
    }

    if (job.status === 'working') {
      updateTimeInfo(job);
      renderJobProgress(job);
      schedulePoll(jobId);
      return;
    }

    if (job.status === 'done') {
      completeJob(job);
      return;
    }

    // status === 'error'
    showError(job.error || 'Something went wrong while generating your lesson.');
    setBusy(false);
  }

  function schedulePoll(jobId) {
    pollTimer = setTimeout(() => pollJob(jobId), 900);
  }

  function formatDuration(seconds) {
    if (!seconds) return '';
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return m + ' min ' + String(s).padStart(2, '0') + ' sec';
  }

  function completeJob(job) {
    if (pollTimer) {
      clearTimeout(pollTimer);
      pollTimer = null;
    }
    markStepsUpTo('done');
    setBar(true, 1);
    statusLine.textContent = 'Finalizing lesson…';

    // Short pause so the user sees the final state, then show the player.
    setTimeout(() => {
      resultMeta.textContent =
        (job.title ? job.title + ' · ' : '') +
        (job.duration ? formatDuration(job.duration) : '');
      player.src = job.videoUrl;
      show(resultCard, false);
      setBusy(false);
      statusLine.textContent = 'Your lesson is ready!';
      timeInfo.textContent =
        '⏱ Finished in ' + fmtClock((Date.now() - jobStartTime) / 1000);
      player.play().catch(() => {
        /* autoplay may be blocked — the controls still work */
      });
    }, 600);
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const topic = topicInput.value.trim();
    if (!topic) {
      topicError.hidden = false;
      topicInput.focus();
      return;
    }
    topicError.hidden = true;

    const payload = {
      topic: topic,
      language: languageSelect.value,
      ageGroup: ageSelect.value,
    };

    // Reset UI.
    errorCard.hidden = true;
    resultCard.hidden = true;
    show(progressCard, false);
    resetProgress();
    markStepsUpTo('lesson');
    setBar(false, 0);
    statusLine.textContent = 'Starting…';
    setBusy(true);
    jobStartTime = Date.now();
    renderStageStartedAt = 0;
    timeInfo.textContent = '';

    let res;
    try {
      res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      showError('Could not reach the server. Is it running? (npm run serve)');
      setBusy(false);
      return;
    }

    let data;
    try {
      data = await res.json();
    } catch {
      showError('The server returned an invalid response.');
      setBusy(false);
      return;
    }

    if (!res.ok || !data.jobId) {
      showError(data.error || 'The server could not start generation.');
      setBusy(false);
      return;
    }

    schedulePoll(data.jobId);
  });

  againBtn.addEventListener('click', () => {
    resultCard.hidden = true;
    errorCard.hidden = true;
    player.removeAttribute('src');
    player.load();
  });
})();
