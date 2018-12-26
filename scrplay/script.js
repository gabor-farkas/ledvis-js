function controlScript(context) {
    const firstText = "      \xDAjpesti K\xE9t Tan\xEDt\xE1si Nyelv\xFB M\xFBszaki Szakk\xF6z\xE9piskola és Gimn\xE1zium, 1998-2003, 13.H, osztályf\xF5n\xF6k: Fekete Katalin        ";
    //context.effect = testEffect(context);
    //context.effect = kukacEffect(context);
    // context.effect = matrixEffect(context);
    // context.effect = animplayEffect(context);
    const names = [
        ["Ak\xF3 K\xE1roly","AK\xD3 K\xC1ROLY","Karcsi"],
        ["Albert Viktor","ALBERT VIKTOR","Veek"],
        ["B\xEDr\xF3 J\xE1nos K\xE1lm\xE1n","B\xCDR\xD3 J\xC1NOS","BJ"],
        ["B\xEDr\xF3 Zolt\xE1n L\xE1szl\xF3","B\xCDR\xD3 ZOLT\xC1N","BZ"],
        ["Cserv\xE1k \xC1d\xE1m","CSERV\xC1K \xC1D\xC1M","Llamma"],
        ["Csizmadia P\xE9ter","CSIZMADIA P\xC9TER","Csizma"],
        ["Farkas G\xE1bor","FARKAS G\xC1BOR","Ordas"],
        ["F\xF6ldi Istv\xE1n","F\xD6LDI ISTV\xC1N","Mazsy"],
        ["G\xE9bert Csaba Tam\xE1s","G\xC9BERT CSABA","Csuba"],
        ["Gub\xE1n P\xE9ter","GUB\xC1N P\xC9TER","Guban"],
        ["Juh\xE1sz P\xE9ter","JUH\xC1SZ P\xC9TER","Juhasz"],
        ["Kiss Bal\xE1zs","KISS BAL\xC1ZS","Balu"],
        ["Koll\xE1r L\xE1szl\xF3","KOLL\xC1R L\xC1SZL\xD3","Laci"],
        ["Koll\xE1r Tam\xE1s","KOLL\xC1R TAM\xC1S","Mutz"],
        ["Kuklis Zolt\xE1n","KUKLIS ZOLT\xC1N","Kukli"],
        ["Kov\xE1cs Gy\xF6rgy","KOV\xC1CS GY\xD6RGY","Gyuri"],
        ["K\xF5v\xE1ri Tam\xE1s","K\xF5V\xC1RI TAM\xC1S","Kovari"],
        ["K\xFCrti \xC1rp\xE1d Istv\xE1n","K\xDCRTI \xC1RP\xC1D","Arpi"],
        ["Mahunka Lajos Zsolt","MAHUNKA LAJOS","Lajos"],
        ["Moln\xE1r J\xF3zsef G\xE1bor","MOLN\xC1R J\xD3ZSEF","Joe"],
        ["Papp Zolt\xE1n","PAPP ZOLT\xC1N","Papp"],
        ["Tam\xE1si Ferenc","TAM\xC1SI FERENC","Feri"],
        ["Tanai Tam\xE1s","TANAI TAM\xC1S","Tanai"],
        ["Ujfaludi Andr\xE1s","UJFALUDI ANDR\xC1S","Umbi"],
        ["V\xE1radi Attila","V\xC1RADI ATTILA","Ati"],
        ["V\xE1s\xE1rhelyi Tam\xE1s","V\xC1S\xC1RHELYI TAM\xC1S","Gonzi"],
        ['Fekete Katalin',"FEKETE KATALIN","Oszi"]
    ];

    let scriptGenerator = script(names);
    context.effectFinished = function () {
        context.effect = scriptGenerator.next().value;
        context.effect.initialize();
    }
    context.effectFinished();
    context.scrplay = startScreenplay(context);

    function* script(names) { // I never though I would actually use generator functions for anything ...
        //yield matrixEffect(context);
        //yield scrollEffect(context, sideEffect, firstText, 2);
        yield* massNwp(names);
    }

    // nagybetus betunkenti effekt minden sracra + animok
    function* massNwp(names) {
        for (let i = 0; i < 27; i ++) {
            names[i][1]; // capitalized
            yield scrollEffect(context, sideEffect, names[i][1], 1);
            yield animplayEffect(context, names[i][2]);
        }
    }


}