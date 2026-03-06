-- =============================================================================
-- NextAct Platform - Seed Data
-- Mental Träning för Fotbollsspelare
-- 8 modules (0–7), 34 lessons, full Swedish content
-- =============================================================================

-- Clear existing seed data before re-seeding
DELETE FROM public.lesson_progress;
DELETE FROM public.module_progress;
DELETE FROM public.lessons;
DELETE FROM public.modules;
DELETE FROM public.programs;

DO $$
DECLARE
  prog_id   UUID;
  mod0_id   UUID;
  mod1_id   UUID;
  mod2_id   UUID;
  mod3_id   UUID;
  mod4_id   UUID;
  mod5_id   UUID;
  mod6_id   UUID;
  mod7_id   UUID;
BEGIN

-- =============================================================================
-- PROGRAM
-- =============================================================================

INSERT INTO public.programs (title, description, "order")
VALUES (
  'Mental Träning för Fotbollsspelare',
  'Ett evidensbaserat program byggt på ACT och MAC-ramverket för att hjälpa fotbollsspelare i åldern 15–25 att utveckla mental styrka, psykologisk flexibilitet och förmågan att prestera under press.',
  1
)
RETURNING id INTO prog_id;

-- =============================================================================
-- MODUL 0: Välkommen (order=0, 2 lektioner)
-- =============================================================================

INSERT INTO public.modules (program_id, title, description, act_process, icon, color_theme, "order", estimated_duration_minutes)
VALUES (
  prog_id,
  'Välkommen',
  'Introduktion till programmet och hur du tar dig igenom det.',
  'orientation',
  'hand-wave',
  'slate',
  0,
  15
)
RETURNING id INTO mod0_id;

-- Lektion 0.0: Välkommen till Next Act
INSERT INTO public.lessons (module_id, title, "order", content, status)
VALUES (
  mod0_id,
  'Välkommen till Next Act',
  0,
  '[
    {"type":"video","title":"Axels intro","videoId":"1100225761"},
    {"type":"text","title":"Vad det här programmet handlar om","content":"Det här är inte ett vanligt mental­tränings­program. Du kommer inte att bli ombedd att tänka positivt eller visualisera segrar. I stället ska vi jobba med det som verkligen fungerar: att förstå hur din hjärna reagerar under press, att lära känna dina hinder inifrån, och att träna dig att agera på dina värderingar — även när det är svårt. Programmet är byggt på ACT och MAC-ramverket, samma metoder som används av idrottspsykologer världen över. Det är anpassat för dig som fotbollsspelare i åldern 15–25. Du behöver inte ha några förkunskaper. Du behöver bara vara villig att vara ärlig med dig själv."},
    {"type":"completion"}
  ]'::jsonb,
  'published'
);

-- Lektion 0.1: Hur programmet fungerar
INSERT INTO public.lessons (module_id, title, "order", content, status)
VALUES (
  mod0_id,
  'Hur programmet fungerar',
  1,
  '[
    {"type":"text","title":"Så tar du dig igenom programmet","content":"Programmet består av sju moduler. I varje modul finns det korta videos med Anders och Henrik, textavsnitt som fördjupar innehållet, och övningar där du reflekterar och skriver ned dina svar. I slutet av varje modul får du en veckouppgift — konkreta saker att göra på träning och match. Du kan också använda ditt bollplank, en AI-driven träningskompis som finns här i appen, för att reflektera vidare eller ställa frågor. Ta dig igenom en modul i taget. Varje modul tar ungefär 30–45 minuter att jobba sig igenom. Allra viktigaste rådet: var ärlig i dina svar. Det är ingen som läser dem utom du själv."},
    {"type":"text","title":"Vad är tuffhetsmodellen?","content":"Under programmets gång bygger du din egen tuffhetsmodell — ett levande dokument som samlar dina insikter, dina hinder och dina verktyg på ett ställe. Den uppdateras automatiskt när du svarar på övningarna. I slutet av modul 7 har du en komplett personlig handlingsplan som du kan ta med dig in i din vardag och ditt spel. Tuffhetsmodellen är ditt, ingen annans. Den är inte ett betyg — den är en karta."},
    {"type":"bollplank_prompt","prompt":"Innan vi börjar — finns det något du undrar eller vill att ditt bollplank vet om dig?"},
    {"type":"completion"}
  ]'::jsonb,
  'published'
);

-- =============================================================================
-- MODUL 1: Psykologin bakom prestation (order=1, 5 lektioner)
-- =============================================================================

INSERT INTO public.modules (program_id, title, description, act_process, icon, color_theme, "order", estimated_duration_minutes)
VALUES (
  prog_id,
  'Psykologin bakom prestation',
  'Förstå varför mental träning fungerar och vad som verkligen driver prestation under press.',
  'values',
  'brain',
  'blue',
  1,
  40
)
RETURNING id INTO mod1_id;

-- Lektion 1.0: Välkommen till modul 1
INSERT INTO public.lessons (module_id, title, "order", content, status)
VALUES (
  mod1_id,
  'Välkommen till modul 1',
  0,
  '[
    {"type":"video","title":"Anders välkomnar","videoId":"455700750"},
    {"type":"video","title":"Modul 1","videoId":"455422409"},
    {"type":"text","title":"Varför mental träning?","content":"Du tränar kroppen varje dag. Du jobbar med teknik, taktik och fysik. Men hur mycket tid lägger du på att träna det som händer mellan öronen? Forskning visar att mental styrka är avgörande för att prestera när det gäller — inte bara talang eller träningsvolym. Och precis som kondition och teknik går mental styrka att träna upp. Det kräver metod, inte bara vilja."},
    {"type":"completion"}
  ]'::jsonb,
  'published'
);

