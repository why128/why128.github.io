<script lang="ts">
    import loading from "$common/image/loading.gif";

    export let diago = true;
</script>

{#if diago}
    <div class="diago">
        <img src={loading} alt="" />
        <p>加载中...</p>
    </div>
{/if}

<style>
    .diago {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 99;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }
    .diago img {
        display: block;
        border-radius: 50%;
        width: 200px;
        height: 200px;
        opacity: 0.5;
    }
    .diago p {
        font-size: 20px;
        color: #eee;
        letter-spacing: 0.2em;
    }
</style>
