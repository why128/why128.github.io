const WORKER_URL = 'https://githubio.wattley.top/';
const FRONTEND_TOKEN = '123456789';
// DUMMY_KEY 用于模拟 Supabase 的 public anon key
const DUMMY_KEY = 'DUMMY_KEY';

/**
 * 模拟 Supabase PostgREST Client，用于通过 Worker 代理访问数据库。
 */
class SupabaseWorkerClient {
    url: string;
    token: string;

    constructor(url: string, token: string) {
        this.url = url;
        this.token = token;
    }

    from(table: string) {
        const self = this;
        // Query 状态对象，用于存储所有链式调用设置的参数
        const query = {
            table,
            selectCols: '*',
            orders: [] as { column: string, ascending: boolean }[],
            limit: null as number | null,
            offset: null as number | null,
            filters: [] as any[],
            body: null as any,
        };

        /**
         * 构造最终的请求 URL，包含表名和所有查询参数。
         */
        const buildUrl = () => {
            const params = new URLSearchParams();
            params.set('select', query.selectCols);

            if (query.orders.length > 0) {
                const orderStr = query.orders.map(o => `${o.column}.${o.ascending ? 'asc' : 'desc'}`).join(',');
                params.set('order', orderStr);
            }

            if (query.limit !== null) params.set('limit', query.limit.toString());
            if (query.offset !== null) params.set('offset', query.offset.toString());

            if (query.filters.length > 0) {
                query.filters.forEach((f: { column: string, operator: string, value: any }) => {
                    const op = f.operator || 'eq';
                    const value = Array.isArray(f.value) && op === 'in' ? `{${f.value.join(',')}}` : f.value;
                    params.append(f.column, `${op}.${value}`);
                });
            }

            const baseUrl = self.url.endsWith('/') ? self.url.slice(0, -1) : self.url;
            return `${baseUrl}/rest/v1/${query.table}?${params.toString()}`;
        };

        /**
         * 发送 Fetch 请求，并统一处理响应结果和错误。
         * 增强了对空响应体的处理。
         */
        const fetchRequest = async (method: string, prefer?: string): Promise<{ data: any | null, error: { message: string, status: number } | null, count?: number | null }> => {
            const url = buildUrl();
            const headers: Record<string, string> = {
                'X-API-Token': self.token,
                'Authorization': `Bearer ${DUMMY_KEY}`,
                'apikey': DUMMY_KEY,
                'Content-Type': 'application/json',
                'accept-profile': 'public',
            };

            if (prefer) {
                headers['Prefer'] = prefer;
            }

            const res = await fetch(url, {
                method,
                headers,
                body: ['GET', 'HEAD'].includes(method) ? undefined : JSON.stringify(query.body),
            });

            try {
                if (!res.ok) {
                    const errorText = await res.text();
                    let errorJson = null;
                    try {
                        errorJson = JSON.parse(errorText);
                    } catch { /* ignored */ }
                    const message = errorJson?.message || errorJson?.error || errorText;
                    return { data: null, error: { message: `[${res.status} ${res.statusText}] ${message}`, status: res.status } };
                }

                // 检查 204 No Content 状态
                if (res.status === 204) {
                    return { data: [], error: null, count: null };
                }

                // 核心修正：先获取响应体文本，避免在空体上调用 res.json()
                const responseText = await res.text();

                if (responseText.length === 0) {
                    // 如果状态码 OK (如 200, 201) 但响应体为空，返回空数组
                    return { data: [], error: null, count: null };
                }

                // 只有在响应体有内容时才尝试解析 JSON
                const data = JSON.parse(responseText);
                // 核心修正结束

                const count = prefer?.includes('count=exact')
                    ? parseInt(res.headers.get('content-range')?.split('/')[1] || '0')
                    : null;

                return { data, error: null, count };

            } catch (e: any) {
                // 捕获所有客户端错误，包括 JSON 解析错误
                return { data: null, error: { message: `Client Error: Failed to process response. ${e.message || e}`, status: res.status } };
            }
        };

        // 链式调用对象
        const chain: any = {
            // ... (select, get 方法保持不变) ...
            select(columns: string = '*') {
                query.selectCols = columns;
                return this;
            },

            get({ count = null }: { count?: 'exact' | null } = {}) {
                let prefer = '';
                if (count === 'exact') {
                    prefer = 'count=exact';
                }
                return fetchRequest('GET', prefer);
            },

            // =========================================================================
            // CRUD - MUTATIONS (增、改、删)
            // =========================================================================

            insert(data: any, { returning = 'representation' }: { returning?: 'minimal' | 'representation' } = {}) {
                query.body = Array.isArray(data) ? data : [data];
                const prefer = `return=${returning}`;
                return fetchRequest('POST', prefer);
            },

            /**
             * 更新数据 (UPDATE)。🚀 修正：恢复为标准的 PATCH 请求。
             */
            update(data: any, { returning = 'representation' }: { returning?: 'minimal' | 'representation' } = {}) {
                query.body = data;
                const prefer = `return=${returning}`;
                // 🚀 恢复使用 PATCH
                return fetchRequest('PATCH', prefer);
            },

            delete({ returning = 'minimal' }: { returning?: 'minimal' | 'representation' } = {}) {
                const prefer = `return=${returning}`;
                return fetchRequest('DELETE', prefer);
            },

            // ... (QUERY MODIFIERS & FILTERS 保持不变) ...
            order(column: string, { ascending = true } = {}) { query.orders.push({ column, ascending }); return this; },
            limit(count: number) { query.limit = count; return this; },
            range(from: number, to: number) { query.offset = from; query.limit = to - from + 1; return this; },
            eq(column: string, value: any) { query.filters.push({ column, value, operator: 'eq' }); return this; },
            neq(column: string, value: any) { query.filters.push({ column, value, operator: 'neq' }); return this; },
            gt(column: string, value: any) { query.filters.push({ column, value, operator: 'gt' }); return this; },
            gte(column: string, value: any) { query.filters.push({ column, value, operator: 'gte' }); return this; },
            lt(column: string, value: any) { query.filters.push({ column, value, operator: 'lt' }); return this; },
            lte(column: string, value: any) { query.filters.push({ column, value, operator: 'lte' }); return this; },
            like(column: string, pattern: string) { query.filters.push({ column, value: pattern, operator: 'like' }); return this; },
            ilike(column: string, pattern: string) { query.filters.push({ column, value: pattern, operator: 'ilike' }); return this; },
            in(column: string, values: any[]) { query.filters.push({ column, value: values, operator: 'in' }); return this; },
            match(obj: Record<string, any>) {
                Object.entries(obj).forEach(([col, val]) => query.filters.push({ column: col, value: val, operator: 'eq' }));
                return this;
            },
        };

        return chain;
    }
}

// 导出实例
const supabase = new SupabaseWorkerClient(WORKER_URL, FRONTEND_TOKEN);

export default supabase;