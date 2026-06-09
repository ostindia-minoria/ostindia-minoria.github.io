// Unified O-W-M Account Authorization and Cloud Sync Module
const API_URL = "https://owm-api.duckdns.org:8443";
const BOT_USERNAME = "sitemedia07_bot";

// Keys to synchronize between localStorage and cloud payload
const payloadKeys = [
    'om_bg_music',
    'om_bg_track',
    'om_bg_volume',
    'om_ui_sounds',
    'om_tv_jailbroken',
    'om_tv_passcode_unlocked',
    'om_settings_tooltip_seen'
];

let isRestoringSettings = false;

// Global callback for Telegram Login Widget
window.onTelegramAuth = function(user) {
    console.log("Telegram Auth callback triggered:", user);
    
    fetch(`${API_URL}/api/auth/telegram`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })
    .then(res => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
    })
    .then(data => {
        if (data.success) {
            console.log("Authentication successful, saving session details.");
            localStorage.setItem('telegram_id', data.user.telegram_id);
            localStorage.setItem('hash', user.hash); // save verified hash as session token
            
            // Save compatible profile object for Ocean TV system
            const profileObj = {
                id: data.user.telegram_id,
                first_name: data.user.first_name,
                username: data.user.username,
                photo_url: data.user.photo_url
            };
            localStorage.setItem('telegram_user', JSON.stringify(profileObj));
            localStorage.setItem('om_user_profile', JSON.stringify(profileObj));
            
            // Restore settings from cloud payload
            if (data.payload) {
                isRestoringSettings = true;
                for (const [key, val] of Object.entries(data.payload)) {
                    localStorage.setItem(key, String(val));
                }
                isRestoringSettings = false;
            }
            
            // Close modal and refresh to apply
            window.closeAuthModal();
            window.location.reload();
        } else {
            alert('Ошибка авторизации: ' + (data.error || 'Неизвестная ошибка'));
        }
    })
    .catch(err => {
        console.error("Authentication request failed:", err);
        alert('Не удалось связаться с сервером авторизации.');
    });
};

// Global Logout Handler
window.handleLogout = function() {
    console.log("Logging out from O-W-M account.");
    localStorage.removeItem('telegram_id');
    localStorage.removeItem('hash');
    localStorage.removeItem('telegram_user');
    localStorage.removeItem('om_user_profile');
    
    // Reset specific device/game settings to defaults
    localStorage.setItem('om_tv_jailbroken', 'false');
    localStorage.setItem('om_tv_passcode_unlocked', 'false');
    
    window.closeAuthModal();
    window.location.reload();
};

// Cloud Sync Function
window.syncAccountData = function() {
    const telegram_id = localStorage.getItem('telegram_id');
    const hash = localStorage.getItem('hash');
    
    if (!telegram_id || !hash) {
        console.log("Sync skipped: User is not logged in.");
        return;
    }
    
    const payload = {};
    payloadKeys.forEach(key => {
        const val = localStorage.getItem(key);
        if (val !== null) {
            payload[key] = val;
        }
    });
    
    console.log("Syncing account payload with cloud:", payload);
    
    fetch(`${API_URL}/api/account/sync`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ telegram_id, hash, payload })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            console.log("Cloud sync successful.");
        } else {
            console.warn("Cloud sync warning:", data.error);
        }
    })
    .catch(err => {
        console.warn("Cloud sync unreachable:", err);
    });
};

// Intercept localStorage.setItem to auto-sync when settings change
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
    originalSetItem.apply(this, arguments);
    if (!isRestoringSettings && payloadKeys.includes(key)) {
        window.syncAccountData();
    }
};

// Update profile indicators in site headers
window.checkAuthState = function() {
    const desktopHeader = document.getElementById('headerProfileBlock');
    const mobileHeader = document.getElementById('mobileHeaderProfileBlock');
    const tvHeaderProfile = document.getElementById('tv-user-profile');
    
    const lockOverlayHtml = `
        <div class="absolute inset-0 z-10 flex items-center justify-center bg-gray-900/50 backdrop-blur-[3px] rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-cyan-400 drop-shadow-[0_0_4px_rgba(34,211,238,0.5)]">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
        </div>
    `;

    const defaultHeaderHtml = `
        <i class="fab fa-telegram text-sky-400 text-lg"></i>
        <span class="text-xs text-white font-semibold font-sans">Войти</span>
        ${lockOverlayHtml}
    `;
    
    if (desktopHeader) {
        desktopHeader.innerHTML = defaultHeaderHtml;
        desktopHeader.className = "relative hidden md:flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full hover:bg-white/10 transition pointer-events-none cursor-not-allowed";
    }
    if (mobileHeader) {
        mobileHeader.innerHTML = `
            <i class="fab fa-telegram text-sky-400 text-lg"></i>
            <span class="text-xs text-white font-medium font-sans">Войти</span>
            <div class="absolute inset-0 z-10 flex items-center justify-center bg-gray-900/50 backdrop-blur-[3px] rounded">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-cyan-400 drop-shadow-[0_0_4px_rgba(34,211,238,0.5)]">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
            </div>
        `;
        mobileHeader.className = "hidden relative flex items-center justify-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded hover:bg-white/10 transition pointer-events-none cursor-not-allowed";
    }
    if (tvHeaderProfile) {
        tvHeaderProfile.innerHTML = `
            <i class="fab fa-telegram text-sky-400 text-lg"></i>
            <span class="tv-user-name text-xs text-white font-semibold font-sans">Войти</span>
            ${lockOverlayHtml}
        `;
        tvHeaderProfile.className = "tv-user-profile !static relative pointer-events-none cursor-not-allowed";
    }
    
    // Adapt index CTA card if present
    updateCtaBlock();
};

