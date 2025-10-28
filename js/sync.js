// Sistema de sincronização com Firebase
// Carrega dados do Firebase ao iniciar o app

// Função para inicializar e carregar dados do Firebase
async function initializeFirebaseData() {
    if (typeof db === 'undefined' || !db) {
        console.log('Firebase não inicializado ainda');
        return;
    }
    
    console.log('🔄 Carregando dados do Firebase...');
    
    try {
        // Carregar usuários
        const usersSnapshot = await db.collection('users').get();
        if (!usersSnapshot.empty) {
            const users = usersSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            localStorage.setItem('users', JSON.stringify(users));
            console.log('✅ Usuários carregados:', users.length);
        }
        
        // Carregar relatórios
        const reportsSnapshot = await db.collection('reports').get();
        if (!reportsSnapshot.empty) {
            const reports = {};
            reportsSnapshot.docs.forEach(doc => {
                reports[doc.id] = doc.data();
            });
            localStorage.setItem('reports', JSON.stringify(reports));
            console.log('✅ Relatórios carregados:', Object.keys(reports).length);
        }
        
        // Carregar empresas
        const companiesSnapshot = await db.collection('companies').get();
        if (!companiesSnapshot.empty) {
            const companies = companiesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            localStorage.setItem('companies', JSON.stringify(companies));
            console.log('✅ Empresas carregadas:', companies.length);
        }
        
        console.log('🎉 Sincronização concluída!');
        
        // Não recarregar automaticamente - deixar página funcionar normalmente
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

