/* ==========================================================================
   MAGICAL ROMANTIC SPECIAL PERSON WEBSITE INTERACTIVE ENGINE
   Features: Preloader, 11-Page Controller, Canvas Particle Systems (Stars,
   Rose Petals, Butterflies, Fireworks, Confetti, Cursor Sparkle Trail),
   "Aariro Aarariro - Appa Song" MP3 Background Music, Direct UPI Payment Launcher,
   Dual Language Tamil + English, Lightbox, Slideshow, Typewriter, 3D Flip Cards,
   YES/NO Explosion, Payment Modal, Unboxing Gift Box
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. STATE & DOM CACHE
    // ==========================================
    let currentPage = 1;
    const totalPages = 11;
    let isMusicPlaying = false;
    let isSoundFxMuted = false;
    let audioCtx = null;
    let musicInterval = null;
    let slideshowInterval = null;

    // DOM Elements
    const preloader = document.getElementById('preloader');
    const preloaderFill = document.getElementById('preloaderFill');
    const pages = document.querySelectorAll('.page-section');
    const dots = document.querySelectorAll('.dot');
    const openBtn = document.getElementById('openBtn');
    const nextBtns = document.querySelectorAll('.next-btn');
    const replayBtn = document.getElementById('replayBtn');

    const musicToggleBtn = document.getElementById('musicToggleBtn');
    const soundFxBtn = document.getElementById('soundFxBtn');
    const bgAudio = document.getElementById('bgAudio');

    // Lightbox
    const lightboxModal = document.getElementById('lightboxModal');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    let galleryCards = document.querySelectorAll('.gallery-card');
    const galleryGrid = document.getElementById('galleryGrid');
    let currentGalleryIndex = 0;

    // Page 8 YES/NO
    const yesBtn = document.getElementById('yesBtn');
    const noBtn = document.getElementById('noBtn');
    const thinkAgainToast = document.getElementById('thinkAgainToast');

    // Page 9 Payments
    const payCards = document.querySelectorAll('.pay-card');
    const paymentModal = document.getElementById('paymentModal');
    const closePaymentModal = document.getElementById('closePaymentModal');

    // Page 10 Gift Box
    const giftBoxBtn = document.getElementById('giftBoxBtn');
    const revealedChocolate = document.getElementById('revealedChocolate');
    const giftBoxContainer = document.getElementById('giftBoxContainer');

    // ==========================================
    // 2. PRELOADER ENGINE
    // ==========================================
    let progress = 0;
    const loadTimer = setInterval(() => {
        progress += 25;
        if (preloaderFill) preloaderFill.style.width = progress + '%';
        if (progress >= 100) {
            clearInterval(loadTimer);
            setTimeout(() => {
                if (preloader) preloader.classList.add('fade-out');
            }, 400);
        }
    }, 150);

    // ==========================================
    // 3. PAGE NAVIGATION CONTROLLER
    // ==========================================
    function navigateToPage(pageNumber) {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        
        playChimeSound();
        currentPage = pageNumber;
        
        pages.forEach((page, idx) => {
            if (idx + 1 === currentPage) {
                page.classList.add('active');
            } else {
                page.classList.remove('active');
            }
        });

        dots.forEach((dot, idx) => {
            if (idx + 1 === currentPage) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });

        if (currentPage === 2) {
            startGallerySlideshow();
        } else {
            stopGallerySlideshow();
        }

        if (currentPage === 5) {
            startTypewriter();
        }

        if (currentPage === 7) {
            triggerFireworks();
        }

        if (currentPage === 11) {
            triggerConfetti();
        }
    }

    if (openBtn) {
        openBtn.addEventListener('click', () => {
            initAudioContext();
            startMusic();
            navigateToPage(2);
        });
    }

    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const nextPg = parseInt(btn.getAttribute('data-next'));
            navigateToPage(nextPg);
        });
    });

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const pagePg = parseInt(dot.getAttribute('data-page'));
            navigateToPage(pagePg);
        });
    });

    if (replayBtn) {
        replayBtn.addEventListener('click', () => {
            navigateToPage(1);
        });
    }

    // Touch Swipe & Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        if (lightboxModal.classList.contains('active') || paymentModal.classList.contains('active')) {
            if (e.key === 'Escape') {
                closeLightbox();
                paymentModal.classList.remove('active');
            }
            if (e.key === 'ArrowLeft') showPrevLightbox();
            if (e.key === 'ArrowRight') showNextLightbox();
            return;
        }

        if (e.key === 'ArrowRight' || e.key === 'Space') {
            if (currentPage < totalPages) navigateToPage(currentPage + 1);
        } else if (e.key === 'ArrowLeft') {
            if (currentPage > 1) navigateToPage(currentPage - 1);
        }
    });

    let touchStartX = 0;
    let touchEndX = 0;
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        if (lightboxModal.classList.contains('active') || paymentModal.classList.contains('active')) return;
        if (touchStartX - touchEndX > 50) {
            if (currentPage < totalPages) navigateToPage(currentPage + 1);
        } else if (touchEndX - touchStartX > 50) {
            if (currentPage > 1) navigateToPage(currentPage - 1);
        }
    }, { passive: true });

    // ==========================================
    // 4. GALLERY & LIGHTBOX
    // ==========================================
    function bindGalleryEvents() {
        galleryCards = document.querySelectorAll('.gallery-card');
        galleryCards.forEach((card, idx) => {
            card.onclick = () => {
                currentGalleryIndex = idx;
                openLightbox(card);
            };
        });
    }
    bindGalleryEvents();

    function openLightbox(card) {
        playChimeSound();
        const src = card.getAttribute('data-src');
        const caption = card.getAttribute('data-caption');
        lightboxImg.src = src;
        lightboxCaption.textContent = caption || '';
        lightboxModal.classList.add('active');
    }

    function closeLightbox() {
        lightboxModal.classList.remove('active');
    }

    function showPrevLightbox() {
        if (galleryCards.length === 0) return;
        currentGalleryIndex = (currentGalleryIndex - 1 + galleryCards.length) % galleryCards.length;
        openLightbox(galleryCards[currentGalleryIndex]);
    }

    function showNextLightbox() {
        if (galleryCards.length === 0) return;
        currentGalleryIndex = (currentGalleryIndex + 1) % galleryCards.length;
        openLightbox(galleryCards[currentGalleryIndex]);
    }

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', showPrevLightbox);
    if (lightboxNext) lightboxNext.addEventListener('click', showNextLightbox);

    function startGallerySlideshow() {
        stopGallerySlideshow();
        slideshowInterval = setInterval(() => {
            if (currentPage !== 2 || lightboxModal.classList.contains('active') || galleryCards.length === 0) return;
            currentGalleryIndex = (currentGalleryIndex + 1) % galleryCards.length;
            galleryCards.forEach((card, i) => {
                if (i === currentGalleryIndex) {
                    card.style.borderColor = 'var(--pink-primary)';
                    card.style.transform = 'scale(1.05)';
                } else {
                    card.style.borderColor = 'var(--glass-border)';
                    card.style.transform = 'scale(1)';
                }
            });
        }, 3000);
    }

    function stopGallerySlideshow() {
        if (slideshowInterval) {
            clearInterval(slideshowInterval);
            slideshowInterval = null;
        }
    }

    // ==========================================
    // 5. PAGE 5: TYPEWRITER MECHANIC
    // ==========================================
    const sweetMessages = [
        "You are one of the most precious people in my life. ❤️",
        "Thank you for always being yourself. ✨",
        "Your happiness means a lot to me. 😊",
        "I wish your life is filled with endless smiles. 🌸",
        "You deserve love, respect, success, and peace. 💖"
    ];
    let msgIdx = 0;
    let charIdx = 0;
    let typewriterTimer = null;
    const typewriterTextEl = document.getElementById('typewriterText');
    const tDots = document.querySelectorAll('.t-dot');

    function startTypewriter() {
        if (typewriterTimer) clearTimeout(typewriterTimer);
        msgIdx = 0;
        charIdx = 0;
        typeNextChar();
    }

    function typeNextChar() {
        const currentMsg = sweetMessages[msgIdx];
        if (typewriterTextEl) {
            typewriterTextEl.textContent = currentMsg.substring(0, charIdx);
        }

        updateTDots();

        if (charIdx < currentMsg.length) {
            charIdx++;
            typewriterTimer = setTimeout(typeNextChar, 50);
        } else {
            typewriterTimer = setTimeout(() => {
                msgIdx = (msgIdx + 1) % sweetMessages.length;
                charIdx = 0;
                typeNextChar();
            }, 3000);
        }
    }

    function updateTDots() {
        tDots.forEach((dot, idx) => {
            if (idx === msgIdx) dot.classList.add('active');
            else dot.classList.remove('active');
        });
    }

    tDots.forEach(dot => {
        dot.addEventListener('click', () => {
            msgIdx = parseInt(dot.getAttribute('data-msg'));
            charIdx = 0;
            if (typewriterTimer) clearTimeout(typewriterTimer);
            typeNextChar();
        });
    });

    // ==========================================
    // 6. PAGE 6: 3D FLIP ADVICE CARDS
    // ==========================================
    const flipCards = document.querySelectorAll('.flip-card');
    flipCards.forEach(card => {
        card.addEventListener('click', () => {
            playChimeSound();
            card.classList.toggle('flipped');
        });
    });

    // ==========================================
    // 7. PAGE 8: YES / NO INTERACTION
    // ==========================================
    if (noBtn) {
        noBtn.addEventListener('click', () => {
            playChimeSound();
            if (thinkAgainToast) {
                thinkAgainToast.classList.add('show');
                setTimeout(() => {
                    thinkAgainToast.classList.remove('show');
                }, 2500);
            }
        });
    }

    if (yesBtn) {
        yesBtn.addEventListener('click', () => {
            playChimeSound();
            triggerHeartExplosion();
            setTimeout(() => {
                navigateToPage(9);
            }, 1800);
        });
    }

    // ==========================================
    // 8. PAGE 9: DIRECT UPI PAYMENT & MODAL
    // ==========================================
    payCards.forEach(card => {
        card.addEventListener('click', () => {
            playChimeSound();
            const upiUrl = card.getAttribute('data-upi');
            if (upiUrl) {
                try {
                    window.location.href = upiUrl;
                } catch(e) {}
            }
            if (paymentModal) paymentModal.classList.add('active');
        });
    });

    if (closePaymentModal) {
        closePaymentModal.addEventListener('click', () => {
            if (paymentModal) paymentModal.classList.remove('active');
            navigateToPage(10);
        });
    }

    // ==========================================
    // 9. PAGE 10: UNBOXING GIFT BOX
    // ==========================================
    if (giftBoxBtn) {
        giftBoxBtn.addEventListener('click', () => {
            playChimeSound();
            giftBoxBtn.classList.add('open');
            triggerConfetti();
            
            setTimeout(() => {
                if (giftBoxContainer) giftBoxContainer.style.display = 'none';
                if (revealedChocolate) revealedChocolate.classList.remove('hidden');
            }, 800);
        });
    }

    // ==========================================
    // 10. AUDIO ENGINE & APPA SONG MUSIC PLAYER
    // ==========================================
    function initAudioContext() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContext();
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    function playChimeSound() {
        if (isSoundFxMuted || !audioCtx) return;
        try {
            const now = audioCtx.currentTime;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(659.25, now);
            osc.frequency.exponentialRampToValueAtTime(987.77, now + 0.15);

            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start(now);
            osc.stop(now + 0.35);
        } catch (e) {}
    }

    function startMusic() {
        isMusicPlaying = true;
        musicToggleBtn.classList.add('playing');

        if (bgAudio) {
            bgAudio.play().then(() => {
                console.log("Playing Appa Song MP3");
            }).catch(e => {
                console.log("Playback fallback synth");
                playRomanticChord();
                if (musicInterval) clearInterval(musicInterval);
                musicInterval = setInterval(playRomanticChord, 4000);
            });
        }
    }

    function stopMusic() {
        isMusicPlaying = false;
        musicToggleBtn.classList.remove('playing');
        if (bgAudio) bgAudio.pause();
        if (musicInterval) {
            clearInterval(musicInterval);
            musicInterval = null;
        }
    }

    function toggleMusic() {
        initAudioContext();
        if (isMusicPlaying) stopMusic();
        else startMusic();
    }

    if (musicToggleBtn) musicToggleBtn.addEventListener('click', toggleMusic);
    if (soundFxBtn) {
        soundFxBtn.addEventListener('click', () => {
            isSoundFxMuted = !isSoundFxMuted;
            if (isSoundFxMuted) soundFxBtn.innerHTML = '<i class="fas fa-volume-xmark"></i>';
            else soundFxBtn.innerHTML = '<i class="fas fa-volume-high"></i>';
        });
    }

    const romanticChords = [
        [329.63, 392.00, 493.88, 659.25],
        [261.63, 329.63, 392.00, 523.25],
        [293.66, 369.99, 440.00, 587.33],
        [246.94, 311.13, 369.99, 493.88]
    ];
    let chordIdx = 0;

    function playRomanticChord() {
        if (!isMusicPlaying || !audioCtx) return;
        try {
            const now = audioCtx.currentTime;
            const notes = romanticChords[chordIdx];
            chordIdx = (chordIdx + 1) % romanticChords.length;

            notes.forEach((freq, idx) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.14);

                gain.gain.setValueAtTime(0.001, now + idx * 0.14);
                gain.gain.linearRampToValueAtTime(0.035, now + idx * 0.14 + 0.4);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.14 + 3.8);

                osc.connect(gain);
                gain.connect(audioCtx.destination);

                osc.start(now + idx * 0.14);
                osc.stop(now + idx * 0.14 + 3.9);
            });
        } catch (e) {}
    }

    // ==========================================
    // 11. DYNAMIC CANVAS PARTICLE ENGINES
    // ==========================================
    const pCanvas = document.getElementById('particleCanvas');
    const pCtx = pCanvas.getContext('2d');
    let pWidth = pCanvas.width = window.innerWidth;
    let pHeight = pCanvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        pWidth = pCanvas.width = window.innerWidth;
        pHeight = pCanvas.height = window.innerHeight;
    });

    class StarParticle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * pWidth;
            this.y = Math.random() * pHeight;
            this.size = Math.random() * 2.5 + 1;
            this.speedY = -Math.random() * 0.5 - 0.2;
            this.opacity = Math.random() * 0.7 + 0.2;
            this.color = Math.random() > 0.5 ? '#ffd700' : '#ff80bf';
        }
        update() {
            this.y += this.speedY;
            if (this.y < -10) { this.reset(); this.y = pHeight + 10; }
        }
        draw() {
            pCtx.save();
            pCtx.globalAlpha = this.opacity;
            pCtx.fillStyle = this.color;
            pCtx.beginPath();
            pCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            pCtx.fill();
            pCtx.restore();
        }
    }
    const starParticles = Array.from({ length: 50 }, () => new StarParticle());

    function animateStars() {
        pCtx.clearRect(0, 0, pWidth, pHeight);
        starParticles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animateStars);
    }
    animateStars();

    // Canvas 2: Falling Rose Petals
    const petalsCanvas = document.getElementById('petalsCanvas');
    const petalsCtx = petalsCanvas.getContext('2d');
    petalsCanvas.width = window.innerWidth;
    petalsCanvas.height = window.innerHeight;

    class Petal {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * petalsCanvas.width;
            this.y = -20;
            this.size = Math.random() * 12 + 8;
            this.speedY = Math.random() * 1.5 + 0.8;
            this.speedX = Math.sin(Math.random() * Math.PI) * 1.2;
            this.rotation = Math.random() * 360;
            this.rotSpeed = (Math.random() - 0.5) * 2;
            this.opacity = Math.random() * 0.6 + 0.3;
        }
        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            this.rotation += this.rotSpeed;
            if (this.y > petalsCanvas.height + 20) this.reset();
        }
        draw() {
            petalsCtx.save();
            petalsCtx.translate(this.x, this.y);
            petalsCtx.rotate(this.rotation * Math.PI / 180);
            petalsCtx.globalAlpha = this.opacity;
            petalsCtx.fillStyle = '#ff4b72';
            petalsCtx.beginPath();
            petalsCtx.ellipse(0, 0, this.size, this.size / 2, Math.PI / 4, 0, 2 * Math.PI);
            petalsCtx.fill();
            petalsCtx.restore();
        }
    }
    const petals = Array.from({ length: 25 }, () => new Petal());

    function animatePetals() {
        petalsCtx.clearRect(0, 0, petalsCanvas.width, petalsCanvas.height);
        petals.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animatePetals);
    }
    animatePetals();

    // Canvas 3: Cursor Sparkle Trail
    const sCanvas = document.getElementById('sparkleTrailCanvas');
    const sCtx = sCanvas.getContext('2d');
    sCanvas.width = window.innerWidth;
    sCanvas.height = window.innerHeight;

    let sparkles = [];
    document.addEventListener('mousemove', (e) => {
        for (let i = 0; i < 2; i++) {
            sparkles.push({
                x: e.clientX,
                y: e.clientY,
                size: Math.random() * 4 + 2,
                speedX: (Math.random() - 0.5) * 2,
                speedY: (Math.random() - 0.5) * 2,
                life: 1,
                color: Math.random() > 0.5 ? '#ffd700' : '#ff80bf'
            });
        }
    });

    function animateSparkles() {
        sCtx.clearRect(0, 0, sCanvas.width, sCanvas.height);
        sparkles.forEach((s, idx) => {
            s.x += s.speedX;
            s.y += s.speedY;
            s.life -= 0.03;
            if (s.life <= 0) sparkles.splice(idx, 1);
            else {
                sCtx.save();
                sCtx.globalAlpha = s.life;
                sCtx.fillStyle = s.color;
                sCtx.beginPath();
                sCtx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                sCtx.fill();
                sCtx.restore();
            }
        });
        requestAnimationFrame(animateSparkles);
    }
    animateSparkles();

    // Canvas 4: Fireworks (Page 7)
    const fCanvas = document.getElementById('fireworksCanvas');
    const fCtx = fCanvas.getContext('2d');
    fCanvas.width = window.innerWidth;
    fCanvas.height = window.innerHeight;
    let fwParticles = [];

    function triggerFireworks() {
        fwParticles = [];
        for (let i = 0; i < 80; i++) {
            fwParticles.push({
                x: fCanvas.width / 2,
                y: fCanvas.height / 2,
                angle: Math.random() * Math.PI * 2,
                speed: Math.random() * 8 + 2,
                life: 1,
                color: ['#ffd700', '#ff4b72', '#ffffff', '#ff80bf'][Math.floor(Math.random() * 4)]
            });
        }
        animateFireworks();
    }

    function animateFireworks() {
        fCtx.clearRect(0, 0, fCanvas.width, fCanvas.height);
        fwParticles.forEach((p, idx) => {
            p.x += Math.cos(p.angle) * p.speed;
            p.y += Math.sin(p.angle) * p.speed;
            p.life -= 0.02;
            if (p.life <= 0) fwParticles.splice(idx, 1);
            else {
                fCtx.save();
                fCtx.globalAlpha = p.life;
                fCtx.fillStyle = p.color;
                fCtx.beginPath();
                fCtx.arc(p.x, p.y, 3, 0, Math.PI * 2);
                fCtx.fill();
                fCtx.restore();
            }
        });
        if (fwParticles.length > 0) requestAnimationFrame(animateFireworks);
    }

    // Canvas 5: Heart Explosion (Page 8 YES)
    function triggerHeartExplosion() {
        for (let i = 0; i < 60; i++) {
            const h = document.createElement('div');
            h.style.position = 'fixed';
            h.style.left = '50%';
            h.style.top = '50%';
            h.style.fontSize = (Math.random() * 2 + 1) + 'rem';
            h.style.color = Math.random() > 0.5 ? '#ff4b72' : '#ffd700';
            h.style.pointerEvents = 'none';
            h.style.zIndex = '999';
            h.innerHTML = '<i class="fas fa-heart"></i>';
            document.body.appendChild(h);

            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 300 + 100;
            const tx = Math.cos(angle) * dist;
            const ty = Math.sin(angle) * dist;

            h.animate([
                { transform: 'translate(-50%, -50%) scale(0.5)', opacity: 1 },
                { transform: `translate(${tx}px, ${ty}px) scale(1.5)`, opacity: 0 }
            ], {
                duration: 1500,
                easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
            });

            setTimeout(() => h.remove(), 1500);
        }
    }

    // Canvas 6: Confetti Cannon (Page 10 & 11)
    const cCanvas = document.getElementById('confettiCanvas');
    const cCtx = cCanvas.getContext('2d');
    cCanvas.width = window.innerWidth;
    cCanvas.height = window.innerHeight;
    let confettiList = [];

    function triggerConfetti() {
        confettiList = [];
        for (let i = 0; i < 100; i++) {
            confettiList.push({
                x: Math.random() * cCanvas.width,
                y: -20,
                size: Math.random() * 8 + 4,
                speedY: Math.random() * 4 + 2,
                speedX: (Math.random() - 0.5) * 2,
                color: ['#ffd700', '#ff4b72', '#ffffff', '#ff80bf'][Math.floor(Math.random() * 4)],
                rot: Math.random() * 360
            });
        }
        animateConfetti();
    }

    function animateConfetti() {
        cCtx.clearRect(0, 0, cCanvas.width, cCanvas.height);
        confettiList.forEach((c, idx) => {
            c.y += c.speedY;
            c.x += c.speedX;
            c.rot += 5;
            if (c.y > cCanvas.height + 20) confettiList[idx].y = -20;

            cCtx.save();
            cCtx.translate(c.x, c.y);
            cCtx.rotate(c.rot * Math.PI / 180);
            cCtx.fillStyle = c.color;
            cCtx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size);
            cCtx.restore();
        });
        if (confettiList.length > 0) requestAnimationFrame(animateConfetti);
    }
});