// Dynamically inject retro auth modal markup
// Dynamically inject retro auth modal markup
function injectAuthModal() {
    if (document.getElementById('auth-modal-overlay')) return;
    
    const modalHtml = `
    <div id="auth-modal-overlay" class="auth-modal-overlay" style="display: none;">
        <div class="auth-modal-box">
            <!-- Modal Header -->
            <div class="app-header z-10 !p-0 !bg-transparent !border-0 mb-4 flex justify-between items-center">
                <div class="app-title !text-lg !font-bold flex items-center gap-2 text-white">
                    <i class="fab fa-telegram text-sky-400"></i> Единый аккаунт сайта
                </div>
                <button class="app-menu-btn" onclick="closeAuthModal()">✕</button>
            </div>
            <div id="auth-modal-content" class="z-10 flex flex-col gap-4 text-slate-300 text-sm leading-relaxed">
                <!-- Loaded dynamically -->
            </div>
        </div>
    </div>
    `;
    
    const div = document.createElement('div');
    div.innerHTML = modalHtml;
    document.body.appendChild(div.firstElementChild);
}

// Modal open/close actions
window.openAuthModal = function() {
    console.log("Authorization is temporarily disabled.");
    return;
    const modal = document.getElementById('auth-modal-overlay');
    if (modal) {
        modal.style.display = 'flex';
        // Force reflow to ensure transitions trigger correctly
        modal.offsetHeight;
        modal.classList.add('active');
        renderAuthModalContent();
    }
};

window.closeAuthModal = function() {
    const modal = document.getElementById('auth-modal-overlay');
    if (modal) {
        modal.classList.remove('active');
        // Fully hide from DOM after transition completes to prevent click intercept issues
        setTimeout(() => {
            if (!modal.classList.contains('active')) {
                modal.style.display = 'none';
            }
        }, 350);
    }
};

// Render contents based on auth state
function renderAuthModalContent() {
    const content = document.getElementById('auth-modal-content');
    if (!content) return;
    
    const telegramId = localStorage.getItem('telegram_id');
    const userStr = localStorage.getItem('telegram_user');
    
    if (telegramId && userStr) {
        const user = JSON.parse(userStr);
        content.innerHTML = `
            <div class="flex flex-col items-center gap-4 py-3">
                <img src="${user.photo_url || 'assets/images/default-avatar.png'}" alt="Avatar" class="w-16 h-16 rounded-full border-2 border-sky-400 object-cover" onerror="this.src='https://telegram.org/img/t_logo.png'">
                <div class="text-center">
                    <div class="font-bold text-white text-base font-sans">${user.first_name || ''}</div>
                    <div class="text-xs text-sky-400 font-mono mt-0.5">@${user.username || ''}</div>
                </div>
                <div class="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-center text-xs text-slate-400 font-sans">
                    <span class="text-green-400 font-semibold"><i class="fas fa-check-circle mr-1"></i> Облачная синхронизация</span>
                    <div class="mt-1 text-[10px] text-slate-500 leading-tight">Ваши настройки и игровой прогресс Ocean TV сохранены в облаке.</div>
                </div>
                <button onclick="handleLogout()" class="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-200 text-xs rounded-xl font-bold transition font-sans uppercase tracking-wider">
                    Выйти из аккаунта
                </button>
            </div>
        `;
    } else {
        content.innerHTML = `
            <div class="flex flex-col items-center gap-4 py-2">
                <p class="text-center text-xs text-slate-400 leading-relaxed font-sans">
                    Авторизуйтесь через Telegram, чтобы объединить разделы сайта, синхронизировать настройки профиля и прогресс Ocean TV.
                </p>
                <div id="modal-telegram-widget-container" class="flex justify-center items-center w-full py-4 bg-slate-900/40 border border-white/5 rounded-2xl min-h-[80px]">
                    <!-- script is dynamically loaded -->
                </div>
            </div>
        `;
        
        // Dynamically load widget script inside modal
        const wrapper = document.getElementById('modal-telegram-widget-container');
        if (wrapper) {
            const script = document.createElement('script');
            script.async = true;
            script.src = 'https://telegram.org/js/telegram-widget.js?22';
            script.setAttribute('data-telegram-login', BOT_USERNAME.replace(/^@/, ''));
            script.setAttribute('data-size', 'large');
            script.setAttribute('data-onauth', 'onTelegramAuth(user)');
            script.setAttribute('data-request-access', 'write');
            wrapper.appendChild(script);
        }
    }
}

