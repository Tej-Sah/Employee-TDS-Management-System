/**
 * TDS Portal Global Scripts
 */
// 🔐 Password Hashing Function
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

// UI Helpers
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

let userPage = 1;

const TDS_PORTAL = {
    // Session Management
    session: {
        getUser: () => JSON.parse(localStorage.getItem("loggedInUser")),
        logout: () => {
            localStorage.removeItem("loggedInUser");
            window.location.href = "index.html";
        },
        checkAuth: (role) => {
            const user = TDS_PORTAL.session.getUser();
            if (!user) {
                window.location.href = "index.html";
                return null;
            }
            if (role && user.role !== role) {
                window.location.href = "index.html";
                return null;
            }
            return user;
        },
        toggleProfileDropdown: () => {
            const dropdown = document.getElementById('profileDropdown');
            if (dropdown) {
                dropdown.classList.toggle('hidden');
                dropdown.classList.toggle('animate-fade-in');
            }
        }
    },

    // UI Utilities
    ui: {
        toggleTheme: () => {
            const html = document.documentElement;
            if (html.classList.contains('dark')) {
                html.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            } else {
                html.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            }
        },
        showToast: (message, type = 'error') => {
            const existingToast = document.getElementById('globalToast');
            if (existingToast) existingToast.remove();

            const toast = document.createElement('div');
            toast.id = 'globalToast';
            toast.className = `fixed bottom-6 right-6 px-6 py-3 rounded-xl shadow-2xl flex items-center space-x-3 z-[300] transition-all duration-300 transform translate-y-0 glass animate-fade-in`;
            
            const colors = {
                success: 'border-emerald-500/50 text-emerald-400',
                error: 'border-red-500/50 text-red-400',
                info: 'border-blue-500/50 text-blue-400'
            };
            const icons = { success: 'check-circle', error: 'alert-circle', info: 'info' };

            toast.classList.add(...(colors[type] || colors.info).split(' '));
            toast.innerHTML = `<i data-lucide="${icons[type] || 'info'}" class="w-5 h-5"></i><span class="font-medium">${message}</span>`;
            document.body.appendChild(toast);
            lucide.createIcons();
            setTimeout(() => {
                toast.classList.add('opacity-0', 'translate-y-4');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        },
        initCommon: () => {
            window.addEventListener('click', (e) => {
                const profileBtn = document.getElementById('profileBtn');
                const dropdown = document.getElementById('profileDropdown');
                if (dropdown && !dropdown.classList.contains('hidden') && profileBtn && !profileBtn.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.classList.add('hidden');
                }
            });
            lucide.createIcons();
        },

        showMyProfile: async () => {
            const sessionUser = TDS_PORTAL.session.getUser();
            if (!sessionUser) return;
            const modal = document.createElement('div');
            modal.id = 'myProfileModal';
            modal.className = 'fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in';
            modal.innerHTML = `
                <div class="glass max-w-md w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-800 animate-slide-up">
                    <div class="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                        <h3 class="text-2xl font-bold text-white">My Profile</h3>
                        <button onclick="document.getElementById('myProfileModal').remove()" class="text-slate-400 hover:text-white"><i data-lucide="x"></i></button>
                    </div>
                    <div class="p-8 space-y-6">
                        <div class="flex items-center space-x-4">
                            <div class="w-16 h-16 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-2xl">${sessionUser.name[0]}</div>
                            <div>
                                <h4 class="text-xl font-bold text-white">${sessionUser.name}</h4>
                                <p class="text-slate-400">${sessionUser.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            lucide.createIcons();
            modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        },
        showAnnouncements: async () => {
            const modal = document.createElement('div');
            modal.id = 'announcementsModal';
            modal.className = 'fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in';
            modal.innerHTML = `
                <div class="glass max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-800 animate-slide-up flex flex-col max-h-[90vh]">
                    <div class="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/20">
                                <i data-lucide="megaphone" class="w-6 h-6 text-indigo-400"></i>
                            </div>
                            <h3 class="text-2xl font-bold text-white tracking-tight">Announcement Center</h3>
                        </div>
                        <button onclick="document.getElementById('announcementsModal').remove()" class="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white">
                            <i data-lucide="x" class="w-6 h-6"></i>
                        </button>
                    </div>
                    
                    <div class="p-8 overflow-y-auto custom-scrollbar space-y-8">
                        <!-- Broadcast Form -->
                        <div class="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-6">
                            <h4 class="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-4">Broadcast New Message</h4>
                            <form id="modalAnnouncementForm" class="space-y-4">
                                <textarea id="modalAnnounceMessage" rows="3" required class="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm" placeholder="Enter message for all users..."></textarea>
                                <div class="flex justify-end">
                                    <button type="submit" id="broadcastBtn" class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center">
                                        <i data-lucide="send" class="w-4 h-4 mr-2"></i> Broadcast Now
                                    </button>
                                </div>
                            </form>
                        </div>

                        <!-- Recent List -->
                        <div>
                            <h4 class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Recent Announcements</h4>
                            <div id="modalAnnouncementsList" class="space-y-4 text-center py-8">
                                <div class="animate-pulse text-slate-600">Loading announcements...</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            lucide.createIcons();

            const loadModalAnnouncements = async () => {
                const list = document.getElementById('modalAnnouncementsList');
                if (!list) return;
                try {
                    const data = await TDS_PORTAL.db.getAnnouncements();
                    if (!data || data.length === 0) {
                        list.innerHTML = '<p class="text-slate-500 py-4">No recent announcements</p>';
                        return;
                    }
                    list.innerHTML = data.map(n => `
                        <div class="p-5 bg-slate-900/50 border border-slate-800 rounded-2xl text-left hover:border-indigo-500/30 transition-colors">
                            <div class="flex justify-between items-start mb-2">
                                <span class="text-[10px] font-bold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                                    HR: ${n.hrId?.name || 'System'}
                                </span>
                                <span class="text-[10px] text-slate-500 font-medium">${new Date(n.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p class="text-sm text-slate-300 leading-relaxed">${n.message}</p>
                        </div>
                    `).join('');
                } catch (e) {
                    list.innerHTML = '<p class="text-red-400">Failed to load announcements</p>';
                }
            };

            loadModalAnnouncements();

            document.getElementById('modalAnnouncementForm').onsubmit = async (e) => {
                e.preventDefault();
                const msg = document.getElementById('modalAnnounceMessage').value;
                const btn = document.getElementById('broadcastBtn');
                btn.disabled = true;
                btn.innerHTML = '<i data-lucide="loader" class="w-4 h-4 mr-2 animate-spin"></i> Sending...';
                lucide.createIcons();

                const ok = await TDS_PORTAL.db.sendAnnouncement(msg);
                if (ok) {
                    TDS_PORTAL.ui.showToast("Announcement broadcasted!", "success");
                    document.getElementById('modalAnnounceMessage').value = '';
                    loadModalAnnouncements();
                }
                btn.disabled = false;
                btn.innerHTML = '<i data-lucide="send" class="w-4 h-4 mr-2"></i> Broadcast Now';
                lucide.createIcons();
            };

            modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        },
        showSettings: async () => {
            let settings = { siteName: "TDS Portal" };
            try {
                const fetched = await TDS_PORTAL.db.getSettings();
                if (fetched) settings = fetched;
            } catch (error) { console.error("Error fetching settings:", error); }
            
            const modal = document.createElement('div');
            modal.id = 'settingsModal';
            modal.className = 'fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in';
            modal.innerHTML = `
                <div class="glass max-w-lg w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-800 animate-slide-up">
                    <div class="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/20">
                                <i data-lucide="settings" class="w-6 h-6 text-blue-400"></i>
                            </div>
                            <h3 class="text-2xl font-bold text-white tracking-tight">System Settings</h3>
                        </div>
                        <button onclick="document.getElementById('settingsModal').remove()" class="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white">
                            <i data-lucide="x" class="w-6 h-6"></i>
                        </button>
                    </div>
                    <form id="modalSettingsForm" class="p-8 space-y-6">
                        <div>
                            <label class="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2 block">Application Name</label>
                            <input type="text" name="siteName" value="${settings.siteName || ''}" required class="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="e.g. TDS Portal">
                        </div>

                        <div class="flex justify-end space-x-4 pt-4">
                            <button type="button" onclick="document.getElementById('settingsModal').remove()" class="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all border border-slate-700">Cancel</button>
                            <button type="submit" id="saveSettingsBtn" class="btn-primary px-8 py-3">Save Configuration</button>
                        </div>
                    </form>
                </div>
            `;
            document.body.appendChild(modal);
            lucide.createIcons();
            document.getElementById('modalSettingsForm').onsubmit = async (e) => {
                e.preventDefault();
                const btn = document.getElementById('saveSettingsBtn');
                const originalText = btn.innerText;
                btn.innerText = "Saving...";
                btn.disabled = true;
                const formData = new FormData(e.target);
                const data = {
                    siteName: formData.get('siteName')
                };
                const success = await TDS_PORTAL.db.updateSettings(data);
                if (success) {
                    TDS_PORTAL.ui.showToast("Settings updated", "success");
                    modal.remove();
                } else {
                    btn.innerText = originalText;
                    btn.disabled = false;
                }
            };
            modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        },



        updateSystemStatus: async () => {
            const statusText = document.getElementById('systemStatusText');
            const statusBadge = document.getElementById('systemStatusBadge');
            const statusIcon = document.getElementById('systemStatusIcon');
            const statusIconContainer = document.getElementById('systemStatusIconContainer');
            const statusCard = document.getElementById('systemStatusCard');
            
            if (!statusText || !statusBadge) return;

            try {
                const health = await TDS_PORTAL.db.getSystemHealth();
                
                // Update text and badge
                statusText.innerText = health.status;
                statusBadge.innerText = health.status;
                
                // Apply color logic
                const themes = {
                    Healthy: { 
                        text: 'text-emerald-500', 
                        bg: 'bg-emerald-500/10', 
                        border: 'border-emerald-500/20',
                        accent: 'emerald'
                    },
                    Maintenance: { 
                        text: 'text-amber-500', 
                        bg: 'bg-amber-500/10', 
                        border: 'border-amber-500/20',
                        accent: 'amber'
                    },
                    Degraded: { 
                        text: 'text-rose-500', 
                        bg: 'bg-rose-500/10', 
                        border: 'border-rose-500/20',
                        accent: 'rose'
                    }
                };

                const current = themes[health.status] || themes.Degraded;
                
                // Update badge classes
                statusBadge.className = `${current.text} text-xs font-bold ${current.bg} px-2 py-1 rounded-full border ${current.border}`;
                
                // Update icon container
                if (statusIconContainer) {
                    statusIconContainer.className = `w-12 h-12 ${current.bg} rounded-xl flex items-center justify-center ${current.text} group-hover:bg-${current.accent}-500 group-hover:text-slate-900 transition-all duration-300 shadow-lg shadow-${current.accent}-500/10`;
                }

                // Update icon
                if (statusIcon) {
                    statusIcon.className = `w-6 h-6 ${health.status === 'Healthy' ? 'animate-pulse' : ''}`;
                    statusIcon.setAttribute('data-lucide', health.status === 'Degraded' ? 'alert-triangle' : 'activity');
                }

                // Update card border
                if (statusCard) {
                    statusCard.className = `glass-card p-6 border-${current.accent}-500/20 hover:border-${current.accent}-500/50 hover-lift group`;
                }

                lucide.createIcons();
            } catch (error) {
                statusText.innerText = "Error";
                statusBadge.innerText = "Down";
            }
        },
        toggle80C: (val) => {
            const div = document.getElementById('payroll80CDiv');
            if(div) {
                if (val === 'old') { div.classList.remove('hidden'); }
                else { 
                    div.classList.add('hidden'); 
                    if (document.getElementById('payroll80C')) document.getElementById('payroll80C').value = ''; 
                    if (document.getElementById('payrollHomeLoan')) document.getElementById('payrollHomeLoan').value = ''; 
                }
            }
        },
        closePayrollPreview: () => {
            const modal = document.getElementById('payrollPreviewModal');
            if(modal) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
        },
        previewPayroll: () => {
            const empSelect = document.getElementById('payrollEmployee');
            const employeeId = empSelect?.value;
            if (!employeeId) return TDS_PORTAL.ui.showToast("Please select an employee", "error");

            const month = document.getElementById('payrollMonth').value;
            const year = document.getElementById('payrollYear').value;
            const salary = parseInt(document.getElementById('payrollSalary').value) || 0;
            const bonus = parseInt(document.getElementById('payrollBonus').value) || 0;
            const deductions = parseInt(document.getElementById('payrollDeductions').value) || 0;
            
            if (!salary) return TDS_PORTAL.ui.showToast("Please enter a valid base salary", "error");

            const regime = document.getElementById('payrollTaxRegime')?.value || 'new';
            const sec80c = parseInt(document.getElementById('payroll80C')?.value) || 0;
            const homeLoan = parseInt(document.getElementById('payrollHomeLoan')?.value) || 0;

            const monthlyGross = Math.max(0, salary + bonus - deductions);
            const annualSalary = monthlyGross * 12;

            let stdDeduction = 50000;
            let totalDeductions = stdDeduction;
            if (regime === 'old') { 
                totalDeductions += Math.min(sec80c, 150000); 
                totalDeductions += Math.min(homeLoan, 200000); 
            }

            let taxableIncome = Math.max(0, annualSalary - totalDeductions);
            let tax = 0;

            if (regime === 'new') {
                if (taxableIncome > 700000) {
                    let temp = taxableIncome;
                    if (temp > 1500000) { tax += (temp - 1500000) * 0.30; temp = 1500000; }
                    if (temp > 1200000) { tax += (temp - 1200000) * 0.20; temp = 1200000; }
                    if (temp > 900000) { tax += (temp - 900000) * 0.15; temp = 900000; }
                    if (temp > 600000) { tax += (temp - 600000) * 0.10; temp = 600000; }
                    if (temp > 300000) { tax += (temp - 300000) * 0.05; }
                }
            } else {
                if (taxableIncome > 500000) {
                    let temp = taxableIncome;
                    if (temp > 1000000) { tax += (temp - 1000000) * 0.30; temp = 1000000; }
                    if (temp > 500000) { tax += (temp - 500000) * 0.20; temp = 500000; }
                    if (temp > 250000) { tax += (temp - 250000) * 0.05; }
                }
            }

            let totalTax = tax > 0 ? tax + (tax * 0.04) : 0;
            let monthlyTDS = totalTax / 12;
            let monthlyTakeHome = monthlyGross - monthlyTDS;

            const formatCurrency = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
            const empName = empSelect.options[empSelect.selectedIndex].text.split(' (')[0];

            document.getElementById('previewEmployeeName').innerText = empName;
            document.getElementById('previewAnnualSalary').innerText = formatCurrency(annualSalary);
            document.getElementById('previewGross').innerText = formatCurrency(monthlyGross);
            document.getElementById('previewTDS').innerText = formatCurrency(monthlyTDS);
            document.getElementById('previewNet').innerText = formatCurrency(monthlyTakeHome);

            window.currentPayrollData = {
                userId: employeeId,
                month,
                year,
                salary: monthlyTakeHome,
                ctc: annualSalary,
                bonus,
                deductions,
                taxableIncome: taxableIncome,
                totalTax: totalTax,
                taxRegime: regime,
                breakdown: {
                    base: salary,
                    bonus,
                    deductions,
                    stdDeduction,
                    sec80c,
                    homeLoan
                }
            };

            const modal = document.getElementById('payrollPreviewModal');
            if(modal) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }
        },
        submitPayrollRecord: async () => {
            if (!window.currentPayrollData) return;
            const btn = document.getElementById('btnSubmitPayroll');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i data-lucide="loader" class="w-4 h-4 mr-2 animate-spin"></i> Submitting...';
            btn.disabled = true;

            const success = await TDS_PORTAL.db.recordPayroll(window.currentPayrollData);
            if (success) {
                TDS_PORTAL.ui.showToast("Payroll saved successfully (TDS & Net Salary)", "success");
                TDS_PORTAL.ui.closePayrollPreview();
                document.getElementById('payrollForm').reset();
                if(typeof loadPayroll === 'function') loadPayroll();
            } else {
                TDS_PORTAL.ui.showToast("Failed to save payroll", "error");
            }
            btn.innerHTML = originalText;
            btn.disabled = false;
            window.currentPayrollData = null;
        },
        switchRegime: async () => {
            const user = TDS_PORTAL.session.getUser();
            if (!user) {
                TDS_PORTAL.ui.showToast("Session expired. Please login again.", "error");
                return;
            }
            
            const userId = user.id || user._id || user._id;
            if (!userId) {
                console.error("No valid userId found in session:", user);
                TDS_PORTAL.ui.showToast("Problem with user session. Please logout and login again.", "error");
                return;
            }

            try {
                const currentUser = await TDS_PORTAL.db.getUser(userId);
                if (!currentUser) {
                    TDS_PORTAL.ui.showToast("Failed to fetch current user profile.", "error");
                    return;
                }

                const newRegime = (currentUser.taxRegime === 'NEW' || !currentUser.taxRegime) ? 'OLD' : 'NEW';
                
                const success = await TDS_PORTAL.db.updateUser({ id: userId, taxRegime: newRegime });
                if (success) {
                    TDS_PORTAL.ui.showToast(`Switched to ${newRegime} Tax Regime`, "success");
                    if (typeof loadTaxDeclaration === 'function') loadTaxDeclaration();
                    if (typeof loadPayrollData === 'function') loadPayrollData();
                } else {
                    TDS_PORTAL.ui.showToast("Failed to update tax regime on server.", "error");
                }
            } catch (e) {
                console.error("Switch Regime Exception:", e);
                TDS_PORTAL.ui.showToast("Communication error with server.", "error");
            }
        }
    },

    // Data Management
    db: {
        getSystemHealth: async () => {
            const res = await fetch("/api/system/health");
            return await res.json();
        },
        getUsers: async (page = 1, search = '', role = '', status = '') => {
            try {
                const url = new URL("/api/users", window.location.origin);
                url.searchParams.append("page", page || 1);
                if (search) url.searchParams.append("search", search);
                if (role) url.searchParams.append("role", role);
                if (status) url.searchParams.append("status", status);
                const res = await fetch(url);
                return await res.json();
            } catch (error) { return { users: [], total: 0, pages: 0 }; }
        },
        getUser: async (id) => {
            try {
                const res = await fetch(`/api/users/${id}`);
                if (!res.ok) return null;
                return await res.json();
            } catch (e) {
                console.error("Get User Error:", e);
                return null;
            }
        },
        getStats: async () => {
            const res = await fetch("/api/stats");
            return await res.json();
        },
        deleteUser: async (userId) => {
            if (confirm("Are you sure you want to delete this user?")) {
                const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
                if (res.ok) {
                    TDS_PORTAL.ui.showToast("User deleted", "success");
                    if (typeof loadUsers === 'function') loadUsers();
                }
            }
        },
        updateUser: async (user) => {
            const res = await fetch(`/api/users/${user.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(user)
            });
            return res.ok;
        },
        getPayrolls: async () => {
            const res = await fetch(`/api/payroll?_t=${Date.now()}`);
            return await res.json();
        },
        recordPayroll: async (data) => {
            const user = TDS_PORTAL.session.getUser();
            const hrId = user?.id || user?._id;
            
            if (!hrId) {
                console.error("No HR ID found in session");
                return false;
            }

            try {
                const res = await fetch("/api/payroll", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...data, hrId })
                });
                return res.ok;
            } catch (e) {
                console.error("Record Payroll Error:", e);
                return false;
            }
        },
        getUserPayroll: async (userId) => {
            if (!userId) return [];
            try {
                const res = await fetch(`/api/payroll/user/${userId}`);
                if (!res.ok) return [];
                return await res.json();
            } catch (e) { 
                console.error("Get User Payroll Error:", e);
                return []; 
            }
        },
        submitLeaveRequest: async (data) => {
            return await fetch("/api/leaves", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
        },


        getAnnouncements: async () => {
            const res = await fetch("/api/announcements");
            return await res.json();
        },
        sendAnnouncement: async (message) => {
            const hrId = TDS_PORTAL.session.getUser()?.id;
            const res = await fetch("/api/announcements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message, hrId })
            });
            return res.ok;
        },
        getSettings: async () => {
            const res = await fetch("/api/settings");
            return await res.json();
        },
        updateSettings: async (data) => {
            const hrId = TDS_PORTAL.session.getUser()?.id;
            const res = await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, hrId })
            });
            return res.ok;
        },
        viewUser: async (userId) => {
            const data = await TDS_PORTAL.db.getUsers();
            const user = data.users.find(u => u.id === userId);
            if (!user) return;
            const modal = document.createElement('div');
            modal.id = 'userModal';
            modal.className = 'fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm';
            modal.innerHTML = `
                <div class="glass max-w-lg w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-800 p-8">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-2xl font-bold text-white">User Details</h3>
                        <button onclick="document.getElementById('userModal').remove()" class="text-slate-400 hover:text-white"><i data-lucide="x"></i></button>
                    </div>
                    <div class="grid grid-cols-2 gap-4 text-slate-300">
                        <div><p class="text-[10px] uppercase font-bold text-slate-500">Name</p><p class="font-bold text-white">${user.name}</p></div>
                        <div><p class="text-[10px] uppercase font-bold text-slate-500">Employee ID</p><p class="font-bold text-indigo-400">${user.employeeId || 'N/A'}</p></div>
                        <div><p class="text-[10px] uppercase font-bold text-slate-500">PAN Number</p><p class="font-bold text-white">${user.pan || 'NOT SET'}</p></div>
                        <div><p class="text-[10px] uppercase font-bold text-slate-500">Designation</p><p class="font-bold text-white">${user.designation || 'N/A'}</p></div>
                        <div class="col-span-2"><p class="text-[10px] uppercase font-bold text-slate-500">Email Address</p><p class="text-white">${user.email}</p></div>
                        <div><p class="text-[10px] uppercase font-bold text-slate-500">Account Role</p><p class="text-white">${user.role}</p></div>
                        <div><p class="text-[10px] uppercase font-bold text-slate-500">Current Status</p><p class="text-white">${user.status}</p></div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            lucide.createIcons();
            modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        },
        editUser: async (userId) => {
            const data = await TDS_PORTAL.db.getUsers();
            const user = data.users.find(u => u.id === userId);
            if (!user) return;
            const modal = document.createElement('div');
            modal.id = 'editModal';
            modal.className = 'fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm';
            modal.innerHTML = `
                <div class="glass max-w-lg w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-800 p-8">
                    <h3 class="text-2xl font-bold text-white mb-6">Edit User</h3>
                    <form id="editUserForm" class="space-y-4">
                        <input type="hidden" name="id" value="${user.id}">
                        <input type="text" name="name" placeholder="Full Name" value="${user.name}" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white">
                        <input type="email" name="email" placeholder="Email Address" value="${user.email}" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white">
                        <div class="grid grid-cols-2 gap-4">
                            <input type="text" name="pan" placeholder="PAN Number" value="${user.pan || ''}" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white">
                            <input type="text" name="designation" placeholder="Designation" value="${user.designation || ''}" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white">
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <input type="text" name="department" placeholder="Department" value="${user.department || ''}" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white">
                            <input type="text" name="location" placeholder="Location" value="${user.location || ''}" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white">
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <input type="text" name="bankName" placeholder="Bank Name" value="${user.bankName || ''}" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white">
                            <input type="text" name="bankAccountNo" placeholder="Account Number" value="${user.bankAccountNo || ''}" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white">
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <select name="role" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white">
                                <option value="EMPLOYEE" ${user.role==='EMPLOYEE'?'selected':''}>Employee</option>
                                <option value="HR" ${user.role==='HR'?'selected':''}>HR Manager</option>
                            </select>
                            <select name="status" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white">
                                <option value="Active" ${user.status==='Active'?'selected':''}>Active</option>
                                <option value="Blocked" ${user.status==='Blocked'?'selected':''}>Blocked</option>
                            </select>
                        </div>
                        <div class="flex justify-end space-x-3 pt-4">
                            <button type="button" onclick="document.getElementById('editModal').remove()" class="px-6 py-2 bg-slate-800 text-white rounded-xl">Cancel</button>
                            <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-xl">Save</button>
                        </div>
                    </form>
                </div>
            `;
            document.body.appendChild(modal);
            document.getElementById('editUserForm').onsubmit = async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const updated = { 
                    id: formData.get('id'), 
                    name: formData.get('name'), 
                    email: formData.get('email'),
                    pan: formData.get('pan'),
                    designation: formData.get('designation'),
                    department: formData.get('department'),
                    location: formData.get('location'),
                    bankName: formData.get('bankName'),
                    bankAccountNo: formData.get('bankAccountNo'),
                    role: formData.get('role'),
                    status: formData.get('status')
                };
                
                // 📧 Email Format Validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(updated.email)) {
                    TDS_PORTAL.ui.showToast("Please enter a valid email address", "error");
                    return;
                }
                if (await TDS_PORTAL.db.updateUser(updated)) {
                    TDS_PORTAL.ui.showToast("User updated successfully", "success");
                    modal.remove();
                    if (typeof loadUsers === 'function') loadUsers();
                }
            };
        }
    }
};

