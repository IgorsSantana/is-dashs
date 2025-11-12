// Utilitários para integração com Power BI Embedded

(function () {
    const DEFAULT_SETTINGS = {
        embedTokenUrl: 'http://localhost:7071/api/powerbi/embed-info',
        tokenMethod: 'POST',
        requestTimeoutMs: 15000
    };

    function getPowerBiSettings() {
        const customSettings = window.POWERBI_SETTINGS || {};
        return {
            ...DEFAULT_SETTINGS,
            ...customSettings
        };
    }

    function validateEmbeddedReportConfig(report) {
        const settings = getPowerBiSettings();
        const embed = report?.embed || {};
        const workspaceId = embed.workspaceId || settings.defaultWorkspaceId;
        const reportId = embed.reportId;
        const datasetId = embed.datasetId || settings.defaultDatasetId || null;
        const additional = embed.additional || null;

        if (!workspaceId) {
            throw new Error('Configuração Power BI Embedded incompleta. Defina o Workspace ID (padrão não disponível).');
        }
        if (!reportId) {
            throw new Error('Configuração Power BI Embedded incompleta. Informe o Report ID no Painel Administrativo.');
        }

        const normalized = {
            workspaceId,
            reportId
        };

        if (datasetId) {
            normalized.datasetId = datasetId;
        }
        if (additional) {
            normalized.additional = additional;
        }

        return normalized;
    }

    async function fetchEmbedInfo(report) {
        const settings = getPowerBiSettings();
        if (!settings.embedTokenUrl) {
            throw new Error('Endpoint de token do Power BI Embedded não configurado. Defina POWERBI_SETTINGS.embedTokenUrl.');
        }

        const embedCfg = validateEmbeddedReportConfig(report);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), settings.requestTimeoutMs);
        const method = (settings.tokenMethod || 'POST').toUpperCase();

        const baseHeaders = {};
        let url = settings.embedTokenUrl;
        const payload = {
            workspaceId: embedCfg.workspaceId || null,
            reportId: embedCfg.reportId || null,
            datasetId: embedCfg.datasetId || null,
            additional: embedCfg.additional || null
        };

        const fetchOptions = {
            method,
            headers: baseHeaders,
            signal: controller.signal
        };

        if (method === 'GET') {
            // Remover valores nulos e montar querystring
            const params = Object.entries(payload)
                .filter(([_, value]) => value)
                .reduce((acc, [key, value]) => {
                    acc[key] = value;
                    return acc;
                }, {});
            const query = new URLSearchParams(params).toString();
            if (query) {
                url += (url.includes('?') ? '&' : '?') + query;
            }
        } else {
            fetchOptions.headers['Content-Type'] = 'application/json';
            fetchOptions.body = JSON.stringify(payload);
        }

        try {
            const response = await fetch(url, fetchOptions);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Falha ao obter token do Power BI Embedded (${response.status}): ${errorText}`);
            }

            const payload = await response.json();

            const token = payload.accessToken || payload.token || payload.embedToken;
            const embedUrl = payload.embedUrl;
            const resolvedReportId = payload.reportId || embedCfg.reportId;

            if (!token || !embedUrl) {
                throw new Error('Resposta inválida do backend: token ou embedUrl ausentes.');
            }

            return {
                accessToken: token,
                embedUrl,
                reportId: resolvedReportId,
                settings: payload.settings || {}
            };
        } finally {
            clearTimeout(timeout);
        }
    }

    function ensurePowerBiClient() {
        if (!window.powerbi || !window['powerbi-client']) {
            throw new Error('Biblioteca powerbi-client não carregada. Verifique a tag de script no HTML.');
        }
        return {
            service: window.powerbi,
            models: window['powerbi-client'].models
        };
    }

    async function embedReport(container, report) {
        const { service, models } = ensurePowerBiClient();
        const embedInfo = await fetchEmbedInfo(report);

        // Resetar container antes de embutir
        service.reset(container);

        const config = {
            type: 'report',
            tokenType: models.TokenType.Embed,
            accessToken: embedInfo.accessToken,
            embedUrl: embedInfo.embedUrl,
            id: embedInfo.reportId,
            settings: {
                panes: {
                    filters: {
                        visible: false
                    }
                },
                navContentPaneEnabled: false,
                ...embedInfo.settings
            }
        };

        return service.embed(container, config);
    }

    window.PowerBIEmbedded = {
        embedReport
    };
})();

