<script lang="ts">
    import Header from "@/views/header/Index.svelte";
    import Footer from "@/views/footer/Index.svelte";
    import lunisolar from "lunisolar";
    // 引入 theGods 插件
    import theGods from "lunisolar/plugins/theGods";
    import { onMount } from "svelte";
    let date = new Date().toISOString().substring(0, 10);
    let time = new Date().toTimeString().substring(0, 5);
    let datetime = `${date}T${time}`;
    console.log(666, formatDateTime(datetime));
    let d: lunisolar.Lunisolar;
    d = _init(formatDateTime(datetime));
    import { gxarr, color_t_arr, color_d_arr } from "./emun";
    let cangarr = gxarr[d.char8.day.stem.toString()];
    function updateDateTimePart() {
        if (date && time) {
            const newDateTime = `${date}T${time}`;
            // 仍然需要检查，防止不必要的 DOM 更新
            if (newDateTime !== datetime) {
                datetime = newDateTime;
            }
        }
    }

    $: {
        // 确保 datetime 有值且格式正确
        if (datetime && datetime.length >= 16) {
            const newDate = datetime.substring(0, 10);
            const newTime = datetime.substring(11, 16);

            // 通过 if 判断，只在反向赋值时更新 date 和 time
            // 确保更新只发生在 datetime 自身被用户修改时
            if (newDate !== date) {
                date = newDate;
            }
            if (newTime !== time) {
                time = newTime;
            }
        }
    }
    function formatDateTime(dateInput: string) {
        // 1. 确保输入是 Date 对象
        const date = new Date(dateInput);

        // 检查日期是否有效
        if (isNaN(date.getTime())) {
            return "Invalid Date";
        }

        // 2. 提取并填充零 (padStart)

        // 获取年份
        const year = date.getFullYear();

        // 获取月份 (getMonth() 返回 0-11，需要 +1)
        const month = String(date.getMonth() + 1).padStart(2, "0");

        // 获取日期
        const day = String(date.getDate()).padStart(2, "0");

        // 获取小时
        const hours = String(date.getHours()).padStart(2, "0");

        // 获取分钟
        const minutes = String(date.getMinutes()).padStart(2, "0");

        // 3. 拼接目标格式
        // YYYY/MM/DD HH:MM
        return `${year}/${month}/${day} ${hours}:${minutes}`;
    }
    function reinit() {
        d = _init(formatDateTime(datetime));
        cangarr = gxarr[d.char8.day.stem.toString()];
    }
    function _init(t: string) {
        return lunisolar(t); //"2022/07/18 14:40"

        // --- format ---
        console.log(4545, d.format("cY cM cD cH"));
        d.format("lY年 lM(lL)lD lH時"); // 可取得阴历日期 '二〇二二年 六月(大)二十 未時'
        d.format("cY cM cD cH"); // 可取得八字：'壬寅 丁未 壬申 丁未'
        d.format("YYYY-MM-DD HH:mm:ss"); // 2022-07-18 14:40:00

        // --- 阴历---

        // d.lunar.toString() // 二〇二二年六月二十未時
        `${d.lunar}`; // 二〇二二年六月二十未時
        d.lunar.year; // 2022
        d.lunar.getYearName(); // 二〇二二
        d.lunar.month; // 6 （如果是闰六月会返回106）
        d.lunar.getMonthName(); // 六月
        d.lunar.day; // 20
        d.lunar.getDayName(); // 二十
        d.lunar.hour; // 7 （返回从0开始算的时辰下标）
        d.lunar.getHourName(); // 未
        // d.lunar.isLeapMonth // false (是否闰月)
        // --- 八字 ----

        `${d.char8}`; // 壬寅 丁未 壬申 丁未
        d.char8.year.toString(); // 壬寅  （取得年柱）
        d.char8.month.toString(); // 丁未  （取得月柱）
        d.char8.day.toString(); // 壬申 （取得日柱）
        d.char8.hour.toString(); // 丁未  （取得时柱）
        d.char8.year.stem.toString(); // 壬 (年柱天干)
        d.char8.year.branch.toString(); // 寅  (年柱地支)
        d.char8.year.branch.hiddenStems; // [甲, 丙, 戊]  （地支藏干的天干对象列表，顺序为本气、中气、余气）
        // ...其它柱类似

        // 节气
        lunisolar("2022-07-23").solarTerm?.toString(); // 大暑 （返回当天的节气，如果不是节气则solarTerm().solarTerm返回null）

        // 阴历反查 （阴历转公历）
        lunisolar
            .fromLunar({
                year: 2022,
                month: 10,
                day: 25,
            })
            .format("YYYY-MM-DD"); // 2022-11-18

        // 加载插件
        lunisolar.extend(theGods);

        // ---  使用
        const lsr = lunisolar("2018-10-04");
        // 取神煞
        lsr.theGods.getGods("month"); // 取得当日的月神
        lsr.theGods.getGods("day"); // 取得当日的日神
        lsr.theGods.getDuty12God(); // 取得当日建除十二神（建、除、满....）

        // 查宜忌
        lsr.theGods.getActs(); // 取得当日宜忌 {good: string[], bad: string[]}
        lsr.theGods.getGoodActs(1); // 取得当日所宜（通书六十事）
        lsr.theGods.getGoodActs(2); // 取得当日所宜（御用六十七事）
        lsr.theGods.getBadActs(1); // 取得当日所忌（通书六十事）
        lsr.theGods.getBadActs(2); // 取得当日所忌（御用六十七事）

        // 取得当日所有时辰吉凶
        lunisolar("2022-10-21").theGods.getLuckHours(); // [-1, -1, 1, 1, -1, 1, -1, -1, 1, -1, 1, 1] 大于0为吉，少于0为凶

        // 取得当日指定吉神所在方位  (支持 '喜神' | '福神' | '財神' | '陽貴' | '陰貴' 查询)
        const [d24, god] =
            lunisolar("2022-11-25").theGods.getLuckDirection("財神");
        d24.direction; // 南
        d24.name; // 午
        d24.angle; // 180
    }
