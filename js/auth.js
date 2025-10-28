// Sistema de autenticação e gerenciamento de usuários

// Inicializar usuário admin padrão
function initializeDefaultUsers() {
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    // Se existir SEED_DATA e ainda não populado, carregar
    if (users.length === 0 && typeof window !== 'undefined' && window.SEED_DATA) {
        try {
            const seed = window.SEED_DATA;
            if (Array.isArray(seed.users)) {
                users = seed.users;
                localStorage.setItem('users', JSON.stringify(users));
            }
            if (Array.isArray(seed.companies)) {
                localStorage.setItem('companies', JSON.stringify(seed.companies));
            }
            if (seed.companyDepartments) {
                localStorage.setItem('companyDepartments', JSON.stringify(seed.companyDepartments));
            }
        } catch {}
    }

    const needAdminTI = !users.some(u => u.isAdminTI);
    const needAdmin = !users.some(u => u.username === 'admin');
    
    if (users.length === 0 || needAdminTI || needAdmin) {
        // Criar usuário admin TI padrão
        if (needAdminTI) {
            const defaultAdminTI = {
                id: 'admin-ti',
                username: 'admin-ti',
                password: btoa('admin-ti-123'), // Senha: admin-ti-123
                company: 'matriz',
                department: 'ti',
                isAdminTI: true,
                isAdmin: true
            };
            users.push(defaultAdminTI);
        }
        
        // Criar usuário admin padrão
        if (needAdmin) {
            const defaultAdmin = {
                id: 'admin',
                username: 'admin',
                password: btoa('admin123'), // Senha: admin123
                company: 'matriz',
                department: 'gerencia',
                isAdmin: true
            };
            users.push(defaultAdmin);
        }
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// Função para validar login
function validateLogin(username, password) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const encryptedPassword = btoa(password);
    
    const user = users.find(u => u.username === username);
    
    if (!user) {
        return { success: false, message: 'Usuário não encontrado' };
    }
    
    if (user.password !== encryptedPassword) {
        return { success: false, message: 'Senha incorreta' };
    }
    
    return { success: true, user: user };
}

// Função para obter usuários
function getUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
}

// Função para adicionar/editar usuário
function saveUser(user) {
    const users = getUsers();
    
    if (user.id) {
        // Editar usuário existente
        const index = users.findIndex(u => u.id === user.id);
        if (index !== -1) {
            const existingUser = users[index];
            // Preservar senha original se não foi alterada
            const password = user.password && user.password !== '***PRESERVED***' ? btoa(user.password) : existingUser.password;
            users[index] = { ...existingUser, ...user, password };
        }
    } else {
        // Adicionar novo usuário
        user.id = 'user_' + Date.now();
        user.password = btoa(user.password);
        users.push(user);
    }
    
    localStorage.setItem('users', JSON.stringify(users));
    return user;
}

// Função para excluir usuário
function deleteUser(userId) {
    const users = getUsers();
    const filteredUsers = users.filter(u => u.id !== userId);
    localStorage.setItem('users', JSON.stringify(filteredUsers));
}

// Função para obter empresas
function getCompanies() {
    return JSON.parse(localStorage.getItem('companies') || '[]');
}

// Função para salvar empresas
function saveCompanies(companies) {
    localStorage.setItem('companies', JSON.stringify(companies));
}

// Função para adicionar/editar empresa
function saveCompany(company) {
    const companies = getCompanies();
    
    if (company.id) {
        // Editar empresa existente
        const index = companies.findIndex(c => c.id === company.id);
        if (index !== -1) {
            companies[index] = company;
        }
    } else {
        // Adicionar nova empresa
        company.id = 'company_' + Date.now();
        companies.push(company);
    }
    
    saveCompanies(companies);
    return company;
}

// Função para excluir empresa
function deleteCompany(companyId) {
    const companies = getCompanies();
    const filteredCompanies = companies.filter(c => c.id !== companyId);
    saveCompanies(filteredCompanies);
}

// Função para ver senha (apenas Admin TI)
function canViewPassword(user) {
    const session = JSON.parse(localStorage.getItem('session') || '{}');
    return session.isAdminTI || session.isAdmin;
}

// Função para obter senha descriptografada
function getDecryptedPassword(user) {
    try {
        return atob(user.password);
    } catch {
        return '***';
    }
}

// Função para obter relatórios
function getReports() {
    const reports = localStorage.getItem('reports');
    if (reports) {
        return JSON.parse(reports);
    }
    
    // Retornar relatórios padrão do CONFIG
    return CONFIG.REPORTS;
}

// Função para salvar relatórios
function saveReports(reports) {
    localStorage.setItem('reports', JSON.stringify(reports));
}

// Função para adicionar/editar relatório
function saveReport(report) {
    const reports = getReports();
    
    if (report.id) {
        // Editar relatório existente
        reports[report.id] = {
            name: report.name,
            url: report.url,
            icon: report.icon || '📊',
            departments: report.departments,
            specificUsers: report.specificUsers
        };
    } else {
        // Adicionar novo relatório
        const id = 'report_' + Date.now();
        reports[id] = {
            name: report.name,
            url: report.url,
            icon: report.icon || '📊',
            departments: report.departments,
            specificUsers: report.specificUsers
        };
    }
    
    saveReports(reports);
    return reports;
}

// Função para excluir relatório
function deleteReport(reportId) {
    const reports = getReports();
    delete reports[reportId];
    saveReports(reports);
}

