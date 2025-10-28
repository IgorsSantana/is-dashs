// Seed inicial de dados: usuários, empresas e departamentos por empresa
// Este arquivo é opcional; se presente, será usado para popular o localStorage quando estiver vazio.

window.SEED_DATA = {
    companies: [
        { id: 'company_matriz', name: 'Matriz', code: 'matriz' },
        { id: 'company_loja_01', name: 'Loja 01', code: 'loja-01' },
        { id: 'company_loja_02', name: 'Loja 02', code: 'loja-02' },
        { id: 'company_loja_03', name: 'Loja 03', code: 'loja-03' }
    ],
    companyDepartments: {
        'matriz': ['gerencia','financeiro','vendas','compras','rh','operacoes','ti'],
        'loja-01': ['gerencia','vendas','operacoes'],
        'loja-02': ['gerencia','vendas','operacoes'],
        'loja-03': ['gerencia','vendas','operacoes']
    },
    users: [
        {
            id: 'admin-ti',
            username: 'admin-ti',
            // Senha: admin-ti-123 (base64)
            password: 'YWRtaW4tdGktMTIz',
            company: 'matriz',
            department: 'ti',
            isAdminTI: true,
            isAdmin: true
        },
        {
            id: 'admin',
            username: 'admin',
            // Senha: admin123 (base64)
            password: 'YWRtaW4xMjM=',
            company: 'matriz',
            department: 'gerencia',
            isAdmin: true
        }
    ]
};


