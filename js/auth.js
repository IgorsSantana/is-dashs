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
    console.log('🔐 Validando login para:', username);
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    console.log('👥 Usuários disponíveis:', users.length);
    
    const encryptedPassword = btoa(password);
    
    const user = users.find(u => u.username === username);
    
    if (!user) {
        console.log('❌ Usuário não encontrado');
        return { success: false, message: 'Usuário não encontrado' };
    }
    
    // Verificar senha: pode estar em Base64 ou texto plano
    let passwordMatch = false;
    
    if (user.password === encryptedPassword || user.password === password) {
        passwordMatch = true;
    } else {
        // Tentar descriptografar se estiver em Base64
        try {
            if (atob(user.password) === password) {
                passwordMatch = true;
            }
        } catch (e) {
            // Senha não está em Base64 válido
        }
    }
    
    console.log('🔑 Senhas comparadas:', {
        stored: user.password,
        encrypted: encryptedPassword,
        passwordMatch: passwordMatch
    });
    
    if (!passwordMatch) {
        console.log('❌ Senha incorreta');
        return { success: false, message: 'Senha incorreta' };
    }
    
    console.log('✅ Login bem-sucedido para:', username);
    return { success: true, user: user };
}

// Função para obter usuários (lê do Firebase e atualiza cache)
async function getUsers() {
    let users = [];
    
    // Tentar buscar do Firebase
    if (typeof db !== 'undefined' && db) {
        try {
            const snapshot = await db.collection('users').get();
            if (!snapshot.empty) {
                users = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                // Atualizar cache local
                localStorage.setItem('users', JSON.stringify(users));
                console.log('✅ Usuários carregados do Firebase:', users.length);
            }
        } catch (e) {
            console.log('⚠️ Firebase não disponível, usando cache local:', e.message);
        }
    }
    
    // Se Firebase não retornou dados, usar cache local
    if (users.length === 0) {
        users = JSON.parse(localStorage.getItem('users') || '[]');
    }
    
    return users;
}

// Função auxiliar síncrona para compatibilidade (retorna cache local)
function getUsersSync() {
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
    const users = getUsersSync();
    
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

// Função para obter empresas (lê do Firebase primeiro)
async function getCompanies() {
    let companies = [];
    
    // Tentar buscar do Firebase
    if (typeof db !== 'undefined' && db) {
        try {
            const snapshot = await db.collection('companies').get();
            if (!snapshot.empty) {
                companies = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                // Atualizar cache local
                localStorage.setItem('companies', JSON.stringify(companies));
                console.log('✅ Empresas carregadas do Firebase:', companies.length);
            }
        } catch (e) {
            console.log('⚠️ Firebase não disponível, usando cache local:', e.message);
        }
    }
    
    // Se Firebase não retornou dados, usar cache local
    if (companies.length === 0) {
        companies = JSON.parse(localStorage.getItem('companies') || '[]');
    }
    
    return companies;
}

// Função auxiliar síncrona
function getCompaniesSync() {
    return JSON.parse(localStorage.getItem('companies') || '[]');
}

// Função para salvar empresas
function saveCompanies(companies) {
    localStorage.setItem('companies', JSON.stringify(companies));
    
    // Sincronizar com Firebase
    if (typeof db !== 'undefined' && db) {
        try {
            const batch = db.batch();
            companies.forEach(company => {
                const companyRef = db.collection('companies').doc(company.id);
                batch.set(companyRef, { name: company.name, code: company.code });
            });
            batch.commit().catch(e => console.log('Firebase companies sync falhou:', e));
        } catch (e) {
            console.log('Firebase companies não disponível');
        }
    }
}

// Função para adicionar/editar empresa
function saveCompany(company) {
    const companies = getCompaniesSync();
    
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
    
    // Sincronizar Firebase
    if (typeof db !== 'undefined' && db) {
        db.collection('companies').doc(company.id).set({
            name: company.name,
            code: company.code
        }).catch(e => console.log('Firebase company save falhou'));
    }
    
    return company;
}

// Função para excluir empresa
function deleteCompany(companyId) {
    const companies = getCompaniesSync();
    const filteredCompanies = companies.filter(c => c.id !== companyId);
    saveCompanies(filteredCompanies);
    
    // Deletar do Firebase
    if (typeof db !== 'undefined' && db) {
        db.collection('companies').doc(companyId).delete().catch(e => console.log('Firebase company delete falhou'));
    }
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

// Função para obter relatórios (lê do Firebase primeiro)
async function getReports() {
    let reports = null;
    
    // Tentar buscar do Firebase
    if (typeof db !== 'undefined' && db) {
        try {
            const snapshot = await db.collection('reports').get();
            if (!snapshot.empty) {
                reports = {};
                snapshot.docs.forEach(doc => {
                    reports[doc.id] = doc.data();
                });
                // Atualizar cache local
                localStorage.setItem('reports', JSON.stringify(reports));
                console.log('✅ Relatórios carregados do Firebase:', Object.keys(reports).length);
            }
        } catch (e) {
            console.log('⚠️ Firebase não disponível, usando cache local:', e.message);
        }
    }
    
    // Se Firebase não retornou dados, usar cache local
    if (!reports) {
        const reportsStr = localStorage.getItem('reports');
        if (reportsStr) {
            reports = JSON.parse(reportsStr);
        } else {
            // Retornar relatórios padrão do CONFIG
            reports = CONFIG.REPORTS;
        }
    }
    
    return reports;
}

// Função auxiliar síncrona
function getReportsSync() {
    const reports = localStorage.getItem('reports');
    if (reports) {
        return JSON.parse(reports);
    }
    return CONFIG.REPORTS;
}

// Função para salvar relatórios
function saveReports(reports) {
    localStorage.setItem('reports', JSON.stringify(reports));
    
    // Sincronizar com Firebase
    if (typeof db !== 'undefined' && db) {
        try {
            const batch = db.batch();
            Object.entries(reports).forEach(([id, report]) => {
                const reportRef = db.collection('reports').doc(id);
                batch.set(reportRef, report);
            });
            batch.commit().catch(e => console.log('Firebase reports sync falhou:', e));
        } catch (e) {
            console.log('Firebase reports não disponível');
        }
    }
}

// Função para adicionar/editar relatório
function saveReport(report) {
    const reports = getReportsSync();
    const integrationType = report.integrationType || 'url';
    const embedConfig = integrationType === 'embedded' ? (report.embed || null) : null;
    
    const normalizedReport = {
        name: report.name,
        url: integrationType === 'url' ? report.url : null,
        icon: report.icon || '📊',
        integrationType,
        embed: embedConfig,
        departments: report.departments,
        specificUsers: report.specificUsers
    };
    
    if (report.id) {
        // Editar relatório existente
        reports[report.id] = normalizedReport;
    } else {
        // Adicionar novo relatório
        const id = 'report_' + Date.now();
        report.id = id;
        reports[id] = normalizedReport;
    }
    
    saveReports(reports);
    
    // Sincronizar Firebase
    if (typeof db !== 'undefined' && db) {
        const reportId = report.id || Object.keys(reports)[Object.keys(reports).length - 1];
        db.collection('reports').doc(reportId).set(reports[reportId]).catch(e => console.log('Firebase report save falhou'));
    }
    
    return reports;
}

// Função para excluir relatório
function deleteReport(reportId) {
    const reports = getReportsSync();
    delete reports[reportId];
    saveReports(reports);
    
    // Deletar do Firebase
    if (typeof db !== 'undefined' && db) {
        db.collection('reports').doc(reportId).delete().catch(e => console.log('Firebase report delete falhou'));
    }
}

