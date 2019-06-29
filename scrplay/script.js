function controlScript(context) {
    const firstText = "      Újpesti Két Tanítási Nyelvű Műszaki Szakközépiskola és Gimnázium, 1998-2003, 13.H, osztályfőnök: Fekete Katalin        ";
    //context.effect = testEffect(context);
    //context.effect = kukacEffect(context);
    // context.effect = matrixEffect(context);
    // context.effect = animplayEffect(context);


    const names = [
        ["Akó Károly","AKÓ KÁROLY","Karcsi"],
        ["Albert Viktor","ALBERT VIKTOR","Veek"],
        ["Bíró János Kálmán","BÍRÓ JÁNOS","BJ"],
        ["Bíró Zoltán László","BÍRÓ ZOLTÁN","BZ"],
        ["Cservák Ádám","CSERVÁK ÁDÁM","Llamma"],
        ["Csizmadia Péter","CSIZMADIA PÉTER","Csizma"],
        ["Farkas Gábor","FARKAS GÁBOR","Ordas"],
        ["Földi István","FÖLDI ISTVÁN","Mazsy"],
        ["Gébert Csaba Tamás","GÉBERT CSABA","Csuba"],
        ["Gubán Péter","GUBÁN PÉTER","Guban"],
        ["Juhász Péter","JUHÁSZ PÉTER","Juhasz"],
        ["Kiss Balázs","KISS BALÁZS","Balu"],
        ["Kollár László","KOLLÁR LÁSZLÓ","Laci"],
        ["Kollár Tamás","KOLLÁR TAMÁS","Mutz"],
        ["Kuklis Zoltán","KUKLIS ZOLTÁN","Kukli"],
        ["Kovács György","KOVÁCS GYÖRGY","Gyuri"],
        ["Kővári Tamás","KŐVÁRI TAMÁS","Kovari"],
        ["Kürti Árpád István","KÜRTI ÁRPÁD","Arpi"],
        ["Mahunka Lajos Zsolt","MAHUNKA LAJOS","Lajos"],
        ["Molnár József Gábor","MOLNÁR JÓZSEF","Joe"],
        ["Papp Zoltán","PAPP ZOLTÁN","Papp"],
        ["Tamási Ferenc","TAMÁSI FERENC","Feri"],
        ["Tanai Tamás","TANAI TAMÁS","Tanai"],
        ["Ujfaludi András","UJFALUDI ANDRÁS","Umbi"],
        ["Váradi Attila","VÁRADI ATTILA","Ati"],
        ["Vásárhelyi Tamás","VÁSÁRHELYI TAMÁS","Gonzi"],
        ['Fekete Katalin',"FEKETE KATALIN","Oszi"]
    ];
    const tanarnevek = "       Tablón szereplő tanáraink: " +
    "Bodor Imre Tibor  ,  " +
    "Fekete Katalin of  ,  " +
    "Kovács Mihály igh  ,  " +
    "Zombori Béla ig  ,  " +
    "Kasza Gyuláné igh  ,  " +
    "Barabás Gábor mhf  ,  " +
    "Horváth Zoltán  ,  " +
    "Hámori Zoltán  ,  " +
    "Tolnai János dr  ,  " +
    "Danielle Sundberg  ,  " +
    "Kiss Leskó Gergé  ,  " +
    "Kámán Ildikó  ,  " +
    "Molnár Imréné  ,  " +
    "Tolnai Gábor István  ,  " +
    "Braun éva  ,  " +
    "Habóczky Károly  ,  " +
    "Szegő János  " +
    "          ";

    const authorstring =  "       Project tabló credits:      ötlet, fejlesztés:"+
"    Farkas Gábor    ;    hegesztés, forrasztás, fúrás,  segítség:"+
"    Albert Viktor,  Vásárhelyi Tamás     ;     további support:"+
"    Kollár László, Kürti Árpád, Tamási Ferenc      |    "+
"    Az elektronika nyákjai Német tanár úr műhelyében, illetve külső cégnél"+
" készültek, a fejlesztés Szegő tanár úr műhelyében folyt. Az analóg elektronikai"+
" tervezésben Suri tanár úr nyújtott segítséget. Az 576 db ledet a Ledland kft"+
" ajánlotta fel (www.led.hu).  További információ a http://matrix.intro.hu"+
" honlapon található.       ";

const tanarakmeg = "Tanáraink voltak még:   "+
"Mr & Mrs Metro  ,  "+
"Hannah Cawthrone  ,  "+
"Dennis Hopper  ,  "+
"Molnár Géza  ,  "+
"Molnár Pál  ,  "+
"Nádasdi István  ,  "+
"Németh Antal  ,  "+
"Benő László  ,  "+
"Repcsényi Zoltánné  ,  "+
"Prófusz Magdolna  ,  "+
"Nagyné Németh Ildikó  ,  "+
"Kiss Gábor  ,  "+
"Hegyiné Závori Szilvia  ,  "+
"Hámori Zoltán  ,  "+
"Dési Imre  ,  "+
"Wittine Mária         ";


    let scriptGenerator = script(names);
    context.effectFinished = function () {
        context.effect = scriptGenerator.next().value;
        context.effect.initialize();
    }
    context.effectFinished();
    context.scrplay = startScreenplay(context);

    function* script(names) { // I never though I would actually use generator functions for anything ...
        yield matrixEffect(context);
        yield scrollEffect(context, sideEffect, firstText, 2);
        while(true) {
            let rnd = Math.random() * 340;
            if (rnd < 80) {
                yield* massNwp(names);
            } else if (rnd < 160) {
                yield* massNames(names);
            } else if (rnd < 300) {
                yield* scrollValami();
            } else if (rnd < 310) {
                yield kukacEffect(context);
            } else {
                yield matrixEffect(context);
            }
        }
    }

    // scroll minden sracra + animok
    function* massNames(names) {
        for (let i = 0; i < 27; i ++) {
            yield scrollEffect(context, sideEffect, names[i][0], Math.floor(Math.random() * 3));
            yield animplayEffect(context, names[i][2]);
        }
    }

    // nagybetus betunkenti effekt minden sracra + animok
    function* massNwp(names) {
        for (let i = 0; i < 27; i ++) {
            yield nwpEffect(context, names[i][1]);
            yield animplayEffect(context, names[i][2]);
        }
    }

    function* scrollValami() {
        let rnd = Math.floor(Math.random() * 340);
        let szoveg = null;
        if (rnd < 100) {
            szoveg = firstText;
        } else if (rnd < 200) {
            szoveg = tanarnevek;
        } else if (rnd < 300) {
            szoveg = tanarakmeg;
        } else {
            szoveg = authorstring;
        }
        yield scrollEffect(context, sideEffect, szoveg, Math.floor(Math.random() * 3));
    }

}