-- Lektion 1.1: Vad är mental tuffhet?
INSERT INTO public.lessons (module_id, title, "order", content, status)
VALUES (
  mod1_id,
  'Vad är mental tuffhet?',
  1,
  '[
    {"type":"text","title":"Mental tuffhet — vad det faktiskt innebär","content":"Mental tuffhet handlar inte om att inte känna press. Det handlar om vad du gör med den. De mentalt starkaste spelarna du känner till — de som presterar när det gäller, som reser sig efter misstag, som drar laget framåt när det är tungt — de känner precis samma nervositet, tvivel och rädsla som alla andra. Skillnaden är att de har lärt sig att agera på sina värderingar trots obehaget, inte utan det. Mental tuffhet är inte en egenskap du antingen har eller inte har. Det är en färdighet. Och du är redan i färd med att träna upp den."},
    {"type":"story","content":"Kalle är 18 år och lagets skickligaste tekniker. I seriens avgörande match mot rivallaget kände han hur nervositeten kröp upp i halsen redan i omklädningsrummet. Hans tankar snurrade: Vad om jag tappar bollen? Vad om vi förlorar på grund av mig? Han spelade de första 20 minuterna stelt och säkert — passade bakåt när han borde ha vänt, sköt inte när läget uppstod. Det var inte brist på förmåga. Det var hans hjärna som försökte skydda honom från misslyckande. Men i det läget skyddade den honom från sitt eget spel."},
    {"type":"text","title":"Värderingar, inte ångest","content":"Det handlar om att agera på dina värderingar, inte på din ångest. Din ångest vill att du spelar säkert. Dina värderingar vill att du spelar som din bästa version. Den spänningen försvinner aldrig helt — men du kan välja vad du lyssnar på."},
    {"type":"completion"}
  ]'::jsonb,
  'published'
);

-- Lektion 1.2: Din kartläggning
INSERT INTO public.lessons (module_id, title, "order", content, status)
VALUES (
  mod1_id,
  'Din kartläggning',
  2,
  '[
    {"type":"text","title":"Var är du just nu?","content":"Innan vi kan gå framåt behöver vi förstå var du är just nu. Kartläggningen är första steget i din tuffhetsmodell. Det finns inga rätt eller fel svar — det viktigaste är att du är ärlig. Ta dig tid med frågorna. Skriv mer än du tror att du behöver."},
    {"type":"exercise_text","prompt":"Beskriv din mentala situation i fotbollen just nu. Vad fungerar bra? Vad hindrar dig?","scaffolding":["Hur känner du dig inför viktiga matcher?","Finns det situationer där din mentala styrka sviktar?"],"toughnessKey":"kartlaggning.nulage"},
    {"type":"exercise_text","prompt":"Vad är ditt viktigaste mål med det här programmet?","scaffolding":["Vad vill du kunna göra som du inte kan nu?","Hur skulle din bästa version av dig själv se ut på planen?"],"toughnessKey":"kartlaggning.mal"},
    {"type":"completion"}
  ]'::jsonb,
  'published'
);

-- Lektion 1.3: ACT i idrotten
INSERT INTO public.lessons (module_id, title, "order", content, status)
VALUES (
  mod1_id,
  'ACT i idrotten',
  3,
  '[
    {"type":"text","title":"Vad är ACT?","content":"ACT — Acceptance and Commitment Therapy — är det vetenskapliga ramverk som det här programmet bygger på. Det är inte en terapi i traditionell mening. Det är en metod för att öka psykologisk flexibilitet: förmågan att vara i kontakt med dina tankar och känslor som de är, utan att låta dem styra ditt beteende. I idrotten används ACT inom MAC-ramverket, Mindfulness-Acceptance-Commitment, och forskning visar att det ger mätbara förbättringar i prestation under press. Det fungerar inte genom att eliminera jobbiga tankar — det fungerar genom att du slutar kämpa mot dem."},
    {"type":"story","content":"Sara var 20 år och mittfältare i ett allsvenskt damlag. Hon hade jobbat med en idrottspsykolog i sex månader och börjat använda ACT-tekniker. Det som överraskade henne mest var att hennes nervositet inte försvann — men hennes relation till den förändrades. Förut försökte hon trycka bort nervositeten, tänka på något annat, övertala sig själv att allt skulle gå bra. Nu lät hon den finnas där. Hon gav den ett namn. Och sedan fokuserade hon på vad hon faktiskt behövde göra. Det ändrade allt."},
    {"type":"text","title":"Handling trots jobbiga tankar","content":"Det handlar inte om att tänka positivt — det handlar om att handla rätt trots jobbiga tankar. Din hjärna kommer alltid att producera tvivel, oro och självkritik. Det är så den är byggd. Målet är inte att stänga av den. Målet är att sluta låta den ta ratten."},
    {"type":"completion"}
  ]'::jsonb,
  'published'
);

-- Lektion 1.4: Veckouppgift 1
INSERT INTO public.lessons (module_id, title, "order", content, status)
VALUES (
  mod1_id,
  'Veckouppgift 1',
  4,
  '[
    {"type":"text","title":"Bra jobbat med modul 1","content":"Du har nu lagt grunden för resten av programmet. Du vet vad mental tuffhet faktiskt är, du har gjort din kartläggning, och du har lärt dig grunderna i ACT. Nu är det dags att börja observera dig själv i verkliga situationer."},
    {"type":"weekly_task","tasks":["Observera en situation den här veckan där du märker att press påverkar ditt spel. Skriv ned vad som hände — inte vad du tyckte om det, bara vad du faktiskt kände, tänkte och gjorde.","Fråga dig själv efter situationen: Agerade jag som min bästa version? Varför eller varför inte? Skriv ned svaret.","Läs igenom dina svar i din kartläggning en gång till. Stämmer de fortfarande? Finns det något du vill lägga till?"]},
    {"type":"bollplank_prompt","prompt":"Vill du reflektera kring vad du märkt om din mentala styrka med ditt bollplank?"},
    {"type":"completion"}
  ]'::jsonb,
  'published'
);

-- =============================================================================
-- MODUL 2: Din värderade riktning (order=2, 5 lektioner)
-- =============================================================================

INSERT INTO public.modules (program_id, title, description, act_process, icon, color_theme, "order", estimated_duration_minutes)
VALUES (
  prog_id,
  'Din värderade riktning',
  'Utforska vad som verkligen driver dig och bygg din personliga kompass för fotbollen.',
  'values',
  'compass',
  'emerald',
  2,
  40
)
RETURNING id INTO mod2_id;

-- Lektion 2.0: Välkommen till modul 2
INSERT INTO public.lessons (module_id, title, "order", content, status)
VALUES (
  mod2_id,
  'Välkommen till modul 2',
  0,
  '[
    {"type":"video","title":"Modul 2","videoId":"1097559806"},
    {"type":"text","title":"Din värderade riktning","content":"I den här modulen utforskar vi vad som verkligen driver dig — din värderade riktning. Det är grunden för allt annat i programmet. Utan en tydlig värderad riktning är det omöjligt att veta om du rör dig framåt eller bakåt. Med den har du en intern kompass som fungerar även när yttre omständigheter är kaotiska."},
    {"type":"completion"}
  ]'::jsonb,
  'published'
);

