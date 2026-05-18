const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface ApiOptions extends RequestInit {
    accessToken?: string;
    body?: any;
    headers?: HeadersInit & {
        Authorization?: string;
    };
}

export const apiFetch = async (endpoint: string, options: ApiOptions = {}) => {
    const { accessToken, body, ...restOptions } = options;

    // Todas as requisições passam pelo mesmo proxy (Spring Boot)
    const fullUrl = `${API_BASE_URL}${endpoint}`;

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...restOptions.headers,
    };

    if (accessToken) {
        (headers as Record<string, string>).Authorization = `Bearer ${accessToken}`;
    }

    const config: RequestInit = {
        ...restOptions,
        headers,
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    const response = await fetch(fullUrl, config);

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error on endpoint '${endpoint}':`, errorText);
        throw new Error(`API request failed with status ${response.status} on URL ${fullUrl}`);
    }

    // Apenas retorna null se for resposta vazia (204) ou content-length explicitamente 0
    if (response.status === 204) {
        return null;
    }

    const contentLength = response.headers.get('content-length');
    if (contentLength === '0') {
        return null;
    }

    // Como garantimos que não é 204 e content-length != 0, a reposta deve ter um corpo. 
    // Em alguns casos o response.text() pode ser vazio (Ex: API retorna 200 OK sem JSON).
    const textData = await response.text();
    if (!textData) {
        return null;
    }

    try {
        return JSON.parse(textData);
    } catch (e) {
        console.warn(`Response from ${endpoint} could not be parsed as JSON. Returning as text.`, e);
        return textData;
    }
};
