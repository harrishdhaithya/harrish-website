// ===== Helpers =====
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ===== Mobile Navigation Toggle =====
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// ===== Smooth scroll for navigation links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            const offsetTop = target.offsetTop - 70;
            window.scrollTo({ top: offsetTop, behavior: 'smooth' });
        }
    });
});

// ===== Navbar state + scroll progress + active link + scroll-top =====
const navbar = document.querySelector('.navbar');
const scrollProgress = document.getElementById('scrollProgress');
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-menu a');

function onScroll() {
    const scrollY = window.scrollY;

    // Navbar background
    navbar.classList.toggle('scrolled', scrollY > 40);

    // Scroll progress bar
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress.style.width = (docHeight > 0 ? (scrollY / docHeight) * 100 : 0) + '%';

    // Active nav link
    let current = '';
    sections.forEach(section => {
        if (scrollY >= section.offsetTop - 120) current = section.getAttribute('id');
    });
    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href').slice(1) === current);
    });

    // Scroll-to-top button
    if (scrollTopBtn) scrollTopBtn.style.display = scrollY > 400 ? 'flex' : 'none';
}
window.addEventListener('scroll', onScroll, { passive: true });

// ===== Scroll Reveal with stagger =====
const revealTargets = [
    ...document.querySelectorAll('.section-title'),
    ...document.querySelectorAll('.about-text p'),
    ...document.querySelectorAll('.highlight-item'),
    ...document.querySelectorAll('.timeline-item'),
    ...document.querySelectorAll('.project-card'),
    ...document.querySelectorAll('.skill-category'),
    ...document.querySelectorAll('.contact-cta'),
    ...document.querySelectorAll('.contact-content p'),
    ...document.querySelectorAll('.contact-item')
];

revealTargets.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            const delay = parseInt(entry.target.dataset.delay || (i * 80), 10);
            setTimeout(() => entry.target.classList.add('visible'), delay);
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

// Group stagger: assign incremental delay to siblings entering together
document.querySelectorAll('.projects-grid, .skills-grid, .about-highlights, .timeline, .contact-info').forEach(group => {
    [...group.children].forEach((child, idx) => {
        if (child.classList.contains('reveal')) child.dataset.delay = idx * 90;
    });
});

revealTargets.forEach(el => revealObserver.observe(el));

// ===== Rotating typing effect for hero subtitle =====
const typedRole = document.getElementById('typedRole');
if (typedRole && !prefersReduced) {
    const roles = [
        'secure software.',
        'scalable systems.',
        'high-performance backends.',
        'things that matter.'
    ];
    let roleIndex = 0, charIndex = 0, deleting = false;

    function typeLoop() {
        const word = roles[roleIndex];
        typedRole.textContent = word.substring(0, charIndex);

        if (!deleting && charIndex < word.length) {
            charIndex++;
            setTimeout(typeLoop, 70);
        } else if (!deleting && charIndex === word.length) {
            deleting = true;
            setTimeout(typeLoop, 1600);
        } else if (deleting && charIndex > 0) {
            charIndex--;
            setTimeout(typeLoop, 35);
        } else {
            deleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            setTimeout(typeLoop, 250);
        }
    }
    typeLoop();
} else if (typedRole) {
    typedRole.textContent = 'secure software.';
}

// ===== Custom cursor glow =====
const cursorGlow = document.getElementById('cursorGlow');
if (cursorGlow && window.matchMedia('(pointer: fine)').matches) {
    let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    let tx = cx, ty = cy;

    window.addEventListener('mousemove', (e) => {
        tx = e.clientX;
        ty = e.clientY;
        cursorGlow.style.opacity = '1';
    });
    document.addEventListener('mouseleave', () => cursorGlow.style.opacity = '0');

    (function animateGlow() {
        cx += (tx - cx) * 0.12;
        cy += (ty - cy) * 0.12;
        cursorGlow.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
        requestAnimationFrame(animateGlow);
    })();
}

// ===== 3D tilt on project cards =====
if (!prefersReduced && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const r = card.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            card.style.transform = `perspective(900px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg) translateY(-6px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    // ===== Magnetic buttons =====
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const r = btn.getBoundingClientRect();
            const mx = e.clientX - r.left - r.width / 2;
            const my = e.clientY - r.top - r.height / 2;
            btn.style.transform = `translate(${mx * 0.25}px, ${my * 0.35}px)`;
        });
        btn.addEventListener('mouseleave', () => btn.style.transform = '');
    });
}

// ===== Hero live terminal =====
const terminalBody = document.getElementById('terminalBody');
if (terminalBody) {
    const PROMPT = '<span class="term-prompt">harrish<span class="t-dir"> ~ </span>$</span> ';
    // each step: a typed command followed by its printed output line(s)
    const script = [
        { cmd: 'whoami', out: [{ t: 'harrish_dhaithya' }] },
        { cmd: 'cat about.txt', out: [
            { t: 'Software Engineer · MSc Computing @ DCU' },
            { t: 'Ex-Zoho · Secure Software Engineering' }
        ] },
        { cmd: 'ls skills/', out: [
            { t: 'java   spring-boot   aws   docker', cls: 'files' },
            { t: 'cryptography   postgresql   react', cls: 'files' }
        ] },
        { cmd: './contact --me', out: [
            { t: '↳ open to new opportunities ✓', cls: 'success' }
        ] }
    ];

    const sleep = ms => new Promise(r => setTimeout(r, ms));

    function addLine(html, cls) {
        const el = document.createElement('div');
        el.className = 'term-line' + (cls ? ' ' + cls : '');
        el.innerHTML = html;
        terminalBody.appendChild(el);
        return el;
    }

    async function typeInto(span, text) {
        for (let i = 0; i < text.length; i++) {
            span.textContent += text[i];
            await sleep(40 + Math.random() * 45);
        }
    }

    async function runOnce() {
        terminalBody.innerHTML = '';
        for (const step of script) {
            const line = addLine(PROMPT + '<span class="term-cmd"></span>');
            await sleep(250);
            await typeInto(line.querySelector('.term-cmd'), step.cmd);
            await sleep(280);
            for (const o of step.out) {
                const out = addLine('', 'term-out' + (o.cls ? ' ' + o.cls : ''));
                out.style.opacity = '0';
                out.textContent = o.t;
                requestAnimationFrame(() => {
                    out.style.transition = 'opacity 0.25s ease';
                    out.style.opacity = '1';
                });
                await sleep(180);
            }
            await sleep(420);
        }
        // resting prompt with blinking caret
        addLine(PROMPT + '<span class="term-caret"></span>');
    }

    async function loop() {
        if (prefersReduced) {
            // static rendering, no animation
            for (const step of script) {
                addLine(PROMPT + '<span class="term-cmd">' + step.cmd + '</span>');
                step.out.forEach(o => addLine(o.t, 'term-out' + (o.cls ? ' ' + o.cls : '')));
            }
            return;
        }
        while (true) {
            await runOnce();
            await sleep(7000);
        }
    }

    // start once the hero is on screen
    const startObserver = new IntersectionObserver((entries, obs) => {
        if (entries[0].isIntersecting) {
            obs.disconnect();
            loop();
        }
    }, { threshold: 0.2 });
    startObserver.observe(terminalBody);
}

// ===== Scroll to top button =====
const scrollTopBtn = document.createElement('button');
scrollTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
scrollTopBtn.className = 'scroll-top-btn';
scrollTopBtn.setAttribute('aria-label', 'Scroll to top');
document.body.appendChild(scrollTopBtn);

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Initial paint
onScroll();