-- Lektion 2.1: 80-årsdag-övningen
INSERT INTO public.lessons (module_id, title, "order", content, status)
VALUES (
  mod2_id,
  '80-årsdag-övningen',
  1,
  '[
    {"type":"text","title":"Föreställ dig din 80-årsdag","content":"Föreställ dig att du är 80 år. Det är din födelsedag och dina gamla lagkamrater, din familj och dina vänner är samlade för att hylla dig. En efter en reser de sig och berättar om vem du var som idrottare och människa. Vad säger de? Vilka ord använder de? Berättar de om en person som spelade det säkra spelet, eller om någon som alltid vågade? Berättar de om en lagkamrat som drog andra nedåt eller en som lyfte laget? Den här övningen hjälper dig att se bortom resultat och statistik — till vem du vill ha varit."},
    {"type":"exercise_text","prompt":"Vad säger de om dig som idrottare och människa? Vad vill du att de ska minnas?","scaffolding":["Vilka egenskaper vill du ha haft?","Hur vill du ha behandlat dina lagkamrater?"],"toughnessKey":"varderad_riktning.attioarsdag"},
    {"type":"completion"}
  ]'::jsonb,
  'published'
);

-- Lektion 2.2: Din inre glöd
INSERT INTO public.lessons (module_id, title, "order", content, status)
VALUES (
  mod2_id,
  'Din inre glöd',
  2,
  '[
    {"type":"video","title":"Anders förklarar värderad riktning","videoId":"1097563492"},
    {"type":"text","title":"Mål kontra värderingar","content":"Det finns en viktig skillnad mellan mål och värderingar. Mål är saker du uppnår: vinna cupen, ta steget till seniorfotbollen, bli ordinarie. Värderingar är sätt att vara och handla som aldrig tar slut: att spela modigt, att vara en äkta lagkamrat, att aldrig ge upp. Mål går att bocka av. Värderingar lever du antingen upp till eller inte — dag för dag, träning för träning, match för match. Det är dina värderingar som ger mål deras mening. Utan dem är ett mål bara ett nummer."},
    {"type":"exercise_text","prompt":"Vad är din värderade riktning i fotbollen? Hur vill du spela, träna och vara som lagkamrat?","scaffolding":["Vad älskar du med fotboll när det är som bäst?","Vilken typ av spelare vill du bli — inte bara tekniskt, utan som person?"],"toughnessKey":"varderad_riktning.inre_glod"},
    {"type":"completion"}
  ]'::jsonb,
  'published'
);

-- Lektion 2.3: Värderad riktning under press
INSERT INTO public.lessons (module_id, title, "order", content, status)
VALUES (
  mod2_id,
  'Värderad riktning under press',
  3,
  '[
    {"type":"text","title":"Det verkliga testet","content":"Det verkliga testet på din värderade riktning är inte vad du gör när allt flyter på. Det är vad du gör när laget förlorar med tre mål, när tränaren kritiserar dig, när du gjort tre misstag i rad och en del av dig vill försvinna. Det är i de stunderna som din riktning antingen bär dig framåt eller sviker dig. Och det är i de stunderna som den här träningen spelar roll. Att känna till sin värderade riktning är ett första steg. Att leva upp till den under press är en färdighet som tar tid att bygga."},
    {"type":"story","content":"Felicia var back i ett P17-lag och hennes värderade riktning var tydlig: hon ville spela modigt och ta initiativ. Men under en period när laget förlorade match efter match märkte hon hur hon spelade allt mer defensivt och räddat. Hon passade bakåt när hon borde ha dribbat. Hon ropade inte på bollen i svåra lägen. Det var inte lek — det var hennes hjärna som försökte skydda henne från ytterligare misslyckanden. Det tog tre veckors medvetet arbete för henne att börja ta tillbaka sitt eget spel. Det började med att hon erkände gapet."},
    {"type":"exercise_text","prompt":"Hur lever du upp till din värderade riktning i dag? Namnge en situation där det brister.","scaffolding":["Vad hindrar dig?","Vad skulle du göra annorlunda om du levde helt efter din riktning?"],"toughnessKey":"varderad_riktning.gap"},
    {"type":"completion"}
  ]'::jsonb,
  'published'
);

-- Lektion 2.4: Veckouppgift 2
INSERT INTO public.lessons (module_id, title, "order", content, status)
VALUES (
  mod2_id,
  'Veckouppgift 2',
  4,
  '[
    {"type":"text","title":"Låt din riktning guida dig","content":"Ditt jobb den här veckan är att låta din värderade riktning guida dina val — inte resultat, inte rädsla. Välj en träning den här veckan och sätt intentionen innan du går in: hur vill du spela? Vem vill du vara?"},
    {"type":"weekly_task","tasks":["Skriv upp din värderade riktning i en mening och sätt den på ett ställe du ser varje dag — i omklädningsrummet, i träningsbagen, eller som bakgrundsbild på telefonen.","Notera varje kväll den här veckan om du handlade i linje med din riktning under träning eller match. Inte om du presterade bra — om du var den spelaren du vill vara.","Identifiera ett tillfälle då det var svårt att leva upp till din riktning. Vad hände? Vad tog över?"]},
    {"type":"bollplank_prompt","prompt":"Har du funderat på din inre glöd? Ditt bollplank vill gärna höra mer om vad som driver dig."},
    {"type":"completion"}
  ]'::jsonb,
  'published'
);

-- =============================================================================
-- MODUL 3: Förstå dina hinder (order=3, 5 lektioner)
-- =============================================================================

INSERT INTO public.modules (program_id, title, description, act_process, icon, color_theme, "order", estimated_duration_minutes)
VALUES (
  prog_id,
  'Förstå dina hinder',
  'Lär dig förstå hur hjärnan skapar hinder under press — och varför det är helt normalt.',
  'acceptance',
  'shield',
  'violet',
  3,
  45
)
RETURNING id INTO mod3_id;

