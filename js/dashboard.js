// Gerenciamento do dashboard

let currentSession = null;
let availableReports = [];

// Inicializar dashboard
window.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadSession();
    renderSidebar();
    setupEventListeners();
    setupAdminPanel();
});

// Verificar autenticação
function checkAuth() {
    const session = localStorage.getItem('session');
    
    if (!session) {
        window.location.href = 'index.html';
        return;
    }
    
    currentSession = JSON.parse(session);
}

// Carregar dados da sessão
function loadSession() {
    if (currentSession) {
        // Exibir informações do usuário
        const userNameEl = document.getElementById('userName');
        const companyInfoEl = document.getElementById('companyInfo');
        const userRoleEl = document.getElementById('userRole');
        
        userNameEl.textContent = currentSession.username;
        companyInfoEl.textContent = formatCompanyName(currentSession.company);
        
        // Mostrar role se admin ou admin TI
        if (currentSession.isAdminTI) {
            userRoleEl.textContent = 'Admin TI';
            userRoleEl.style.color = '#ef4444';
            document.getElementById('adminPanelBtn').style.display = 'block';
        } else if (currentSession.isAdmin) {
            userRoleEl.textContent = 'Admin';
            userRoleEl.style.color = '#fbbf24';
            document.getElementById('adminPanelBtn').style.display = 'block';
        }
        
        // Obter relatórios disponíveis
        const reports = getReports();
        
        // Admin TI tem acesso a TODOS os relatórios
        if (currentSession.isAdminTI) {
            availableReports = Object.entries(reports).map(([id, report]) => ({
                id: id,
                ...report
            }));
        } else {
            availableReports = getAvailableReports(
                currentSession.department,
                reports
            );
        }
    }
}

// Renderizar sidebar com relatórios
function renderSidebar() {
    const reportList = document.getElementById('reportList');
    
    if (availableReports.length === 0) {
        reportList.innerHTML = `
            <li class="report-item">
                <span class="report-name">Nenhum relatório disponível</span>
            </li>
        `;
        return;
    }
    
    reportList.innerHTML = availableReports.map((report, index) => `
        <li class="report-item ${index === 0 ? 'active' : ''}" data-report-id="${report.id}">
            <span class="report-name">${report.icon} ${report.name}</span>
            <span class="report-department">${formatDepartmentName(getDepartmentDisplay(report.departments))}</span>
        </li>
    `).join('');
    
    // Se houver relatórios, carregar o primeiro
    if (availableReports.length > 0 && availableReports[0]) {
        loadReport(availableReports[0].id);
    }
}

// Setup de event listeners
function setupEventListeners() {
    // Clique em relatório da sidebar
    document.addEventListener('click', (e) => {
        const reportItem = e.target.closest('.report-item[data-report-id]');
        
        if (reportItem) {
            const reportId = reportItem.dataset.reportId;
            
            // Remover active de todos
            document.querySelectorAll('.report-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Adicionar active ao item clicado
            reportItem.classList.add('active');
            
            // Carregar relatório
            loadReport(reportId);
        }
    });
    
    // Botão de logout
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', () => {
        if (confirm('Deseja sair do sistema?')) {
            localStorage.removeItem('session');
            window.location.href = 'index.html';
        }
    });
}

