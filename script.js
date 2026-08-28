/* ============================================================
   LAKSHMI AUTO AGENCY — INTERACTIONS & ANIMATIONS
   ============================================================ */

(function() {
  'use strict';

  // ============================================================
  // NAVBAR — Scroll Effects
  // ============================================================
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  function handleNavbarScroll() {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });

  // ============================================================
  // SCROLL-DRIVEN VIDEO ANIMATION (Apple-style)
  // ============================================================
  const scrollVideoSection = document.getElementById('scrollVideo');
  const scrollCanvas = document.getElementById('scrollCanvas');
  const scrollCtx = scrollCanvas ? scrollCanvas.getContext('2d') : null;
  const scrollProgressFill = document.getElementById('scrollProgressFill');
  const scrollVideoContent = document.querySelector('.scroll-video-content');
  const FRAME_COUNT = 100;
  const frameImages = [];
  let framesLoaded = 0;
  let currentFrame = -1;

  // Preload all frames
  function preloadFrames() {
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      const paddedIndex = String(i).padStart(3, '0');
      img.src = 'images/frames/f' + paddedIndex + '.jpg';
      img.onload = function() {
        framesLoaded++;
        // Draw first frame when it's loaded
        if (i === 0 && scrollCanvas) {
          resizeCanvas();
          drawFrame(0);
        }
      };
      frameImages[i] = img;
    }
  }

  function resizeCanvas() {
    if (!scrollCanvas) return;
    scrollCanvas.width = window.innerWidth;
    scrollCanvas.height = window.innerHeight;
  }

  function drawFrame(frameIndex) {
    if (!scrollCtx || !frameImages[frameIndex] || !frameImages[frameIndex].complete) return;

    const img = frameImages[frameIndex];
    const canvas = scrollCanvas;

    scrollCtx.clearRect(0, 0, canvas.width, canvas.height);

    // Scale image to cover canvas (like object-fit: cover)
    const imgRatio = img.width / img.height;
    const canvasRatio = canvas.width / canvas.height;
    let drawWidth, drawHeight, offsetX, offsetY;

    if (canvasRatio > imgRatio) {
      drawWidth = canvas.width;
      drawHeight = canvas.width / imgRatio;
      offsetX = 0;
      offsetY = (canvas.height - drawHeight) / 2;
    } else {
      drawHeight = canvas.height;
      drawWidth = canvas.height * imgRatio;
      offsetX = (canvas.width - drawWidth) / 2;
      offsetY = 0;
    }

    scrollCtx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }

  function handleScrollVideo() {
    if (!scrollVideoSection || !scrollCanvas) return;

    const rect = scrollVideoSection.getBoundingClientRect();
    const sectionHeight = scrollVideoSection.offsetHeight - window.innerHeight;
    const scrolled = -rect.top;
    const progress = Math.max(0, Math.min(1, scrolled / sectionHeight));

    // Calculate which frame to show
    const frameIndex = Math.min(FRAME_COUNT - 1, Math.floor(progress * FRAME_COUNT));

    if (frameIndex !== currentFrame && frameIndex >= 0) {
      currentFrame = frameIndex;
      requestAnimationFrame(function() {
        drawFrame(frameIndex);
      });
    }

    // Update progress bar
    if (scrollProgressFill) {
      scrollProgressFill.style.width = (progress * 100) + '%';
    }

    // Show text overlay when animation is mostly complete
    if (scrollVideoContent) {
      if (progress > 0.7) {
        scrollVideoContent.classList.add('show');
      } else {
        scrollVideoContent.classList.remove('show');
      }
    }
  }

  window.addEventListener('scroll', handleScrollVideo, { passive: true });
  window.addEventListener('resize', function() {
    resizeCanvas();
    if (currentFrame >= 0) drawFrame(currentFrame);
  });

  // Initialize
  if (scrollCanvas) {
    preloadFrames();
    resizeCanvas();
  }

  // ============================================================
  // MOBILE MENU
  // ============================================================
  const hamburger = document.getElementById('navHamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  hamburger.addEventListener('click', function() {
    this.classList.toggle('active');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });

  window.closeMobileMenu = function() {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  };

  // ============================================================
  // SCROLL REVEAL ANIMATIONS
  // ============================================================
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  const revealObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Don't unobserve to allow re-animation if needed
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(function(el) {
    revealObserver.observe(el);
  });

  // ============================================================
  // ANIMATED COUNTER
  // ============================================================
  const counters = document.querySelectorAll('[data-count]');
  let countersAnimated = false;

  const counterObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting && !countersAnimated) {
        countersAnimated = true;
        animateCounters();
      }
    });
  }, { threshold: 0.3 });

  counters.forEach(function(counter) {
    counterObserver.observe(counter);
  });

  function animateCounters() {
    counters.forEach(function(counter) {
      const target = parseFloat(counter.getAttribute('data-count'));
      const isDecimal = target % 1 !== 0;
      const duration = 2000;
      const startTime = performance.now();

      function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = target * eased;

        if (isDecimal) {
          counter.textContent = current.toFixed(1);
        } else {
          counter.textContent = Math.floor(current);
        }

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = isDecimal ? target.toFixed(1) : target;
        }
      }

      requestAnimationFrame(updateCounter);
    });
  }

  // ============================================================
  // SERVICE PROCESS — Scroll Animation
  // ============================================================
  const processSteps = document.querySelectorAll('.process-step');
  const processLineFill = document.getElementById('processLineFill');

  const processObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        const step = parseInt(entry.target.getAttribute('data-step'));
        entry.target.classList.add('visible');

        // Animate the timeline fill
        const totalSteps = processSteps.length;
        const fillPercent = (step / totalSteps) * 100;
        if (processLineFill) {
          const currentFill = parseFloat(processLineFill.style.height) || 0;
          if (fillPercent > currentFill) {
            processLineFill.style.height = fillPercent + '%';
          }
        }
      }
    });
  }, {
    threshold: 0.3,
    rootMargin: '0px 0px -100px 0px'
  });

  processSteps.forEach(function(step) {
    processObserver.observe(step);
  });

  // ============================================================
  // LIGHTBOX
  // ============================================================
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');

  window.openLightbox = function(element) {
    const img = element.querySelector('img');
    if (img) {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeLightbox = function() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  };

  // Close lightbox on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) {
      closeLightbox();
    }
  });

  // Prevent clicking on image from closing lightbox
  lightboxImg.addEventListener('click', function(e) {
    e.stopPropagation();
  });

  // ============================================================
  // SERVICE BOOKING FORM
  // ============================================================
  window.handleBooking = function(e) {
    e.preventDefault();

    const form = document.getElementById('bookingForm');
    const success = document.getElementById('bookingSuccess');

    // Simple validation
    const requiredFields = form.querySelectorAll('[required]');
    let valid = true;

    requiredFields.forEach(function(field) {
      if (!field.value.trim()) {
        valid = false;
        field.style.borderColor = '#e74c3c';
        setTimeout(function() {
          field.style.borderColor = '';
        }, 2000);
      }
    });

    if (!valid) return;

    // Show success
    form.classList.add('hidden');
    success.classList.add('show');

    // Scroll to success message
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Set minimum date for booking form
  const dateInput = document.getElementById('bookingDate');
  if (dateInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.setAttribute('min', yyyy + '-' + mm + '-' + dd);
  }

  // ============================================================
  // SMOOTH SCROLL for anchor links
  // ============================================================
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const navHeight = navbar.offsetHeight;
        const targetPos = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
        });
      }
    });
  });

  // ============================================================
  // PARALLAX — Hero background subtle movement
  // ============================================================
  const heroBg = document.querySelector('.hero-bg img');

  function handleParallax() {
    if (!heroBg) return;
    const scrolled = window.pageYOffset;
    const heroHeight = document.querySelector('.hero').offsetHeight;

    if (scrolled <= heroHeight) {
      const parallaxOffset = scrolled * 0.3;
      heroBg.style.transform = 'scale(1.05) translateY(' + parallaxOffset + 'px)';
    }
  }

  window.addEventListener('scroll', handleParallax, { passive: true });

  // ============================================================
  // ACTIVE NAV LINK on scroll
  // ============================================================
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a:not(.nav-cta)');

  function updateActiveLink() {
    const scrollPos = window.pageYOffset + 100;

    sections.forEach(function(section) {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(function(link) {
          link.style.color = '';
          if (link.getAttribute('href') === '#' + id) {
            link.style.color = 'var(--pure-white)';
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });

  // ============================================================
  // FORM INPUT INTERACTIONS
  // ============================================================
  const formInputs = document.querySelectorAll('.form-group input, .form-group select, .form-group textarea');

  formInputs.forEach(function(input) {
    input.addEventListener('focus', function() {
      this.parentElement.style.transform = 'translateY(-2px)';
      this.parentElement.style.transition = 'transform 0.3s ease';
    });

    input.addEventListener('blur', function() {
      this.parentElement.style.transform = '';
    });
  });

  // ============================================================
  // GLOBAL SCROLL PROGRESS BAR
  // ============================================================
  const globalProgress = document.getElementById('globalScrollProgress');
  
  function updateGlobalScrollProgress() {
    if (!globalProgress) return;
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight <= 0) return;
    const progress = (window.pageYOffset / totalHeight) * 100;
    globalProgress.style.width = Math.min(100, Math.max(0, progress)) + '%';
  }

  window.addEventListener('scroll', updateGlobalScrollProgress, { passive: true });

  // ============================================================
  // AMBIENT CURSOR GLOW TRAIL
  // ============================================================
  const cursorGlow = document.getElementById('cursorGlow');
  let mouseX = 0, mouseY = 0;
  let glowX = 0, glowY = 0;

  if (cursorGlow && window.innerWidth > 768) {
    window.addEventListener('mousemove', function(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animateCursorGlow() {
      glowX += (mouseX - glowX) * 0.1;
      glowY += (mouseY - glowY) * 0.1;
      cursorGlow.style.left = glowX + 'px';
      cursorGlow.style.top = glowY + 'px';
      requestAnimationFrame(animateCursorGlow);
    }
    requestAnimationFrame(animateCursorGlow);
  }

  // ============================================================
  // 3D TILT EFFECT ON CARDS
  // ============================================================
  const tiltCards = document.querySelectorAll('.bike-card, .service-card, .why-card');

  if (window.innerWidth > 768) {
    tiltCards.forEach(function(card) {
      card.addEventListener('mousemove', function(e) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;

        card.style.transform = 'perspective(1000px) rotateX(' + rotateX.toFixed(2) + 'deg) rotateY(' + rotateY.toFixed(2) + 'deg) translateY(-6px)';
      });

      card.addEventListener('mouseleave', function() {
        card.style.transform = '';
      });
    });
  }

  // ============================================================
  // PERFORMANCE — Throttle scroll events
  // ============================================================
  let ticking = false;

  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(function() {
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

})();

