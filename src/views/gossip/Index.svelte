<script>
    import supabase from "$lib/supabase";
    import Header from "@/views/header/Index.svelte";
    import Footer from "@/views/footer/Index.svelte";
    import gossip from "$common/image/gossip.png";
</script>

<Header />
<div class="">
    <div class="container">
        <div class="img"><img src={gossip} alt="" /></div>
        <div class="text">
            <p>乾坤屯蒙需讼师， 比小畜兮履泰否，</p>
            <p>同人大有谦豫随， 蛊临观兮噬嗑贲，</p>
            <p>剥复无妄大畜颐， 大过坎离三十备。</p>
            <p>咸恒遁兮及大壮， 晋与明夷家人睽，</p>
            <p>蹇解损益夬姤萃， 升困井革鼎震继，</p>
            <p>艮渐归妹丰旅巽， 兑涣节兮中孚至，</p>
            <p>小过既济兼未济， 是为下经三十四。</p>
            <p>注：卦名读音：</p>
            <p>
                1．乾卦：读qián——2．坤卦：kūn——3．屯卦：zhūn——4．蒙卦：méng——5．需卦：xū，6．讼卦：sòng——7．师卦：shī——8．比卦：bǐ——9．小畜卦：
                xiǎo
                xù——10．履卦：lǚ，11．泰卦：tài——12．否卦：pǐ——13同人卦：tóng
                rén—14大有卦：dà
                yǒu—15谦卦：qiān，16．豫卦：yù——17．随卦：suí——18．蛊卦：gǔ——19．临卦：lín——20．观卦：guān，21．噬嗑卦：shì
                he(二声)—22．贲卦：bì—23剥卦：bō——24．复卦fù——25．无妄卦：wú
                wàng
                26．大畜卦：dàxù—27．颐卦：yí—28．大过卦：dàguò—29．坎卦：kǎn——30．离卦：lí
                31．咸卦：xián——32．恒卦héng——33．遁卦dùn——34大壮卦dà
                zhuàng——35晋卦：jìn 36．明夷卦míng yí—37家人卦：jiā
                rén—38睽卦：kuí—39．蹇卦：jiǎn——40．解卦：jiě
                41．损卦：sǔn——42．益卦：yì——43．夬卦：guài——44．姤卦：gòu——45．萃卦：cuì，46．升卦：shēng——47困卦：kùn——48．井卦：jǐng——49．革卦：gé——50．鼎卦：dǐng，51．震卦：zhèn——52．艮卦gèn——53．渐卦：jiàn——54归妹卦：guī
                mèi—55．丰卦：fēng
                56．旅卦：lǚ——57．巽卦：xùn——58．兑卦：duì——59．涣卦：huàn——60．节卦：jié，61．中孚卦：zhōng
                fú——62．小过卦：xiǎo guò——63．既济卦：jì jì——64．未济卦：wèi jì
            </p>
        </div>
    </div>
</div>
<Footer />

<style>
    .img {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
    }
    .img img {
        width: 100%;
        max-width: 885px;
        height: auto;
    }
    .text {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-size: 30px;
        /* height: 300px; */
    }
</style>