-- Lektion 3.0: Välkommen till modul 3
INSERT INTO public.lessons (module_id, title, "order", content, status)
VALUES (
  mod3_id,
  'Välkommen till modul 3',
  0,
  '[
    {"type":"video","title":"Modul 3","videoId":"1097569313"},
    {"type":"text","title":"Förstå hindren inifrån","content":"I den här modulen lär vi oss förstå vad som verkligen hindrar oss — och varför det är biologiskt inbyggt. Du är inte svag för att du känner press. Du är mänsklig. Men när du förstår vad som händer inuti dig under press kan du börja göra val i stället för att bara reagera. Det är det den här modulen handlar om."},
    {"type":"completion"}
  ]'::jsonb,
  'published'
);

-- Lektion 3.1: Hjärnan under press
INSERT INTO public.lessons (module_id, title, "order", content, status)
VALUES (
  mod3_id,
  'Hjärnan under press',
  1,
  '[
    {"type":"video","title":"Anders förklarar hjärnan","videoId":"1097572332"},
    {"type":"text","title":"Din hjärnas alarmsignal","content":"Din hjärna har en inbyggd alarmsignal — vi kallar den Apan. Den lever i din amygdala och har ett enda syfte: att skydda dig från fara. Problemet är att den inte kan skilja på ett lejon i skogen och en viktig match. När du känner press aktiverar Apan din fight-or-flight-respons: pulsen ökar, musklerna spänns, tankarna accelererar. Det är inte ett tecken på svaghet. Det är ett tecken på att din hjärna gör exakt vad den är byggd för att göra. Men i fotbollssammanhang fungerar den reaktionen ofta mot dig — den gör dig stelare, snävar av ditt fokus och driver fram läktaraktioner."},
    {"type":"story","content":"Magnus var 16 år och lagets förstaval på mål. I cupfinalen var han i perfekt form fram till femminutersvilan. Sedan kom straffen. I sekunden han ställde sig på mållinjen kände han hur kroppen förändrades — händerna svettades, fokus tunnelnade, tankarna rusade. Det var inte rädsla för misslyckande i sig. Det var hans Apa som aktiverades. Han visste inte det då. Han trodde att han var för svag för stora matcher. Det var han inte. Hans hjärna fungerade precis som den skulle — han behövde bara lära sig arbeta med den."},
    {"type":"video","title":"Anders analyserar fotbollsspelaren","videoId":"1097577445"},
    {"type":"completion"}
  ]'::jsonb,
  'published'
);

-- Lektion 3.2: Kletiga tankar
INSERT INTO public.lessons (module_id, title, "order", content, status)
VALUES (
  mod3_id,
  'Kletiga tankar',
  2,
  '[
    {"type":"video","title":"Anders analyserar tankar","videoId":"1097582005"},
    {"type":"video","title":"Henrik fördjupar tankar","videoId":"1097585782"},
    {"type":"text","title":"Tankar som fastnar och styr","content":"Kletiga tankar är tankar som fastnar och börjar styra dina handlingar. De dyker upp, och i stället för att passera förbi — som de borde — klibbar de fast vid dig och kräver uppmärksamhet. Det kan vara: Jag är inte tillräckligt bra. Det kommer att gå dåligt. Tränaren tror inte på mig. Alla ser hur dålig jag är. Sådana tankar är inte sanningar. De är produkter av en hjärna som försöker hantera en pressad situation. Men när du tror på dem som fakta börjar de forma ditt beteende — du spelar defensivt, undviker risker, drar dig undan. Det är det kletiga med dem."},
    {"type":"exercise_text","prompt":"Vilka kletiga tankar dyker upp för dig i pressade situationer?","scaffolding":["Vad säger din inre röst inför en viktig match?","Vilka tankar får dig att spela sämre?"],"toughnessKey":"hinder.kletiga_tankar"},
    {"type":"completion"}
  ]'::jsonb,
  'published'
);

-- Lektion 3.3: Din apa
INSERT INTO public.lessons (module_id, title, "order", content, status)
VALUES (
  mod3_id,
  'Din apa',
  3,
  '[
    {"type":"text","title":"Kartlägg din specifika apa","content":"Nu ska vi kartlägga din specifika Apa — hur din fight-or-flight-respons yttrar sig i just din idrott, i just dina situationer. Allas Apa aktiveras lite olika. En del spelare blir stela och spelar säkert. Andra blir aggressiva. Andra drar sig undan och slutar kommunicera. Vissa tappar tekniken, andra tappar fokus. Ingen Apa ser exakt likadan ut — och att känna igen sin egen är det första steget mot att inte låta den styra."},
    {"type":"exercise_text","prompt":"Beskriv din apa. När dyker den upp? Vad känner du i kroppen? Vad gör du?","scaffolding":["Vilka situationer triggar din apa mest?","Hur märker du att apan är aktiv — i kroppen, i tankarna, i beteendet?"],"toughnessKey":"hinder.apan"},
    {"type":"story","content":"Linn var 22 år och anfallare. Hon kunde avgöra exakt när hennes Apa aktiverades — det började alltid i axlarna. De spändes upp mot öronen, hon böjde lite på knäna och hennes röst försvann. Hon slutade kommunicera med lagkamraterna, slutade begära bollen. Under lång tid trodde hon att det handlade om dåligt självförtroende. Men när hon lärde sig att det var hennes Apa som pratade — inte sanningen om hennes förmåga — kunde hon börja välja. Hon kallas fortfarande nervös ibland. Men nu känner hon igen vem som pratar."},
    {"type":"completion"}
  ]'::jsonb,
  'published'
);

-- Lektion 3.4: Veckouppgift 3
INSERT INTO public.lessons (module_id, title, "order", content, status)
VALUES (
  mod3_id,
  'Veckouppgift 3',
  4,
  '[
    {"type":"text","title":"Den här veckans uppgift: observera, förändra inte","content":"Den här veckans uppgift handlar om att observera — inte förändra. Det är svårare än det låter. Vi är vana vid att vilja lösa problem direkt. Men innan du kan förändra ett mönster måste du se det tydligt. Ge det tid."},
    {"type":"weekly_task","tasks":["Observera din Apa under veckan. Notera tre gånger när den dyker upp: vilken situation, vad som triggade den, och hur du reagerade i kropp och beteende.","Lägg märke till dina kletiga tankar utan att döma dem. De är bara tankar — inte fakta. Ingen behöver agera på dem.","Testa att säga tyst till dig själv: Det är min Apa som pratar nu. Se vad som händer i kroppen när du sätter ett namn på det."]},
    {"type":"bollplank_prompt","prompt":"Vill du utforska hur din Apa fungerar? Ditt bollplank kan hjälpa dig att förstå den bättre."},
    {"type":"completion"}
  ]'::jsonb,
  'published'
);

