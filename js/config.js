// Configuração de relatórios, usuários e permissões

const CONFIG = {
    // URLs de exemplo dos relatórios Power BI
    // Substitua pelos seus links reais
    REPORTS: {
        // Relatórios Gerenciais
        'emanuel': {
            name: 'Emanuel',
            departments: ['gerencia', 'financeiro', 'vendas', 'compras', 'rh', 'operacoes'],
            url: 'https://app.powerbi.com/reportEmbed?reportId=1b3ec5d4-562e-42ab-a387-bbd4c22215bd&autoAuth=true&ctid=da49a844-e2e3-40af-86a6-c3819d704f49',
            icon: '📊'
        },
        'visao-geral': {
            name: 'Visão Geral',
            departments: ['gerencia', 'financeiro'],
            url: 'https://app.powerbi.com/view?r=SEU_LINK_AQUI',
            icon: '📊'
        },
        'vendas-grafico': {
            name: 'Vendas - Gráfico Mensal',
            departments: ['gerencia', 'vendas'],
            url: 'https://app.powerbi.com/view?r=SEU_LINK_AQUI',
            icon: '📈'
        },
        'vendas-produtos': {
            name: 'Vendas por Produtos',
            departments: ['gerencia', 'vendas'],
            url: 'https://app.powerbi.com/view?r=SEU_LINK_AQUI',
            icon: '🛍️'
        },
        
        // Relatórios Financeiros
        'financeiro-fluxo': {
            name: 'Fluxo de Caixa',
            departments: ['gerencia', 'financeiro'],
            url: 'https://app.powerbi.com/view?r=SEU_LINK_AQUI',
            icon: '💰'
        },
        'financeiro-contas': {
            name: 'Contas a Receber/Pagar',
            departments: ['financeiro'],
            url: 'https://app.powerbi.com/view?r=SEU_LINK_AQUI',
            icon: '💳'
        },
        'financeiro-margem': {
            name: 'Margem de Lucro',
            departments: ['gerencia', 'financeiro'],
            url: 'https://app.powerbi.com/view?r=SEU_LINK_AQUI',
            icon: '📉'
        },
        
        // Relatórios de Compras
        'compras-fornecedores': {
            name: 'Performance Fornecedores',
            departments: ['gerencia', 'compras'],
            url: 'https://app.powerbi.com/view?r=SEU_LINK_AQUI',
            icon: '🏭'
        },
        'compras-estoque': {
            name: 'Controle de Estoque',
            departments: ['gerencia', 'compras', 'operacoes'],
            url: 'https://app.powerbi.com/view?r=SEU_LINK_AQUI',
            icon: '📦'
        },
        
        // Relatórios de RH
        'rh-pessoal': {
            name: 'Gestão de Pessoal',
            departments: ['gerencia', 'rh'],
            url: 'https://app.powerbi.com/view?r=SEU_LINK_AQUI',
            icon: '👥'
        },
        'rh-frequencia': {
            name: 'Controle de Frequência',
            departments: ['gerencia', 'rh'],
            url: 'https://app.powerbi.com/view?r=SEU_LINK_AQUI',
            icon: '⏰'
        },
        
        // Relatórios Operacionais
        'operacoes-kpi': {
            name: 'KPIs Operacionais',
            departments: ['gerencia', 'operacoes'],
            url: 'https://app.powerbi.com/view?r=SEU_LINK_AQUI',
            icon: '🎯'
        },
        'operacoes-produtividade': {
            name: 'Produtividade',
            departments: ['gerencia', 'operacoes'],
            url: 'https://app.powerbi.com/view?r=SEU_LINK_AQUI',
            icon: '⚡'
        }
    },
    
    // Usuários e suas permissões (exemplo básico)
    // Em produção, isso deveria vir de um backend/banco de dados
    USERS: {
        'admin': {
            company: ['matriz'],
            departments: ['gerencia']
        },
        'gerente': {
            company: ['matriz', 'loja-01'],
            departments: ['gerencia', 'vendas', 'financeiro']
        },
        'vendedor': {
            company: ['loja-01'],
            departments: ['vendas']
        }
    }
};

// Função para verificar se usuário tem acesso a um relatório
function hasReportAccess(userDepartment, reportDepartments) {
    return reportDepartments.includes(userDepartment);
}

// Função para obter relatórios disponíveis para o usuário
function getAvailableReports(userCompany, userDepartment) {
    const reports = [];
    
    for (const [key, report] of Object.entries(CONFIG.REPORTS)) {
        if (hasReportAccess(userDepartment, report.departments)) {
            reports.push({
                id: key,
                ...report
            });
        }
    }
    
    return reports;
}

