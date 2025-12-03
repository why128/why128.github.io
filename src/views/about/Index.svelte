<script>
    import supabase from "$lib/supabase";

    // 查询示例
    (async () => {
        const data = await supabase
            .from("githubio_list")
            .order("id", { ascending: false })
            .range(0, 9) // offset + limit 自动计算
            .select("*"); // 自动发起请求
        console.log(data);
    })();
</script>

<h1>about</h1>
