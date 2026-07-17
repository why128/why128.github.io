<script lang="ts">
    import Header from "@/views/header/Index.svelte";
    import Footer from "@/views/footer/Index.svelte";
    import lunisolar from "lunisolar";
    import theGods from "lunisolar/plugins/theGods";
    import { onMount } from "svelte";

    let date = new Date().toISOString().substring(0, 10);
    let time = new Date().toTimeString().substring(0, 5);
    let datetime = `${date}T${time}`;

    let d: lunisolar.Lunisolar;
    import { gxarr, color_t_arr, color_d_arr } from "./emun";

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
    }

    function reinit() {
        initLunisolar();
    }

    onMount(() => {
        initLunisolar();
    });

    $: {
        if (date && time) {
            datetime = `${date}T${time}`;
            initLunisolar();
        }
    }
</script>

<Header />
<div class="main">
    <div class="container">
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
            </div>

            <button on:click={reinit} class="query-btn">查询八字</button>
        </div>

        <div class="result-card">
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
                            <i>{gxarr[d.char8.year.stem.toString()]?.[d.char8.year.stem.toString()] || ''}</i>{d.char8.year.stem.toString()}
                        </td>
                        <td style="color:{color_t_arr[d.char8.month.stem.toString()]}">
                            <i>{gxarr[d.char8.month.stem.toString()]?.[d.char8.month.stem.toString()] || ''}</i>{d.char8.month.stem.toString()}
                        </td>
                        <td class="self-td" style="color:{color_t_arr[d.char8.day.stem.toString()]}">
                            {d.char8.day.stem.toString()}
                        </td>
                        <td style="color:{color_t_arr[d.char8.hour.stem.toString()]}">
                            <i>{gxarr[d.char8.hour.stem.toString()]?.[d.char8.hour.stem.toString()] || ''}</i>{d.char8.hour.stem.toString()}
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
    </div>
</div>
<Footer />

<style>
    .container { max-width: 1000px; margin: 0 auto; padding: 20px; }
    .picker-card, .result-card { background: white; border-radius: 12px; padding: 25px; margin-bottom: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
    .picker-card h3 { margin-bottom: 20px; color: #333; text-align: center; }
    .input-group { display: flex; gap: 25px; justify-content: center; flex-wrap: wrap; }
    .input-field { display: flex; flex-direction: column; align-items: center; gap: 8px; }
    input { padding: 12px 16px; font-size: 16px; border: 2px solid #ddd; border-radius: 8px; }
    input:focus { border-color: #007acc; box-shadow: 0 0 0 3px rgba(0,122,204,0.1); }
    .query-btn { background: #007acc; color: white; padding: 12px 32px; border: none; border-radius: 8px; cursor: pointer; }
    .query-btn:hover { background: #005a99; }
    .table-c th, .table-c td { text-align: center; padding: 12px; border: 1px solid #eee; }
    .table-c th { background: #f0f0f0; }
    .self { color: #d32f2f; font-weight: bold; }
    .cang-item span { display: block; margin: 4px 0; font-size: 15px; }
</style>
