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

    try {
        const response = await fetch(fullUrl, config);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API Error on endpoint '${endpoint}':`, errorText);
            throw new Error(`API request failed with status ${response.status} on URL ${fullUrl}`);
        }

        if (response.status === 204 || !response.headers.get('content-length') || response.headers.get('content-length') === '0') {
            return null;
        }
        
        return response.json();

    } catch (error) {
        console.error(`Failed to fetch from ${fullUrl}:`, error);
        throw error;
    }
};
