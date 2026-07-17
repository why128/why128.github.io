<script lang="ts">
    import Header from "@/views/header/Index.svelte";
    import Footer from "@/views/footer/Index.svelte";
    import lunisolar from "lunisolar";
    import { onMount } from "svelte";

    import theGods from "lunisolar/plugins/theGods";
    lunisolar.extend(theGods);

    let date = new Date().toISOString().substring(0, 10);
    let time = new Date().toTimeString().substring(0, 5);
    let datetime = `${date}T${time}`;
    let gender = "1";

    let d: any;

    const color_t_arr: Record<string, string> = {
        "甲": "#2e7d32", "乙": "#4caf50",
        "丙": "#c62828", "丁": "#ef5350",
        "戊": "#8d6e63", "己": "#a1887f",
        "庚": "#f57c00", "辛": "#ffb74d",
        "壬": "#1565c0", "癸": "#2196f3"
    };

    const color_d_arr: Record<string, string> = {
        "寅": "#4caf50", "卯": "#81c784",
        "巳": "#ef5350", "午": "#e57373",
        "辰": "#a1887f", "戌": "#a1887f", "丑": "#bcaaa4", "未": "#bcaaa4",
        "申": "#ffb74d", "酉": "#ffe082",
        "亥": "#2196f3", "子": "#64b5f6"
    };

    const tenGodsMap: Record<string, Record<string, string>> = {
        "甲": { "甲": "比肩", "乙": "劫财", "丙": "食神", "丁": "伤官", "戊": "偏财", "己": "正财", "庚": "七杀", "辛": "正官", "壬": "偏印", "癸": "正印" },
        "乙": { "甲": "劫财", "乙": "比肩", "丙": "伤官", "丁": "食神", "戊": "正财", "己": "偏财", "庚": "正官", "辛": "七杀", "壬": "正印", "癸": "偏印" },
        "丙": { "甲": "偏印", "乙": "正印", "丙": "比肩", "丁": "劫财", "戊": "食神", "己": "伤官", "庚": "偏财", "辛": "正财", "壬": "七杀", "癸": "正官" },
        "丁": { "甲": "正印", "乙": "偏印", "丙": "劫财", "丁": "比肩", "戊": "伤官", "己": "食神", "庚": "正财", "辛": "偏财", "壬": "正官", "癸": "七杀" },
        "戊": { "甲": "七杀", "乙": "正官", "丙": "偏印", "丁": "正印", "戊": "比肩", "己": "劫财", "庚": "食神", "辛": "伤官", "壬": "偏财", "癸": "正财" },
        "己": { "甲": "正官", "乙": "七杀", "丙": "正印", "丁": "偏印", "戊": "劫财", "己": "比肩", "庚": "伤官", "辛": "食神", "壬": "正财", "癸": "偏财" },
        "庚": { "甲": "偏财", "乙": "正財", "丙": "七殺", "丁": "正官", "戊": "偏印", "己": "正印", "庚": "比肩", "辛": "劫财", "壬": "食神", "癸": "傷官" },
        "辛": { "甲": "正財", "乙": "偏財", "丙": "正官", "丁": "七殺", "戊": "正印", "己": "偏印", "庚": "劫財", "辛": "比肩", "壬": "傷官", "癸": "食神" },
        "壬": { "甲": "食神", "乙": "傷官", "丙": "偏財", "丁": "正財", "戊": "七殺", "己": "正官", "庚": "偏印", "辛": "正印", "壬": "比肩", "癸": "劫財" },
        "癸": { "甲": "傷官", "乙": "食神", "丙": "正財", "丁": "偏財", "戊": "正官", "己": "七殺", "庚": "正印", "辛": "偏印", "壬": "劫財", "癸": "比肩" }
    };

    function getTenGod(dayStem: string, targetStem: string): string {
        if (!dayStem || !targetStem) return "";
        return tenGodsMap[dayStem]?.[targetStem] || "";
    }

    function safePillar(pillar: any) {
        return {
            stem: pillar?.stem?.toString() ?? "",
            branch: pillar?.branch?.toString() ?? ""
        };
    }

    function safeGanzhi(pillar: any): string {
        const { stem, branch } = safePillar(pillar);
        return stem && branch ? stem + branch : "";
    }

    function getYearGanzhi(year: number): string {
        const stems = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
        const branches = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
        const offset = (year - 4) % 60;
        const idx = offset < 0 ? offset + 60 : offset;
        return stems[idx % 10] + branches[idx % 12];
    }

    function mapYearForLunisolar(year: number): number {
        const MIN = 1901;
        const MAX = 2099;
        if (year >= MIN && year <= MAX) return year;
        const offset = (year - MIN) % 60;
        const mapped = MIN + (offset < 0 ? offset + 60 : offset);
        return mapped > MAX ? mapped - 60 : mapped;
    }

    function getSafeYearGanzhi(year: number): string {
        const mappedYear = mapYearForLunisolar(year);
        try {
            const lsr = lunisolar(new Date(mappedYear, 1, 5));
            const gz = safeGanzhi(lsr.char8?.year);
            if (gz) return gz;
        } catch {}
        return getYearGanzhi(year);
    }

    const ONE_DAY = 86400000;
    const ONE_SHICHEN = 2 * 60 * 60 * 1000;

    function resolveLuckDuration(totalDays: number) {
        let remain = totalDays;
        const years = Math.floor(remain / 3);
        remain -= years * 3;
        const months = Math.floor(remain * 4);
        remain -= months / 4;
        const days = Math.floor(remain);
        remain -= days;
        const shichen = Math.round(remain * ONE_DAY / ONE_SHICHEN);
        return {
            years, months, days, shichen,
            desc: `${years}岁${months}个月${days}天${shichen}个时辰`
        };
    }

    function calcLuckStartDateTime(birthTime: number, totalDays: number, isForward: boolean) {
        const offset = totalDays * ONE_DAY;
        return new Date(isForward ? birthTime + offset : birthTime - offset);
    }

    interface LuckStep {
        label: "小运" | "大运";   // ✅ 新增
        age: number;              // 起始虚岁
        startYear: number;         // 起始公历年
        ganzhi: string;
        stem: string;
        branch: string;
        years: { year: number; ganzhi: string }[];
        luckStartDateTime: Date;
        durationDesc: string;
    }

    let luckList: LuckStep[] = [];
    let selectedLuckIndex = 0;

    function initLunisolar() {
        try {
            d = lunisolar(new Date(datetime));
            calculateLuckAndYears();
        } catch (e) {
            console.error("初始化 lunisolar 失败：", e);
            alert("解析八字失败，请检查输入的时间是否正确！");
        }
    }

    function calculateLuckAndYears() {
        if (!d) return;

        const isMale = gender === "1";
        const yearStem = safePillar(d.char8.year).stem;
        const monthStem = safePillar(d.char8.month).stem;
        const monthBranch = safePillar(d.char8.month).branch;

        const yangStems = ["甲","丙","戊","庚","壬"];
        const isYangYear = yangStems.includes(yearStem);
        const isForward = (isMale && isYangYear) || (!isMale && !isYangYear);

        const stems = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
        const branches = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];

        const birthYear = d.toDate().getFullYear();
        const currentMs = d.valueOf();

        let daysToSolarTerm = 3;
        let luckStartDateTime: Date | null = null;

        if (birthYear < 2100) {
            try {
                const [currentTerm, currentTermDate] = d.recentSolarTerm(0);
                const currentTermValue = currentTerm.value;
                const currentTermTime = currentTermDate.getTime();

                let prevTermDate: Date;
                let nextTermDate: Date;

                if (currentTermTime >= currentMs) {
                    nextTermDate = currentTermDate;
                    const prevTermValue = currentTermValue >= 2 ? currentTermValue - 2 : 22;
                    const [y, m, day] = lunisolar.SolarTerm.findDate(birthYear, prevTermValue);
                    prevTermDate = new Date(y, m - 1, day);
                } else {
                    prevTermDate = currentTermDate;
                    const nextTermValue = currentTermValue <= 20 ? currentTermValue + 2 : 0;
                    const targetYear = currentTermValue <= 20 ? birthYear : birthYear + 1;
                    const [y, m, day] = lunisolar.SolarTerm.findDate(targetYear, nextTermValue);
                    nextTermDate = new Date(y, m - 1, day);
                }

                if (isForward) {
                    daysToSolarTerm = (nextTermDate.getTime() - currentMs) / ONE_DAY;
                } else {
                    daysToSolarTerm = (currentMs - prevTermDate.getTime()) / ONE_DAY;
                }

                if (!Number.isFinite(daysToSolarTerm) || daysToSolarTerm < 0) {
                    daysToSolarTerm = 3;
                }

                luckStartDateTime = calcLuckStartDateTime(currentMs, daysToSolarTerm, isForward);
            } catch (e) {
                console.warn("大运起岁计算失败，使用默认值", e);
                daysToSolarTerm = 3;
                luckStartDateTime = calcLuckStartDateTime(d.valueOf(), daysToSolarTerm, isForward);
            }
        } else {
            daysToSolarTerm = 3;
            luckStartDateTime = calcLuckStartDateTime(d.valueOf(), daysToSolarTerm, isForward);
        }

        // ✅ 起运虚岁（向上取整）
        const startAge = Math.max(1, Math.ceil(daysToSolarTerm / 3));

        // ✅ 起运公历年份 = 交运时间点实际所在的年份（不做任何+1）
        const startYear = luckStartDateTime.getFullYear();

        const duration = resolveLuckDuration(daysToSolarTerm);

        let stemIdx = stems.indexOf(monthStem);
        let branchIdx = branches.indexOf(monthBranch);

        const minorStemIdx = stems.indexOf(monthStem);
        const minorBranchIdx = branches.indexOf(monthBranch);
        const minorGanzhi = stems[minorStemIdx] + branches[minorBranchIdx];

        luckList = [];

        // 1️⃣ 小运
        luckList.push({
            label: "小运",
            age: 1,
            startYear: birthYear,
            ganzhi: minorGanzhi,
            stem: monthStem,
            branch: monthBranch,
            years: Array.from({ length: startAge }, (_, y) => ({
                year: birthYear + y,
                ganzhi: getSafeYearGanzhi(birthYear + y)
            })),
            luckStartDateTime,
            durationDesc: duration.desc
        });

        // 2️⃣ 第一步大运真正开始的年份
        const realLuckStartYear = startYear + startAge;

        // 3️⃣ 11 步大运
        for (let i = 0; i < 11; i++) {
            if (isForward) {
                stemIdx = (stemIdx + 1) % 10;
                branchIdx = (branchIdx + 1) % 12;
            } else {
                stemIdx = (stemIdx - 1 + 10) % 10;
                branchIdx = (branchIdx - 1 + 12) % 12;
            }

            const ganzhi = stems[stemIdx] + branches[branchIdx];
            const luckStartAge = startAge + 1 + i * 10;
            const luckStartYear = realLuckStartYear + i * 10;

            luckList.push({
                label: "大运",
                age: luckStartAge,
                startYear: luckStartYear,
                ganzhi,
                stem: stems[stemIdx],
                branch: branches[branchIdx],
                years: Array.from({ length: 10 }, (_, y) => ({
                    year: luckStartYear + y,
                    ganzhi: getSafeYearGanzhi(luckStartYear + y)
                })),
                luckStartDateTime,
                durationDesc: duration.desc
            });
        }

        selectedLuckIndex = 0;
    }

    function reinit() {
        if (date && time) {
            datetime = `${date}T${time}`;
            initLunisolar();
        } else {
            alert("请输入正确的日期和时间！");
        }
    }

    onMount(initLunisolar);
