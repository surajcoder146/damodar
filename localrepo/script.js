/* ============================================
   LUMINOUS BLOOM — LOADING & LOGIN LOGIC
   ============================================ */

(function () {
  'use strict';

  // ---- DOM refs ----
  const loadingScreen = document.getElementById('loading-screen');
  const loginPage = document.getElementById('login-page');
  const progressFill = document.getElementById('progress-fill');
  const progressPercent = document.getElementById('progress-percent');
  const statusMsg = document.getElementById('status-msg');

  // ---- Petal configuration ----
  const outerConfig = [
    { el: document.querySelector('.op0'), yAngle: 0 },
    { el: document.querySelector('.op1'), yAngle: 45 },
    { el: document.querySelector('.op2'), yAngle: 90 },
    { el: document.querySelector('.op3'), yAngle: 135 },
    { el: document.querySelector('.op4'), yAngle: 180 },
    { el: document.querySelector('.op5'), yAngle: 225 },
    { el: document.querySelector('.op6'), yAngle: 270 },
    { el: document.querySelector('.op7'), yAngle: 315 },
  ];

  const innerConfig = [
    { el: document.querySelector('.ip0'), yAngle: 30 },
    { el: document.querySelector('.ip1'), yAngle: 90 },
    { el: document.querySelector('.ip2'), yAngle: 150 },
    { el: document.querySelector('.ip3'), yAngle: 210 },
    { el: document.querySelector('.ip4'), yAngle: 270 },
    { el: document.querySelector('.ip5'), yAngle: 330 },
  ];

  // ---- Status messages ----
  const messages = [
    'Awakening the bloom...',
    'Unfolding petals...',
    'Igniting the core...',
    'Radiating warmth...',
    'Almost in full bloom...',
    'Your garden awaits...',
  ];

  let messageIndex = 0;

  // ---- Set SVG gradient ----
  function setupSvgGradient() {
    const svg = document.querySelector('.progress-ring');
    if (!svg) return;
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const linearGrad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    linearGrad.setAttribute('id', 'progress-grad');
    linearGrad.setAttribute('x1', '0%');
    linearGrad.setAttribute('y1', '0%');
    linearGrad.setAttribute('x2', '100%');
    linearGrad.setAttribute('y2', '100%');

    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#ff6b9d');

    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', '#ffa07a');

    linearGrad.appendChild(stop1);
    linearGrad.appendChild(stop2);
    defs.appendChild(linearGrad);
    svg.prepend(defs);
  }
  setupSvgGradient();

  // ---- Easing ----
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  // ---- Apply transforms to all petals ----
  function setPetalBloom(percent) {
    const t = Math.min(percent / 100, 1);
    const eased = easeOutCubic(t);

    // Outer: 78° closed → 14° open, translateZ 0 → 22px
    const oAngle = 78 - (78 - 14) * eased;
    const oZ = eased * 22;

    outerConfig.forEach(({ el, yAngle }) => {
      if (el) {
        el.style.transform = `rotateY(${yAngle}deg) rotateX(${oAngle}deg) translateZ(${oZ}px)`;
      }
    });

    // Inner: 80° closed → 22° open, translateZ 0 → 18px
    const iAngle = 80 - (80 - 22) * eased;
    const iZ = eased * 18;

    innerConfig.forEach(({ el, yAngle }) => {
      if (el) {
        el.style.transform = `rotateY(${yAngle}deg) rotateX(${iAngle}deg) translateZ(${iZ}px)`;
      }
    });

    // Update core glow
    const coreGlow = document.querySelector('.core-glow');
    if (coreGlow) {
      const scale = 0.95 + eased * 0.15;
      const opacity = 0.4 + eased * 0.6;
      coreGlow.style.transform = `scale(${scale})`;
      coreGlow.style.opacity = opacity;
    }

    // Update pistil brightness
    const pistil = document.querySelector('.core-pistil');
    if (pistil) {
      const shadowIntensity = 0.2 + eased * 0.5;
      pistil.style.boxShadow = `0 0 ${20 + eased * 40}px rgba(255, 215, 0, ${shadowIntensity}), inset 0 -4px 8px rgba(0,0,0,0.2), inset 0 4px 8px rgba(255,255,255,${0.2 + eased * 0.2})`;
    }
  }

  // ---- Update progress ----
  function updateProgress(value) {
    const percent = Math.round(value);

    progressFill.setAttribute('stroke-dashoffset', 100 - value);
    progressPercent.textContent = percent;

    // Status messages
    const msgIdx = Math.min(
      Math.floor((value / 100) * messages.length),
      messages.length - 1
    );
    if (msgIdx !== messageIndex) {
      messageIndex = msgIdx;
      statusMsg.textContent = messages[msgIdx];
      statusMsg.style.transform = 'translateY(-4px)';
      statusMsg.style.opacity = '0';
      requestAnimationFrame(() => {
        statusMsg.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        statusMsg.style.transform = 'translateY(0)';
        statusMsg.style.opacity = '1';
      });
    }

    setPetalBloom(value);
  }

  // ---- Loading sequence ----
  function startLoading() {
    // Set initial closed state
    setPetalBloom(0);

    const steps = 100;
    let step = 0;

    function tick() {
      step++;
      const rawProgress = (step / steps) * 100;

      // Eased: 0-58% then 58-100%
      const eased = rawProgress < 50
        ? (rawProgress / 50) * 58
        : 58 + ((rawProgress - 50) / 50) * 42;

      updateProgress(Math.min(Math.round(eased), 100));

      if (step < steps) {
        const delay = 38 * (Math.random() * 0.5 + 0.75);
        setTimeout(tick, delay);
      } else {
        updateProgress(100);
        setTimeout(onLoadingComplete, 700);
      }
    }

    setTimeout(tick, 500);
  }

  // ---- Transition to login ----
  function onLoadingComplete() {
    statusMsg.textContent = 'Fully bloomed.';
    statusMsg.style.color = '#ffb6d9';

    const flower = document.getElementById('flower');
    if (flower) {
      flower.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
      flower.style.transform = 'scale(1.06)';

      setTimeout(() => {
        flower.style.transform = 'scale(1)';
      }, 400);
    }

    setTimeout(() => {
      loadingScreen.classList.add('hidden');
      loginPage.classList.add('visible');
    }, 900);
  }

  // ---- Handle login form ----
  function setupLoginForm() {
    const form = document.getElementById('login-form');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = form.querySelector('.login-btn');
      const originalText = btn.innerHTML;

      btn.innerHTML = 'SIGNING IN...';
      btn.disabled = true;

      setTimeout(() => {
        btn.innerHTML = 'WELCOME  ✦';
        btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';

        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.background = '';
          btn.disabled = false;
        }, 2000);
      }, 1500);
    });
  }

  // ---- Init ----
  function init() {
    setupLoginForm();
    requestAnimationFrame(() => {
      requestAnimationFrame(startLoading);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