-- =============================================================================
-- MODUL 4: Dina beteenden (order=4, 5 lektioner)
-- =============================================================================

INSERT INTO public.modules (program_id, title, description, act_process, icon, color_theme, "order", estimated_duration_minutes)
VALUES (
  prog_id,
  'Dina beteenden',
  'Analysera vad du faktiskt gör när hinder dyker upp — och identifiera dina nyckelaktioner.',
  'committed_action',
  'activity',
  'amber',
  4,
  45
)
RETURNING id INTO mod4_id;

-- Lektion 4.0: Välkommen till modul 4
INSERT INTO public.lessons (module_id, title, "order", content, status)
VALUES (
  mod4_id,
  'Välkommen till modul 4',
  0,
  '[
    {"type":"video","title":"Modul 4 intro","videoId":"1097598224"},
    {"type":"text","title":"Från förståelse till handling","content":"Nu går vi från att förstå hinder till att analysera vad vi faktiskt gör när de dyker upp. Det är här som förändringen börjar — inte i tankarnas värld, utan i beteendenas. Vad gör du när Apan aktiveras? Vad gör du när en kletiga tanke tar tag i dig? Det är inte alltid uppenbart — men när du ser mönstret klart kan du börja göra andra val."},
    {"type":"completion"}
  ]'::jsonb,
  'published'
);

-- Lektion 4.1: Läktaraktioner
INSERT INTO public.lessons (module_id, title, "order", content, status)
VALUES (
  mod4_id,
  'Läktaraktioner',
  1,
  '[
    {"type":"video","title":"Apan och kletiga tankar","videoId":"1100640318"},
    {"type":"text","title":"Vad är läktaraktioner?","content":"Läktaraktioner är saker vi gör för att undvika obehag i stunden — men som på sikt håller oss tillbaka och tar oss bort från vår värderade riktning. De kallas läktaraktioner för att de är handlingar som passar för en åskådare, inte en aktiv spelare. Att passa bakåt när du borde ha vänt. Att inte begära bollen i ett svårt läge. Att hålla sig i periferin när laget behöver dig i mitten. Att klaga på domare eller lagkamrater i stället för att fokusera på nästa ball. Alla dessa är sätt att undvika det obehag som Apan signalerar. Och alla håller dig borta från ditt bästa spel."},
    {"type":"story","content":"Viktor var 19 år och lagets förste anfallare — tekniskt sett. Men under de sista fem matcherna hade han slutat dribbla. Han spelade enkelt, vände bakåt, undvek kontakt i boxen. Ingen hade sagt något ännu, men han visste det själv. En kväll tittade han på en inspelning av en match från ett år tidigare — och kunde inte tro skillnaden. Det var inte teknik han saknade. Det var modet att exponera sig. Hans dribblingar hade blivit läktaraktioner — inte för att han inte kunde, utan för att Apan tagit ratten."},
    {"type":"exercise_text","prompt":"Vilka är dina läktaraktioner? Vad gör du för att undvika obehag på planen?","scaffolding":["Vad gör du när Apan aktiveras?","Finns det situationer du aktivt undviker på planen?"],"toughnessKey":"beteenden.laktaraktioner"},
    {"type":"completion"}
  ]'::jsonb,
  'published'
);

-- Lektion 4.2: Nyckelaktioner
INSERT INTO public.lessons (module_id, title, "order", content, status)
VALUES (
  mod4_id,
  'Nyckelaktioner',
  2,
  '[
    {"type":"video","title":"Nyckelaktioner","videoId":"1100443289"},
    {"type":"text","title":"Det motsatta till läktaraktioner","content":"Nyckelaktioner är det motsatta till läktaraktioner. De är handlingar som tar dig mot din värderade riktning — trots att det är obehagligt, trots att Apan skriker, trots att du kan misslyckas. Det är inte reckless. Det är modet att spela som din bästa version. Nyckelaktioner är specifika och konkreta: begära bollen i ett svårt läge, ta dribblingen i boxen, kommunicera tydligt när du tappat bollen, resa sig och springa tillbaka efter ett misstag. De ser olika ut för varje spelare. Men gemensamt för alla nyckelaktioner är att de kräver att du väljer värderad riktning framför kortsiktig trygghet."},
    {"type":"exercise_text","prompt":"Vilka är dina nyckelaktioner? Vad gör din bästa version av dig på planen?","scaffolding":["Vad gör du när du spelar som bäst?","Vilka beteenden vill du ha mer av i ditt spel?"],"toughnessKey":"beteenden.nyckelaktioner"},
    {"type":"completion"}
  ]'::jsonb,
  'published'
);

-- Lektion 4.3: Lagkultur och momentum
INSERT INTO public.lessons (module_id, title, "order", content, status)
VALUES (
  mod4_id,
  'Lagkultur och momentum',
  3,
  '[
    {"type":"video","title":"Momentum","videoId":"1100604948"},
    {"type":"text","title":"Dina beteenden påverkar laget","content":"Dina beteenden påverkar inte bara dig — de påverkar hela laget. Energi smittar, åt båda håll. En spelare som reser sig snabbt efter ett misstag, som kommunicerar positivt, som springer tillbaka när det är tungt — den spelaren lyfter laget. En spelare som klagar, hänger med axlarna, skyller på andra — den spelaren drar ned energin. Det är inte en fråga om personlighet. Det är en fråga om val. Och det valet görs i nuet, i varje situation, inte i teorin."},
    {"type":"exercise_text","prompt":"Vilken typ av lagkamrat vill du vara? Hur bidrar du till lagets mentala energi?","scaffolding":["Vad gör du när laget tappar momentum?","Hur stöttar du lagkamrater som har en dålig dag?"],"toughnessKey":"beteenden.lagkultur"},
    {"type":"completion"}
  ]'::jsonb,
  'published'
);