// Adapt home page CTA block
function updateCtaBlock() {
    const cta = document.getElementById('indexAccountCtaBlock');
    if (!cta) return;
    
    const container = cta.querySelector('.flex');
    if (!container) return;
    
    container.innerHTML = `
        <div class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-900/60 backdrop-blur-md rounded-3xl">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <span class="font-mono tracking-widest uppercase font-bold mt-3 text-cyan-400">Coming Soon...</span>
        </div>
        <div class="w-20 h-20 bg-slate-800/40 rounded-full flex items-center justify-center border border-slate-700/60 shadow-inner mb-6 hover:scale-105 transition-transform duration-300">
            <svg width="48" height="48" viewBox="0 0 100 100" class="mac-flash-icon">
                <circle cx="50" cy="38" r="18" fill="#38bdf8" fill-opacity="0.8"/>
                <path d="M25,78 C25,60 35,56 50,56 C65,56 75,60 75,78 C75,82 75,82 75,82 H25 C25,82 25,82 25,82 Z" fill="#38bdf8" fill-opacity="0.8"/>
            </svg>
        </div>
        <h3 class="text-2xl font-bold mb-3 text-white druk-font tracking-wide">Единый аккаунт O-W-M</h3>
        <p class="text-sm text-slate-400 mb-6 leading-relaxed max-w-md font-sans">
            Единый аккаунт проекта O-W-M связывает все разделы сайта. Он автоматически резервирует и синхронизирует ваши настройки профиля, плейлисты, а также игровой прогресс приставки Ocean TV в облачном хранилище.
        </p>
        <button onclick="openAuthModal()" class="flex items-center gap-3 px-6 py-3 bg-[#1e293b] border border-slate-700 hover:border-sky-400 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition-all duration-300 pointer-events-none cursor-not-allowed shadow-md group font-sans">
            <i class="fab fa-telegram text-sky-400 text-lg group-hover:scale-110 transition-transform"></i>
            <span>Войти в аккаунт</span>
        </button>
    `;
}
}

// Injected CSS Styles for dynamic modal and overlay
const modalStyles = `
/* Retro-System Account Modal Styles injected dynamically */
.auth-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 100000 !important;
    background: rgba(4, 4, 7, 0.85);
    backdrop-filter: blur(12px);
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.auth-modal-overlay.active {
    opacity: 1;
    pointer-events: auto;
}
.auth-modal-box {
    width: 440px;
    max-width: 90vw;
    background: #0f1015;
    border: 2px solid #272a37;
    border-radius: 16px;
    box-shadow: 0 20px 50px rgba(0,0,0,0.85);
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 1.8rem;
    transform: scale(0.92) translateY(20px);
    transition: transform 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
    color: #e2e8f0;
}
.auth-modal-overlay.active .auth-modal-box {
    transform: scale(1) translateY(0);
}
.auth-close-btn {
    background: transparent;
    border: none;
    color: #a0aec0;
    cursor: pointer;
    font-size: 1.25rem;
    transition: color 0.2s, transform 0.2s;
}
.auth-close-btn:hover {
    color: #ffffff;
    transform: rotate(90deg);
}
.app-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    padding-bottom: 1.2rem;
    margin-bottom: 1.5rem;
}
.app-title {
    font-size: 1.8rem;
    font-weight: 500;
    color: #ffffff;
    display: flex;
    align-items: center;
    gap: 12px;
}
.app-menu-btn {
    padding: 0.5rem 1.8rem;
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
    border: 1.5px solid rgba(255, 255, 255, 0.15);
    border-radius: 30px;
    color: #e2e8f0;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1);
    transition: all 0.2s ease;
}
.app-menu-btn:hover {
    background: #ffffff;
    color: #08090c;
    border-color: #ffffff;
    box-shadow: 0 4px 12px rgba(255,255,255,0.25);
    transform: translateY(-1px);
}
`;

// Initial startup routines
document.addEventListener('DOMContentLoaded', () => {
    // Inject styles
    if (!document.getElementById('auth-styles')) {
        const style = document.createElement('style');
        style.id = 'auth-styles';
        style.textContent = modalStyles;
        document.head.appendChild(style);
    }
    
    // Inject HTML container if not present
    injectAuthModal();
    
    // Validate current auth and update headers
    window.checkAuthState();
    
    // Add Click listeners to triggers
    const triggerIds = ['headerProfileBlock', 'mobileHeaderProfileBlock', 'tv-user-profile'];
    triggerIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                window.openAuthModal();
            });
        }
    });
    
    // Index card CTA button trigger click setup
    const ctaBtn = document.querySelector('#indexAccountCtaBlock button');
    if (ctaBtn) {
        ctaBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.openAuthModal();
        });
    }
    
    // Bind click trigger dynamically to tv.html account connect button
    document.addEventListener('click', (e) => {
        if (e.target && e.target.tagName === 'BUTTON' && e.target.textContent.includes('Подключить аккаунт')) {
            e.stopPropagation();
            window.openAuthModal();
        }
    });
});