// Setup do painel admin
function setupAdminPanel() {
    // Botão Power BI Login
    const powerbiLoginBtn = document.getElementById('powerbiLoginBtn');
    if (powerbiLoginBtn) {
        powerbiLoginBtn.addEventListener('click', () => {
            // Abrir Power BI em nova aba para login
            window.open('https://app.powerbi.com', '_blank');
            
            // Mostrar mensagem
            setTimeout(() => {
                alert('Faça login no Power BI que abriu em nova aba. Depois volte aqui e os relatórios funcionarão!');
            }, 500);
        });
    }
    
    if (!currentSession || (!currentSession.isAdmin && !currentSession.isAdminTI)) {
        return;
    }
    
    // Botão admin panel -> abre página admin
    const adminPanelBtn = document.getElementById('adminPanelBtn');
    if (adminPanelBtn) {
        adminPanelBtn.addEventListener('click', () => {
            window.location.href = 'admin.html';
        });
    }
    
    // Fechar modais
    document.querySelectorAll('.modal-close, .modal').forEach(el => {
        el.addEventListener('click', (e) => {
            if (e.target === el || e.target.classList.contains('modal-close')) {
                document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
            }
        });
    });
    
    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById('tab' + capitalize(tab)).classList.add('active');
        });
    });
    
    // Botões de ação
    document.getElementById('addReportBtn').addEventListener('click', () => {
        openReportForm();
    });
    
    document.getElementById('addUserBtn').addEventListener('click', () => {
        openUserForm();
    });
    
    document.getElementById('addCompanyBtn').addEventListener('click', () => {
        openCompanyForm();
    });
    
    // Botão mostrar senhas (apenas para Admin TI)
    if (currentSession?.isAdminTI) {
        document.getElementById('showPasswordsBtn').style.display = 'inline-block';
        document.getElementById('isAdminTIField').style.display = 'block';
        
        document.getElementById('showPasswordsBtn').addEventListener('click', () => {
            const isVisible = localStorage.getItem('showPasswords') === 'true';
            localStorage.setItem('showPasswords', !isVisible);
            loadUsersList();
            document.getElementById('showPasswordsBtn').textContent = !isVisible ? '🙈 Ocultar Senhas' : '👁️ Mostrar Senhas';
        });
    }
    
    // Form de relatório
    document.getElementById('reportForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveReportFromForm();
    });
    
    // Form de usuário
    document.getElementById('userForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveUserFromForm();
    });
    
    // Filtrar usuários quando departamentos forem selecionados
    setupDepartmentFilter();
}

// Carregar painel admin
function loadAdminPanel() {
    if (!currentSession?.isAdmin && !currentSession?.isAdminTI) return;
    
    // Mostrar aba de empresas apenas para Admin TI
    if (currentSession.isAdminTI) {
        document.getElementById('companiesTab').style.display = 'block';
    }
    
    loadReportsList();
    loadUsersList();
    loadCompaniesList();
}

// Carregar lista de relatórios
function loadReportsList() {
    const reports = getReports();
    const reportsList = document.getElementById('reportsList');
    
    reportsList.innerHTML = '';
    
    for (const [id, report] of Object.entries(reports)) {
        const deptInfo = report.departments && report.departments.length > 0 
            ? report.departments.join(', ') + ' departamentos'
            : 'Sem departamentos';
        
        const specificUsersInfo = report.specificUsers && report.specificUsers.length > 0
            ? ` + ${report.specificUsers.length} usuário(s) específico(s)`
            : '';
        
        const item = document.createElement('div');
        item.className = 'admin-list-item';
        item.innerHTML = `
            <div class="admin-item-info">
                <strong>${report.icon} ${report.name}</strong>
                <span class="admin-item-meta">${deptInfo}${specificUsersInfo}</span>
            </div>
            <div class="admin-item-actions">
                <button onclick="editReport('${id}')" class="btn-icon">✏️</button>
                <button onclick="deleteReportConfirm('${id}')" class="btn-icon">🗑️</button>
            </div>
        `;
        reportsList.appendChild(item);
    }
}

// Carregar lista de usuários
function loadUsersList() {
    const users = getUsers();
    const usersList = document.getElementById('usersList');
    
    usersList.innerHTML = '';
    
    const showPasswords = localStorage.getItem('showPasswords') === 'true';
    users.forEach(user => {
        const item = document.createElement('div');
        item.className = 'admin-list-item';
        const roleBadge = user.isAdminTI ? ' (Admin TI)' : (user.isAdmin ? ' (Admin)' : '');
        const passwordHtml = (showPasswords && (currentSession?.isAdminTI))
            ? `<span class="admin-item-meta"><strong>Senha:</strong> ${getDecryptedPassword(user)}</span>`
            : '';
        item.innerHTML = `
            <div class="admin-item-info">
                <strong>${user.username}</strong>
                <span class="admin-item-meta">${formatCompanyName(user.company)} - ${formatDepartmentName(user.department)}${roleBadge}</span>
                ${passwordHtml}
            </div>
            <div class="admin-item-actions">
                <button onclick="editUser('${user.id}')" class="btn-icon">✏️</button>
                <button onclick="deleteUserConfirm('${user.id}')" class="btn-icon">🗑️</button>
            </div>
        `;
        usersList.appendChild(item);
    });
}