-- Lektion 4.4: Veckouppgift 4
INSERT INTO public.lessons (module_id, title, "order", content, status)
VALUES (
  mod4_id,
  'Veckouppgift 4',
  4,
  '[
    {"type":"text","title":"Byt läktaraktioner mot nyckelaktioner","content":"Den här veckan tränar vi på att aktivt byta läktaraktioner mot nyckelaktioner. Det kräver inte att du presterar perfekt — det kräver att du väljer rätt beteende i ett konkret ögonblick. En gång per träning räcker."},
    {"type":"weekly_task","tasks":["Identifiera en läktaraktion du gör regelbundet. Bestäm dig för att byta ut den mot en nyckelaktioner under nästa träning. Förbered dig mentalt innan träningen: när situationen kommer, vad gör du?","Observera ditt lags mentala energi under en match eller träning. Vad bidrar du med? Vad tar du med dig in?","Skriv ned tre nyckelaktioner du vill ha mer av i ditt spel. Var konkret — inte att jag ska vara modigare utan vad du faktiskt gör."]},
    {"type":"bollplank_prompt","prompt":"Vill du prata igenom skillnaden mellan dina läktaraktioner och nyckelaktioner med ditt bollplank?"},
    {"type":"completion"}
  ]'::jsonb,
  'published'
);

-- =============================================================================
-- MODUL 5: Bli mentalt starkare (order=5, 5 lektioner)
-- =============================================================================

INSERT INTO public.modules (program_id, title, description, act_process, icon, color_theme, "order", estimated_duration_minutes)
VALUES (
  prog_id,
  'Bli mentalt starkare',
  'Träna aktivt din mentala styrka med acceptans, defusion och din personliga Våga-lista.',
  'acceptance',
  'flame',
  'orange',
  5,
  45
)
RETURNING id INTO mod5_id;

-- Lektion 5.0: Välkommen till modul 5
INSERT INTO public.lessons (module_id, title, "order", content, status)
VALUES (
  mod5_id,
  'Välkommen till modul 5',
  0,
  '[
    {"type":"video","title":"Modul 5 intro","videoId":"1097600603"},
    {"type":"text","title":"Aktiv mental träning","content":"Den här modulen handlar om att aktivt träna din mentala styrka — inte bara förstå den. Du har nu en karta över din Apa, dina kletiga tankar, dina läktaraktioner och dina nyckelaktioner. Nu är det dags att lära dig de konkreta verktygen som låter dig förändra hur du reagerar. Det handlar om acceptans, defusion och exponering. Tre verktyg som kompletterar varandra och bygger den mentala styrka du tränar för."},
    {"type":"completion"}
  ]'::jsonb,
  'published'
);

-- Lektion 5.1: Acceptans — inte resignation
INSERT INTO public.lessons (module_id, title, "order", content, status)
VALUES (
  mod5_id,
  'Acceptans — inte resignation',
  1,
  '[
    {"type":"video","title":"Anders förklarar verktyg","videoId":"1097603378"},
    {"type":"text","title":"Vad acceptans faktiskt innebär","content":"Acceptans betyder inte att ge upp. Det är ett av de vanligaste missförstånden i mental träning. Acceptans innebär att sluta kämpa mot det som inte går att kontrollera — och istället fokusera på vad du faktiskt kan göra. Du kan inte kontrollera om du är nervös. Du kan inte kontrollera om din Apa aktiveras. Du kan inte kontrollera om kletiga tankar dyker upp. Men du kan välja vad du gör härnäst. Acceptans frigör den energi du lägger på att kämpa mot det okontrollerbara — och riktar den mot ditt beteende i nuet."},
    {"type":"story","content":"Josefine var 21 år och ordinarie back. Under en tuff period förlorade hon sin plats i startelvan. Första reaktionen var att kämpa mot situationen — att bevisa sig, att träna hårdare av fel anledningar, att grubbla på varför tränaren valt bort henne. Det slet. Det hjälpte inte. Det var när hon accepterade situationen — inte som rättvis eller bra, men som verklig — som hon kunde börja jobba. Hon fokuserade på sina nyckelaktioner, på att vara bästa möjliga träningsspelare, på att leva sin värderade riktning varje dag. Sex veckor senare var hon tillbaka i startuppställningen."},
    {"type":"video","title":"Henrik fördjupar acceptans","videoId":"1097605377"},
    {"type":"completion"}
  ]'::jsonb,
  'published'
);

-- Lektion 5.2: Ta bort kletet
INSERT INTO public.lessons (module_id, title, "order", content, status)
VALUES (
  mod5_id,
  'Ta bort kletet',
  2,
  '[
    {"type":"text","title":"Defusion — avstånd från dina tankar","content":"Defusion är konsten att ta avstånd från kletiga tankar. Det handlar inte om att trycka bort dem eller ersätta dem med positiva tankar. Det handlar om att förändra din relation till dem. Du behöver inte tro på varje tanke du har. Du behöver inte agera på dem. Du kan ha tanken Jag är inte tillräckligt bra utan att den bestämmer vad du gör härnäst. Det låter enkelt. Det är inte enkelt. Men det är träningsbart — precis som en teknisk färdighet."},
    {"type":"exercise_text","prompt":"Välj en av dina kletiga tankar. Testa att formulera om den: i stället för Jag är inte tillräckligt bra, säg högt eller tyst: Jag märker att jag har tanken att jag inte är tillräckligt bra. Vad händer?","scaffolding":["Vad händer om du ser tanken som ett moln som passerar — inte som en sanning?","Kan du ha tanken utan att agera på den? Vad förändras?"],"toughnessKey":"hinder.defusion_ovning"},
    {"type":"completion"}
  ]'::jsonb,
  'published'
);

