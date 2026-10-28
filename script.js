
// INTERACTIONS DU PORTFOLIO
'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('siteHeader');
    const progress = document.getElementById('scrollProgress');
    const topButton = document.getElementById('backToTop');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Barre de progression, navigation et retour en haut
    let scheduled = false;
    function updateScroll() {
        const distance = document.documentElement.scrollHeight - window.innerHeight;
        const percentage = distance > 0 ? (window.scrollY / distance) * 100 : 0;
        if (progress) progress.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
        if (header) header.classList.toggle('scrolled', window.scrollY > 15);
        if (topButton) topButton.classList.toggle('visible', window.scrollY > 450);
        scheduled = false;
    }

    window.addEventListener('scroll', () => {
        if (!scheduled) {
            window.requestAnimationFrame(updateScroll);
            scheduled = true;
        }
    }, { passive: true });

    window.addEventListener('resize', updateScroll);
    updateScroll();

    topButton?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    });

    // Fermer le menu Bootstrap après le clic sur un lien (mobile)
    const menu = document.getElementById('menuPrincipal');
    menu?.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 992 && window.bootstrap?.Collapse && menu.classList.contains('show')) {
                bootstrap.Collapse.getOrCreateInstance(menu).hide();
            }
        });
    });

    // Mettre en surbrillance la section actuellement affichée
    const sectionLinks = [...document.querySelectorAll('.navbar-nav a[href^="#"]')];
    const sections = sectionLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);

    if ('IntersectionObserver' in window && sections.length) {
        const sectionObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;

                sectionLinks.forEach(link => {
                    const active = link.getAttribute('href') === `#${entry.target.id}`;
                    link.classList.toggle('active', active);

                    if (active) link.setAttribute('aria-current', 'location');
                    else link.removeAttribute('aria-current');
                });
            });
        }, { rootMargin: '-25% 0px -60% 0px' });

        sections.forEach(section => sectionObserver.observe(section));
    }

    // Animations d'apparition : désactivées si l'utilisateur préfère moins d'effets
    if ('IntersectionObserver' in window && !reduceMotion.matches) {
        document.documentElement.classList.add('js-reveal');

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -25px 0px' });

        document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));
    }

    // Mini-terminal du profil, sans animation si le mouvement est réduit
    const focusText = document.getElementById('rotatingFocus');

    if (focusText && !reduceMotion.matches) {
        const values = ['Linux & réseaux', 'Sécurité offensive', 'TryHackMe labs', 'Pentest & Red Team'];
        let index = 0;

        window.setInterval(() => {
            if (document.hidden) return;
            index = (index + 1) % values.length;
            focusText.textContent = values[index];
        }, 3500);
    }

    // Afficher/masquer les informations complémentaires des projets
    const projectButtons = [...document.querySelectorAll('.project-toggle')];

    projectButtons.forEach(button => {
        const details = document.getElementById(button.getAttribute('aria-controls'));
        if (!details) return;

        button.addEventListener('click', () => {
            const opening = details.hidden;

            projectButtons.forEach(other => {
                const panel = document.getElementById(other.getAttribute('aria-controls'));
                if (panel) panel.hidden = true;
                other.setAttribute('aria-expanded', 'false');
                other.textContent = 'En savoir plus +';
            });

            if (opening) {
                details.hidden = false;
                button.setAttribute('aria-expanded', 'true');
                button.textContent = 'Voir moins −';
            }
        });
    });

    // Copier l'adresse email avec retour visuel accessible
    const toast = document.getElementById('siteToast');
    let toastTimeout;

    function showToast(message) {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        window.clearTimeout(toastTimeout);
        toastTimeout = window.setTimeout(() => toast.classList.remove('show'), 3200);
    }

    document.querySelectorAll('.copy-email').forEach(button => {
        button.addEventListener('click', async () => {
            const email = button.dataset.email;
            if (!email) return;

            try {
                if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
                await navigator.clipboard.writeText(email);
                showToast('Adresse email copiée !');
            } catch {
                showToast(`Copie indisponible : ${email}`);
            }
        });
    });
});