</script>

<Header />
<div class="main">
    <div class="container">
        <div class="choose-box input-group">
            <label for="start">选择日期:</label>
            <input
                type="date"
                id="start"
                name="start-date"
                bind:value={date}
                min="1900-01-01"
                max="2100-12-31"
                on:input={updateDateTimePart}
            />
            <label for="appt">选择时间:</label>
            <input
                type="time"
                id="appt"
                name="appt-time"
                bind:value={time}
                min="00:00"
                max="23:59"
                step="600"
                on:input={updateDateTimePart}
            />
            <label for="meeting">选择出生时间:</label>
            <input
                type="datetime-local"
                id="meeting"
                name="meeting-time"
                bind:value={datetime}
            />
            <button on:click={reinit}>查询</button>
        </div>
        <div class="item">
            <table width="100%" class="table-c">
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
                        <td
                            style="color:{color_t_arr[
                                d.char8.year.stem.toString()
                            ]}"
                            ><i>{cangarr[d.char8.year.stem.toString()]}</i
                            >{d.char8.year.stem.toString()}</td
                        >
                        <td
                            style="color:{color_t_arr[
                                d.char8.month.stem.toString()
                            ]}"
                            ><i>{cangarr[d.char8.month.stem.toString()]}</i
                            >{d.char8.month.stem.toString()}</td
                        >
                        <td
                            class="self-td"
                            style="color:{color_t_arr[
                                d.char8.day.stem.toString()
                            ]}">{d.char8.day.stem.toString()}</td
                        >
                        <td
                            style="color:{color_t_arr[
                                d.char8.hour.stem.toString()
                            ]}"
                            ><i>{cangarr[d.char8.hour.stem.toString()]}</i
                            >{d.char8.hour.stem.toString()}</td
                        >
                    </tr>
                    <tr>
                        <td>地支</td>
                        <td
                            style="color:{color_d_arr[
                                d.char8.year.branch.toString()
                            ]}">{d.char8.year.branch.toString()}</td
                        >
                        <td
                            style="color:{color_d_arr[
                                d.char8.month.branch.toString()
                            ]}">{d.char8.month.branch.toString()}</td
                        >
                        <td
                            style="color:{color_d_arr[
                                d.char8.day.branch.toString()
                            ]}">{d.char8.day.branch.toString()}</td
                        >
                        <td
                            style="color:{color_d_arr[
                                d.char8.hour.branch.toString()
                            ]}">{d.char8.hour.branch.toString()}</td
                        >
                    </tr>
                    <tr class="cang">
                        <td>藏干</td>
                        <td class="cang-item">
                            {#each d.char8.year.branch.hiddenStems
                                .toString()
                                .split(",") as item}
                                <span style="color:{color_t_arr[item]}"
                                    >{item} <i>{cangarr[item]}</i></span
                                >
                            {/each}
                        </td>
                        <td class="cang-item">
                            {#each d.char8.month.branch.hiddenStems
                                .toString()
                                .split(",") as item}
                                <span style="color:{color_t_arr[item]}"
                                    >{item} <i>{cangarr[item]}</i></span
                                >
                            {/each}
                        </td>
                        <td class="cang-item">
                            {#each d.char8.day.branch.hiddenStems
                                .toString()
                                .split(",") as item}
                                <span style="color:{color_t_arr[item]}"
                                    >{item} <i>{cangarr[item]}</i></span
                                >
                            {/each}
                        </td>
                        <td class="cang-item">
                            {#each d.char8.hour.branch.hiddenStems
                                .toString()
                                .split(",") as item}
                                <span style="color:{color_t_arr[item]}"
                                    >{item} <i>{cangarr[item]}</i></span
                                >
                            {/each}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
<Footer />

<style>
    .input-group {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
        padding: 20px;
        border: 1px solid #ccc;
        border-radius: 8px;
    }
    input {
        padding: 10px;
        font-size: 16px;
        border: 1px solid #ddd;
        border-radius: 4px;
    }
    .table-c {
        width: 100%;
    }
    .table-c th {
        text-align: center;
        height: 100px;
        font-size: 24px;
        line-height: 100px;
    }
    .table-c td {
        text-align: center;
        height: 80px;
        font-size: 20px;
        line-height: 80px;
    }
    .self {
        color: red;
    }
    .cang-item {
        height: 100px;
    }
    .cang-item span {
        display: block;
        height: 30px;
        line-height: 30px;
    }
    .tian-tr i {
        display: block;
        position: absolute;
        top: -50%;
        left: 50%;
        transform: translateX(-50%);
    }
    .tian-tr td {
        position: relative;
    }
</style>
