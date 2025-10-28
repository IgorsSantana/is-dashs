// Lógica da página admin.html – reaproveita funções de auth.js e alguns utilitários do dashboard.js

let adminSession = null;

window.addEventListener('DOMContentLoaded', () => {
    const s = localStorage.getItem('session');
    if (!s) { window.location.href = 'index.html'; return; }
    adminSession = JSON.parse(s);
    if (!adminSession.isAdmin && !adminSession.isAdminTI) { window.location.href = 'index.html'; return; }

    const badge = document.getElementById('adminBadge');
    badge.textContent = adminSession.isAdminTI ? 'Admin TI' : 'Admin';
    badge.style.background = adminSession.isAdminTI ? '#ef4444' : '#667eea';

    if (adminSession.isAdminTI) {
        document.getElementById('companiesTab').style.display = 'inline-block';
    }

    // Aguardar sync carregar dados do Firebase
    setTimeout(() => {
        setupTabs();
        setupActions();
        loadReportsList();
        loadUsersList();
        loadCompaniesList();
    }, 1500);
});

function setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('tab' + capitalize(tab)).classList.add('active');
        });
    });
}

function setupActions() {
    // Fechar modais
    document.querySelectorAll('.modal-close, .modal').forEach(el => {
        el.addEventListener('click', (e) => {
            if (e.target === el || e.target.classList.contains('modal-close')) {
                document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
            }
        });
    });

    document.getElementById('addReportBtn').addEventListener('click', () => openReportForm());
    document.getElementById('addUserBtn').addEventListener('click', () => openUserForm());
    document.getElementById('addCompanyBtn').addEventListener('click', () => openCompanyForm());

    // Mostrar senhas
    if (adminSession.isAdminTI && document.getElementById('showPasswordsBtn')) {
        const btn = document.getElementById('showPasswordsBtn');
        btn.style.display = 'inline-block';
        btn.addEventListener('click', () => {
            const isVisible = localStorage.getItem('showPasswords') === 'true';
            localStorage.setItem('showPasswords', !isVisible);
            loadUsersList();
            btn.textContent = !isVisible ? '🙈 Ocultar Senhas' : '👁️ Mostrar Senhas';
        });
    }

    // Submissões
    document.getElementById('reportForm').addEventListener('submit', (e) => { e.preventDefault(); saveReportFromForm(); });
    document.getElementById('userForm').addEventListener('submit', (e) => { e.preventDefault(); saveUserFromForm(); });
    document.getElementById('companyForm').addEventListener('submit', (e) => { e.preventDefault(); saveCompanyFromForm(); });
}

// Utilitários simples (equivalentes do dashboard.js)
function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }
function formatCompanyName(company) {
    const names = { 'matriz':'Matriz','loja-01':'Loja 01','loja-02':'Loja 02','loja-03':'Loja 03' };
    return names[company] || company;
}
function formatDepartmentName(department) {
    const names = { 'financeiro':'Financeiro','vendas':'Vendas','compras':'Compras','rh':'RH','operacoes':'Operações','gerencia':'Gerência','ti':'TI' };
    return names[department] || department;
}

// Relatórios
function loadReportsList() {
    const reports = getReports();
    const reportsList = document.getElementById('reportsList');
    reportsList.innerHTML = '';
    for (const [id, report] of Object.entries(reports)) {
        const deptInfo = report.departments && report.departments.length > 0 ? report.departments.join(', ') + ' departamentos' : 'Sem departamentos';
        const specificUsersInfo = report.specificUsers && report.specificUsers.length > 0 ? ` + ${report.specificUsers.length} usuário(s) específico(s)` : '';
        const item = document.createElement('div');
        item.className = 'admin-list-item';
        item.innerHTML = `
            <div class="admin-item-info">
                <strong>${report.icon || '📊'} ${report.name}</strong>
                <span class="admin-item-meta">${deptInfo}${specificUsersInfo}</span>
            </div>
            <div class="admin-item-actions">
                <button onclick="editReport('${id}')" class="btn-icon">✏️</button>
                <button onclick="deleteReportConfirm('${id}')" class="btn-icon">🗑️</button>
            </div>`;
        reportsList.appendChild(item);
    }
}