// Initialize common UI elements
document.addEventListener('DOMContentLoaded', () => {
    TDS_PORTAL.ui.initCommon();
});

// Common functions for legacy compatibility
function logout() { TDS_PORTAL.session.logout(); }
function goBack() { window.history.back(); }

// Init Theme automatically on load
(function() {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
})();

// Handle browser Back/Forward (bfcache) navigation auth checks
window.addEventListener('pageshow', (event) => {
    const currentPath = window.location.pathname;
    if (currentPath.includes('index.html') || currentPath.endsWith('/') || currentPath === '') {
        localStorage.removeItem('loggedInUser');
    } else if (currentPath.includes('-dashboard') || currentPath.includes('dashboard.html') || currentPath.includes('payroll.html')) {
        const user = TDS_PORTAL.session.getUser();
        if (!user) { window.location.href = 'index.html'; }
    }
});

// Dashboard Section Logic
let usersTotalPages = 1;

async function loadUsers() {
    const search = document.getElementById('userSearch')?.value || '';
    const role = document.getElementById('roleFilter')?.value || '';
    const data = await TDS_PORTAL.db.getUsers(userPage, search, role);
    const { users, total, pages } = data;
    
    usersTotalPages = pages;
    const tbody = document.getElementById('userTableBody');
    if (!tbody) return;

    if (document.getElementById('totalCount')) document.getElementById('totalCount').innerText = total;
    if (document.getElementById('showingCount')) document.getElementById('showingCount').innerText = users.length;
    
    tbody.innerHTML = users.length ? users.map(user => `
        <tr class="hover:bg-slate-100 dark:bg-slate-800/30 transition shadow-sm group">
            <td class="px-8 py-5">
                <div class="flex items-center">
                    <div class="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold mr-4 border border-blue-500/20">
                        ${user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                        <p class="text-sm font-bold text-slate-900 dark:text-white">${user.name}</p>
                        <p class="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-0.5">${user.id.slice(0, 8)}</p>
                    </div>
                </div>
            </td>
            <td class="px-8 py-5 text-sm text-slate-700 dark:text-slate-300">${user.email}</td>
            <td class="px-8 py-5">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${user.role === 'HR' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'} border uppercase tracking-wider">
                    ${user.role}
                </span>
            </td>
            <td class="px-8 py-5 text-sm text-slate-500">${user.createdBy || 'System'}</td>
            <td class="px-8 py-5 text-right space-x-2">
                <button onclick="TDS_PORTAL.db.viewUser('${user.id}')" class="p-2.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-500/20 text-slate-500 dark:text-slate-400 hover:text-blue-400 rounded-xl transition-all border border-slate-300 dark:border-slate-700 hover:border-blue-500/30">
                    <i data-lucide="eye" class="w-4.5 h-4.5"></i>
                </button>
                <button onclick="TDS_PORTAL.db.editUser('${user.id}')" class="p-2.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-500/20 text-slate-500 dark:text-slate-400 hover:text-indigo-400 rounded-xl transition-all border border-slate-300 dark:border-slate-700 hover:border-indigo-500/30">
                    <i data-lucide="edit-3" class="w-4.5 h-4.5"></i>
                </button>
                <button onclick="TDS_PORTAL.db.deleteUser('${user.id}')" class="p-2.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-red-500/20 text-slate-500 dark:text-slate-400 hover:text-red-400 rounded-xl transition-all border border-slate-300 dark:border-slate-700 hover:border-red-500/30">
                    <i data-lucide="trash-2" class="w-4.5 h-4.5"></i>
                </button>
            </td>
        </tr>
    `).join('') : `<tr><td colspan="5" class="px-8 py-12 text-center text-slate-500">No users found</td></tr>`;
    lucide.createIcons();
    renderPagination();
}

