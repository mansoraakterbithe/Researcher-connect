// ============================================================
// 📄 WHAT IS THIS FILE?
// In plain HTML you can write <script> and just run code.
// React does NOT let you do that inside a component directly.
// Instead, React gives you a special tool called "useEffect"
// to run code AFTER the page has been drawn on screen.
//
// 🍰 REAL LIFE EXAMPLE:
// Imagine you bake a cake (the JSX/HTML). useEffect is like
// turning on the cake's candles AFTER the cake is fully baked
// and sitting on the table. You cannot light candles on a cake
// that doesn't exist yet — same with animations on elements
// that haven't been drawn yet.
//
// 📚 WHAT TO LEARN: useEffect, useRef — these are "React Hooks"
// 📋 WHAT TO COPY PASTE: the particle physics maths (nobody
// memorises trigonometry for floating dots — copy it)
// ============================================================

import { useEffect } from "react";
// 🍰 EXAMPLE: useEffect is like a reminder note that says
// "after everything is ready, run this list of tasks"
// 📚 LEARN: this comes from the 'react' library itself

export function useLandingAnimations() {
  // 🍰 EXAMPLE: this whole function is a TOOLBOX. When you call
  // useLandingAnimations() inside your LandingPage, it sets up
  // every animation automatically — like flipping one master
  // switch that turns on all the lights in a house at once.

  useEffect(() => {
    // 🍰 EXAMPLE: everything inside these {} curly braces runs
    // ONE TIME after the page loads — like a "page just opened"
    // alarm going off once.

    // ── 1. PARTICLE BACKGROUND ────────────────────────────
    // 🍰 EXAMPLE: imagine fireflies floating up from the
    // bottom of the screen forever. That's what this does.
    const canvas = document.getElementById("pc");
    if (!canvas) return;
    // 📚 LEARN: "if (!canvas) return" means "if this element
    // doesn't exist, stop here — don't crash the whole app"
    // This is called a SAFETY CHECK — very important habit.

    const ctx = canvas.getContext("2d");
    // 🍰 EXAMPLE: ctx is like picking up a paintbrush.
    // canvas is the blank paper, ctx is what lets you draw on it.

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    // 🍰 EXAMPLE: if you resize your browser window, the canvas
    // (paper) resizes too, so the drawing doesn't look broken.
    // 📚 LEARN: addEventListener = "listen for this event and
    // run this function whenever it happens"

    const colors = [
      "rgba(255,210,0,0.25)",
      "rgba(255,180,0,0.2)",
      "rgba(91,164,230,0.2)",
      "rgba(255,230,100,0.15)",
    ];
    // 🍰 EXAMPLE: a box of 4 different coloured paint tubes
    // the fireflies will randomly pick from

    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height + canvas.height,
      r: Math.random() * 4 + 1,
      speed: Math.random() * 0.7 + 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 0,
      drift: (Math.random() - 0.5) * 0.3,
    }));
    // 🍰 EXAMPLE: Array.from({length: 50}, ...) is like saying
    // "create 50 fireflies, and for each one, roll random dice
    // to decide its starting position, size, speed and colour"
    // x = random horizontal position
    // y = starts below the screen (canvas.height + extra)
    // r = radius (size of the dot)
    // speed = how fast it floats upward
    // drift = slight random left-right wobble
    // 📚 LEARN: Math.random() gives a random decimal between 0 and 1

    let animationFrameId;
    // 🍰 EXAMPLE: this is a "ticket number" for our animation
    // loop, so later we can cancel it cleanly when the page closes
    // (like cancelling a recurring alarm so it doesn't run forever
    // in the background after you've left the page)

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // 🍰 EXAMPLE: wipes the paper clean before drawing again
      // — like an eraser swiping the whole page before redrawing
      // Without this, you'd get thousands of overlapping dots

      particles.forEach((p) => {
        p.y -= p.speed;
        // 🍰 EXAMPLE: every tiny moment, move the firefly UP a
        // little bit. Subtracting from y moves it upward because
        // in computer screens, y=0 is the TOP, not the bottom.

        p.x += p.drift;
        // small left-right wobble each frame

        if (p.y < -10) {
          // 🍰 EXAMPLE: once a firefly floats off the TOP of the
          // screen, teleport it back to the BOTTOM to start again
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
          p.opacity = 0;
        }

        if (p.x < 0 || p.x > canvas.width) p.drift *= -1;
        // 🍰 EXAMPLE: if firefly drifts off the LEFT or RIGHT
        // edge, reverse its drift direction — like a ball
        // bouncing off a wall

        p.opacity = Math.min(1, p.opacity + 0.01);
        // 🍰 EXAMPLE: fireflies slowly FADE IN as they appear,
        // rather than popping in suddenly. Math.min(1, ...) means
        // "never let opacity go above 1 (fully visible)"

        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        // 🍰 EXAMPLE: these 4 lines literally draw one circle
        // (firefly) at position x,y with size r and the chosen colour
        // 📚 LEARN: ctx.arc() draws circles, Math.PI*2 = full circle
      });

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(drawParticles);
      // 🍰 EXAMPLE: requestAnimationFrame says "call this same
      // function again on the very next screen refresh" — your
      // screen refreshes about 60 times per second, so this
      // creates smooth movement, like a flip-book animation
    }
    drawParticles();

    // ── 2. CURSOR GLOW ─────────────────────────────────────
    // 🍰 EXAMPLE: a soft glowing circle that follows your mouse
    // like a torch beam following where you point it
    const cursorGlow = document.getElementById("cg");
    function handleMouseMove(e) {
      if (cursorGlow) {
        cursorGlow.style.left = e.clientX + "px";
        cursorGlow.style.top = e.clientY + "px";
      }
    }
    document.addEventListener("mousemove", handleMouseMove);
    // 🍰 EXAMPLE: e.clientX and e.clientY are the mouse's exact
    // pixel position on screen. We constantly update the glow's
    // position to match — so it "follows" the mouse in real time.

    // ── 3. LETTER BY LETTER TITLE TYPING ───────────────────
    const titleEl = document.getElementById("htitle");
    if (titleEl) {
      titleEl.innerHTML = "";
      const words = [
        { text: "Welcome to ", cls: "" },
        { text: "Researcher", cls: "yc" },
        { text: "\n", cls: "" },
        { text: "Connect", cls: "bc" },
      ];
      // 🍰 EXAMPLE: this is the script for our typewriter.
      // It says "type these words, in this order, in these colours"

      let delay = 1200;
      words.forEach((w) => {
        if (w.text === "\n") {
          titleEl.appendChild(document.createElement("br"));
          return;
        }
        // 🍰 EXAMPLE: \n means "new line" — we insert a real
        // line break element so "Connect" appears on its own row

        w.text.split("").forEach((ch) => {
          // 🍰 EXAMPLE: .split('') breaks a word into single
          // letters, like cutting "CAT" into "C", "A", "T"
          const span = document.createElement("span");
          span.className = "char" + (w.cls ? " " + w.cls : "");
          span.textContent = ch === " " ? "\u00A0" : ch;
          // 🍰 EXAMPLE: \u00A0 is a special "non-breaking space"
          // — normal spaces sometimes get squished by browsers,
          // this one always stays visible
          span.style.animationDelay = delay + "ms";
          titleEl.appendChild(span);
          delay += ch === " " ? 60 : 55;
          // 🍰 EXAMPLE: each letter gets a slightly LATER delay
          // than the one before it — this creates the typewriter
          // "letters appearing one after another" effect
        });
        delay += 80;
        // small extra pause between words
      });
    }

    // ── 4. ANIMATED COUNTING NUMBERS ───────────────────────
    function countUp(elId, target, suffix, startDelay) {
      const el = document.getElementById(elId);
      if (!el) return;
      setTimeout(() => {
        let value = 0;
        const step = target / 100;
        // 🍰 EXAMPLE: if target is 12400, step = 124.
        // We add 124 every tiny moment until we reach 12400.
        // This makes the number visibly COUNT UP instead of
        // just suddenly appearing.
        const timer = setInterval(() => {
          value += step;
          if (value >= target) {
            value = target;
            clearInterval(timer);
            // 🍰 EXAMPLE: once we reach the target, STOP the
            // counting — like a stopwatch that stops at the
            // finish line instead of running forever
          }
          el.textContent = Math.floor(value).toLocaleString() + suffix;
          // 🍰 EXAMPLE: toLocaleString() turns 12400 into
          // "12,400" with a comma — easier to read
        }, 18);
      }, startDelay);
    }

    countUp("s1", 12400, "+", 500);
    countUp("s2", 3200, "+", 700);
    countUp("s3", 180, "+", 900);
    countUp("s4", 8900, "+", 1100);

    // ── 5. SCROLL REVEAL + REVERSE ANIMATION ───────────────
    // 🍰 EXAMPLE: imagine curtains on a window. As you scroll
    // DOWN and a section comes into view, the curtain OPENS
    // (element appears). As you scroll back UP and it leaves
    // the screen, the curtain CLOSES again (element disappears).
    // This is exactly the "jump and reverse" effect you asked for.
    const revealElements = document.querySelectorAll(".reveal");

    revealElements.forEach((el, i) => {
      if (el.classList.contains("cat-card")) {
        const allCards = document.querySelectorAll(".cat-card");
        const idx = Array.from(allCards).indexOf(el);
        el.style.transitionDelay = (idx % 6) * 0.07 + "s";
        // 🍰 EXAMPLE: each category card waits a tiny bit longer
        // than the one before it, so they appear in a STAGGERED
        // wave instead of all popping in at the exact same time
      }
    });

    const revealObserver = new IntersectionObserver(
      (entries) => {
        // 🍰 EXAMPLE: IntersectionObserver is like a security
        // camera that watches a list of elements and reports
        // back "this one just entered the screen" or "this one
        // just left the screen" — without you checking manually
        // every single scroll pixel (which would be very slow).

        entries.forEach((entry) => {
          const el = entry.target;
          if (entry.isIntersecting) {
            // 🍰 EXAMPLE: isIntersecting = true means "this
            // element is currently visible on screen right now"
            el.classList.remove("exit");
            el.classList.add("active");
            // adding "active" class triggers the CSS animation
            // that makes it fade/slide INTO view
          } else {
            const rect = entry.boundingClientRect;
            if (rect.top > 0) {
              // 🍰 EXAMPLE: rect.top > 0 means the element is
              // BELOW the visible screen (hasn't been reached yet)
              // — so we reset it to "not yet shown" state
              el.classList.remove("active");
              el.classList.remove("exit");
            } else {
              // 🍰 EXAMPLE: rect.top <= 0 means the element has
              // scrolled UP and OFF the top of the screen
              // — this triggers the REVERSE exit animation
              el.classList.remove("active");
              el.classList.add("exit");
            }
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
      // 🍰 EXAMPLE: threshold 0.12 means "trigger when 12% of
      // the element is visible" — doesn't wait for the WHOLE
      // thing to show before starting the animation
    );

    revealElements.forEach((el) => revealObserver.observe(el));
    // 🍰 EXAMPLE: tell the security camera to start watching
    // every single element with the "reveal" class

    // ── 6. 3D PARALLAX TILT on hero card ───────────────────
    const heroCard = document.getElementById("heroCard");
    function handleParallax(e) {
      if (!heroCard) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 6;
      const y = (e.clientY / window.innerHeight - 0.5) * 3;
      // 🍰 EXAMPLE: this maths converts mouse position into a
      // small rotation angle. Mouse in the CENTRE = 0 degrees
      // tilt. Mouse near an EDGE = a few degrees of tilt.
      // (e.clientX / window.innerWidth) gives a number from 0
      // to 1. Subtracting 0.5 makes it range from -0.5 to 0.5.
      // Multiplying by 6 limits the maximum tilt to a subtle amount.
      heroCard.style.transform = `perspective(1200px) rotateY(${x}deg) rotateX(${-y}deg)`;
      // 🍰 EXAMPLE: perspective(1200px) creates a 3D viewing
      // distance, like how things look smaller/tilted the further
      // you stand from them in real life. rotateY tilts left-right,
      // rotateX tilts up-down — together they create a "card
      // following your mouse like it's a real 3D object" effect
    }
    document.addEventListener("mousemove", handleParallax);

    // ── 7. CATEGORY SEARCH ──────────────────────────────────
    const searchInput = document.getElementById("catSearch");
    function doSearch() {
      const term = searchInput.value.toLowerCase().trim();
      // 🍰 EXAMPLE: toLowerCase() turns "Physics" into "physics"
      // so searching works no matter how the user types it.
      // trim() removes accidental spaces at the start/end.

      const cards = document.querySelectorAll(".cat-card");
      let foundCount = 0;

      cards.forEach((card) => {
        const name = card.dataset.name || "";
        // 🍰 EXAMPLE: dataset.name reads the data-name="..."
        // attribute we wrote in the JSX earlier

        const matches = !term || name.includes(term);
        // 🍰 EXAMPLE: "!term" means "if search box is empty,
        // show everything". Otherwise, check if the card's name
        // CONTAINS the search word anywhere inside it.

        card.classList.toggle("hidden", !matches);
        // 🍰 EXAMPLE: toggle(class, condition) — if condition is
        // true, ADD the class. If false, REMOVE it. Here: if it
        // does NOT match, hide the card.

        if (matches) foundCount++;
      });

      const noResults = document.getElementById("noResults");
      const searchTermEl = document.getElementById("searchTerm");
      if (searchTermEl) searchTermEl.textContent = term;
      if (noResults) {
        noResults.classList.toggle("show", foundCount === 0 && term !== "");
      }
    }

    if (searchInput) {
      searchInput.addEventListener("input", doSearch);
      // 🍰 EXAMPLE: 'input' event fires EVERY time you type a
      // single character — this is what makes search feel instant
    }

    // ── 8. FILTER CHIPS ──────────────────────────────────────
    const chips = document.querySelectorAll(".chip");
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        // 🍰 EXAMPLE: remove "active" highlight from ALL chips
        // first, then add it ONLY to the one just clicked —
        // this ensures only one chip looks "selected" at a time

        if (searchInput) searchInput.value = "";

        const group = chip.dataset.group;
        const cards = document.querySelectorAll(".cat-card");
        cards.forEach((card) => {
          const show = group === "all" || card.dataset.cat === group;
          card.classList.toggle("hidden", !show);
          if (show) {
            card.classList.remove("active");
            setTimeout(() => card.classList.add("active"), 10);
            // 🍰 EXAMPLE: briefly removing then re-adding "active"
            // forces the entrance animation to PLAY AGAIN, even
            // though the card was already visible before
          }
        });

        const noResults = document.getElementById("noResults");
        if (noResults) noResults.classList.remove("show");
      });
    });

    // ── 9. SHOW ALL / SHOW LESS TOGGLE ──────────────────────
    let showingOnlySix = true;
    const allCards = document.querySelectorAll(".cat-card");
    const viewAllBtn = document.getElementById("viewAllBtn");

    if (viewAllBtn) {
      viewAllBtn.addEventListener("click", () => {
        showingOnlySix = !showingOnlySix;
        // 🍰 EXAMPLE: ! flips true to false and false to true
        // — like flicking a light switch to the opposite position

        allCards.forEach((card, i) => {
          if (i >= 6) {
            card.style.display = showingOnlySix ? "none" : "flex";
            if (!showingOnlySix) {
              card.classList.remove("active");
              setTimeout(() => card.classList.add("active"), (i - 6) * 80);
            }
          }
        });

        viewAllBtn.textContent = showingOnlySix
          ? "Show All Fields ↓"
          : "Show Less ↑";
      });
    }

    // ── 10. CLEANUP ──────────────────────────────────────────
    // 🍰 EXAMPLE: VERY IMPORTANT. When you leave a page, React
    // needs to "turn off" everything we just turned on — like
    // switching off the lights and locking the door when you
    // leave a room. Without this, animations and event listeners
    // keep running in the background even after you've gone to
    // a different page, wasting battery and memory, and can
    // cause bugs.
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mousemove", handleParallax);
      cancelAnimationFrame(animationFrameId);
      revealObserver.disconnect();
    };
    // 📚 LEARN: this returned function is called a "cleanup
    // function" — one of the most important React concepts.
    // Anything you turn ON in useEffect, you must turn OFF here.
  }, []);
  // 🍰 EXAMPLE: that empty [] at the end means "only run this
  // ONE TIME when the page first loads, never again after that"
  // 📚 LEARN: this is called the "dependency array" — empty
  // array = run once. This is one of THE most important React
  // patterns to understand deeply.
}
