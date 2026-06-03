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
    const telegramId = localStorage.getItem('telegram_id');
    const userStr = localStorage.getItem('telegram_user');
    
    const desktopHeader = document.getElementById('headerProfileBlock');
    const mobileHeader = document.getElementById('mobileHeaderProfileBlock');
    const tvHeaderProfile = document.getElementById('tv-user-profile');
    
    if (telegramId && userStr) {
        const user = JSON.parse(userStr);
        const name = user.first_name || user.username || "Профиль";
        const avatarHtml = `
            <img src="${user.photo_url || 'assets/images/default-avatar.png'}" class="w-6 h-6 rounded-full border border-sky-400 object-cover" onerror="this.src='https://telegram.org/img/t_logo.png'">
            <span class="text-xs text-white font-semibold font-sans">${name}</span>
        `;
        
        if (desktopHeader) {
            desktopHeader.innerHTML = avatarHtml;
            desktopHeader.classList.remove('bg-white/5');
            desktopHeader.classList.add('bg-sky-500/10', 'border-sky-500/25');
        }
        if (mobileHeader) {
            mobileHeader.innerHTML = avatarHtml;
            mobileHeader.classList.remove('hidden');
            mobileHeader.classList.add('flex');
        }
        if (tvHeaderProfile) {
            tvHeaderProfile.innerHTML = `
                <img src="${user.photo_url || 'assets/images/default-avatar.png'}" class="w-6 h-6 rounded-full border border-sky-400 object-cover" onerror="this.src='https://telegram.org/img/t_logo.png'">
                <span class="tv-user-name text-xs text-white font-semibold font-sans">${name}</span>
            `;
        }
    } else {
        const defaultHeaderHtml = `
            <i class="fab fa-telegram text-sky-400 text-lg"></i>
            <span class="text-xs text-white font-semibold font-sans">Войти</span>
        `;
        
        if (desktopHeader) {
            desktopHeader.innerHTML = defaultHeaderHtml;
            desktopHeader.classList.add('bg-white/5');
            desktopHeader.classList.remove('bg-sky-500/10', 'border-sky-500/25');
        }
        if (mobileHeader) {
            mobileHeader.innerHTML = defaultHeaderHtml;
            mobileHeader.classList.add('hidden');
        }
        if (tvHeaderProfile) {
            tvHeaderProfile.innerHTML = `
                <i class="fab fa-telegram text-sky-400 text-lg"></i>
                <span class="tv-user-name text-xs text-white font-semibold font-sans">Войти</span>
            `;
        }
    }
    
    // Adapt index CTA card if present
    updateCtaBlock();
};

// Dynamically inject retro auth modal markup
function injectAuthModal() {
    if (document.getElementById('auth-modal-overlay')) return;
    
    const modalHtml = `
    <div id="auth-modal-overlay" class="auth-modal-overlay">
        <div class="auth-modal-box">
            <div class="flex justify-between items-center mb-5 pb-3 border-b border-white/5">
                <h3 class="text-sm font-bold text-white flex items-center gap-2 font-sans tracking-wider uppercase">
                    <i class="fab fa-telegram text-sky-400 text-base"></i>
                    <span>Единый аккаунт O-W-M</span>
                </h3>
                <button class="auth-close-btn text-slate-400 hover:text-white transition" onclick="closeAuthModal()">✕</button>
            </div>
            <div id="auth-modal-content" class="flex flex-col gap-4 text-slate-300 text-sm leading-relaxed">
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
    const modal = document.getElementById('auth-modal-overlay');
    if (modal) {
        modal.classList.add('active');
        renderAuthModalContent();
    }
};

window.closeAuthModal = function() {
    const modal = document.getElementById('auth-modal-overlay');
    if (modal) {
        modal.classList.remove('active');
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
                <div id="modal-telegram-widget-container" class="flex justify-center w-full py-4 bg-slate-900/40 border border-white/5 rounded-2xl min-h-[80px]">
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
            script.setAttribute('data-telegram-login', BOT_USERNAME);
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
    
    const telegramId = localStorage.getItem('telegram_id');
    const userStr = localStorage.getItem('telegram_user');
    
    const container = cta.querySelector('.flex');
    if (!container) return;
    
    if (telegramId && userStr) {
        const user = JSON.parse(userStr);
        container.innerHTML = `
            <div class="w-20 h-20 bg-sky-500/10 rounded-full flex items-center justify-center border border-sky-500/30 shadow-lg shadow-sky-500/5 mb-6 hover:scale-105 transition-transform duration-300">
                <img src="${user.photo_url || 'assets/images/default-avatar.png'}" alt="Avatar" class="w-16 h-16 rounded-full border border-sky-400 object-cover" onerror="this.src='https://telegram.org/img/t_logo.png'">
            </div>
            <h3 class="text-2xl font-bold mb-1 text-white druk-font tracking-wide">Единый аккаунт подключен</h3>
            <div class="text-xs text-sky-400 font-mono mb-4">@${user.username || ''}</div>
            <p class="text-sm text-slate-400 mb-6 leading-relaxed max-w-md font-sans">
                Привет, ${user.first_name || 'пользователь'}! Ваши настройки и игровой прогресс Ocean TV синхронизируются с облаком автоматически в фоновом режиме.
            </p>
            <button onclick="handleLogout()" class="px-6 py-2.5 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-200 text-xs rounded-xl font-bold transition font-sans uppercase tracking-wider">
                Выйти из аккаунта
            </button>
        `;
    } else {
        container.innerHTML = `
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
            <div id="cta-telegram-widget-wrapper" class="flex justify-center w-full min-h-[40px]">
                <!-- Widget loaded dynamically -->
            </div>
        `;
        
        const wrapper = document.getElementById('cta-telegram-widget-wrapper');
        if (wrapper) {
            const script = document.createElement('script');
            script.async = true;
            script.src = 'https://telegram.org/js/telegram-widget.js?22';
            script.setAttribute('data-telegram-login', BOT_USERNAME);
            script.setAttribute('data-size', 'large');
            script.setAttribute('data-onauth', 'onTelegramAuth(user)');
            script.setAttribute('data-request-access', 'write');
            wrapper.appendChild(script);
        }
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