function renderPagination() {
    const container = document.getElementById('paginationNumbers');
    if (!container) return;
    container.innerHTML = '';
    const start = Math.max(1, userPage - 2);
    const end = Math.min(usersTotalPages, start + 4);
    for (let i = start; i <= end; i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        btn.className = `w-10 h-10 rounded-xl border ${userPage === i ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-blue-500/10 transition-all font-bold text-sm'}`;
        btn.onclick = () => { userPage = i; loadUsers(); };
        container.appendChild(btn);
    }
}

function changePage(delta) { userPage += delta; loadUsers(); }

async function loadPayroll() {
    const empSelect = document.getElementById('payrollEmployee');
    if (empSelect && empSelect.options.length <= 1) {
        try {
            const data = await TDS_PORTAL.db.getUsers();
            if(data && data.users) {
                const employees = data.users.filter(u => u.role === 'EMPLOYEE');
                employees.forEach(emp => {
                    const opt = document.createElement('option');
                    opt.value = emp.id;
                    opt.innerText = `${emp.name} [${emp.employeeId || 'N/A'}]`;
                    empSelect.appendChild(opt);
                });
            }
        } catch (e) {
            console.error("Failed to load employees for payroll:", e);
        }
    }

    try {
        const payrolls = await TDS_PORTAL.db.getPayrolls();
        const tbody = document.getElementById('payrollTableBody');
        if (!tbody) return;
        
        if (!payrolls || !Array.isArray(payrolls)) {
            tbody.innerHTML = '<tr><td colspan="4" class="p-8 text-center text-slate-500">No records found</td></tr>';
            return;
        }

        tbody.innerHTML = payrolls.length ? payrolls.map(p => `
            <tr class="hover:bg-slate-800/30 transition border-b border-slate-800/50">
                <td class="px-6 py-4 flex items-center">
                    <div class="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 mr-3">${p.userId?.name?.[0] || 'U'}</div>
                    <div><p class="text-sm font-bold text-slate-900 dark:text-white">${p.userId?.name || 'Unknown'}</p></div>
                </td>
                <td class="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">${p.month} ${p.year}</td>
                <td class="px-6 py-4 text-sm font-bold text-emerald-400">₹${(p.salary || 0).toLocaleString()}</td>
                <td class="px-6 py-4 text-xs text-slate-500">${p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A'}</td>
            </tr>
        `).join('') : '<tr><td colspan="4" class="p-8 text-center text-slate-500">No records found</td></tr>';
    } catch (e) {
        console.error("Failed to load payroll list:", e);
    }
}