// Abrir form de relatório
function openReportForm(reportId = null) {
    document.getElementById('reportFormTitle').textContent = reportId ? 'Editar Relatório' : 'Adicionar Relatório';
    document.getElementById('reportForm').reset();
    document.getElementById('reportFormId').value = reportId || '';
    
    // Preencher lista de usuários
    loadUsersForReportForm();
    
    if (reportId) {
        const reports = getReports();
        const report = reports[reportId];
        if (report) {
            document.getElementById('reportFormName').value = report.name;
            document.getElementById('reportFormUrl').value = report.url;
            document.getElementById('reportFormIcon').value = report.icon || '📊';
            
            // Marcar departamentos
            document.querySelectorAll('.department-checkbox').forEach(cb => {
                cb.checked = report.departments?.includes(cb.value);
            });
            
            // Aplicar filtro de usuários baseado nos departamentos selecionados
            filterUsersByDepartments();
            
            // Marcar usuários específicos
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

// Configurar filtro de departamentos
function setupDepartmentFilter() {
    const departmentCheckboxes = document.querySelectorAll('.department-checkbox');
    departmentCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', filterUsersByDepartments);
    });
}

// Filtrar usuários por departamentos selecionados
function filterUsersByDepartments() {
    const selectedDepartments = Array.from(document.querySelectorAll('.department-checkbox:checked')).map(cb => cb.value);
    const users = getUsers();
    const specificUsersList = document.getElementById('specificUsersList');
    const filterInfo = document.getElementById('userFilterInfo');
    
    let filteredUsers;
    let infoText = '';
    
    // Se nenhum departamento está selecionado, mostra todos os usuários
    if (selectedDepartments.length === 0) {
        filteredUsers = users;
        infoText = '';
    } else {
        // Filtrar usuários pelos departamentos selecionados
        filteredUsers = users.filter(user => selectedDepartments.includes(user.department));
        
        if (filteredUsers.length === 0) {
            infoText = '(nenhum usuário nos departamentos selecionados)';
        } else if (filteredUsers.length === 1) {
            infoText = '(1 usuário)';
        } else {
            infoText = `(${filteredUsers.length} usuários)`;
        }
    }
    
    // Atualizar info
    filterInfo.textContent = infoText;
    
    // Salvar checkboxes marcados antes de atualizar
    const checkedUsers = Array.from(document.querySelectorAll('.user-checkbox:checked')).map(cb => cb.value);
    
    specificUsersList.innerHTML = filteredUsers.map(user => {
        const isChecked = checkedUsers.includes(user.id);
        return `
            <label class="user-checkbox-label">
                <input type="checkbox" value="${user.id}" class="user-checkbox" ${isChecked ? 'checked' : ''}>
                ${user.username} (${formatCompanyName(user.company)})
            </label>
        `;
    }).join('');
}

// Carregar lista de usuários para o form
function loadUsersForReportForm() {
    const users = getUsers();
    const specificUsersList = document.getElementById('specificUsersList');
    
    specificUsersList.innerHTML = users.map(user => `
        <label class="user-checkbox-label">
            <input type="checkbox" value="${user.id}" class="user-checkbox">
            ${user.username} (${formatCompanyName(user.company)})
        </label>
    `).join('');
}

// Salvar relatório do form
function saveReportFromForm() {
    const reportId = document.getElementById('reportFormId').value;
    const departments = Array.from(document.querySelectorAll('.department-checkbox:checked')).map(cb => cb.value);
    const specificUsers = Array.from(document.querySelectorAll('.user-checkbox:checked')).map(cb => cb.value);
    
    // Validar
    if (departments.length === 0 && specificUsers.length === 0) {
        alert('Selecione pelo menos um departamento ou usuário específico!');
        return;
    }
    
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
    loadSession();
    renderSidebar();
    
    alert('Relatório salvo com sucesso!');
}

// Abrir form de usuário
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
            document.getElementById('userFormIsAdmin').checked = user.isAdmin;
            if (document.getElementById('userFormIsAdminTI')) {
                document.getElementById('userFormIsAdminTI').checked = !!user.isAdminTI;
            }
            document.getElementById('userFormPassword').required = false;
            document.getElementById('userFormPassword').value = '';
            document.getElementById('userFormPassword').placeholder = 'Deixe em branco para manter a senha';
        }
    }
    // Mostrar campo Admin TI somente para Admin TI logado
    const isAdminTIField = document.getElementById('isAdminTIField');
    if (isAdminTIField) {
        isAdminTIField.style.display = currentSession?.isAdminTI ? 'block' : 'none';
    }
    
    document.getElementById('userFormModal').classList.add('active');
}

