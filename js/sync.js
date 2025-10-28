// Sistema de sincronização com Firebase
// Carrega dados do Firebase ao iniciar o app

// Função para inicializar e carregar dados do Firebase
async function initializeFirebaseData() {
    console.log('🔄 Tentando inicializar Firebase...');
    console.log('db definido?', typeof db !== 'undefined' && db !== null);
    
    if (typeof db === 'undefined' || !db) {
        console.log('⚠️ Firebase não inicializado ainda, tentando novamente...');
        setTimeout(initializeFirebaseData, 500);
        return;
    }
    
    console.log('🔄 Carregando dados do Firebase...');
    
    try {
        // Carregar usuários
        const usersSnapshot = await db.collection('users').get();
        console.log('📦 Snapshot de usuários:', usersSnapshot.size, 'documentos');
        if (!usersSnapshot.empty) {
            const users = usersSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            localStorage.setItem('users', JSON.stringify(users));
            console.log('✅ Usuários carregados:', users.length, users);
        } else {
            console.log('⚠️ Nenhum usuário encontrado no Firebase');
        }
        
        // Carregar relatórios
        const reportsSnapshot = await db.collection('reports').get();
        console.log('📦 Snapshot de relatórios:', reportsSnapshot.size, 'documentos');
        if (!reportsSnapshot.empty) {
            const reports = {};
            reportsSnapshot.docs.forEach(doc => {
                reports[doc.id] = doc.data();
            });
            localStorage.setItem('reports', JSON.stringify(reports));
            console.log('✅ Relatórios carregados:', Object.keys(reports).length, reports);
        } else {
            console.log('⚠️ Nenhum relatório encontrado no Firebase');
        }
        
        // Carregar empresas
        const companiesSnapshot = await db.collection('companies').get();
        console.log('📦 Snapshot de empresas:', companiesSnapshot.size, 'documentos');
        if (!companiesSnapshot.empty) {
            const companies = companiesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            localStorage.setItem('companies', JSON.stringify(companies));
            console.log('✅ Empresas carregadas:', companies.length, companies);
        } else {
            console.log('⚠️ Nenhuma empresa encontrada no Firebase');
        }
        
        console.log('🎉 Sincronização concluída!');
        console.log('📊 Verificando localStorage:');
        console.log('- Usuários:', JSON.parse(localStorage.getItem('users') || '[]').length);
        console.log('- Relatórios:', Object.keys(JSON.parse(localStorage.getItem('reports') || '{}')).length);
        console.log('- Empresas:', JSON.parse(localStorage.getItem('companies') || '[]').length);
        
        // Disparar evento customizado para que outros scripts saibam que os dados foram carregados
        window.dispatchEvent(new CustomEvent('firebaseDataLoaded'));
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados do Firebase:', error);
    }
}

// Aguardar Firebase inicializar e carregar dados
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initializeFirebaseData();
    }, 1000); // Aguardar 1s para Firebase carregar
});