function openReportForm(reportId = null) {
    document.getElementById('reportFormTitle').textContent = reportId ? 'Editar Relatório' : 'Adicionar Relatório';
    document.getElementById('reportForm').reset();
    document.getElementById('reportFormId').value = reportId || '';
    loadUsersForReportForm();
    if (reportId) {
        const reports = getReports();
        const report = reports[reportId];
        if (report) {
            document.getElementById('reportFormName').value = report.name;
            document.getElementById('reportFormUrl').value = report.url;
            document.getElementById('reportFormIcon').value = report.icon || '📊';
            document.querySelectorAll('.department-checkbox').forEach(cb => { cb.checked = report.departments?.includes(cb.value); });
            filterUsersByDepartments();
            if (report.specificUsers && report.specificUsers.length > 0) {
                report.specificUsers.forEach(userId => {
                    const checkbox = document.querySelector(`input.user-checkbox[value="${userId}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
        }
    }
    document.getElementById('reportFormModal').classList.add('active');
}

function loadUsersForReportForm() {
    const users = getUsers();
    const specificUsersList = document.getElementById('specificUsersList');
    specificUsersList.innerHTML = users.map(user => `
        <label class="user-checkbox-label">
            <input type="checkbox" value="${user.id}" class="user-checkbox">
            ${user.username} (${formatCompanyName(user.company)})
        </label>`).join('');
}

function filterUsersByDepartments() {
    const selectedDepartments = Array.from(document.querySelectorAll('.department-checkbox:checked')).map(cb => cb.value);
    const users = getUsers();
    const specificUsersList = document.getElementById('specificUsersList');
    const filterInfo = document.getElementById('userFilterInfo');
    let filteredUsers;
    let infoText = '';
    if (selectedDepartments.length === 0) { filteredUsers = users; infoText = ''; }
    else {
        filteredUsers = users.filter(u => selectedDepartments.includes(u.department));
        if (filteredUsers.length === 0) infoText = '(nenhum usuário nos departamentos selecionados)';
        else if (filteredUsers.length === 1) infoText = '(1 usuário)';
        else infoText = `(${filteredUsers.length} usuários)`;
    }
    filterInfo.textContent = infoText;
    const checkedUsers = Array.from(document.querySelectorAll('.user-checkbox:checked')).map(cb => cb.value);
    specificUsersList.innerHTML = filteredUsers.map(user => {
        const isChecked = checkedUsers.includes(user.id);
        return `<label class="user-checkbox-label"><input type="checkbox" value="${user.id}" class="user-checkbox" ${isChecked ? 'checked' : ''}> ${user.username} (${formatCompanyName(user.company)})</label>`;
    }).join('');
}

function saveReportFromForm() {
    const reportId = document.getElementById('reportFormId').value;
    const departments = Array.from(document.querySelectorAll('.department-checkbox:checked')).map(cb => cb.value);
    const specificUsers = Array.from(document.querySelectorAll('.user-checkbox:checked')).map(cb => cb.value);
    if (departments.length === 0 && specificUsers.length === 0) { alert('Selecione pelo menos um departamento ou usuário específico!'); return; }
    const report = {
        id: reportId,
        name: document.getElementById('reportFormName').value,
        url: document.getElementById('reportFormUrl').value,
        icon: document.getElementById('reportFormIcon').value,
        departments: departments.length > 0 ? departments : null,
        specificUsers: specificUsers.length > 0 ? specificUsers : null
    };
    saveReport(report);
    document.getElementById('reportFormModal').classList.remove('active');
    loadReportsList();
    alert('Relatório salvo com sucesso!');
}

function editReport(reportId) { openReportForm(reportId); }
function deleteReportConfirm(reportId) { if (confirm('Excluir relatório?')) { deleteReport(reportId); loadReportsList(); alert('Relatório excluído!'); } }
function closeReportForm() { document.getElementById('reportFormModal').classList.remove('active'); }

// Usuários
function loadUsersList() {
    const users = getUsers();
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = '';
    const showPasswords = localStorage.getItem('showPasswords') === 'true';
    users.forEach(user => {
        const item = document.createElement('div');
        item.className = 'admin-list-item';
        const roleBadge = user.isAdminTI ? ' (Admin TI)' : (user.isAdmin ? ' (Admin)' : '');
        const passwordHtml = (showPasswords && (adminSession?.isAdminTI)) ? `<span class="admin-item-meta"><strong>Senha:</strong> ${getDecryptedPassword(user)}</span>` : '';
        item.innerHTML = `<div class="admin-item-info"><strong>${user.username}</strong><span class="admin-item-meta">${formatCompanyName(user.company)} - ${formatDepartmentName(user.department)}${roleBadge}</span>${passwordHtml}</div><div class="admin-item-actions"><button onclick=\"editUser('${user.id}')\" class=\"btn-icon\">✏️</button><button onclick=\"deleteUserConfirm('${user.id}')\" class=\"btn-icon\">🗑️</button></div>`;
        usersList.appendChild(item);
    });
}

function openUserForm(userId = null) {
    document.getElementById('userFormTitle').textContent = userId ? 'Editar Usuário' : 'Adicionar Usuário';
    document.getElementById('userForm').reset();
    document.getElementById('userFormId').value = userId || '';
    populateCompaniesSelect();
    if (userId) {
        const users = getUsers();
        const user = users.find(u => u.id === userId);
        if (user) {
            document.getElementById('userFormUsername').value = user.username;
            document.getElementById('userFormCompany').value = user.company;
            document.getElementById('userFormDepartment').value = user.department;
            if (document.getElementById('userFormIsAdminTI')) document.getElementById('userFormIsAdminTI').checked = !!user.isAdminTI;
            document.getElementById('userFormPassword').required = false;
            document.getElementById('userFormPassword').value = '';
            document.getElementById('userFormPassword').placeholder = 'Deixe em branco para manter a senha';
        }
    }
    const isAdminTIField = document.getElementById('isAdminTIField');
    if (isAdminTIField) { isAdminTIField.style.display = adminSession?.isAdminTI ? 'block' : 'none'; }
    document.getElementById('userFormModal').classList.add('active');
}

function saveUserFromForm() {
    const userId = document.getElementById('userFormId').value;
    const user = {
        id: userId,
        username: document.getElementById('userFormUsername').value,
        password: (userId && document.getElementById('userFormPassword').value === '') ? '***PRESERVED***' : document.getElementById('userFormPassword').value,
        company: document.getElementById('userFormCompany').value,
        department: document.getElementById('userFormDepartment').value,
        isAdmin: false,
        isAdminTI: document.getElementById('userFormIsAdminTI') ? document.getElementById('userFormIsAdminTI').checked : false
    };
    saveUser(user);
    document.getElementById('userFormModal').classList.remove('active');
    loadUsersList();
    alert('Usuário salvo com sucesso!');
}

function editUser(userId) { openUserForm(userId); }
function deleteUserConfirm(userId) { if (userId === adminSession.id) { alert('Você não pode excluir seu próprio usuário!'); return; } if (confirm('Excluir usuário?')) { deleteUser(userId); loadUsersList(); alert('Usuário excluído!'); } }
function closeUserForm() { document.getElementById('userFormModal').classList.remove('active'); }

// Empresas
function loadCompaniesList() {
    const companies = getCompanies();
    const companiesList = document.getElementById('companiesList');
    if (!companiesList) return;
    companiesList.innerHTML = '';
    companies.forEach(company => {
        const item = document.createElement('div');
        item.className = 'admin-list-item';
        item.innerHTML = `<div class=\"admin-item-info\"><strong>${company.name}</strong><span class=\"admin-item-meta\">Código: ${company.code}</span></div><div class=\"admin-item-actions\"><button onclick=\"editCompany('${company.id}')\" class=\"btn-icon\">✏️</button><button onclick=\"deleteCompanyConfirm('${company.id}')\" class=\"btn-icon\">🗑️</button></div>`;
        companiesList.appendChild(item);
    });
}

function openCompanyForm(companyId = null) {
    if (!adminSession?.isAdminTI) { alert('Apenas Admin TI pode gerenciar empresas.'); return; }
    document.getElementById('companyFormTitle').textContent = companyId ? 'Editar Empresa' : 'Adicionar Empresa';
    document.getElementById('companyForm').reset();
    document.getElementById('companyFormId').value = companyId || '';
    if (companyId) {
        const companies = getCompanies();
        const company = companies.find(c => c.id === companyId);
        if (company) {
            document.getElementById('companyFormName').value = company.name;
            document.getElementById('companyFormCode').value = company.code;
        }
    }
    document.getElementById('companyFormModal').classList.add('active');
}

function saveCompanyFromForm() {
    const company = { id: document.getElementById('companyFormId').value, name: document.getElementById('companyFormName').value, code: document.getElementById('companyFormCode').value };
    saveCompany(company);
    document.getElementById('companyFormModal').classList.remove('active');
    loadCompaniesList();
    populateCompaniesSelect();
    alert('Empresa salva com sucesso!');
}

function deleteCompanyConfirm(companyId) { if (!adminSession?.isAdminTI) { alert('Apenas Admin TI pode gerenciar empresas.'); return; } if (confirm('Excluir empresa?')) { deleteCompany(companyId); loadCompaniesList(); populateCompaniesSelect(); alert('Empresa excluída!'); } }
function closeCompanyForm() { document.getElementById('companyFormModal').classList.remove('active'); }

function populateCompaniesSelect() {
    const select = document.getElementById('userFormCompany');
    if (!select) return;
    const baseOptions = [
        { code: 'matriz', name: 'Matriz' },
        { code: 'loja-01', name: 'Loja 01' },
        { code: 'loja-02', name: 'Loja 02' },
        { code: 'loja-03', name: 'Loja 03' }
    ];
    const companies = getCompanies();
    const merged = [...baseOptions, ...companies.map(c => ({ code: c.code, name: c.name }))];
    const current = select.value;
    select.innerHTML = merged.map(c => `<option value="${c.code}">${c.name}</option>`).join('');
    if (current) select.value = current;
}