// Salvar usuário do form
function saveUserFromForm() {
    const userId = document.getElementById('userFormId').value;
    
    const user = {
        id: userId,
        username: document.getElementById('userFormUsername').value,
        password: (userId && document.getElementById('userFormPassword').value === '') ? '***PRESERVED***' : document.getElementById('userFormPassword').value,
        company: document.getElementById('userFormCompany').value,
        department: document.getElementById('userFormDepartment').value,
        isAdmin: document.getElementById('userFormIsAdmin').checked,
        isAdminTI: document.getElementById('userFormIsAdminTI') ? document.getElementById('userFormIsAdminTI').checked : false
    };
    
    saveUser(user);
    
    document.getElementById('userFormModal').classList.remove('active');
    loadUsersList();
    
    alert('Usuário salvo com sucesso!');
}

// Editar relatório
function editReport(reportId) {
    openReportForm(reportId);
}

// Editar usuário
function editUser(userId) {
    openUserForm(userId);
}

// Confirmar exclusão de relatório
function deleteReportConfirm(reportId) {
    if (confirm('Deseja realmente excluir este relatório?')) {
        deleteReport(reportId);
        loadReportsList();
        loadSession();
        renderSidebar();
        alert('Relatório excluído!');
    }
}

// Confirmar exclusão de usuário
function deleteUserConfirm(userId) {
    if (userId === currentSession.id) {
        alert('Você não pode excluir seu próprio usuário!');
        return;
    }
    
    if (confirm('Deseja realmente excluir este usuário?')) {
        deleteUser(userId);
        loadUsersList();
        alert('Usuário excluído!');
    }
}

// Fechar form de relatório
function closeReportForm() {
    document.getElementById('reportFormModal').classList.remove('active');
}

// Fechar form de usuário
function closeUserForm() {
    document.getElementById('userFormModal').classList.remove('active');
}

// Empresas
function loadCompaniesList() {
    const companies = getCompanies();
    const companiesList = document.getElementById('companiesList');
    if (!companiesList) return;
    companiesList.innerHTML = '';
    companies.forEach(company => {
        const item = document.createElement('div');
        item.className = 'admin-list-item';
        item.innerHTML = `
            <div class="admin-item-info">
                <strong>${company.name}</strong>
                <span class="admin-item-meta">Código: ${company.code}</span>
            </div>
            <div class="admin-item-actions">
                <button onclick="editCompany('${company.id}')" class="btn-icon">✏️</button>
                <button onclick="deleteCompanyConfirm('${company.id}')" class="btn-icon">🗑️</button>
            </div>
        `;
        companiesList.appendChild(item);
    });
}

function openCompanyForm(companyId = null) {
    if (!currentSession?.isAdminTI) {
        alert('Apenas Admin TI pode gerenciar empresas.');
        return;
    }
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
    document.getElementById('companyForm').onsubmit = (e) => {
        e.preventDefault();
        saveCompanyFromForm();
    };
    document.getElementById('companyFormModal').classList.add('active');
}

