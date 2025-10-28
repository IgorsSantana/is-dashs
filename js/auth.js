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
    // Usar localStorage por enquanto
    // Firebase pode ser adicionado depois com cache sincronizado
    return JSON.parse(localStorage.getItem('users') || '[]');
}

// Função para salvar também no Firebase (assíncrono)
async function syncUsersToFirebase(users) {
    // Verificar se Firebase está disponível
    if (typeof db === 'undefined' || !db) {
        return;
    }
    
    try {
        // Criar batch para salvar tudo de uma vez
        const batch = db.batch();
        users.forEach(user => {
            const userRef = db.collection('users').doc(user.id);
            const { id, ...userData } = user;
            batch.set(userRef, userData);
        });
        await batch.commit();
        console.log('✅ Dados sincronizados com Firebase');
    } catch (e) {
        console.log('⚠️ Firebase não disponível:', e.message);
    }
}

// Função para adicionar/editar usuário
function saveUser(user) {
    const users = getUsers();
    
    if (!user.id) {
        user.id = 'user_' + Date.now();
    }
    
    // Se password foi alterado, criptografar
    if (user.password && user.password !== '***PRESERVED***') {
        user.password = btoa(user.password);
    }
    
    const index = users.findIndex(u => u.id === user.id);
    
    if (index !== -1) {
        // Editar existente
        const existingUser = users[index];
        user.password = user.password || existingUser.password;
        users[index] = user;
    } else {
        // Adicionar novo
        if (!user.password) user.password = btoa('123456');
        users.push(user);
    }
    
    localStorage.setItem('users', JSON.stringify(users));
    
    // Sincronizar com Firebase em background
    syncUsersToFirebase(users);
    
    return user;
}

// Função para excluir usuário
function deleteUser(userId) {
    const users = getUsers();
    const filteredUsers = users.filter(u => u.id !== userId);
    localStorage.setItem('users', JSON.stringify(filteredUsers));
    
    // Sincronizar Firebase em background
    syncUsersToFirebase(filteredUsers);
    
    // Tentar deletar do Firebase também
    if (typeof db !== 'undefined' && db) {
        db.collection('users').doc(userId).delete().catch(e => console.log('Firebase delete falhou'));
    }
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

// Função para exportar todos os dados
function exportData() {
    const data = {
        users: getUsers(),
        reports: getReports(),
        companies: getCompanies(),
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Função para importar dados
function importData(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // Validar estrutura
            if (!data.users || !data.reports) {
                throw new Error('Formato inválido');
            }
            
            // Salvar dados
            if (data.users) localStorage.setItem('users', JSON.stringify(data.users));
            if (data.reports) localStorage.setItem('reports', JSON.stringify(data.reports));
            if (data.companies) localStorage.setItem('companies', JSON.stringify(data.companies));
            
            alert('Dados importados com sucesso! Recarregue a página.');
            window.location.reload();
        } catch (error) {
            alert('Erro ao importar dados: ' + error.message);
        }
    };
    
    reader.readAsText(file);
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

