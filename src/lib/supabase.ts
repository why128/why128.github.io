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
        const query: any = {
            table,
            selectCols: '*',
            orders: [] as { column: string, ascending: boolean }[],
            limit: null as number | null,
            offset: null as number | null,
            filters: [] as any[],
            body: null,
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
                    // 对于 in 操作符，值需要格式化为 PostgREST 接受的数组形式 (e.g., {1,2,3})
                    const value = Array.isArray(f.value) && op === 'in' ? `{${f.value.join(',')}}` : f.value;
                    params.append(f.column, `${op}.${value}`);
                });
            }

            // 移除 URL 尾部的斜杠，保证 /rest/v1/${query.table} 格式正确
            const baseUrl = self.url.endsWith('/') ? self.url.slice(0, -1) : self.url;
            return `${baseUrl}/rest/v1/${query.table}?${params.toString()}`;
        };

        /**
         * 发送 Fetch 请求，并统一处理响应结果和错误。
         * 结果格式为 { data, error, count }
         */
        const fetchRequest = async (method: string, prefer?: string): Promise<{ data: any | null, error: { message: string, status: number } | null, count?: number | null }> => {
            const url = buildUrl();
            const headers: Record<string, string> = {
                // Supabase Worker 的自定义 token
                'X-API-Token': self.token,
                // 模拟 Supabase 必需的 headers
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
                // GET/HEAD请求没有body，其他方法发送 query.body
                body: ['GET', 'HEAD'].includes(method) ? undefined : JSON.stringify(query.body),
            });

            try {
                // 检查 HTTP 状态码
                if (!res.ok) {
                    const errorText = await res.text();
                    let errorJson = null;
                    try {
                        errorJson = JSON.parse(errorText);
                    } catch {
                        // 忽略非 JSON 格式的错误
                    }
                    // 尝试从 JSON 或文本中提取错误信息
                    const message = errorJson?.message || errorJson?.error || errorText;
                    return { data: null, error: { message: `[${res.status} ${res.statusText}] ${message}`, status: res.status } };
                }

                // 204 No Content 通常用于 DELETE 或 insert/update with Prefer: return=minimal
                if (res.status === 204) {
                    return { data: [], error: null, count: null };
                }

                // PostgREST 客户端默认返回 JSON 数组
                const data = await res.json();

                // 如果请求包含 count=exact，则从 Content-Range 头中解析总行数
                const count = prefer?.includes('count=exact')
                    ? parseInt(res.headers.get('content-range')?.split('/')[1] || '0')
                    : null;

                return { data, error: null, count };

            } catch (e: any) {
                // 处理 JSON 解析失败或其他意外错误
                return { data: null, error: { message: `Client Error: Failed to process response. ${e.message || e}`, status: res.status } };
            }
        };

        // 链式调用对象
        const chain: any = {
            // =========================================================================
            // CRUD - READ (查询)
            // =========================================================================

            /**
             * 执行 SELECT 查询。
             * @param columns 要选择的列，默认为 '*'。
             * @param options 可选地包含 { count: 'exact' } 以获取总行数。
             */
            select(columns: string = '*', { count = null }: { count?: 'exact' | null } = {}) {
                query.selectCols = columns;
                let prefer = '';
                if (count === 'exact') {
                    // PostgREST 的计数 Prefer 头
                    prefer = 'count=exact';
                }
                return fetchRequest('GET', prefer);
            },

            // =========================================================================
            // CRUD - MUTATIONS (增、改、删)
            // =========================================================================

            /**
             * 插入数据 (CREATE)。
             * @param data 要插入的对象或对象数组。
             * @param options 可选地设置 returning 为 'minimal' (不返回数据) 或 'representation' (返回操作后的数据)。
             */
            insert(data: any, { returning = 'representation' }: { returning?: 'minimal' | 'representation' } = {}) {
                query.body = Array.isArray(data) ? data : [data];
                const prefer = `return=${returning}`;
                return fetchRequest('POST', prefer);
            },

            /**
             * 更新数据 (UPDATE)。必须先设置过滤器（如 eq/match 等）。
             * @param data 要更新的键值对。
             * @param options 可选地设置 returning 为 'minimal' (不返回数据) 或 'representation' (返回操作后的数据)。
             */
            update(data: any, { returning = 'representation' }: { returning?: 'minimal' | 'representation' } = {}) {
                query.body = data;
                const prefer = `return=${returning}`;
                return fetchRequest('PATCH', prefer);
            },

            /**
             * 删除数据 (DELETE)。必须先设置过滤器（如 eq/match 等）。
             * @param options 可选地设置 returning 为 'minimal' (不返回数据) 或 'representation' (返回操作后的数据)。
             */
            delete({ returning = 'minimal' }: { returning?: 'minimal' | 'representation' } = {}) {
                const prefer = `return=${returning}`;
                return fetchRequest('DELETE', prefer);
            },

            // =========================================================================
            // QUERY MODIFIERS (查询构造器)
            // =========================================================================

            order(column: string, { ascending = true } = {}) {
                query.orders.push({ column, ascending });
                return this;
            },

            limit(count: number) {
                query.limit = count;
                return this;
            },

            range(from: number, to: number) {
                query.offset = from;
                query.limit = to - from + 1;
                return this;
            },

            // =========================================================================
            // FILTERS (过滤器)
            // =========================================================================

            eq(column: string, value: any) { query.filters.push({ column, value, operator: 'eq' }); return this; },
            neq(column: string, value: any) { query.filters.push({ column, value, operator: 'neq' }); return this; },
            gt(column: string, value: any) { query.filters.push({ column, value, operator: 'gt' }); return this; },
            gte(column: string, value: any) { query.filters.push({ column, value, operator: 'gte' }); return this; },
            lt(column: string, value: any) { query.filters.push({ column, value, operator: 'lt' }); return this; },
            lte(column: string, value: any) { query.filters.push({ column, value, operator: 'lte' }); return this; },
            like(column: string, pattern: string) { query.filters.push({ column, value: pattern, operator: 'like' }); return this; },
            ilike(column: string, pattern: string) { query.filters.push({ column, value: pattern, operator: 'ilike' }); return this; },

            /**
             * 新增：检查列的值是否在给定数组中 (IN)。
             * @param column 列名。
             * @param values 值数组 (e.g., [1, 5, 10])。
             */
            in(column: string, values: any[]) { query.filters.push({ column, value: values, operator: 'in' }); return this; },

            match(obj: Record<string, any>) {
                Object.entries(obj).forEach(([col, val]) => query.filters.push({ column: col, value: val, operator: 'eq' }));
                return this;
            },
        };

        return chain;
    }
}

// 使用示例
const supabase = new SupabaseWorkerClient(WORKER_URL, FRONTEND_TOKEN);

export default supabase;