function saveCompanyFromForm() {
    const company = {
        id: document.getElementById('companyFormId').value,
        name: document.getElementById('companyFormName').value,
        code: document.getElementById('companyFormCode').value
    };
    saveCompany(company);
    document.getElementById('companyFormModal').classList.remove('active');
    loadCompaniesList();
    // Atualizar selects de empresas
    populateCompaniesSelect();
    alert('Empresa salva com sucesso!');
}

function deleteCompanyConfirm(companyId) {
    if (!currentSession?.isAdminTI) {
        alert('Apenas Admin TI pode gerenciar empresas.');
        return;
    }
    if (confirm('Deseja realmente excluir esta empresa?')) {
        deleteCompany(companyId);
        loadCompaniesList();
        populateCompaniesSelect();
        alert('Empresa excluída!');
    }
}

function closeCompanyForm() {
    document.getElementById('companyFormModal').classList.remove('active');
}

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
    if (current) {
        select.value = current;
    }
}

// Carregar relatório
function loadReport(reportId) {
    const reports = getReports();
    const report = reports[reportId];
    
    if (!report) {
        console.error('Relatório não encontrado:', reportId);
        return;
    }
    
    // Atualizar título
    document.getElementById('selectedReportTitle').textContent = report.name;
    
    // Renderizar container do relatório
    const container = document.getElementById('reportContainer');
    
    if (!report.url || report.url.includes('SEU_LINK_AQUI')) {
        container.innerHTML = `
            <div class="welcome-message">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <line x1="9" y1="3" x2="9" y2="21"/>
                    <line x1="9" y1="9" x2="21" y2="9"/>
                </svg>
                <h2>Configuração Necessária</h2>
                <p><strong>${report.name}</strong> precisa ser configurado.</p>
                <p style="margin-top: 20px; font-size: 14px;">
                    Configure a URL do Power BI no Painel Administrativo.
                </p>
            </div>
        `;
    } else {
        // Criar iframe para embed do Power BI
        container.innerHTML = `
            <div class="loading">Carregando relatório...</div>
        `;
        
        // Simular carregamento
        setTimeout(() => {
            container.innerHTML = `
                <div class="iframe-wrapper">
                    <iframe 
                        title="${report.name}" 
                        src="${report.url}" 
                        frameborder="0" 
                        allowfullscreen="true">
                    </iframe>
                </div>
            `;
        }, 500);
    }
}

// Função para obter relatórios disponíveis
function getAvailableReports(userDepartment, reports) {
    const available = [];
    const currentUser = currentSession;
    
    for (const [id, report] of Object.entries(reports)) {
        let hasAccess = false;
        
        // Verificar acesso por departamento
        const hasDepartmentAccess = report.departments && 
                                   report.departments.length > 0 && 
                                   report.departments.includes(userDepartment);
        
        // Verificar acesso por usuário específico
        const hasSpecificUserAccess = report.specificUsers && 
                                     Array.isArray(report.specificUsers) && 
                                     report.specificUsers.length > 0 && 
                                     report.specificUsers.includes(currentUser.id);
        
        // OR lógica: acesso por departamento OU por usuário específico
        hasAccess = hasDepartmentAccess || hasSpecificUserAccess;
        
        if (hasAccess) {
            available.push({
                id: id,
                ...report
            });
        }
    }
    
    return available;
}

// Funções auxiliares
function formatCompanyName(company) {
    const names = {
        'matriz': 'Matriz',
        'loja-01': 'Loja 01',
        'loja-02': 'Loja 02',
        'loja-03': 'Loja 03'
    };
    return names[company] || company;
}

function formatDepartmentName(department) {
    const names = {
        'financeiro': 'Financeiro',
        'vendas': 'Vendas',
        'compras': 'Compras',
        'rh': 'RH',
        'operacoes': 'Operações',
        'gerencia': 'Gerência',
        'ti': 'TI'
    };
    return names[department] || department;
}

function getDepartmentDisplay(departments) {
    return departments?.[0] || '';
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