async function loadLogs() {
    const logs = await TDS_PORTAL.db.getLogs();
    const tbody = document.getElementById('logsTableBody');
    if (!tbody) return;
    tbody.innerHTML = logs.map(log => `
        <tr class="hover:bg-slate-800/30 transition border-b border-slate-800/50">
            <td class="px-8 py-5 text-sm text-slate-300 font-medium">${log.hrId?.name || 'System'}</td>
            <td class="px-8 py-5"><span class="px-2 py-1 bg-slate-800 rounded text-[10px] font-bold text-slate-400 border border-slate-700">${log.actionType}</span></td>
            <td class="px-8 py-5 text-sm text-slate-400">${log.description}</td>
            <td class="px-8 py-5 text-xs text-slate-500">${new Date(log.timestamp).toLocaleString()}</td>
        </tr>
    `).join('');
}



function exportPayroll(format) { 
    // Default to the current payroll month/year if we don't have a picker
    window.location.href = `/api/reports/payroll?format=${format}&month=February&year=2026`; 
}

document.addEventListener('submit', async (e) => {
    if (e.target.id === 'leaveRequestForm') {
        e.preventDefault();
        const user = TDS_PORTAL.session.getUser();
        if (!user) {
            TDS_PORTAL.ui.showToast("Session expired, please login again", "error");
            return;
        }
        const btn = e.target.querySelector('button[type="submit"]');
        const originalText = btn.innerText;
        btn.disabled = true;
        btn.innerText = "Submitting...";

        const data = {
            employeeId: user.id || user._id,
            employeeName: user.name,
            leaveType: document.getElementById('leaveType').value,
            startDate: document.getElementById('startDate').value,
            endDate: document.getElementById('endDate').value,
            reason: document.getElementById('leaveReason').value
        };

        // Manual Validation
        if (!data.startDate || !data.endDate) {
            TDS_PORTAL.ui.showToast("Please select both start and end dates", "error");
            btn.disabled = false;
            btn.innerText = originalText;
            return;
        }

        // Helper to parse DD/MM/YYYY
        const parseDate = (str) => {
            if (!str) return null;
            // Support DD/MM/YYYY or DD-MM-YYYY
            const parts = str.split(/[\/\-]/);
            if (parts.length === 3) {
                // Try to handle both DD/MM/YYYY and YYYY/MM/DD
                if (parts[0].length === 4) return new Date(str); // YYYY/MM/DD
                return new Date(parts[2], parts[1] - 1, parts[0]); // DD/MM/YYYY
            }
            return new Date(str);
        };

        const start = parseDate(data.startDate);
        const end = parseDate(data.endDate);
        const today = new Date();
        today.setHours(0,0,0,0);

        if (!start || isNaN(start.getTime()) || !end || isNaN(end.getTime())) {
            TDS_PORTAL.ui.showToast("Please enter valid dates (DD/MM/YYYY)", "error");
            btn.disabled = false;
            btn.innerText = originalText;
            return;
        }

        if (start < today) {
            TDS_PORTAL.ui.showToast("Start date cannot be in the past", "error");
            btn.disabled = false;
            btn.innerText = originalText;
            return;
        }

        if (start > end) {
            TDS_PORTAL.ui.showToast("End date must be after start date!", "error");
            btn.disabled = false;
            btn.innerText = originalText;
            return;
        }

        // Convert to ISO for backend consistency
        data.startDate = start.toISOString();
        data.endDate = end.toISOString();

        console.log("Submitting Leave Request:", data);

        const response = await TDS_PORTAL.db.submitLeaveRequest(data);
        if (response.ok) {
            TDS_PORTAL.ui.showToast("Leave request submitted successfully!", "success");
            e.target.reset();
            if (typeof loadLeaveRequests === 'function') loadLeaveRequests();
        } else {
            const errorData = await response.json().catch(() => ({}));
            TDS_PORTAL.ui.showToast(errorData.message || "Failed to submit leave request", "error");
        }
        btn.disabled = false;
        btn.innerText = originalText;
    }
});