</script>

<Header />
<div class="main">
    <div class="container">

        <div class="picker-card">
            <h3>选择出生日期与时间</h3>
            <div class="input-group">
                <div class="input-field">
                    <label>出生日期</label>
                    <input type="date" bind:value={date} max="2100-12-31" />
                </div>
                <div class="input-field">
                    <label>出生时间</label>
                    <input type="time" bind:value={time} />
                </div>
                <div class="input-field">
                    <label>性别</label>
                    <div class="gender-radio-group">
                        <label><input type="radio" value="1" bind:group={gender} /> 男</label>
                        <label><input type="radio" value="0" bind:group={gender} /> 女</label>
                    </div>
                </div>
            </div>
            <button class="query-btn" on:click={reinit}>查询八字</button>
        </div>

        {#if d}
            <div class="result-card">
                <div class="gender-indicator">
                    性别：{gender === "1" ? "乾造 (男)" : "坤造 (女)"}
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
                            {#each [d.char8.year, d.char8.month, d.char8.day, d.char8.hour] as p}
                                {@const sp = safePillar(p)}
                                <td style="color:{color_t_arr[sp.stem]}">
                                    <i>{getTenGod(safePillar(d.char8.day).stem, sp.stem)}</i><br>
                                    <span class="gz-large">{sp.stem}</span>
                                </td>
                            {/each}
                        </tr>
                        <tr>
                            <td>地支</td>
                            {#each [d.char8.year, d.char8.month, d.char8.day, d.char8.hour] as p}
                                {@const sp = safePillar(p)}
                                <td style="color:{color_d_arr[sp.branch]}">
                                    <span class="gz-large">{sp.branch}</span>
                                </td>
                            {/each}
                        </tr>
                        <tr class="cang">
                            <td>藏干</td>
                            {#each [d.char8.year, d.char8.month, d.char8.day, d.char8.hour] as p}
                                <td class="cang-item">
                                    {#each p?.branch?.hiddenStems || [] as hs}
                                        {@const stem = hs.toString()}
                                        <div style="color:{color_t_arr[stem]}">
                                            {stem} <span>{getTenGod(safePillar(d.char8.day).stem, stem)}</span>
                                        </div>
                                    {/each}
                                </td>
                            {/each}
                        </tr>
                    </tbody>
                </table>
            </div>

            {#if luckList.length > 0}
                <div class="minor-luck-notice">
                    ⚠️ 起运前（{luckList[0].durationDesc}）为 <b>小运</b> 阶段，{luckList[0].age} 虚岁起正式走大运
                </div>
            {/if}

            <div class="luck-section">
                <h3>📊 大运 / 小运排盘</h3>
                <div class="luck-grid">
                    {#each luckList as luck, i}
                        <button
                            class="luck-card"
                            class:active={i === selectedLuckIndex}
                            class:minor={luck.label === '小运'}
                            on:click={() => selectedLuckIndex = i}
                        >
                            <div class="luck-label">{luck.label}</div>
                            <div>{luck.age} 虚岁起</div>
                            <div class="luck-ganzhi">
                                <span style="color:{color_t_arr[luck.stem]}">{luck.stem}</span>
                                <span style="color:{color_d_arr[luck.branch]}">{luck.branch}</span>
                            </div>
                            <div>{luck.startYear} 年</div>
                            {#if luck.label === '小运'}
                                <div class="luck-time">
                                    小运期：{luck.years.length} 年
                                </div>
                            {:else}
                                <div class="luck-time">
                                    交运：{luck.luckStartDateTime.toLocaleString()}
                                </div>
                            {/if}
                            <div class="luck-duration">
                                起运：{luck.durationDesc}
                            </div>
                        </button>
                    {/each}
                </div>
            </div>

            {#if luckList[selectedLuckIndex]}
                <div class="year-section">
                    <h3>📅 {luckList[selectedLuckIndex].ganzhi} 大运 · 流年（{luckList[selectedLuckIndex].age}–{luckList[selectedLuckIndex].age + 9} 虚岁）</h3>
                    <div class="year-grid">
                        {#each luckList[selectedLuckIndex].years as yr}
                            <div class="year-card">
                                <div>{yr.year}</div>
                                <div class="yr-ganzhi">
                                    <span style="color:{color_t_arr[yr.ganzhi[0]]}">{yr.ganzhi[0]}</span>
                                    <span style="color:{color_d_arr[yr.ganzhi[1]]}">{yr.ganzhi[1]}</span>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}
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

    .luck-section, .year-section {
        background: white;
        border-radius: 12px;
        padding: 25px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        margin-bottom: 30px;
    }

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

    .luck-ganzhi {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 4px;
    }

    .luck-time {
        font-size: 11px;
        color: #666;
        margin-top: 4px;
    }

    .luck-duration {
        font-size: 11px;
        color: #888;
    }

    .minor-luck-notice {
        background: #fff8e1;
        border: 1px solid #ffd54f;
        border-radius: 8px;
        padding: 12px 16px;
        margin-bottom: 20px;
        font-size: 14px;
        color: #856404;
    }

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
    }

    .yr-ganzhi {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 2px;
    }
    .luck-card.minor {
        background: #fffbe6;
        border-color: #faad14;
    }

    .luck-label {
        font-size: 12px;
        font-weight: bold;
        color: #666;
        margin-bottom: 4px;
    }

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
            grid-template-columns: repeat(4, 1fr);
        }
        .year-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }
</style>