-- Lektion 5.3: Din Våga-lista
INSERT INTO public.lessons (module_id, title, "order", content, status)
VALUES (
  mod5_id,
  'Din Våga-lista',
  3,
  '[
    {"type":"text","title":"Vad är en Våga-lista?","content":"En Våga-lista är en lista på situationer du aktivt vill exponera dig för — situationer som din Apa vill undvika. Det bygger på ett välkänt psykologiskt faktum: det enda sättet att minska rädslan för en situation är att utsätta sig för den, om och om igen, tills hjärnan lär sig att det är okej. För en fotbollsspelare kan det handla om att begära bollen i ett tufft läge, att ta det svåra skottet, att kommunicera tydligt med tränaren, att spela mot ett starkare lag utan att spela säkert. Varje gång du gör något från din Våga-lista bygger du mental kapacitet."},
    {"type":"exercise_text","prompt":"Skriv din Våga-lista. Vilka 3–5 situationer behöver du exponera dig för att växa som fotbollsspelare?","scaffolding":["Vad undviker du i dag som du vet att du borde göra?","Vad skulle din bästa version av dig våga göra?"],"toughnessKey":"vaga_lista"},
    {"type":"text","title":"Din lista skickas till dig","content":"Du kommer att få din Våga-lista skickad till dig på SMS — som en konkret påminnelse att ta med dig till nästa träning. Spara det meddelandet. Öppna det innan du kliver in på planen."},
    {"type":"completion"}
  ]'::jsonb,
  'published'
);

-- Lektion 5.4: Veckouppgift 5
INSERT INTO public.lessons (module_id, title, "order", content, status)
VALUES (
  mod5_id,
  'Veckouppgift 5',
  4,
  '[
    {"type":"text","title":"Agera på din Våga-lista","content":"Den här veckan är det dags att börja agera. Välj en sak från din Våga-lista och gör den. Bara en. Det behöver inte gå bra. Det behöver inte kännas bra. Det behöver bara ske."},
    {"type":"weekly_task","tasks":["Ta en sak från din Våga-lista och genomför den under veckan. Bered dig mentalt: du vet att Apan kommer att aktiveras — det är en del av poängen.","Notera vad som hände efteråt. Hur reagerade Apan? Vad kände du? Vad hände med den obehagskänslan över tid?","Dela din Våga-lista med en lagkamrat eller tränare om du vågar. Det är i sig ett steg på listan för de flesta."]},
    {"type":"bollplank_prompt","prompt":"Vill du prata med ditt bollplank om hur det gick med din Våga-lista?"},
    {"type":"completion"}
  ]'::jsonb,
  'published'
);

-- =============================================================================
-- MODUL 6: Fokusera mera (order=6, 4 lektioner)
-- =============================================================================

INSERT INTO public.modules (program_id, title, description, act_process, icon, color_theme, "order", estimated_duration_minutes)
VALUES (
  prog_id,
  'Fokusera mera',
  'Träna fokus som en färdighet och bygg din personliga refokuseringsrutin.',
  'present_moment',
  'eye',
  'sky',
  6,
  35
)
RETURNING id INTO mod6_id;

-- Lektion 6.0: Välkommen till modul 6
INSERT INTO public.lessons (module_id, title, "order", content, status)
VALUES (
  mod6_id,
  'Välkommen till modul 6',
  0,
  '[
    {"type":"video","title":"Modul 6","videoId":"1100677431"},
    {"type":"text","title":"Fokus är en färdighet","content":"Fokus är en färdighet — inte en personlighetsegenskap. Det är inte något du antingen har eller saknar. Det är något du tränar upp, precis som snabbhet eller teknik. De spelare som verkar ha naturligt bra fokus har oftast bara tränat det mer — medvetet eller omedvetet. I den här modulen lär du dig hur fokus fungerar, vad som stjäl det, och framför allt hur du snabbt hittar tillbaka till det när du tappat det."},
    {"type":"completion"}
  ]'::jsonb,
  'published'
);

-- Lektion 6.1: Fokusövningar
INSERT INTO public.lessons (module_id, title, "order", content, status)
VALUES (
  mod6_id,
  'Fokusövningar',
  1,
  '[
    {"type":"video","title":"Anders instruerar fokus","videoId":"1097612921"},
    {"type":"video","title":"Henrik fördjupar fokus","videoId":"1097615120"},
    {"type":"text","title":"Rätt uppmärksamhet vid rätt tillfälle","content":"Fokus handlar inte om att tänka på allt — det handlar om att ha rätt uppmärksamhet på rätt sak vid rätt tillfälle. Under en match skiftar det optimala fokusobjektet hela tiden: bollen, rummet, lagkamraten, din position. Problemet uppstår när fokus fastnar på fel sak — på misstaget du just gjort, på vad tränaren tänker, på resultattavlan, på publikens reaktion. Alla dessa är fokusstjälar. Och de är normala. Frågan är inte om du tapper fokus — utan hur snabbt du hittar tillbaka."},
    {"type":"exercise_text","prompt":"Vad brukar stjäla ditt fokus under matcher och träningar?","scaffolding":["Tankar? Misstag? Publiken? Lagkamrater? Tränaren?","Hur märker du att du tappat fokus — i kroppen, i tanken, i spelet?"],"toughnessKey":"fokusrutiner.fokushinder"},
    {"type":"completion"}
  ]'::jsonb,
  'published'
);

-- Lektion 6.2: Refokuseringsrutinen
INSERT INTO public.lessons (module_id, title, "order", content, status)
VALUES (
  mod6_id,
  'Refokuseringsrutinen',
  2,
  '[
    {"type":"text","title":"En fast sekvens för att komma tillbaka","content":"En refokuseringsrutin är en fast, inövad sekvens du genomför när du märker att du tappat fokus — för att snabbt komma tillbaka till nuet. Den ska vara kort: 3–5 sekunder. Den ska vara konkret: något fysiskt, något du säger till dig själv, något du ser på. Och den ska vara din — inte lånad från någon annan. Rutinen i sig spelar mindre roll. Det som spelar roll är att du använder den konsekvent tills den blir automatisk."},
    {"type":"story","content":"Erik var 17 år och mittfältare. Han hade ett problem med att hänga kvar vid misstag — ett dåligt passningsbeslut kunde spöka i fem minuter. Med sin idrottspsykolog byggde han en tre-sekunders rutin: ett djupt andetag ut, ordet nästa tyst för sig själv, blicken upp och framåt. Han övade det hundratals gånger på träning — inte bara när han tappat fokus, utan som en färdighet. Under säsongen förändrades han. Inte för att misstagen försvann, utan för att han slutade bära dem med sig."},
    {"type":"exercise_text","prompt":"Skapa din personliga refokuseringsrutin. Vad gör du för att snabbt komma tillbaka i nuet?","scaffolding":["Vad kan du göra fysiskt — andas, röra på dig, klappa händerna?","Vad säger du till dig själv — ett ord, en mening?","Vad fokuserar du blicken på?"],"toughnessKey":"fokusrutiner.refokusering"},
    {"type":"completion"}
  ]'::jsonb,
  'published'
);

