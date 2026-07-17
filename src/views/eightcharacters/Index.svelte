<script lang="ts">
    import Header from "@/views/header/Index.svelte";
    import Footer from "@/views/footer/Index.svelte";
    import lunisolar from "lunisolar";
    import { onMount } from "svelte";

    // 注意：lunisolar 的 plugins/theGods 插件可以辅助计算神煞，
    // 其内置的 char8（八字）对象提供了 `.luck` 用于获取大运数据
    import theGods from "lunisolar/plugins/theGods";
    lunisolar.extend(theGods);

    let date = new Date().toISOString().substring(0, 10);
    let time = new Date().toTimeString().substring(0, 5);
    let datetime = `${date}T${time}`;
    
    // 性别变量，"1" 代表男(乾造)，"0" 代表女(坤造)
    let gender = "1"; 

    let d: lunisolar.Lunisolar;
    import { gxarr, color_t_arr, color_d_arr } from "./emun";

    // 大运数据结构定义
    interface LuckStep {
        age: number; // 起运年龄
        startYear: number; // 起运公历年份
        ganzhi: string; // 大运干支
        stem: string; // 大运天干
        branch: string; // 大运地支
        years: { year: number; ganzhi: string }[]; // 对应的 10 个流年
    }

    let luckList: LuckStep[] = [];
    let selectedLuckIndex = 0; // 当前选中的大运索引（用于展示流年）

    function formatDateTime(dateInput: string) {
        const date = new Date(dateInput);
        if (isNaN(date.getTime())) return "Invalid Date";

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");

        return `${year}/${month}/${day} ${hours}:${minutes}`;
    }

    function initLunisolar() {
        d = lunisolar(formatDateTime(datetime));
        calculateLuckAndYears();
    }

    // 计算大运与流年
    function calculateLuckAndYears() {
        if (!d) return;

        // 获取 lunisolar 自带的八字大运实例
        // gender: 1为男，0为女
        const isMale = gender === "1";
        const luck = d.char8.luck(isMale);
        
        // 起运岁数（实岁/虚岁，这里取实岁或大运提供的起运岁数数）
        const startAge = luck.rates.age; // 几岁起运
        const startYear = luck.rates.year; // 几岁起运对应的公历年份
        
        // 获取大运干支列表（通常看 8 步大运）
        const list = luck.list; 
        
        luckList = list.map((item, index) => {
            // 计算当前大运的起运年龄和公历年
            const currentAge = startAge + index * 10;
            const currentStartYear = startYear + index * 10;
            const ganzhiStr = item.ganzhi.toString(); // 比如 "甲子"
            const stem = ganzhiStr.charAt(0);
            const branch = ganzhiStr.charAt(1);

            // 生成这步大运 10 年的流年数据
            const years = Array.from({ length: 10 }, (_, i) => {
                const yr = currentStartYear + i;
                // 利用 lunisolar 解析该流年的干支
                const yrLunisolar = lunisolar(`${yr}/06/01`); // 用该年年中定位当年干支
                return {
                    year: yr,
                    ganzhi: yrLunisolar.char8.year.toString()
                };
            });

            return {
                age: currentAge,
                startYear: currentStartYear,
                ganzhi: ganzhiStr,
                stem,
                branch,
                years
            };
        });

        // 默认选中第一步大运
        selectedLuckIndex = 0;
    }

    // 校验函数
    function isValidDate(dateStr: string): boolean {
        if (!dateStr) return false;
        if (dateStr[0] !== '1' && dateStr[0] !== '2') return false; 
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(dateStr)) return false;
        const parsedDate = new Date(dateStr);
        return !isNaN(parsedDate.getTime());
    }

    function reinit() {
        if (date && time && isValidDate(date)) {
            datetime = `${date}T${time}`;
            try {
                initLunisolar();
            } catch (e) {
                alert("解析八字失败，请输入正确的日期！");
            }
        } else {
            alert("请输入正确的日期和时间！");
        }
    }

    onMount(() => {
        initLunisolar();
    });
</script>

