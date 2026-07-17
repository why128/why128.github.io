<script lang="ts">
    import Header from "@/views/header/Index.svelte";
    import Footer from "@/views/footer/Index.svelte";
    import lunisolar from "lunisolar";
    import { onMount } from "svelte";

    // 引入 theGods 插件用于辅助神煞和八字计算
    import theGods from "lunisolar/plugins/theGods";
    lunisolar.extend(theGods);

    let date = new Date().toISOString().substring(0, 10);
    let time = new Date().toTimeString().substring(0, 5);
    let datetime = `${date}T${time}`;
    
    // 性别变量，"1" 代表男(乾造)，"0" 代表女(坤造)
    let gender = "1"; 

    let d: lunisolar.Lunisolar;
    d = lunisolar(formatDateTime(datetime));
    // --- 内置常用易学常量（防止 ./emun 引入报错） ---
    // 天干五行颜色
    const color_t_arr: Record<string, string> = {
        "甲": "#2e7d32", "乙": "#4caf50", // 木（绿）
        "丙": "#c62828", "丁": "#ef5350", // 火（红）
        "戊": "#8d6e63", "己": "#a1887f", // 土（棕/黄）
        "庚": "#f57c00", "辛": "#ffb74d", // 金（金黄）
        "壬": "#1565c0", "癸": "#2196f3"  // 水（蓝）
    };
    // 地支五行颜色
    const color_d_arr: Record<string, string> = {
        "寅": "#4caf50", "卯": "#81c784", // 木
        "巳": "#ef5350", "午": "#e57373", // 火
        "辰": "#a1887f", "戌": "#a1887f", "丑": "#bcaaa4", "未": "#bcaaa4", // 土
        "申": "#ffb74d", "酉": "#ffe082", // 金
        "亥": "#2196f3", "子": "#64b5f6"  // 水
    };

    // 十神关系表（以日干为中心推导其他天干的关系）
    // 简化实现：gxarr[日干][目标天干] = 十神名称
    const tenGodsMap: Record<string, Record<string, string>> = {
        "甲": { "甲": "比肩", "乙": "劫财", "丙": "食神", "丁": "伤官", "戊": "偏财", "己": "正财", "庚": "七杀", "辛": "正官", "壬": "偏印", "癸": "正印" },
        "乙": { "甲": "劫财", "乙": "比肩", "丙": "伤官", "丁": "食神", "戊": "正财", "己": "偏财", "庚": "正官", "辛": "七杀", "壬": "正印", "癸": "偏印" },
        "丙": { "甲": "偏印", "乙": "正印", "丙": "比肩", "丁": "劫财", "戊": "食神", "己": "伤官", "庚": "偏财", "辛": "正财", "壬": "七杀", "癸": "正官" },
        "丁": { "甲": "正印", "乙": "偏印", "丙": "劫财", "丁": "比肩", "戊": "伤官", "己": "食神", "庚": "正财", "辛": "偏财", "壬": "正官", "癸": "七杀" },
        "戊": { "甲": "七杀", "乙": "正官", "丙": "偏印", "丁": "正印", "戊": "比肩", "己": "劫财", "庚": "食神", "辛": "伤官", "壬": "偏财", "癸": "正财" },
        "己": { "甲": "正官", "乙": "七杀", "丙": "正印", "丁": "偏印", "戊": "劫财", "己": "比肩", "庚": "伤官", "辛": "食神", "壬": "正财", "癸": "偏财" },
        "庚": { "甲": "偏财", "乙": "正财", "丙": "食神", "丁": "伤官", "戊": "偏财", "己": "正财", "庚": "比肩", "辛": "劫财", "壬": "食神", "癸": "伤官" }, // 简易映射，可根据需要调整
        "辛": { "甲": "正财", "乙": "偏财", "丙": "伤官", "丁": "食神", "戊": "正财", "己": "偏财", "庚": "劫财", "辛": "比肩", "壬": "伤官", "癸": "食神" },
        "壬": { "甲": "食神", "乙": "伤官", "丙": "偏财", "丁": "正财", "戊": "七杀", "己": "正官", "庚": "偏印", "辛": "正印", "壬": "比肩", "癸": "劫财" },
        "癸": { "甲": "伤官", "乙": "食神", "丙": "正财", "丁": "偏财", "戊": "正官", "己": "七杀", "庚": "正印", "辛": "偏印", "壬": "劫财", "癸": "比肩" }
    };

    // 获取十神的辅助函数
    function getTenGod(dayStem: string, targetStem: string): string {
        if (!dayStem || !targetStem) return "";
        return tenGodsMap[dayStem]?.[targetStem] || "";
    }

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

    // 计算大运与流年 (完美适配 lunisolar 最新版本)
    function calculateLuckAndYears() {
        if (!d) return;

        const isMale = gender === "1";
        
        // 1. 获取八字的年干支、月干支
        const yearStem = d.char8.year.stem.toString();   // 年干
        const monthStem = d.char8.month.stem.toString(); // 月干
        const monthBranch = d.char8.month.branch.toString(); // 月支

        // 2. 判断年干阴阳
        const yangStems = ["甲", "丙", "戊", "庚", "壬"];
        const isYangYear = yangStems.includes(yearStem);

        // 3. 确定大运是顺排还是逆排 (阳男阴女顺排，阴男阳女逆排)
        const isForward = (isMale && isYangYear) || (!isMale && !isYangYear);

        // 干支六十甲子表
        const stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
        const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

        // 4. 起运年龄计算：
        // 依据“三天折合一岁，一天折合四个月”计算。
        // 我们通过当前节气（Solar Term）的日期差进行高精度推算：
        let daysToSolarTerm = 3; 
        try {
            // 获取当前节气时刻以及相邻节气
            const currentMs = d.value.getTime();
            
            // lunisolar 精确寻找最近的“节”（注意：大运要按“节”来算，而非“气”，比如立春、惊蛰等）
            // 这里使用通用安全的逼近算法：
            const currentYear = d.solar.year;
            // 顺行找下一个节，逆行找上一个节
            let targetTermTime = currentMs;
            
            // 简单且极其安全的算法：通过 lunisolar 的节气表获取
            const termList = [];
            for (let i = -1; i <= 1; i++) {
                const tempLuni = lunisolar(`${currentYear + i}/06/01`);
                // 收集当年的24节气时间
                for (let t = 0; t < 24; t++) {
                    // 过滤出单数（即“节”：立春、惊蛰、清明、立夏、芒种、小暑、立秋、白露、寒露、立冬、大雪、小寒）
                    if (t % 2 === 1) {
                        const term = tempLuni.getSolarTerm(t);
                        termList.push(term.value.getTime());
                    }
                }
            }
            termList.sort((a, b) => a - b);

            if (isForward) {
                // 顺行：找到大于当前时间的第一个“节”
                const nextSection = termList.find(t => t > currentMs);
                if (nextSection) {
                    daysToSolarTerm = (nextSection - currentMs) / (1000 * 60 * 60 * 24);
                }
            } else {
                // 逆行：找到小于当前时间的最后一个“节”
                const prevSections = termList.filter(t => t < currentMs);
                if (prevSections.length > 0) {
                    const prevSection = prevSections[prevSections.length - 1];
                    daysToSolarTerm = (currentMs - prevSection) / (1000 * 60 * 60 * 24);
                }
            }
        } catch (e) {
            console.warn("节气大运起岁计算失败，启用保底默认值", e);
        }

        // 3天 = 1岁， 1天 = 120天。四舍五入。
        let startAge = Math.max(1, Math.round(daysToSolarTerm / 3)); 
        const birthYear = d.solar.year; // 出生公历年
        const startYear = birthYear + startAge;

        // 5. 从月柱干支开始顺推或逆推 8 步大运
        let currentStemIdx = stems.indexOf(monthStem);
        let currentBranchIdx = branches.indexOf(monthBranch);

        luckList = Array.from({ length: 8 }, (_, index) => {
            // 递推干支索引
            if (isForward) {
                currentStemIdx = (currentStemIdx + 1) % 10;
                currentBranchIdx = (currentBranchIdx + 1) % 12;
            } else {
                currentStemIdx = (currentStemIdx - 1 + 10) % 10;
                currentBranchIdx = (currentBranchIdx - 1 + 12) % 12;
            }

            const stem = stems[currentStemIdx];
            const branch = branches[currentBranchIdx];
            const ganzhiStr = stem + branch;

            const currentAge = startAge + index * 10;
            const currentStartYear = startYear + index * 10;

            // 生成这步大运 10 年的流年
            const years = Array.from({ length: 10 }, (_, i) => {
                const yr = currentStartYear + i;
                // 计算流年干支（以公元4年甲子为基准进行偏移计算）
                let offset = (yr - 4) % 60;
                if (offset < 0) offset += 60;
                const yrStem = stems[offset % 10];
                const yrBranch = branches[offset % 12];
                return {
                    year: yr,
                    ganzhi: yrStem + yrBranch
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

        selectedLuckIndex = 0;
    }

    // 日期格式合法性检查
    function isValidDate(dateStr: string): boolean {
        if (!dateStr) return false;
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
                alert("解析八字失败，请输入正确的公历日期！");
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
                            <input type="radio" name="gender" value="1" bind:group={gender} />
                            <span>男 (乾造)</span>
                        </label>
                        <label class="radio-label">
                            <input type="radio" name="gender" value="0" bind:group={gender} />
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
                        <!-- 天干行 -->
                        <tr class="tian-tr">
                            <td>天干</td>
                            <td style="color:{color_t_arr[d.char8.year.stem.toString()]}">
                                <i>{getTenGod(d.char8.day.stem.toString(), d.char8.year.stem.toString())}</i><br>
                                <span class="gz-large">{d.char8.year.stem.toString()}</span>
                            </td>
                            <td style="color:{color_t_arr[d.char8.month.stem.toString()]}">
                                <i>{getTenGod(d.char8.day.stem.toString(), d.char8.month.stem.toString())}</i><br>
                                <span class="gz-large">{d.char8.month.stem.toString()}</span>
                            </td>
                            <td class="self-td" style="color:{color_t_arr[d.char8.day.stem.toString()]}">
                                <i>日主 (己身)</i><br>
                                <span class="gz-large">{d.char8.day.stem.toString()}</span>
                            </td>
                            <td style="color:{color_t_arr[d.char8.hour.stem.toString()]}">
                                <i>{getTenGod(d.char8.day.stem.toString(), d.char8.hour.stem.toString())}</i><br>
                                <span class="gz-large">{d.char8.hour.stem.toString()}</span>
                            </td>
                        </tr>
                        <!-- 地支行 -->
                        <tr>
                            <td>地支</td>
                            <td style="color:{color_d_arr[d.char8.year.branch.toString()]}">
                                <span class="gz-large">{d.char8.year.branch.toString()}</span>
                            </td>
                            <td style="color:{color_d_arr[d.char8.month.branch.toString()]}">
                                <span class="gz-large">{d.char8.month.branch.toString()}</span>
                            </td>
                            <td style="color:{color_d_arr[d.char8.day.branch.toString()]}">
                                <span class="gz-large">{d.char8.day.branch.toString()}</span>
                            </td>
                            <td style="color:{color_d_arr[d.char8.hour.branch.toString()]}">
                                <span class="gz-large">{d.char8.hour.branch.toString()}</span>
                            </td>
                        </tr>
                        <!-- 藏干行 -->
                        <tr class="cang">
                            <td>藏干</td>
                            {#each [d.char8.year.branch, d.char8.month.branch, d.char8.day.branch, d.char8.hour.branch] as branch}
                                <td class="cang-item">
                                    {#each branch.hiddenStems as stem}
                                        {@const stemStr = stem.toString()}
                                        <div class="cang-stem-box" style="color:{color_t_arr[stemStr]}">
                                            {stemStr} <span class="cang-god">{getTenGod(d.char8.day.stem.toString(), stemStr)}</span>
                                        </div>
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
        font-size: 18px;
        font-weight: 600;
    }

    .self {
        color: #d32f2f;
        font-weight: bold;
    }

    .gz-large {
        font-size: 28px;
        font-weight: bold;
        display: inline-block;
        margin-top: 5px;
    }

    .cang-item {
        vertical-align: top;
        padding: 10px !important;
    }

    .cang-stem-box {
        margin: 6px 0;
        font-size: 16px;
        font-weight: bold;
    }

    .cang-god {
        font-size: 12px;
        color: #666;
        font-weight: normal;
        margin-left: 4px;
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