-- Lektion 6.3: Veckouppgift 6
INSERT INTO public.lessons (module_id, title, "order", content, status)
VALUES (
  mod6_id,
  'Veckouppgift 6',
  3,
  '[
    {"type":"text","title":"Träna rutinen tills den sitter","content":"En refokuseringsrutin fungerar bara om den är automatiserad. Det betyder att du behöver öva den tills du inte behöver tänka på den — den bara sker. Tre träningar räcker för att börja. Tio träningar för att den ska sitta."},
    {"type":"weekly_task","tasks":["Öva din refokuseringsrutin aktivt tre gånger under träning den här veckan. Skapa medvetet situationer där du behöver använda den — ta ett dåligt beslut och återhämta dig, eller öva den efter en missad passning.","Identifiera ett tillfälle i en match eller träning när du tappade fokus. Använd rutinen. Notera hur lång tid det tog att komma tillbaka — och om det var snabbare än vanligt.","Lär ut rutinen till en lagkamrat. Att förklara den för någon annan befäster din egen förståelse — och du hjälper laget på köpet."]},
    {"type":"bollplank_prompt","prompt":"Vill du finslipa din fokusrutin med hjälp av ditt bollplank?"},
    {"type":"completion"}
  ]'::jsonb,
  'published'
);

-- =============================================================================
-- MODUL 7: Din Gameplan (order=7, 3 lektioner)
-- =============================================================================

INSERT INTO public.modules (program_id, title, description, act_process, icon, color_theme, "order", estimated_duration_minutes)
VALUES (
  prog_id,
  'Din Gameplan',
  'Samla allt i din personliga Gameplan och ta med dig programmet in i framtiden.',
  'committed_action',
  'award',
  'rose',
  7,
  30
)
RETURNING id INTO mod7_id;

-- Lektion 7.0: Välkommen till modul 7
INSERT INTO public.lessons (module_id, title, "order", content, status)
VALUES (
  mod7_id,
  'Välkommen till modul 7',
  0,
  '[
    {"type":"video","title":"Modul 7 Avslutning","videoId":"1097617371"},
    {"type":"text","title":"Du har jobbat hårt","content":"Du har jobbat dig igenom sex moduler av mental träning. Du har kartlagt din mentala situation, utforskat din värderade riktning, förstått dina hinder, analyserat dina beteenden, tränat acceptans och defusion, byggt en Våga-lista och skapat en refokuseringsrutin. Det är inte lite. Nu är det dags att samla allt i din personliga Gameplan — ett dokument du tar med dig härifrån och in i resten av din fotbollskarriär."},
    {"type":"completion"}
  ]'::jsonb,
  'published'
);

-- Lektion 7.1: Din Gameplan
INSERT INTO public.lessons (module_id, title, "order", content, status)
VALUES (
  mod7_id,
  'Din Gameplan',
  1,
  '[
    {"type":"text","title":"En komplett handlingsplan","content":"Din Gameplan är en komplett sammanfattning av din tuffhetsmodell — en handlingsplan för hur du tar med dig det här programmet in i din vardag och ditt spel. Den är inte ett bevis på att du är klar. Den är ett levande dokument som du kan gå tillbaka till, uppdatera och fördjupa allt eftersom du växer. Gå igenom frågorna nedan med samma ärlighet du haft genom hela programmet."},
    {"type":"exercise_text","prompt":"Sammanfatta din värderade riktning i en mening.","scaffolding":["Hur vill du spela, träna och vara som fotbollsspelare och lagkamrat?"],"toughnessKey":"gameplan.varderad_riktning"},
    {"type":"exercise_text","prompt":"Vad är ditt viktigaste verktyg från programmet?","scaffolding":["Defusion? Acceptans? Din refokuseringsrutin? Nyckelaktioner? Våga-listan?"],"toughnessKey":"gameplan.viktigaste_verktyg"},
    {"type":"exercise_text","prompt":"Vad är dina tre viktigaste nyckelaktioner framöver?","scaffolding":["Var konkret — vad gör du specifikt på träning och match?"],"toughnessKey":"gameplan.nyckelaktioner_framover"},
    {"type":"exercise_text","prompt":"Vad påminner dig om att du är på rätt väg?","scaffolding":["En känsla, ett ord, en bild, en rutin?"],"toughnessKey":"gameplan.paminnelse"},
    {"type":"completion"}
  ]'::jsonb,
  'published'
);

-- Lektion 7.2: Vägen framåt
INSERT INTO public.lessons (module_id, title, "order", content, status)
VALUES (
  mod7_id,
  'Vägen framåt',
  2,
  '[
    {"type":"text","title":"Programmet slutar — resan fortsätter","content":"Programmet slutar här. Din resa fortsätter. Mental träning är inte något du gör en gång och sedan är klar med. Det är något du praktiserar varje dag — i varje träning, i varje match, i varje situation där Apan aktiveras och du väljer att agera på din värderade riktning ändå. Du har nu verktygen. Du vet vad mental tuffhet faktiskt innebär. Du vet vad som händer i din hjärna under press, och du vet vad du kan göra åt det. Det är mer än de flesta spelare i ditt lag vet. Använd det."},
    {"type":"text","title":"Din tuffhetsmodell är levande","content":"Din tuffhetsmodell är inte ett avslutat dokument. Gå tillbaka och uppdatera den när du växer som spelare och människa. Gå tillbaka till modulerna när du stöter på en ny typ av utmaning. Den kunskapen försvinner inte — den fördjupas med erfarenhet."},
    {"type":"bollplank_prompt","prompt":"Ditt bollplank finns alltid här. Kom tillbaka när du behöver ett bollplank inför en match, en svår period, eller bara för att reflektera."},
    {"type":"weekly_task","tasks":["Läs igenom din kompletta tuffhetsmodell från modul 1 till 7. Vad har förändrats? Vad är du mest stolt över?","Dela din Gameplan med din tränare, en förälder eller en lagkamrat du litar på.","Skriv ned ett löfte till dig själv om hur du tar med dig programmet framåt — konkret, i ett steg du kan ta redan i nästa träning."]},
    {"type":"completion"}
  ]'::jsonb,
  'published'
);

END $$;