<Header />
<div class="main">
    <div class="container">
        <!-- 1. 选择出生日期与时间 -->
        <div class="picker-card">
            <h3>选择出生日期与时间</h3>
            
            <div class="input-group">
                <div class="input-field">
                    <label for="start">出生日期</label>
                    <input type="date" id="start" bind:value={date} min="1900-01-01" max="2100-12-31" />
                </div>
                <div class="input-field">
                    <label for="appt">出生时间</label>
                    <input type="time" id="appt" bind:value={time} min="00:00" max="23:59" step="600" />
                </div>
                <div class="input-field">
                    <label>性别</label>
                    <div class="gender-radio-group">
                        <label class="radio-label">
                            <input type="radio" name="gender" value="1" bind:group={gender} on:change={reinit} />
                            <span>男 (乾造)</span>
                        </label>
                        <label class="radio-label">
                            <input type="radio" name="gender" value="0" bind:group={gender} on:change={reinit} />
                            <span>女 (坤造)</span>
                        </label>
                    </div>
                </div>
            </div>

            <button on:click={reinit} class="query-btn">查询八字</button>
        </div>

        {#if d}
            <!-- 2. 八字排盘结果 -->
            <div class="result-card">
                <div class="gender-indicator">
                    性别：<span class={gender === "1" ? "male-text" : "female-text"}>
                        {gender === "1" ? "乾造 (男)" : "坤造 (女)"}
                    </span>
                </div>

                <table class="table-c">
                    <thead>
                        <tr>
                            <th>八字</th>
                            <th>年柱</th>
                            <th>月柱</th>
                            <th class="self">日柱</th>
                            <th>时柱</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="tian-tr">
                            <td>天干</td>
                            <td style="color:{color_t_arr[d.char8.year.stem.toString()]}">
                                <i>{gxarr[d.char8.year.stem.toString()]?.[d.char8.year.stem.toString()] || ''}</i><br>{d.char8.year.stem.toString()}
                            </td>
                            <td style="color:{color_t_arr[d.char8.month.stem.toString()]}">
                                <i>{gxarr[d.char8.month.stem.toString()]?.[d.char8.month.stem.toString()] || ''}</i><br>{d.char8.month.stem.toString()}
                            </td>
                            <td class="self-td" style="color:{color_t_arr[d.char8.day.stem.toString()]}">
                                <br>{d.char8.day.stem.toString()}
                            </td>
                            <td style="color:{color_t_arr[d.char8.hour.stem.toString()]}">
                                <i>{gxarr[d.char8.hour.stem.toString()]?.[d.char8.hour.stem.toString()] || ''}</i><br>{d.char8.hour.stem.toString()}
                            </td>
                        </tr>
                        <tr>
                            <td>地支</td>
                            <td style="color:{color_d_arr[d.char8.year.branch.toString()]}">{d.char8.year.branch.toString()}</td>
                            <td style="color:{color_d_arr[d.char8.month.branch.toString()]}">{d.char8.month.branch.toString()}</td>
                            <td style="color:{color_d_arr[d.char8.day.branch.toString()]}">{d.char8.day.branch.toString()}</td>
                            <td style="color:{color_d_arr[d.char8.hour.branch.toString()]}">{d.char8.hour.branch.toString()}</td>
                        </tr>
                        <tr class="cang">
                            <td>藏干</td>
                            {#each [d.char8.year.branch, d.char8.month.branch, d.char8.day.branch, d.char8.hour.branch] as branch}
                                <td class="cang-item">
                                    {#each branch.hiddenStems as stem}
                                        {@const stemStr = stem.toString()}
                                        <span style="color:{color_t_arr[stemStr]}">
                                            {stemStr} <i>{gxarr[d.char8.day.stem.toString()]?.[stemStr] || ''}</i>
                                        </span>
                                    {/each}
                                </td>
                            {/each}
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- 3. 大运排盘模块 -->
            <div class="luck-section">
                <h3 class="section-title">📊 大运排盘 <small>（点击大运卡片查看对应流年）</small></h3>
                <div class="luck-grid">
                    {#each luckList as luck, index}
                        <button 
                            class="luck-card" 
                            class:active={selectedLuckIndex === index}
                            on:click={() => selectedLuckIndex = index}
                        >
                            <div class="luck-age">{luck.age} 岁起</div>
                            <div class="luck-ganzhi">
                                <span style="color:{color_t_arr[luck.stem]}">{luck.stem}</span><span style="color:{color_d_arr[luck.branch]}">{luck.branch}</span>
                            </div>
                            <div class="luck-year">{luck.startYear} 年</div>
                        </button>
                    {/each}
                </div>
            </div>

            <!-- 4. 流年排盘模块 -->
            {#if luckList[selectedLuckIndex]}
                <div class="year-section">
                    <h3 class="section-title">
                        📅 【{luckList[selectedLuckIndex].ganzhi}】大运对应的流年 
                        <span class="luck-span-age">({luckList[selectedLuckIndex].age}岁 - {luckList[selectedLuckIndex].age + 9}岁)</span>
                    </h3>
                    <div class="year-grid">
                        {#each luckList[selectedLuckIndex].years as yr}
                            <div class="year-card">
                                <div class="yr-num">{yr.year} 年</div>
                                <div class="yr-ganzhi">
                                    <span style="color:{color_t_arr[yr.ganzhi.charAt(0)]}">{yr.ganzhi.charAt(0)}</span><span style="color:{color_d_arr[yr.ganzhi.charAt(1)]}">{yr.ganzhi.charAt(1)}</span>
                                </div>
                                <div class="yr-age">{luckList[selectedLuckIndex].age + (yr.year - luckList[selectedLuckIndex].startYear)} 岁</div>
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}

        {:else}
            <div class="result-card" style="text-align: center; color: #888;">
                正在加载排盘数据...
            </div>
        {/if}
    </div>
</div>
<Footer />

<style>
    .container {
        max-width: 1000px;
        margin: 0 auto;
        padding: 20px;
    }

    .picker-card {
        background: #f8f9fa;
        border-radius: 12px;
        padding: 25px;
        margin-bottom: 30px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
        text-align: center;
    }

    .picker-card h3 {
        margin-bottom: 20px;
        color: #333;
    }

    .input-group {
        display: flex;
        gap: 35px;
        justify-content: center;
        flex-wrap: wrap;
        margin-bottom: 25px;
    }

    .input-field {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
    }

    .input-field label {
        font-weight: 600;
        color: #555;
    }

    input[type="date"], input[type="time"] {
        padding: 12px 16px;
        font-size: 16px;
        border: 2px solid #ddd;
        border-radius: 8px;
        transition: all 0.3s;
    }

    input[type="date"]:focus, input[type="time"]:focus {
        border-color: #007acc;
        outline: none;
        box-shadow: 0 0 0 3px rgba(0, 122, 204, 0.1);
    }

    .gender-radio-group {
        display: flex;
        gap: 15px;
        height: 48px;
        align-items: center;
    }

    .radio-label {
        display: flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
        font-size: 15px;
        user-select: none;
    }

    .radio-label input[type="radio"] {
        width: 18px;
        height: 18px;
        cursor: pointer;
    }

    .query-btn {
        background: #007acc;
        color: white;
        padding: 12px 32px;
        font-size: 16px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;
    }

    .query-btn:hover {
        background: #005a99;
        transform: translateY(-2px);
    }

    .result-card {
        background: white;
        border-radius: 12px;
        padding: 25px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        margin-bottom: 30px;
    }

    .gender-indicator {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 15px;
        text-align: left;
        border-left: 4px solid #007acc;
        padding-left: 10px;
    }
    
    .male-text {
        color: #007acc;
    }

    .female-text {
        color: #e040fb;
    }

    .table-c {
        width: 100%;
        border-collapse: collapse;
    }

    .table-c th, .table-c td {
        text-align: center;
        padding: 15px;
        border: 1px solid #eee;
    }

    .table-c th {
        background: #f0f0f0;
        font-size: 22px;
    }

    .self {
        color: #d32f2f;
        font-weight: bold;
    }

    .cang-item {
        vertical-align: top;
        padding-top: 15px;
    }

    .cang-item span {
        display: block;
        margin: 4px 0;
        font-size: 15px;
    }

    /* ================= 大运流年样式 ================= */
    .luck-section, .year-section {
        background: white;
        border-radius: 12px;
        padding: 25px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        margin-bottom: 30px;
    }

    .section-title {
        font-size: 20px;
        color: #333;
        margin-bottom: 20px;
        border-left: 4px solid #007acc;
        padding-left: 12px;
        text-align: left;
    }

    .section-title small {
        font-size: 14px;
        color: #888;
        font-weight: normal;
    }

    .luck-span-age {
        font-size: 15px;
        color: #666;
        font-weight: normal;
    }

    /* 大运卡片网格：响应式自适应列宽 */
    .luck-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 12px;
    }

    .luck-card {
        background: #fdfdfd;
        border: 2px solid #eaeaea;
        border-radius: 10px;
        padding: 12px 8px;
        text-align: center;
        cursor: pointer;
        transition: all 0.25s ease;
        outline: none;
    }

    .luck-card:hover {
        border-color: #007acc;
        background-color: #f4faff;
        transform: translateY(-2px);
    }

    .luck-card.active {
        border-color: #007acc;
        background-color: #eaf5ff;
        box-shadow: 0 4px 12px rgba(0, 122, 204, 0.15);
    }

    .luck-age {
        font-size: 13px;
        color: #666;
        margin-bottom: 4px;
    }

    .luck-ganzhi {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 4px;
    }

    .luck-year {
        font-size: 12px;
        color: #999;
    }

    /* 流年卡片网格：5列自适应排版 */
    .year-grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 12px;
    }

    .year-card {
        background: #fafafa;
        border: 1px solid #eee;
        border-radius: 8px;
        padding: 12px 6px;
        text-align: center;
        box-shadow: inset 0 0 4px rgba(0,0,0,0.02);
    }

    .yr-num {
        font-size: 12px;
        color: #888;
        margin-bottom: 2px;
    }

    .yr-ganzhi {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 2px;
    }

    .yr-age {
        font-size: 12px;
        color: #666;
    }

    /* 移动端媒体查询调整 */
    @media (max-width: 768px) {
        .input-group {
            flex-direction: column;
            align-items: center;
            gap: 15px;
        }
        .gender-radio-group {
            height: auto;
            margin-top: 5px;
        }
        .luck-grid {
            grid-template-columns: repeat(4, 1fr); /* 移动端一行显示4个大运 */
        }
        .year-grid {
            grid-template-columns: repeat(2, 1fr); /* 移动端一行显示2个流年 */
        }
    }
</style>
